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

function getEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

class SupabaseDataProvider {
  private client = createBrowserSupabaseClient(getEnv("VITE_SUPABASE_URL"), getEnv("VITE_SUPABASE_ANON_KEY"));

  loadPublicData(): Promise<CMSData> {
    return loadPublicCMSDataFromSupabase(this.client);
  }

  loadCmsData(): Promise<CMSData> {
    return loadCmsDataFromSupabase(this.client);
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
