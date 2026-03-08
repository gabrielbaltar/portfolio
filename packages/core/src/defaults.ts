import type {
  Award,
  BlogPost,
  CMSData,
  Certification,
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
  siteTitle: "Gabriel Baltar",
  siteDescription: "Portfólio de UX Designer e Product Designer.",
  templateUrl: "#",
  resumeUrl: "#",
  defaultLanguage: "pt",
  defaultTheme: "dark",
  footerCredit: "Projetado no Figma por Gabriel Baltar",
  footerCopyright: "Todos os direitos reservados",
  seoTitle: "Gabriel Baltar | UX Designer",
  seoDescription: "Portfólio de UX Designer e Product Designer com projetos, artigos e experiência.",
  createdAt: now,
  updatedAt: now,
};

export const defaultProfile: ProfileData = {
  id: "main",
  name: "Gabriel Baltar Pereira",
  role: "UX Designer",
  location: "Rio de Janeiro, Brasil",
  available: true,
  availableText: "Disponivel para trabalho",
  currentJobTitle: "Senior Web Designer",
  currentCompany: "Digital Innovations Agency",
  currentCompanyUrl: "https://www.digitalinnovationsagency.com/",
  email: "gabriel.baltar21@hotmail.com",
  phone: "(21) 99999-9999",
  photo: "",
  twitter: "https://x.com/",
  instagram: "https://www.instagram.com/",
  linkedin: "https://linkedin.com/",
  aboutTitle: "Sobre mim",
  aboutParagraph1:
    "Ola, eu sou o Gabriel Baltar, um UX/UI Designer e Product Designer com mais de 5 anos de experiencia criando experiencias digitais visualmente impressionantes e centradas no usuario.",
  aboutParagraph2:
    "Minha jornada no design comecou com a curiosidade de como as interfaces digitais funcionam e o desejo de criar algo significativo. Ao longo dos anos, aprimorei minhas habilidades em design de interfaces, pesquisa de usuario e otimizacao de experiencia.",
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

export function normalizeCMSData(data: Partial<CMSData> | null | undefined): CMSData {
  const empty = createEmptyCMSData();
  return {
    ...empty,
    ...data,
    siteSettings: { ...empty.siteSettings, ...(data?.siteSettings ?? {}) },
    profile: { ...empty.profile, ...(data?.profile ?? {}) },
    projects: data?.projects ?? empty.projects,
    experiences: data?.experiences ?? empty.experiences,
    education: data?.education ?? empty.education,
    certifications: data?.certifications ?? empty.certifications,
    stack: data?.stack ?? empty.stack,
    awards: data?.awards ?? empty.awards,
    recommendations: data?.recommendations ?? empty.recommendations,
    blogPosts: data?.blogPosts ?? empty.blogPosts,
    pages: data?.pages ?? empty.pages,
    media: data?.media ?? empty.media,
  };
}
