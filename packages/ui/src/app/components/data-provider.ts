import type {
  CMSCollectionName,
  CMSData,
  ContentEntityType,
  ContentVersion,
  MediaItem,
  MediaVisibility,
  ProfileData,
  ProjectAccessRequest,
  ProjectAccessRequestStatus,
  ProjectAccessStatus,
  SiteSettings,
  SubmitProjectAccessRequestResult,
} from "@portfolio/core";
import {
  createBrowserSupabaseClient,
  createTimedBrowserSupabaseClient,
  getProjectAccessStatus,
  getSession,
  isSlugAvailable,
  loadCmsData as loadCmsDataFromSupabase,
  loadContentVersions,
  loadProjectAccessRequests,
  loadPublicCMSData as loadPublicCMSDataFromSupabase,
  onAuthStateChange,
  saveAwards,
  saveBlogPosts,
  saveCertifications,
  saveContentVersion,
  saveEducation,
  saveExperiences,
  savePages,
  saveProfile,
  saveProjects,
  savePublicCMSDataSnapshot,
  saveRecommendations,
  saveSiteSettings,
  saveStack,
  signInWithPassword,
  signOut,
  submitProjectAccessRequest,
  updateProjectAccessRequestStatus,
  uploadMedia,
  deleteMedia,
} from "@portfolio/supabase";
import recoveredPublicSnapshot from "@portfolio/core/recovered/public-cms-snapshot.json";

const PUBLIC_DATA_CACHE_KEY = "portfolio_public_cms_snapshot_v2";
const CMS_DATA_CACHE_KEY = "portfolio_cms_snapshot_v1";
const SUPABASE_READ_TIMEOUT_MS = 8000;
const PUBLIC_DATA_CACHE_MAX_AGE_MS = 60 * 1000;
const DEFAULT_PRODUCTION_CMS_REPOSITORY_URL = "https://portfolio-api.onrender.com/api/cms/public";

type CachedSnapshot = {
  cachedAt: number;
  data: CMSData;
};

type PublicRepositoryResponse = {
  provider?: string;
  data?: CMSData;
};

const bundledPublicSnapshot = recoveredPublicSnapshot as CachedSnapshot;

function getPublicDataSource() {
  const configuredSource = (import.meta.env.VITE_PUBLIC_DATA_SOURCE || "").trim().toLowerCase();
  const forceStatic = import.meta.env.VITE_FORCE_STATIC_PUBLIC_DATA === "true";

  if (configuredSource) {
    if (["static", "snapshot", "bundled", "local"].includes(configuredSource) && !forceStatic && import.meta.env.PROD) {
      return "repository";
    }

    return configuredSource;
  }

  if ((import.meta.env.VITE_CMS_REPOSITORY_URL || "").trim()) {
    return "repository";
  }

  if ((import.meta.env.VITE_SUPABASE_URL || "").trim() && (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim()) {
    return "supabase";
  }

  return "";
}

function allowsRemotePublicData() {
  return !import.meta.env.PROD || import.meta.env.VITE_ALLOW_REMOTE_PUBLIC_DATA === "true";
}

function isRepositoryPublicSource(source = getPublicDataSource()) {
  return ["repository", "api", "server", "backend"].includes(source);
}

function isDirectRemotePublicSource(source = getPublicDataSource()) {
  return ["supabase", "live", "remote", "realtime"].includes(source);
}

function shouldUseRepositoryPublicSource() {
  return isRepositoryPublicSource();
}

function shouldUseBundledPublicSnapshot() {
  const source = getPublicDataSource();

  if (isRepositoryPublicSource(source)) {
    return false;
  }

  if (!allowsRemotePublicData() && isDirectRemotePublicSource(source)) {
    return true;
  }

  if (allowsRemotePublicData() && isDirectRemotePublicSource(source)) {
    return false;
  }

  if (["static", "snapshot", "bundled", "local"].includes(source)) {
    return true;
  }

  return Boolean(import.meta.env.PROD);
}

function normalizeLoadError(error: unknown): Error {
  if (
    error instanceof Error &&
    (error.name === "TimeoutError" ||
      error.name === "AbortError" ||
      /timed out|timeout/i.test(error.message))
  ) {
    return new Error("O Supabase nao respondeu a tempo. Tentando usar o ultimo snapshot local disponivel.");
  }

  return error instanceof Error ? error : new Error("Erro ao carregar dados do Supabase.");
}

function getEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

function getCmsRepositoryUrl() {
  return (
    import.meta.env.VITE_CMS_REPOSITORY_URL ||
    (import.meta.env.PROD ? DEFAULT_PRODUCTION_CMS_REPOSITORY_URL : "/api/cms/public")
  ).trim();
}

async function fetchFromCmsRepository(): Promise<CMSData> {
  const response = await fetch(getCmsRepositoryUrl(), {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`CMS Repository HTTP ${response.status}`);
  }

  const body = (await response.json()) as PublicRepositoryResponse;
  if (!body.data) {
    throw new Error("CMS Repository returned an empty payload.");
  }

  console.info(`[CMSDataProvider] Public data loaded from CMS Repository${body.provider ? ` (${body.provider})` : ""}.`);
  return body.data;
}

class SupabaseDataProvider {
  private client: ReturnType<typeof createBrowserSupabaseClient> | null = null;
  private readClient: ReturnType<typeof createTimedBrowserSupabaseClient> | null = null;
  private publicSnapshot: CachedSnapshot | null = null;
  private cmsSnapshot: CachedSnapshot | null = null;
  private publicLoadPromise: Promise<CMSData> | null = null;
  private cmsLoadPromise: Promise<CMSData> | null = null;

  private readSnapshot(storageKey: string): CachedSnapshot | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as CachedSnapshot;
      if (!parsed || typeof parsed.cachedAt !== "number" || !parsed.data) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private writeSnapshot(storageKey: string, data: CMSData) {
    const snapshot: CachedSnapshot = {
      cachedAt: Date.now(),
      data,
    };

    if (storageKey === PUBLIC_DATA_CACHE_KEY) {
      this.publicSnapshot = snapshot;
    } else {
      this.cmsSnapshot = snapshot;
    }

    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
    } catch {
      // Ignore storage failures and continue using in-memory snapshots.
    }
  }

  private getSnapshot(storageKey: string) {
    const inMemory = storageKey === PUBLIC_DATA_CACHE_KEY ? this.publicSnapshot : this.cmsSnapshot;
    if (inMemory) return inMemory;

    const persisted = this.readSnapshot(storageKey);
    if (!persisted) return null;

    if (storageKey === PUBLIC_DATA_CACHE_KEY) {
      this.publicSnapshot = persisted;
    } else {
      this.cmsSnapshot = persisted;
    }

    return persisted;
  }

  private getFreshPublicSnapshot() {
    const snapshot = this.getSnapshot(PUBLIC_DATA_CACHE_KEY);
    if (!snapshot) return null;
    return Date.now() - snapshot.cachedAt <= PUBLIC_DATA_CACHE_MAX_AGE_MS ? snapshot : null;
  }

  private getClient() {
    if (!this.client) {
      this.client = createBrowserSupabaseClient(getEnv("VITE_SUPABASE_URL"), getEnv("VITE_SUPABASE_ANON_KEY"));
    }

    return this.client;
  }

  private getReadClient() {
    if (!this.readClient) {
      this.readClient = createTimedBrowserSupabaseClient(
        getEnv("VITE_SUPABASE_URL"),
        getEnv("VITE_SUPABASE_ANON_KEY"),
        SUPABASE_READ_TIMEOUT_MS,
      );
    }

    return this.readClient;
  }

  getCachedPublicData(): CMSData | null {
    if (shouldUseBundledPublicSnapshot()) {
      return bundledPublicSnapshot.data;
    }

    return this.getFreshPublicSnapshot()?.data ?? null;
  }

  getCachedCmsData(): CMSData | null {
    return this.getSnapshot(CMS_DATA_CACHE_KEY)?.data ?? null;
  }

  cachePublicData(data: CMSData) {
    this.writeSnapshot(PUBLIC_DATA_CACHE_KEY, data);
  }

  cacheCmsData(data: CMSData) {
    this.writeSnapshot(CMS_DATA_CACHE_KEY, data);
  }

  loadPublicData(): Promise<CMSData> {
    const snapshot = this.getFreshPublicSnapshot();

    if (shouldUseBundledPublicSnapshot()) {
      this.writeSnapshot(PUBLIC_DATA_CACHE_KEY, bundledPublicSnapshot.data);
      return Promise.resolve(bundledPublicSnapshot.data);
    }

    if (this.publicLoadPromise) {
      return this.publicLoadPromise;
    }

    this.publicLoadPromise = (shouldUseRepositoryPublicSource()
      ? fetchFromCmsRepository()
      : loadPublicCMSDataFromSupabase(this.getReadClient()))
      .then((data) => {
        this.writeSnapshot(PUBLIC_DATA_CACHE_KEY, data);
        return data;
      })
      .catch((rawError) => {
        const error = normalizeLoadError(rawError);
        if (snapshot) {
          console.warn("[SupabaseDataProvider] Using cached public snapshot after load failure.", error);
          return snapshot.data;
        }
        console.warn("[SupabaseDataProvider] Using bundled public snapshot after load failure.", error);
        this.writeSnapshot(PUBLIC_DATA_CACHE_KEY, bundledPublicSnapshot.data);
        return bundledPublicSnapshot.data;
      })
      .finally(() => {
        this.publicLoadPromise = null;
      });

    return this.publicLoadPromise;
  }

  loadCmsData(): Promise<CMSData> {
    const snapshot = this.getSnapshot(CMS_DATA_CACHE_KEY);

    if (this.cmsLoadPromise) {
      return this.cmsLoadPromise;
    }

    this.cmsLoadPromise = loadCmsDataFromSupabase(this.getReadClient())
      .then((data) => {
        this.writeSnapshot(CMS_DATA_CACHE_KEY, data);
        return data;
      })
      .catch((rawError) => {
        const error = normalizeLoadError(rawError);
        if (snapshot) {
          console.warn("[SupabaseDataProvider] Using cached CMS snapshot after load failure.", error);
          return snapshot.data;
        }
        throw error;
      })
      .finally(() => {
        this.cmsLoadPromise = null;
      });

    return this.cmsLoadPromise;
  }

  saveSiteSettings(siteSettings: SiteSettings) {
    return saveSiteSettings(this.getClient(), siteSettings);
  }

  savePublicSnapshot(data: CMSData) {
    return savePublicCMSDataSnapshot(this.getClient(), data);
  }

  saveProfile(profile: ProfileData) {
    return saveProfile(this.getClient(), profile);
  }

  saveCollection(collection: CMSCollectionName, previous: any[], next: any[]) {
    switch (collection) {
      case "projects":
        return saveProjects(this.getClient(), previous, next);
      case "blogPosts":
        return saveBlogPosts(this.getClient(), previous, next);
      case "pages":
        return savePages(this.getClient(), previous, next);
      case "experiences":
        return saveExperiences(this.getClient(), previous, next);
      case "education":
        return saveEducation(this.getClient(), previous, next);
      case "certifications":
        return saveCertifications(this.getClient(), previous, next);
      case "stack":
        return saveStack(this.getClient(), previous, next);
      case "awards":
        return saveAwards(this.getClient(), previous, next);
      case "recommendations":
        return saveRecommendations(this.getClient(), previous, next);
      case "media":
        return Promise.resolve();
      default:
        return Promise.resolve();
    }
  }

  uploadMedia(file: File, visibility: MediaVisibility = "public"): Promise<MediaItem> {
    return uploadMedia(this.getClient(), file, visibility);
  }

  deleteMedia(item: MediaItem) {
    return deleteMedia(this.getClient(), item);
  }

  loadVersions(entityType: ContentEntityType, entityId: string): Promise<ContentVersion[]> {
    return loadContentVersions(this.getClient(), entityType, entityId);
  }

  saveVersion(entityType: ContentEntityType, entityId: string, snapshot: Record<string, unknown>, label: string) {
    return saveContentVersion(this.getClient(), entityType, entityId, snapshot, label);
  }

  signIn(email: string, password: string) {
    return signInWithPassword(this.getClient(), email, password);
  }

  signOut() {
    return signOut(this.getClient());
  }

  getSession() {
    return getSession(this.getClient());
  }

  onAuthStateChange(callback: Parameters<typeof onAuthStateChange>[1]) {
    return onAuthStateChange(this.getClient(), callback);
  }

  isSlugAvailable(collection: Extract<CMSCollectionName, "projects" | "blogPosts" | "pages">, slug: string, excludeId?: string) {
    return isSlugAvailable(this.getClient(), collection, slug, excludeId);
  }

  getProjectAccessStatus(projectId: string, visitorToken: string): Promise<ProjectAccessStatus> {
    return getProjectAccessStatus(this.getReadClient(), projectId, visitorToken);
  }

  submitProjectAccessRequest(input: {
    projectId: string;
    requesterName: string;
    requesterEmail: string;
    requesterMessage: string;
    visitorToken: string;
  }): Promise<SubmitProjectAccessRequestResult> {
    return submitProjectAccessRequest(this.getClient(), input);
  }

  loadProjectAccessRequests(): Promise<ProjectAccessRequest[]> {
    return loadProjectAccessRequests(this.getClient());
  }

  updateProjectAccessRequestStatus(requestId: string, status: ProjectAccessRequestStatus): Promise<void> {
    return updateProjectAccessRequestStatus(this.getClient(), requestId, status);
  }
}

export const dataProvider = new SupabaseDataProvider();
