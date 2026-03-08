import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "pt" | "en";

const translations = {
  pt: {
    // Nav
    intro: "Intro",
    about: "About",
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
    stackTitle: "Stack",
    awardsTitle: "Premiações",
    recommendationsTitle: "Recomendações",
    articlesTitle: "Artigos & Publicações",
    readMoreArticles: "Leia mais artigos",
    viewAllPosts: "Ver todos os artigos",
    readArticle: "Ler artigo",
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
    backToHome: "Voltar para o inicio",
    articleNotFound: "Artigo não encontrado",
    projectNotFound: "Projeto nao encontrado",
    pageNotFound: "Pagina nao encontrada",
    protectedArticleTitle: "Artigo protegido",
    protectedArticleDescription: "Este artigo e restrito. Digite a senha para acessar o conteudo.",
    protectedProjectTitle: "Projeto protegido",
    protectedProjectDescription: "Este projeto esta sob NDA ou contem informacoes sensiveis. Digite a senha para acessar.",
    enterPassword: "Digite a senha",
    incorrectPassword: "Senha incorreta. Tente novamente.",
    accessArticle: "Acessar artigo",
    accessProject: "Acessar projeto",
    categoryLabel: "Categoria",
    servicesLabel: "Servicos",
    clientLabel: "Cliente",
    yearLabel: "Ano",
    authorLabel: "Autor",
    dateLabel: "Data",
    readingTimeLabel: "Leitura",
    topicsLabel: "Topicos",
    originalPublication: "Ver publicacao original",
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
    stackTitle: "Stack",
    awardsTitle: "Awards",
    recommendationsTitle: "Recommendations",
    articlesTitle: "Articles & Publications",
    readMoreArticles: "Read more articles",
    viewAllPosts: "View all posts",
    readArticle: "Read article",
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

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "en" || stored === "pt") return stored;
  } catch {}
  return "pt";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getStoredLanguage);
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
