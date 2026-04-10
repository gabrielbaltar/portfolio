import type {
  Award,
  BlogPost,
  CMSData,
  Certification,
  ContentBlock,
  ContentListItem,
  Education,
  Experience,
  HomeGalleryItem,
  MediaItem,
  Page,
  ProfileData,
  Recommendation,
  SiteSettings,
  StackItem,
} from "./types";
import {
  clampExperienceTaskLineHeight,
  DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT,
} from "./experience";
import { clampStackLogoRadius, DEFAULT_STACK_LOGO_RADIUS } from "./stack";

const now = new Date().toISOString();

export const defaultSiteSettings: SiteSettings = {
  id: "main",
  siteTitle: "",
  siteDescription: "",
  stackSectionTitlePt: "",
  stackSectionTitleEn: "",
  homeGalleryTitlePt: "",
  homeGalleryTitleEn: "",
  homeGalleryIntroPt: "",
  homeGalleryIntroEn: "",
  homeGalleryItems: [],
  templateUrl: "",
  resumeUrl: "",
  defaultLanguage: "pt",
  defaultTheme: "dark",
  footerCredit: "",
  footerCopyright: "",
  seoTitle: "",
  seoDescription: "",
  projectOrder: [],
  blogPostOrder: [],
  sectionVisibility: {},
  contentVisibility: {},
  projectCardOverrides: {},
  blogPostCardOverrides: {},
  experienceOverrides: {},
  createdAt: now,
  updatedAt: now,
};

function applyExplicitOrder<T extends { id: string }>(items: T[], order: string[]) {
  if (!order.length || items.length < 2) return items;

  const rank = new Map(order.map((id, index) => [id, index]));

  return [...items].sort((left, right) => {
    const leftRank = rank.get(left.id);
    const rightRank = rank.get(right.id);

    if (leftRank === undefined && rightRank === undefined) return 0;
    if (leftRank === undefined) return 1;
    if (rightRank === undefined) return -1;
    return leftRank - rightRank;
  });
}

export const defaultProfile: ProfileData = {
  id: "main",
  name: "",
  role: "",
  location: "",
  available: false,
  availableText: "",
  currentJobTitle: "",
  currentCompany: "",
  currentCompanyUrl: "",
  email: "",
  phone: "",
  photo: "",
  twitter: "",
  twitterLabel: "Twitter",
  instagram: "",
  instagramLabel: "Instagram",
  linkedin: "",
  linkedinLabel: "LinkedIn",
  aboutTitle: "",
  aboutParagraph1: "",
  aboutParagraph2: "",
  createdAt: now,
  updatedAt: now,
};

export function getProfileAboutParagraphs(
  profile: Pick<ProfileData, "aboutParagraphs" | "aboutParagraph1" | "aboutParagraph2"> | null | undefined,
) {
  if (Array.isArray(profile?.aboutParagraphs)) {
    return profile.aboutParagraphs.map((paragraph) => (typeof paragraph === "string" ? paragraph : ""));
  }

  return [
    typeof profile?.aboutParagraph1 === "string" ? profile.aboutParagraph1 : "",
    typeof profile?.aboutParagraph2 === "string" ? profile.aboutParagraph2 : "",
  ];
}

export function syncProfileAboutFields(profile: ProfileData): ProfileData {
  const aboutParagraphs = getProfileAboutParagraphs(profile);

  return {
    ...profile,
    aboutParagraphs,
    aboutParagraph1: aboutParagraphs[0] || "",
    aboutParagraph2: aboutParagraphs[1] || "",
  };
}

export function emptyMedia(): MediaItem[] {
  return [];
}

export function emptyExperiences(): Experience[] {
  return [];
}

export function emptyEducation(): Education[] {
  return [];
}

export function emptyCertifications(): Certification[] {
  return [];
}

export function emptyStack(): StackItem[] {
  return [];
}

export function emptyAwards(): Award[] {
  return [];
}

export function emptyRecommendations(): Recommendation[] {
  return [];
}

export function emptyProjects(): CMSData["projects"] {
  return [];
}

export function emptyBlogPosts(): BlogPost[] {
  return [];
}

export function emptyPages(): Page[] {
  return [];
}

export function createEmptyCMSData(): CMSData {
  return {
    siteSettings: { ...defaultSiteSettings },
    profile: { ...defaultProfile },
    projects: emptyProjects(),
    experiences: emptyExperiences(),
    education: emptyEducation(),
    certifications: emptyCertifications(),
    stack: emptyStack(),
    awards: emptyAwards(),
    recommendations: emptyRecommendations(),
    blogPosts: emptyBlogPosts(),
    pages: emptyPages(),
    media: emptyMedia(),
  };
}

function normalizeListItems(items: unknown): ContentListItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    if (typeof item === "string") {
      return {
        text: item,
        children: [],
      };
    }

    if (item && typeof item === "object") {
      const text = typeof (item as { text?: unknown }).text === "string" ? (item as { text: string }).text : "";
      const children = normalizeListItems((item as { children?: unknown }).children);
      return {
        text,
        children,
      };
    }

    return {
      text: "",
      children: [],
    };
  });
}

function normalizeHomeGalleryItems(items: unknown): HomeGalleryItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    const record = item && typeof item === "object" ? item as Partial<HomeGalleryItem> : {};

    return {
      id: typeof record.id === "string" && record.id.trim() ? record.id : `home-gallery-${index + 1}`,
      title: typeof record.title === "string" ? record.title : "",
      subtitle: typeof record.subtitle === "string" ? record.subtitle : "",
      image: typeof record.image === "string" ? record.image : "",
      imagePosition: typeof record.imagePosition === "string" && record.imagePosition.trim()
        ? record.imagePosition
        : "50% 50%",
    };
  });
}

function normalizeContentBlocks(blocks: ContentBlock[] | undefined) {
  return (blocks ?? []).map((block) => {
    if (block.type !== "unordered-list" && block.type !== "ordered-list") {
      return block;
    }

    return {
      ...block,
      items: normalizeListItems(block.items),
    };
  });
}

export function normalizeCMSData(data: Partial<CMSData> | null | undefined): CMSData {
  const empty = createEmptyCMSData();
  const siteSettings = {
    ...empty.siteSettings,
    ...(data?.siteSettings ?? {}),
    homeGalleryItems: normalizeHomeGalleryItems(data?.siteSettings?.homeGalleryItems),
  };
  const profile = syncProfileAboutFields({ ...empty.profile, ...(data?.profile ?? {}) });
  const projects = applyExplicitOrder(data?.projects ?? empty.projects, siteSettings.projectOrder).map((project) => ({
    ...project,
    titleAppearance: siteSettings.projectCardOverrides?.[project.id]?.titleAppearance || project.titleAppearance,
    subtitleAppearance: siteSettings.projectCardOverrides?.[project.id]?.subtitleAppearance || project.subtitleAppearance,
    cardImage: siteSettings.projectCardOverrides?.[project.id]?.image || project.cardImage || "",
    cardImagePosition:
      siteSettings.projectCardOverrides?.[project.id]?.imagePosition ||
      project.cardImagePosition ||
      project.imagePosition ||
      "50% 50%",
    contentBlocks: normalizeContentBlocks(project.contentBlocks),
  }));
  const blogPosts = applyExplicitOrder(data?.blogPosts ?? empty.blogPosts, siteSettings.blogPostOrder).map((post) => ({
    ...post,
    titleAppearance: siteSettings.blogPostCardOverrides?.[post.id]?.titleAppearance || post.titleAppearance,
    subtitleAppearance: siteSettings.blogPostCardOverrides?.[post.id]?.subtitleAppearance || post.subtitleAppearance,
    cardTitle: siteSettings.blogPostCardOverrides?.[post.id]?.title || post.cardTitle || "",
    cardSubtitle: siteSettings.blogPostCardOverrides?.[post.id]?.subtitle || post.cardSubtitle || "",
    cardImage: siteSettings.blogPostCardOverrides?.[post.id]?.image || post.cardImage || "",
    cardImagePosition:
      siteSettings.blogPostCardOverrides?.[post.id]?.imagePosition ||
      post.cardImagePosition ||
      post.imagePosition ||
      "50% 50%",
    contentBlocks: normalizeContentBlocks(post.contentBlocks),
  }));
  const pages = (data?.pages ?? empty.pages).map((page) => ({
    ...page,
    contentBlocks: normalizeContentBlocks(page.contentBlocks),
  }));
  const experiences = (data?.experiences ?? empty.experiences).map((experience) => ({
    ...experience,
    tasks: experience.tasks ?? [],
    taskLineHeight: clampExperienceTaskLineHeight(
      siteSettings.experienceOverrides?.[experience.id]?.taskLineHeight ??
        experience.taskLineHeight ??
        DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT,
    ),
  }));
  const stack = (data?.stack ?? empty.stack).map((item) => ({
    ...item,
    logoRadius: clampStackLogoRadius(item.logoRadius ?? DEFAULT_STACK_LOGO_RADIUS),
  }));

  return {
    ...empty,
    ...data,
    siteSettings,
    profile,
    projects,
    experiences,
    education: data?.education ?? empty.education,
    certifications: data?.certifications ?? empty.certifications,
    stack,
    awards: data?.awards ?? empty.awards,
    recommendations: data?.recommendations ?? empty.recommendations,
    blogPosts,
    pages,
    media: data?.media ?? empty.media,
  };
}
