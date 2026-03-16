import type {
  Award,
  BlogPost,
  CMSData,
  Certification,
  ContentBlock,
  ContentListItem,
  Education,
  Experience,
  MediaItem,
  Page,
  ProfileData,
  Recommendation,
  SiteSettings,
  StackItem,
} from "./types";

const now = new Date().toISOString();

export const defaultSiteSettings: SiteSettings = {
  id: "main",
  siteTitle: "",
  siteDescription: "",
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
  const siteSettings = { ...empty.siteSettings, ...(data?.siteSettings ?? {}) };
  const projects = applyExplicitOrder(data?.projects ?? empty.projects, siteSettings.projectOrder).map((project) => ({
    ...project,
    contentBlocks: normalizeContentBlocks(project.contentBlocks),
  }));
  const blogPosts = applyExplicitOrder(data?.blogPosts ?? empty.blogPosts, siteSettings.blogPostOrder).map((post) => ({
    ...post,
    contentBlocks: normalizeContentBlocks(post.contentBlocks),
  }));
  const pages = (data?.pages ?? empty.pages).map((page) => ({
    ...page,
    contentBlocks: normalizeContentBlocks(page.contentBlocks),
  }));

  return {
    ...empty,
    ...data,
    siteSettings,
    profile: { ...empty.profile, ...(data?.profile ?? {}) },
    projects,
    experiences: data?.experiences ?? empty.experiences,
    education: data?.education ?? empty.education,
    certifications: data?.certifications ?? empty.certifications,
    stack: data?.stack ?? empty.stack,
    awards: data?.awards ?? empty.awards,
    recommendations: data?.recommendations ?? empty.recommendations,
    blogPosts,
    pages,
    media: data?.media ?? empty.media,
  };
}
