import type {
  CMSCollectionName,
  CMSData,
  ContentEntityType,
  ContentVersion,
  MediaItem,
  MediaVisibility,
  ProfileData,
  SiteSettings,
} from "@portfolio/core";
import {
  createBrowserSupabaseClient,
  getSession,
  isSlugAvailable,
  loadCmsData as loadCmsDataFromSupabase,
  loadContentVersions,
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
  saveRecommendations,
  saveSiteSettings,
  saveStack,
  signInWithPassword,
  signOut,
  uploadMedia,
  deleteMedia,
} from "@portfolio/supabase";

const PUBLIC_DATA_CACHE_KEY = "portfolio_public_cms_snapshot_v1";
const CMS_DATA_CACHE_KEY = "portfolio_cms_snapshot_v1";
const PUBLIC_DATA_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedSnapshot = {
  cachedAt: number;
  data: CMSData;
};

function getEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

class SupabaseDataProvider {
  private client = createBrowserSupabaseClient(getEnv("VITE_SUPABASE_URL"), getEnv("VITE_SUPABASE_ANON_KEY"));
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

  loadPublicData(): Promise<CMSData> {
    const snapshot = this.getSnapshot(PUBLIC_DATA_CACHE_KEY);
    const isFresh = Boolean(snapshot && Date.now() - snapshot.cachedAt < PUBLIC_DATA_CACHE_TTL_MS);

    if (isFresh && snapshot) {
      return Promise.resolve(snapshot.data);
    }

    if (this.publicLoadPromise) {
      return this.publicLoadPromise;
    }

    this.publicLoadPromise = loadPublicCMSDataFromSupabase(this.client)
      .then((data) => {
        this.writeSnapshot(PUBLIC_DATA_CACHE_KEY, data);
        return data;
      })
      .catch((error) => {
        if (snapshot) {
          console.warn("[SupabaseDataProvider] Using cached public snapshot after load failure.", error);
          return snapshot.data;
        }
        throw error;
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

    this.cmsLoadPromise = loadCmsDataFromSupabase(this.client)
      .then((data) => {
        this.writeSnapshot(CMS_DATA_CACHE_KEY, data);
        return data;
      })
      .catch((error) => {
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
    return saveSiteSettings(this.client, siteSettings);
  }

  saveProfile(profile: ProfileData) {
    return saveProfile(this.client, profile);
  }

  saveCollection(collection: CMSCollectionName, previous: any[], next: any[]) {
    switch (collection) {
      case "projects":
        return saveProjects(this.client, previous, next);
      case "blogPosts":
        return saveBlogPosts(this.client, previous, next);
      case "pages":
        return savePages(this.client, previous, next);
      case "experiences":
        return saveExperiences(this.client, previous, next);
      case "education":
        return saveEducation(this.client, previous, next);
      case "certifications":
        return saveCertifications(this.client, previous, next);
      case "stack":
        return saveStack(this.client, previous, next);
      case "awards":
        return saveAwards(this.client, previous, next);
      case "recommendations":
        return saveRecommendations(this.client, previous, next);
      case "media":
        return Promise.resolve();
      default:
        return Promise.resolve();
    }
  }

  uploadMedia(file: File, visibility: MediaVisibility = "public"): Promise<MediaItem> {
    return uploadMedia(this.client, file, visibility);
  }

  deleteMedia(item: MediaItem) {
    return deleteMedia(this.client, item);
  }

  loadVersions(entityType: ContentEntityType, entityId: string): Promise<ContentVersion[]> {
    return loadContentVersions(this.client, entityType, entityId);
  }

  saveVersion(entityType: ContentEntityType, entityId: string, snapshot: Record<string, unknown>, label: string) {
    return saveContentVersion(this.client, entityType, entityId, snapshot, label);
  }

  signIn(email: string, password: string) {
    return signInWithPassword(this.client, email, password);
  }

  signOut() {
    return signOut(this.client);
  }

  getSession() {
    return getSession(this.client);
  }

  onAuthStateChange(callback: Parameters<typeof onAuthStateChange>[1]) {
    return onAuthStateChange(this.client, callback);
  }

  isSlugAvailable(collection: Extract<CMSCollectionName, "projects" | "blogPosts" | "pages">, slug: string, excludeId?: string) {
    return isSlugAvailable(this.client, collection, slug, excludeId);
  }
}

export const dataProvider = new SupabaseDataProvider();
