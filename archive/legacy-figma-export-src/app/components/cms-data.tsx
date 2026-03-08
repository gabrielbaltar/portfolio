import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dataProvider } from "./data-provider";
import { storageEvents } from "./data-provider";

// Block-based content system (Medium/Notion style)
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

export type ContentStatus = "draft" | "review" | "published" | "archived";

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  services: string;
  client: string;
  year: string;
  image: string;
  galleryImages: string[];
  link: string;
  slug: string;
  description: string;
  contentBlocks: ContentBlock[];
  imageBgColor?: string;
  imagePosition?: string;
  galleryPositions?: string[];
  password?: string;
  status: ContentStatus;
  tags: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  location: string;
  company: string;
  period: string;
  role: string;
  tasks: string[];
}

export interface Education {
  id: string;
  location: string;
  period: string;
  degree: string;
  university: string;
  description: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  link: string;
}

export interface StackItem {
  id: string;
  name: string;
  description: string;
  color: string;
  link: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  link: string;
}

export interface Recommendation {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export interface BlogPost {
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
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  contentBlocks: ContentBlock[];
  status: ContentStatus;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface ProfileData {
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

export interface CMSData {
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

const now = new Date().toISOString();

const defaultData: CMSData = {
  profile: {
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
  },
  projects: [
    {
      id: "1", title: "Brandify", subtitle: "Agencia de Marketing Digital", category: "Agency Website",
      services: "Design de Interface, Desenvolvimento Web", client: "Digital Innovations Agency", year: "2023",
      image: "", galleryImages: [], link: "#", slug: "brandify",
      description: "Brandify e uma plataforma de marketing digital que ajuda empresas a criar e gerenciar suas marcas de forma eficiente e estrategica.",
      contentBlocks: [
        { type: "heading1", text: "Sobre Brandify" },
        { type: "paragraph", text: "Brandify e uma plataforma de marketing digital que ajuda empresas a criar e gerenciar suas marcas de forma eficiente e estrategica." },
        { type: "heading2", text: "Funcionalidades" },
        { type: "unordered-list", items: ["Design de Interface", "Desenvolvimento Web", "Gerenciamento de Conteudo"] },
      ],
      imageBgColor: "",
      status: "published", tags: ["web", "marketing"], featured: true,
      seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
    {
      id: "2", title: "Shiro", subtitle: "Portfolio Pessoal", category: "Personal Portfolio",
      services: "Design de Interface, Desenvolvimento Web", client: "Gabriel Baltar", year: "2022",
      image: "", galleryImages: [], link: "#", slug: "shiro",
      description: "Shiro e o portfolio pessoal de Gabriel Baltar, onde ele apresenta seus projetos e habilidades em design e desenvolvimento web.",
      contentBlocks: [
        { type: "heading1", text: "Sobre Shiro" },
        { type: "paragraph", text: "Shiro e o portfolio pessoal de Gabriel Baltar." },
      ],
      imageBgColor: "",
      status: "published", tags: ["portfolio", "design"], featured: false,
      seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
    {
      id: "3", title: "Vivid", subtitle: "Apresentacao de Aplicativos", category: "App Showcase",
      services: "Design de Interface, Desenvolvimento Web", client: "Digital Innovations Agency", year: "2021",
      image: "", galleryImages: [], link: "#", slug: "vivid",
      description: "Vivid e uma plataforma que apresenta e destaca aplicativos de alta qualidade.",
      contentBlocks: [
        { type: "heading1", text: "Sobre Vivid" },
        { type: "paragraph", text: "Vivid e uma plataforma que apresenta e destaca aplicativos de alta qualidade." },
      ],
      imageBgColor: "",
      status: "published", tags: ["app", "showcase"], featured: false,
      seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
    {
      id: "4", title: "Capture", subtitle: "Agencia de Videos", category: "Video Agency",
      services: "Design de Interface, Desenvolvimento Web", client: "Digital Innovations Agency", year: "2020",
      image: "", galleryImages: [], link: "#", slug: "capture",
      description: "Capture e uma agencia de videos que produz conteudo visual de alta qualidade.",
      contentBlocks: [],
      imageBgColor: "",
      status: "draft", tags: ["video", "agency"], featured: false,
      seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
    {
      id: "5", title: "Automize", subtitle: "Agencia de Inteligencia Artificial", category: "AI Agency",
      services: "Design de Interface, Desenvolvimento Web", client: "Digital Innovations Agency", year: "2019",
      image: "", galleryImages: [], link: "#", slug: "automize",
      description: "Automize e uma agencia de inteligencia artificial.",
      contentBlocks: [],
      imageBgColor: "",
      status: "published", tags: ["ai", "agency"], featured: false,
      seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
    {
      id: "6", title: "Lyne", subtitle: "Portfolio e Agencia", category: "Portfolio & Agency",
      services: "Design de Interface, Desenvolvimento Web", client: "Digital Innovations Agency", year: "2018",
      image: "", galleryImages: [], link: "#", slug: "lyne",
      description: "Lyne e um portfolio e agencia que apresenta projetos de design e desenvolvimento web de alta qualidade.",
      contentBlocks: [],
      imageBgColor: "",
      status: "archived", tags: ["portfolio", "agency"], featured: false,
      seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
  ],
  experiences: [
    { id: "1", location: "San Francisco, CA", company: "Digital Innovations Agency", period: "Jan 2019 - Presente", role: "Senior Web Designer", tasks: ["Liderou o redesign de websites de alto trafego, resultando em 30% de aumento no engajamento.", "Gerenciou uma equipe de designers juniores.", "Colaborou com equipes multifuncionais.", "Implementou principios de design responsivo."] },
    { id: "2", location: "Los Angeles, CA", company: "Creative Solutions Studio", period: "Jun 2013 - Dez 2018", role: "Web Designer", tasks: ["Projetou e desenvolveu mais de 50 websites customizados.", "Conduziu testes de usabilidade e pesquisa de usuario.", "Criou wireframes, mockups e prototipos.", "Utilizou HTML, CSS e JavaScript."] },
    { id: "3", location: "Austin, TX", company: "TechWave LLC", period: "Abr 2008 - Mai 2013", role: "Front-End Developer / Designer", tasks: ["Desenvolveu e manteve o front-end de websites de e-commerce.", "Trabalhou com desenvolvedores back-end para integrar APIs.", "Garantiu padroes de acessibilidade.", "Criou assets visuais para campanhas."] },
    { id: "4", location: "Seattle, WA", company: "Bright Ideas Web Solutions", period: "Jan 2006 - Mar 2008", role: "Junior Web Designer", tasks: ["Auxiliou no design e desenvolvimento de websites.", "Manteve e atualizou websites existentes.", "Participou de reunioes com clientes.", "Desenvolveu habilidades basicas de HTML e CSS."] },
  ],
  education: [
    { id: "1", location: "Berkeley, CA", period: "2010 - 2012", degree: "Master of Science in Web Design and Development", university: "University of California", description: "Focado em tecnologias web avancadas, design de experiencia do usuario e desenvolvimento front-end." },
    { id: "2", location: "Seattle, WA", period: "2002 - 2006", degree: "Bachelor of Fine Arts in Graphic Design", university: "University of Washington", description: "Enfase em comunicacao visual, principios de design e midia digital." },
  ],
  certifications: [
    { id: "1", title: "Certified Web Developer (CWD)", issuer: "International Web Association, 2021", link: "https://www.coursera.org/" },
    { id: "2", title: "User Experience (UX) Design Certification", issuer: "Nielsen Norman Group, 2018", link: "https://www.coursera.org/" },
    { id: "3", title: "Advanced HTML5 and CSS3 Specialist", issuer: "W3Schools, 2016", link: "https://www.coursera.org/" },
    { id: "4", title: "Google Analytics Individual Qualification (GAIQ)", issuer: "Google, 2015", link: "https://www.coursera.org/" },
  ],
  stack: [
    { id: "1", name: "Figma", description: "Design de interfaces", color: "#0055FF", link: "https://www.figma.com/" },
    { id: "2", name: "Framer", description: "No-code web design", color: "#0055FF", link: "https://www.framer.com/" },
    { id: "3", name: "Notion", description: "Gerenciamento de projetos", color: "#17CF97", link: "https://notion.so/" },
    { id: "4", name: "Stripe", description: "Plataforma de pagamentos", color: "#5417D7", link: "https://stripe.com/" },
    { id: "5", name: "Zoom", description: "Colaboracao", color: "#007DFC", link: "https://zoom.us/" },
    { id: "6", name: "Cal.com", description: "Comunicacao", color: "#CA9352", link: "https://cal.com/" },
  ],
  awards: [
    { id: "1", title: "Site of the day", issuer: "Awwwards, 2023", link: "https://www.awwwards.com/" },
    { id: "2", title: "Site of the month", issuer: "Awwwards, 2020", link: "https://www.awwwards.com/" },
    { id: "3", title: "Website of the day", issuer: "CSS Design Awards, 2018", link: "https://www.cssdesignawards.com/" },
    { id: "4", title: "Site of the day", issuer: "FWA, 2016", link: "https://thefwa.com/" },
  ],
  recommendations: [
    { id: "1", name: "Jane Smith", role: "Chief Marketing Officer at Digital Innovations Agency", quote: '"A expertise de design do Gabriel e sua abordagem inovadora foram fundamentais para o sucesso da nossa agencia."' },
    { id: "2", name: "Michael Brown", role: "Founder of Creative Solutions Studio", quote: '"Gabriel e um designer excepcional com um olhar aguado para detalhes e uma compreensao profunda de experiencia do usuario."' },
    { id: "3", name: "Lisa Turner", role: "Senior Developer at TechWave LLC", quote: '"Trabalhar com Gabriel foi um prazer. Seu espirito colaborativo e habilidades tecnicas fizeram nossos projetos fluirem de forma suave."' },
  ],
  blogPosts: [
    {
      id: "1", title: "The Future of Web Design: Trends to Watch in 2024", publisher: "Web Design Journal",
      date: "15 de mai. de 2024", description: "Uma analise aprofundada das tendencias emergentes em web design.",
      image: "", content: "", slug: "the-future-of-web-design-trends-to-watch-in-2024",
      contentBlocks: [
        { type: "heading1", text: "O Futuro do Design Web" },
        { type: "paragraph", text: "O design web esta em constante evolucao, e 2024 promete trazer mudancas significativas." },
        { type: "heading2", text: "Tendencias Principais" },
        { type: "unordered-list", items: ["Design com IA", "Micro-interacoes", "Design Sustentavel"] },
      ],
      status: "published", tags: ["design", "trends"], featured: true, author: "Gabriel Baltar",
      readTime: "5 min", seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
    {
      id: "2", title: "Responsive Design Best Practices", publisher: "Modern Web Magazine",
      date: "11 de mai. de 2024", description: "As melhores praticas para criar websites responsivos.",
      image: "", content: "", slug: "responsive-design-best-practices",
      contentBlocks: [
        { type: "heading1", text: "Praticas de Design Responsivo" },
        { type: "paragraph", text: "O design responsivo nao e mais uma opcao, e uma necessidade." },
      ],
      status: "published", tags: ["responsive", "css"], featured: false, author: "Gabriel Baltar",
      readTime: "4 min", seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
    {
      id: "3", title: "The Art of Minimalist Web Design", publisher: "Modern Web Magazine",
      date: "10 de mai. de 2024", description: "Os principios do design minimalista.",
      image: "", content: "", slug: "the-art-of-minimalist-web-design",
      contentBlocks: [
        { type: "heading1", text: "A Arte do Design Minimalista" },
        { type: "paragraph", text: "Menos e mais - essa e a essencia do design minimalista." },
      ],
      status: "draft", tags: ["minimalism", "design"], featured: false, author: "Gabriel Baltar",
      readTime: "6 min", seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
  ],
  pages: [
    {
      id: "1", title: "Sobre", slug: "sobre", description: "Pagina institucional sobre o portfolio.",
      contentBlocks: [
        { type: "heading1", text: "Sobre mim" },
        { type: "paragraph", text: "Sou um designer apaixonado por criar experiencias digitais memoraveis." },
      ],
      status: "published", seoTitle: "", seoDescription: "", createdAt: now, updatedAt: now,
    },
  ],
  media: [],
};

// Uses the data provider abstraction — swap to Supabase in data-provider.ts
function loadData(): CMSData {
  try {
    const loaded = dataProvider.loadData();
    // dataProvider.loadData() can return synchronously (localStorage) or null
    if (loaded && typeof loaded === "object" && "profile" in loaded) {
      const parsed = loaded as any;
      // Migrate projects (ensure all fields exist)
      if (parsed.projects) {
        parsed.projects = parsed.projects.map((p: any) => ({
          subtitle: "", services: "", client: "", year: "", galleryImages: [],
          slug: p.title ? p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") : p.id,
          description: "", contentBlocks: [],
          imageBgColor: "",
          password: "",
          status: "published" as ContentStatus,
          tags: [], featured: false, seoTitle: "", seoDescription: "",
          createdAt: now, updatedAt: now,
          ...p,
        }));
      }
      // Migrate blog posts
      if (parsed.blogPosts) {
        parsed.blogPosts = parsed.blogPosts.map((b: any) => ({
          contentBlocks: [], slug: "",
          status: "published" as ContentStatus,
          tags: [], featured: false, author: "Gabriel Baltar",
          readTime: "5 min", seoTitle: "", seoDescription: "",
          subtitle: "", imageBgColor: "", galleryImages: [],
          link: "", category: "", services: "", password: "",
          createdAt: now, updatedAt: now,
          ...b,
        }));
      }
      // Migrate profile
      if (parsed.profile && !parsed.profile.currentCompanyUrl) {
        parsed.profile.currentCompanyUrl = "";
      }
      // Add missing collections
      if (!parsed.pages) parsed.pages = defaultData.pages;
      if (!parsed.media) parsed.media = [];
      return parsed;
    }
  } catch {}
  return defaultData;
}

function saveData(data: CMSData) {
  dataProvider.saveData(data);
}

interface CMSContextType {
  data: CMSData;
  updateData: (newData: CMSData) => void;
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
  resetData: () => void;
}

const CMSContext = createContext<CMSContextType | null>(null);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CMSData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Listen for storage warnings/errors and show toast notifications
  useEffect(() => {
    const unsubscribe = storageEvents.on((msg, type) => {
      // Dynamic import to avoid circular deps — toast from sonner
      import("sonner").then(({ toast }) => {
        if (type === "error") {
          toast.error(msg, { duration: 8000 });
        } else {
          toast.warning(msg, { duration: 6000 });
        }
      });
    });
    return unsubscribe;
  }, []);

  const updateData = (newData: CMSData) => setData(newData);
  const updateProfile = (profile: ProfileData) => setData((d) => ({ ...d, profile }));
  const updateProjects = (projects: Project[]) => setData((d) => ({ ...d, projects }));
  const updateExperiences = (experiences: Experience[]) => setData((d) => ({ ...d, experiences }));
  const updateEducation = (education: Education[]) => setData((d) => ({ ...d, education }));
  const updateCertifications = (certifications: Certification[]) => setData((d) => ({ ...d, certifications }));
  const updateStack = (stack: StackItem[]) => setData((d) => ({ ...d, stack }));
  const updateAwards = (awards: Award[]) => setData((d) => ({ ...d, awards }));
  const updateRecommendations = (recommendations: Recommendation[]) => setData((d) => ({ ...d, recommendations }));
  const updateBlogPosts = (blogPosts: BlogPost[]) => setData((d) => ({ ...d, blogPosts }));
  const updatePages = (pages: Page[]) => setData((d) => ({ ...d, pages }));
  const updateMedia = (media: MediaItem[]) => setData((d) => ({ ...d, media }));
  const addMediaItem = (item: MediaItem) => setData((d) => ({ ...d, media: [item, ...d.media] }));
  const removeMediaItem = (id: string) => setData((d) => ({ ...d, media: d.media.filter((m) => m.id !== id) }));
  const resetData = () => { setData(defaultData); saveData(defaultData); };

  return (
    <CMSContext.Provider value={{
      data, updateData, updateProfile, updateProjects, updateExperiences,
      updateEducation, updateCertifications, updateStack, updateAwards,
      updateRecommendations, updateBlogPosts, updatePages, updateMedia,
      addMediaItem, removeMediaItem, resetData,
    }}>
      {children}
    </CMSContext.Provider>
  );
}

const noop = () => {};

const fallbackContext: CMSContextType = {
  data: loadData(),
  updateData: noop,
  updateProfile: noop,
  updateProjects: noop,
  updateExperiences: noop,
  updateEducation: noop,
  updateCertifications: noop,
  updateStack: noop,
  updateAwards: noop,
  updateRecommendations: noop,
  updateBlogPosts: noop,
  updatePages: noop,
  updateMedia: noop,
  addMediaItem: noop,
  removeMediaItem: noop,
  resetData: noop,
};

export function useCMS() {
  const ctx = useContext(CMSContext);
  if (!ctx) {
    // Fallback: return read-only data loaded from storage
    // This prevents crashes during HMR or if component renders outside provider
    return fallbackContext;
  }
  return ctx;
}