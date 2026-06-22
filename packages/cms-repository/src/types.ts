import type { BlogPost, CMSData, ProfileData, Project as CoreProject } from "@portfolio/core";

export type CaseStudy = CoreProject;
export type Project = CoreProject;
export type Profile = ProfileData;
export type Article = BlogPost;

export type CMSProviderName = "supabase" | "turso" | "static";

export interface CMSProvider {
  readonly name: CMSProviderName;
  loadPublicCMSData(): Promise<CMSData>;
  savePublicCMSData?(data: CMSData): Promise<void>;
}

export interface CMSRepositoryResult {
  provider: CMSProviderName;
  data: CMSData;
}

export interface CMSRepository {
  loadPublicCMSData(): Promise<CMSRepositoryResult>;
}

export interface CMSRepositoryLogger {
  info(message: string): void;
  warn(message: string): void;
}
