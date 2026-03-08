export type Language = "pt" | "en";
export type ThemeMode = "dark" | "light";
export type ContentStatus = "draft" | "review" | "published" | "archived";
export type ContentEntityType =
  | "project"
  | "blog_post"
  | "page"
  | "experience"
  | "education"
  | "certification"
  | "stack"
  | "award"
  | "recommendation";

export type MediaVisibility = "public" | "private";

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading1"; text: string }
  | { type: "heading2"; text: string }
  | { type: "heading3"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "image"; url: string; caption: string; position?: string; borderRadius?: number }
  | { type: "video"; url: string; caption: string; poster?: string; autoplay?: boolean; loop?: boolean; muted?: boolean; borderRadius?: number }
  | { type: "divider" }
  | { type: "quote"; text: string; author: string }
  | { type: "cta"; text: string; buttonText: string; buttonUrl: string; openInNewTab?: boolean }
  | { type: "embed"; url: string; caption: string };

export interface TimestampedEntity {
  createdAt: string;
  updatedAt: string;
}

export interface SortableEntity {
  sortOrder: number;
}

export interface SiteSettings extends TimestampedEntity {
  id: string;
  siteTitle: string;
  siteDescription: string;
  templateUrl: string;
  resumeUrl: string;
  defaultLanguage: Language;
  defaultTheme: ThemeMode;
  footerCredit: string;
  footerCopyright: string;
  seoTitle: string;
  seoDescription: string;
}

export interface ProfileData extends TimestampedEntity {
  id: string;
  name: string;
  role: string;
  location: string;
  available: boolean;
  availableText: string;
  currentJobTitle: string;
  currentCompany: string;
  currentCompanyUrl: string;
  email: string;
  phone: string;
  photo: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
}

export interface Project extends TimestampedEntity {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  services: string;
  client: string;
  year: string;
  image: string;
  imageBgColor?: string;
  imagePosition?: string;
  galleryImages: string[];
  galleryPositions?: string[];
  link: string;
  slug: string;
  description: string;
  contentBlocks: ContentBlock[];
  password?: string;
  status: ContentStatus;
  tags: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  publishedAt?: string | null;
}

export interface BlogPost extends TimestampedEntity {
  id: string;
  title: string;
  subtitle?: string;
  publisher: string;
  date: string;
  description: string;
  image: string;
  imageBgColor?: string;
  imagePosition?: string;
  galleryPositions?: string[];
  galleryImages?: string[];
  content: string;
  contentBlocks: ContentBlock[];
  slug: string;
  status: ContentStatus;
  tags: string[];
  featured: boolean;
  author: string;
  readTime: string;
  link?: string;
  category?: string;
  services?: string;
  password?: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt?: string | null;
}

export interface Page extends TimestampedEntity {
  id: string;
  title: string;
  slug: string;
  description: string;
  contentBlocks: ContentBlock[];
  status: ContentStatus;
  seoTitle: string;
  seoDescription: string;
  publishedAt?: string | null;
}

export interface Experience extends SortableEntity {
  id: string;
  location: string;
  company: string;
  period: string;
  role: string;
  tasks: string[];
}

export interface Education extends SortableEntity {
  id: string;
  location: string;
  period: string;
  degree: string;
  university: string;
  description: string;
}

export interface Certification extends SortableEntity {
  id: string;
  title: string;
  issuer: string;
  link: string;
}

export interface StackItem extends SortableEntity {
  id: string;
  name: string;
  description: string;
  color: string;
  link: string;
}

export interface Award extends SortableEntity {
  id: string;
  title: string;
  issuer: string;
  link: string;
}

export interface Recommendation extends SortableEntity {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export interface MediaItem extends TimestampedEntity {
  id: string;
  name: string;
  bucket: string;
  path: string;
  url: string;
  visibility: MediaVisibility;
  mimeType: string;
  size: number;
  kind: "image" | "video" | "file";
}

export interface ContentVersion {
  id: string;
  entityType: ContentEntityType;
  entityId: string;
  label: string;
  snapshot: Record<string, unknown>;
  createdAt: string;
  createdBy?: string | null;
}

export interface CMSData {
  siteSettings: SiteSettings;
  profile: ProfileData;
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  stack: StackItem[];
  awards: Award[];
  recommendations: Recommendation[];
  blogPosts: BlogPost[];
  pages: Page[];
  media: MediaItem[];
}

export interface CMSLoadState {
  data: CMSData;
  loading: boolean;
  error: string | null;
}

export type CMSCollectionName =
  | "projects"
  | "blogPosts"
  | "pages"
  | "experiences"
  | "education"
  | "certifications"
  | "stack"
  | "awards"
  | "recommendations"
  | "media";
