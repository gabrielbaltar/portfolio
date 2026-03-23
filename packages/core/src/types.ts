export type Language = "pt" | "en";
export type ThemeMode = "dark" | "light";
export type ContentStatus = "draft" | "review" | "published" | "archived";
export type PortfolioSectionId =
  | "about"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "stack"
  | "awards"
  | "recommendations"
  | "blog"
  | "contact";
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
export type PublicContentVisibilityCollection =
  | "projects"
  | "blogPosts"
  | "pages"
  | "experiences"
  | "education"
  | "certifications"
  | "stack"
  | "awards"
  | "recommendations";

export interface StyleGuidePrinciple {
  title: string;
  description: string;
}

export interface ColorPaletteItem {
  name: string;
  token?: string;
  hex: string;
  role: string;
  usage: string;
}

export interface TypographyItem {
  label: string;
  token?: string;
  family: string;
  weight: string;
  size: string;
  lineHeight: string;
  sample: string;
}

export interface IconGridItem {
  name: string;
  token?: string;
  url: string;
  notes: string;
}

export interface UserFlowStep {
  title: string;
  description: string;
  outcome: string;
}

export interface SitemapSection {
  title: string;
  description: string;
  children: string[];
}

export interface ContentListItem {
  text: string;
  children?: ContentListItem[];
}

export type ContentBlock =
  | { type: "paragraph"; text: string; lineHeight?: number }
  | { type: "heading1"; text: string; lineHeight?: number }
  | { type: "heading2"; text: string; lineHeight?: number }
  | { type: "heading3"; text: string; lineHeight?: number }
  | { type: "unordered-list"; items: ContentListItem[]; lineHeight?: number }
  | { type: "ordered-list"; items: ContentListItem[]; lineHeight?: number }
  | { type: "style-guide"; title: string; summary: string; principles: StyleGuidePrinciple[] }
  | { type: "color-palette"; title: string; colors: ColorPaletteItem[] }
  | { type: "typography"; title: string; fonts: TypographyItem[] }
  | { type: "icon-grid"; title: string; icons: IconGridItem[] }
  | { type: "user-flow"; title: string; steps: UserFlowStep[] }
  | { type: "sitemap"; title: string; sections: SitemapSection[] }
  | { type: "code"; code: string; language: string; caption?: string }
  | { type: "image"; url: string; caption: string; position?: string; borderRadius?: number; galleryImages?: string[]; galleryPositions?: string[] }
  | { type: "video"; url: string; caption: string; poster?: string; autoplay?: boolean; loop?: boolean; muted?: boolean; previewStart?: number; previewDuration?: number; borderRadius?: number; fit?: "contain" | "cover"; zoom?: number }
  | { type: "divider"; spacing?: number }
  | { type: "quote"; text: string; author: string; lineHeight?: number }
  | { type: "cta"; text: string; buttonText: string; buttonUrl: string; openInNewTab?: boolean; lineHeight?: number }
  | { type: "embed"; url: string; caption: string; height?: number };

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
  projectOrder: string[];
  blogPostOrder: string[];
  sectionVisibility: Partial<Record<PortfolioSectionId, boolean>>;
  contentVisibility: Record<string, boolean>;
  projectCardOverrides: Record<string, { title?: string; subtitle?: string }>;
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
  twitterLabel: string;
  instagram: string;
  instagramLabel: string;
  linkedin: string;
  linkedinLabel: string;
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
  cardImage?: string;
  cardImagePosition?: string;
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
  cardImage?: string;
  cardImagePosition?: string;
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
  showLink?: boolean;
}

export interface StackItem extends SortableEntity {
  id: string;
  name: string;
  description: string;
  color: string;
  logo?: string;
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
