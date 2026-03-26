import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  createEmptyCMSData,
  legacySeedData,
  normalizeCMSData,
  type Award,
  type BlogPost,
  type CMSCollectionName,
  type CMSData,
  type Certification,
  type ContentBlock,
  type ContentStatus,
  type Education,
  type Experience,
  type MediaItem,
  type Page,
  type ProfileData,
  type Project,
  type Recommendation,
  type SiteSettings,
  type StackItem,
  type TextAppearance,
} from "@portfolio/core";
import { dataProvider } from "./data-provider";

export type {
  Award,
  BlogPost,
  CMSData,
  Certification,
  ContentBlock,
  ContentStatus,
  Education,
  Experience,
  MediaItem,
  Page,
  ProfileData,
  Project,
  Recommendation,
  SiteSettings,
  StackItem,
  TextAppearance,
} from "@portfolio/core";

type CMSMode = "public" | "cms";

interface CMSContextType {
  mode: CMSMode;
  data: CMSData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveAll: () => Promise<void>;
  updateData: (newData: CMSData) => void;
  updateSiteSettings: (siteSettings: SiteSettings) => void;
  updateProfile: (profile: ProfileData) => void;
  updateProjects: (projects: Project[]) => void;
  updateExperiences: (experiences: Experience[]) => void;
  updateEducation: (education: Education[]) => void;
  updateCertifications: (certifications: Certification[]) => void;
  updateStack: (stack: StackItem[]) => void;
  updateAwards: (awards: Award[]) => void;
  updateRecommendations: (recommendations: Recommendation[]) => void;
  updateBlogPosts: (blogPosts: BlogPost[]) => void;
  updatePages: (pages: Page[]) => void;
  updateMedia: (media: MediaItem[]) => void;
  addMediaItem: (item: MediaItem) => void;
  removeMediaItem: (id: string) => void;
  resetData: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType | null>(null);

async function loadByMode(mode: CMSMode): Promise<CMSData> {
  const loaded = mode === "cms" ? await dataProvider.loadCmsData() : await dataProvider.loadPublicData();
  return normalizeCMSData(loaded);
}

async function persistCollection<K extends CMSCollectionName>(key: K, previous: CMSData[K], next: CMSData[K]) {
  await dataProvider.saveCollection(key, previous, next);
}

const PUBLIC_REFRESH_INTERVAL_MS = 30 * 60 * 1000;

export function CMSProvider({ children, mode = "public" }: { children: ReactNode; mode?: CMSMode }) {
  const initialSnapshot = mode === "cms" ? dataProvider.getCachedCmsData() : dataProvider.getCachedPublicData();
  const [data, setData] = useState<CMSData>(() => normalizeCMSData(initialSnapshot ?? createEmptyCMSData()));
  const [loading, setLoading] = useState(!initialSnapshot);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<CMSData>(data);
  const persistedDataRef = useRef<CMSData>(data);
  const hasInitialSnapshotRef = useRef(Boolean(initialSnapshot));

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const refreshData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const nextData = await loadByMode(mode);
      setData(nextData);
      dataRef.current = nextData;
      persistedDataRef.current = nextData;
      if (!silent) {
        setError(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados do CMS.";
      if (!silent) {
        setError(message);
        toast.error(message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const refresh = () => refreshData(false);

  useEffect(() => {
    const silentInitialRefresh = hasInitialSnapshotRef.current;
    hasInitialSnapshotRef.current = false;
    void refreshData(silentInitialRefresh);
  }, [mode]);

  useEffect(() => {
    if (mode !== "public") return;

    const refreshInBackground = () => {
      void refreshData(true);
    };

    const intervalId = window.setInterval(refreshInBackground, PUBLIC_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [mode]);

  const updateData = (newData: CMSData) => {
    setData(newData);
    dataRef.current = newData;
  };

  const updateSingleton = <K extends "siteSettings" | "profile">(key: K, nextValue: CMSData[K]) => {
    const previous = dataRef.current[key];
    const nextData = { ...dataRef.current, [key]: nextValue } as CMSData;
    setData(nextData);
    dataRef.current = nextData;

    if (mode !== "cms") return;

    const savePromise =
      key === "siteSettings"
        ? dataProvider.saveSiteSettings(nextValue as SiteSettings)
        : dataProvider.saveProfile(nextValue as ProfileData);

    void savePromise.catch((err) => {
      const message = err instanceof Error ? err.message : "Erro ao salvar configuracao.";
      setData((current) => ({ ...current, [key]: previous }));
      dataRef.current = { ...dataRef.current, [key]: previous } as CMSData;
      toast.error(message);
    });

    void savePromise.then(() => {
      const persisted = { ...persistedDataRef.current, [key]: nextValue } as CMSData;
      persistedDataRef.current = persisted;
      dataProvider.cacheCmsData(persisted);
    });
  };

  const updateCollection = <K extends CMSCollectionName>(key: K, nextValue: CMSData[K]) => {
    const previous = dataRef.current[key];
    const nextData = { ...dataRef.current, [key]: nextValue } as CMSData;
    setData(nextData);
    dataRef.current = nextData;

    if (mode !== "cms") return;

    const savePromise = persistCollection(key, previous, nextValue);

    void savePromise.catch((err) => {
      const message = err instanceof Error ? err.message : "Erro ao salvar alteracoes.";
      const reverted = { ...dataRef.current, [key]: previous } as CMSData;
      setData(reverted);
      dataRef.current = reverted;
      toast.error(message);
    });

    void savePromise.then(() => {
      const persisted = { ...persistedDataRef.current, [key]: nextValue } as CMSData;
      persistedDataRef.current = persisted;
      dataProvider.cacheCmsData(persisted);
    });
  };

  const addMediaItem = (item: MediaItem) => {
    updateCollection("media", [item, ...dataRef.current.media]);
  };

  const removeMediaItem = (id: string) => {
    updateCollection(
      "media",
      dataRef.current.media.filter((item) => item.id !== id),
    );
  };

  const resetData = async () => {
    if (mode !== "cms") return;

    const previous = dataRef.current;
    const nextData = normalizeCMSData(legacySeedData);
    setData(nextData);
    dataRef.current = nextData;

    try {
      await dataProvider.saveSiteSettings(nextData.siteSettings);
      await dataProvider.saveProfile(nextData.profile);
      await Promise.all([
        dataProvider.saveCollection("projects", previous.projects, nextData.projects),
        dataProvider.saveCollection("blogPosts", previous.blogPosts, nextData.blogPosts),
        dataProvider.saveCollection("pages", previous.pages, nextData.pages),
        dataProvider.saveCollection("experiences", previous.experiences, nextData.experiences),
        dataProvider.saveCollection("education", previous.education, nextData.education),
        dataProvider.saveCollection("certifications", previous.certifications, nextData.certifications),
        dataProvider.saveCollection("stack", previous.stack, nextData.stack),
        dataProvider.saveCollection("awards", previous.awards, nextData.awards),
        dataProvider.saveCollection("recommendations", previous.recommendations, nextData.recommendations),
        dataProvider.saveCollection("media", previous.media, nextData.media),
      ]);
      persistedDataRef.current = nextData;
      dataProvider.cacheCmsData(nextData);
      toast.success("Conteudo demo restaurado.");
    } catch (err) {
      setData(previous);
      dataRef.current = previous;
      toast.error(err instanceof Error ? err.message : "Erro ao restaurar conteudo demo.");
      throw err;
    }
  };

  const saveAll = async () => {
    if (mode !== "cms") return;

    const previous = persistedDataRef.current;
    const nextData = dataRef.current;

    await dataProvider.saveSiteSettings(nextData.siteSettings);
    await dataProvider.saveProfile(nextData.profile);
    await Promise.all([
      dataProvider.saveCollection("projects", previous.projects, nextData.projects),
      dataProvider.saveCollection("blogPosts", previous.blogPosts, nextData.blogPosts),
      dataProvider.saveCollection("pages", previous.pages, nextData.pages),
      dataProvider.saveCollection("experiences", previous.experiences, nextData.experiences),
      dataProvider.saveCollection("education", previous.education, nextData.education),
      dataProvider.saveCollection("certifications", previous.certifications, nextData.certifications),
      dataProvider.saveCollection("stack", previous.stack, nextData.stack),
      dataProvider.saveCollection("awards", previous.awards, nextData.awards),
      dataProvider.saveCollection("recommendations", previous.recommendations, nextData.recommendations),
      dataProvider.saveCollection("media", previous.media, nextData.media),
    ]);

    persistedDataRef.current = nextData;
    dataProvider.cacheCmsData(nextData);
  };

  const value = useMemo<CMSContextType>(
    () => ({
      mode,
      data,
      loading,
      error,
      refresh,
      saveAll,
      updateData,
      updateSiteSettings: (siteSettings) => updateSingleton("siteSettings", siteSettings),
      updateProfile: (profile) => updateSingleton("profile", profile),
      updateProjects: (projects) => updateCollection("projects", projects),
      updateExperiences: (experiences) => updateCollection("experiences", experiences),
      updateEducation: (education) => updateCollection("education", education),
      updateCertifications: (certifications) => updateCollection("certifications", certifications),
      updateStack: (stack) => updateCollection("stack", stack),
      updateAwards: (awards) => updateCollection("awards", awards),
      updateRecommendations: (recommendations) => updateCollection("recommendations", recommendations),
      updateBlogPosts: (blogPosts) => updateCollection("blogPosts", blogPosts),
      updatePages: (pages) => updateCollection("pages", pages),
      updateMedia: (media) => updateCollection("media", media),
      addMediaItem,
      removeMediaItem,
      resetData,
    }),
    [data, error, loading, mode, saveAll],
  );

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}

const fallbackContext: CMSContextType = {
  mode: "public",
  data: createEmptyCMSData(),
  loading: false,
  error: null,
  refresh: async () => {},
  saveAll: async () => {},
  updateData: () => {},
  updateSiteSettings: () => {},
  updateProfile: () => {},
  updateProjects: () => {},
  updateExperiences: () => {},
  updateEducation: () => {},
  updateCertifications: () => {},
  updateStack: () => {},
  updateAwards: () => {},
  updateRecommendations: () => {},
  updateBlogPosts: () => {},
  updatePages: () => {},
  updateMedia: () => {},
  addMediaItem: () => {},
  removeMediaItem: () => {},
  resetData: async () => {},
};

export function useCMS() {
  return useContext(CMSContext) ?? fallbackContext;
}
