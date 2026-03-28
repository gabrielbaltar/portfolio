import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "pt" | "en";

const translations = {
  pt: {
    // Nav
    intro: "Intro",
    about: "Sobre",
    projects: "Projetos",
    experience: "Experiência",
    education: "Educação",
    tools: "Ferramentas",
    blog: "Blog",
    contact: "Contato",

    // Header
    getTemplate: "Ver Template",
    downloadCV: "Baixar CV",
    availableForWork: "Disponível para trabalho",

    // Sections
    aboutMe: "Sobre mim",
    projectsTitle: "Projetos",
    viewAll: "Ver todos",
    experienceTitle: "Experiência",
    educationTitle: "Educação",
    certificationsTitle: "Certificações",
    stackTitle: "Ferramentas",
    awardsTitle: "Premiações",
    recommendationsTitle: "Recomendações",
    articlesTitle: "Artigos & Publicações",
    readMoreArticles: "Leia mais artigos",
    viewAllPosts: "Ver todos os artigos",
    readArticle: "Ler artigo",
    previousPage: "Anterior",
    nextPage: "Próxima",
    pageLabel: "Página",
    visitWebsite: "Ver site",
    letsTalk: "Vamos conversar",
    view: "Ver",
    visit: "Visitar",

    // Contact form
    timeForMe: "Meu horário:",
    email: "Email:",
    phone: "Telefone:",
    socials: "Redes sociais:",
    reachOut: "Entre em contato:",
    yourName: "Seu nome",
    yourEmail: "Seu e-mail",
    message: "Mensagem",
    sendMessage: "Enviar Mensagem",
    sending: "Enviando...",
    fillAllFields: "Preencha todos os campos.",
    emailCopied: "Email copiado!",
    messageSent: "Mensagem enviada com sucesso!",

    // Footer
    designedIn: "Projetado no",
    by: "Por",
    copyright: "Todos os direitos reservados",

    // Blog
    back: "Voltar",
    backToBlog: "Voltar ao blog",
    backToProjects: "Voltar aos projetos",
    backToHome: "Voltar para o início",
    articleNotFound: "Artigo não encontrado",
    projectNotFound: "Projeto não encontrado",
    pageNotFound: "Página não encontrada",
    protectedArticleTitle: "Artigo protegido",
    protectedArticleDescription: "Este artigo é restrito. Digite a senha para acessar o conteúdo.",
    protectedProjectTitle: "Projeto protegido",
    protectedProjectDescription: "Este projeto está sob NDA ou contém informações sensíveis. Digite a senha para acessar.",
    enterPassword: "Digite a senha",
    incorrectPassword: "Senha incorreta. Tente novamente.",
    accessArticle: "Acessar artigo",
    accessProject: "Acessar projeto",
    shareArticle: "Compartilhar artigo",
    shareNatively: "Compartilhar",
    copyLink: "Copiar link",
    articleLinkCopied: "Link do artigo copiado!",
    nativeShareFallback: "O compartilhamento nativo não está disponível aqui. O link foi copiado.",
    instagramShareFallback: "O Instagram não aceita abrir um post com link pronto pela web. O link foi copiado e o Instagram foi aberto.",
    shareOnX: "Compartilhar no X",
    shareOnFacebook: "Compartilhar no Facebook",
    shareOnLinkedIn: "Compartilhar no LinkedIn",
    shareOnWhatsApp: "Compartilhar no WhatsApp",
    shareOnInstagram: "Abrir no Instagram",
    categoryLabel: "Categoria",
    servicesLabel: "Serviços",
    clientLabel: "Cliente",
    yearLabel: "Ano",
    authorLabel: "Autor",
    dateLabel: "Data",
    readingTimeLabel: "Leitura",
    topicsLabel: "Tópicos",
    originalPublication: "Ver publicação original",
    home: "Home",
  },
  en: {
    // Nav
    intro: "Intro",
    about: "About",
    projects: "Projects",
    experience: "Experience",
    education: "Education",
    tools: "Tools",
    blog: "Blog",
    contact: "Contact",

    // Header
    getTemplate: "Get Template",
    downloadCV: "Download CV",
    availableForWork: "Available for work",

    // Sections
    aboutMe: "About me",
    projectsTitle: "Projects",
    viewAll: "View all",
    experienceTitle: "Experience",
    educationTitle: "Education",
    certificationsTitle: "Certifications",
    stackTitle: "Stacks",
    awardsTitle: "Awards",
    recommendationsTitle: "Recommendations",
    articlesTitle: "Articles & Publications",
    readMoreArticles: "Read more articles",
    viewAllPosts: "View all posts",
    readArticle: "Read article",
    previousPage: "Previous",
    nextPage: "Next",
    pageLabel: "Page",
    visitWebsite: "Visit website",
    letsTalk: "Let's talk",
    view: "View",
    visit: "Visit",

    // Contact form
    timeForMe: "Time for me:",
    email: "Email:",
    phone: "Phone:",
    socials: "Socials:",
    reachOut: "Reach out:",
    yourName: "Your name",
    yourEmail: "Your email address",
    message: "Message",
    sendMessage: "Send Message",
    sending: "Sending...",
    fillAllFields: "Fill all fields.",
    emailCopied: "Email copied!",
    messageSent: "Message sent successfully!",

    // Footer
    designedIn: "Designed in",
    by: "By",
    copyright: "All rights reserved",

    // Blog
    back: "Back",
    backToBlog: "Back to blog",
    backToProjects: "Back to projects",
    backToHome: "Back to home",
    articleNotFound: "Article not found",
    projectNotFound: "Project not found",
    pageNotFound: "Page not found",
    protectedArticleTitle: "Protected article",
    protectedArticleDescription: "This article is restricted. Enter the password to access the content.",
    protectedProjectTitle: "Protected project",
    protectedProjectDescription: "This project is under NDA or contains sensitive information. Enter the password to access it.",
    enterPassword: "Enter password",
    incorrectPassword: "Incorrect password. Try again.",
    accessArticle: "Access article",
    accessProject: "Access project",
    shareArticle: "Share article",
    shareNatively: "Share",
    copyLink: "Copy link",
    articleLinkCopied: "Article link copied!",
    nativeShareFallback: "Native sharing is not available here. The link was copied.",
    instagramShareFallback: "Instagram does not support opening a ready-to-post link composer on the web. The link was copied and Instagram was opened.",
    shareOnX: "Share on X",
    shareOnFacebook: "Share on Facebook",
    shareOnLinkedIn: "Share on LinkedIn",
    shareOnWhatsApp: "Share on WhatsApp",
    shareOnInstagram: "Open on Instagram",
    categoryLabel: "Category",
    servicesLabel: "Services",
    clientLabel: "Client",
    yearLabel: "Year",
    authorLabel: "Author",
    dateLabel: "Date",
    readingTimeLabel: "Reading time",
    topicsLabel: "Topics",
    originalPublication: "View original publication",
    home: "Home",
  },
};

interface LanguageContextType {
  lang: Language;
  locale: string;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.pt) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANG_STORAGE_KEY = "portfolio_language";

const BRAZIL_TIMEZONES = new Set([
  "America/Sao_Paulo",
  "America/Rio_Branco",
  "America/Manaus",
  "America/Cuiaba",
  "America/Campo_Grande",
  "America/Belem",
  "America/Fortaleza",
  "America/Recife",
  "America/Maceio",
  "America/Bahia",
  "America/Araguaina",
  "America/Boa_Vista",
  "America/Porto_Velho",
  "America/Eirunepe",
  "America/Noronha",
  "America/Santarem",
]);

function getForcedLanguage(): Language | null {
  if (typeof window === "undefined") return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("lang")?.trim().toLowerCase();
    if (forced === "en" || forced === "pt") return forced;
  } catch {}

  return null;
}

function getStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "en" || stored === "pt") return stored;
  } catch {}
  return null;
}

function isBrazilTimezone(timezone?: string) {
  return Boolean(timezone && BRAZIL_TIMEZONES.has(timezone));
}

function detectVisitorLanguage(): Language {
  if (typeof window === "undefined") return "pt";

  const forced = getForcedLanguage();
  if (forced) return forced;

  const stored = getStoredLanguage();
  if (stored) return stored;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (isBrazilTimezone(timezone)) {
    return "pt";
  }

  const locales = [navigator.language, ...(navigator.languages || [])]
    .map((locale) => locale?.trim())
    .filter(Boolean) as string[];

  if (locales.some((locale) => locale.toLowerCase() === "pt-br")) {
    return "pt";
  }

  return "en";
}

export function LanguageProvider({
  children,
  detectFromVisitor = false,
}: {
  children: ReactNode;
  detectFromVisitor?: boolean;
}) {
  const [lang, setLangState] = useState<Language>(() => {
    if (detectFromVisitor) return detectVisitorLanguage();
    return getForcedLanguage() ?? getStoredLanguage() ?? "pt";
  });
  const locale = lang === "en" ? "en-US" : "pt-BR";

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {}
  }, []);

  const t = (key: keyof typeof translations.pt) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, locale, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback for rendering outside provider (e.g. Figma preview)
    const fallbackT = (key: keyof typeof translations.pt) => translations.pt[key] || key;
    return { lang: "pt" as Language, locale: "pt-BR", setLang: () => {}, t: fallbackT };
  }
  return ctx;
}
