import type {
  BlogPost,
  ContentBlock,
  Page,
  ProfileData,
  Project,
} from "../packages/core/src/index.ts";
import {
  createAdminSupabaseClient,
  loadCmsData,
  saveAwards,
  saveBlogPosts,
  saveCertifications,
  saveEducation,
  saveExperiences,
  savePages,
  saveProfile,
  saveProjects,
  saveRecommendations,
  saveSiteSettings,
  saveStack,
} from "../packages/supabase/src/index.ts";

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${name}`);
  }
  return value;
}

const REGEX_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bDisponivel\b/g, "Disponível"],
  [/\bOla\b/g, "Olá"],
  [/\bexperiencia\b/g, "experiência"],
  [/\bexperiencias\b/g, "experiências"],
  [/\bExperiencia\b/g, "Experiência"],
  [/\bExperiencias\b/g, "Experiências"],
  [/\busuario\b/g, "usuário"],
  [/\busuarios\b/g, "usuários"],
  [/\bUsuario\b/g, "Usuário"],
  [/\bUsuarios\b/g, "Usuários"],
  [/\bconteudo\b/g, "conteúdo"],
  [/\bConteudo\b/g, "Conteúdo"],
  [/\binformacoes\b/g, "informações"],
  [/\bInformacoes\b/g, "Informações"],
  [/\bprincipios\b/g, "princípios"],
  [/\bPrincipios\b/g, "Princípios"],
  [/\btrafego\b/g, "tráfego"],
  [/\bTrafego\b/g, "Tráfego"],
  [/\bpadroes\b/g, "padrões"],
  [/\bPadroes\b/g, "Padrões"],
  [/\bprototipos\b/g, "protótipos"],
  [/\bPrototipos\b/g, "Protótipos"],
  [/\bmidia\b/g, "mídia"],
  [/\bMidia\b/g, "Mídia"],
  [/\bnavegacao\b/g, "navegação"],
  [/\bNavegacao\b/g, "Navegação"],
  [/\bconfiguracoes\b/g, "configurações"],
  [/\bConfiguracoes\b/g, "Configurações"],
  [/\bconsistencia\b/g, "consistência"],
  [/\bConsistencia\b/g, "Consistência"],
  [/\bdirecao\b/g, "direção"],
  [/\bDirecao\b/g, "Direção"],
  [/\bimpressao\b/g, "impressão"],
  [/\bImpressao\b/g, "Impressão"],
  [/\bdecisao\b/g, "decisão"],
  [/\bDecisao\b/g, "Decisão"],
  [/\bacao\b/g, "ação"],
  [/\bAcao\b/g, "Ação"],
  [/\bacoes\b/g, "ações"],
  [/\bAcoes\b/g, "Ações"],
  [/\bcolaboracao\b/g, "colaboração"],
  [/\bColaboracao\b/g, "Colaboração"],
  [/\bcomunicacao\b/g, "comunicação"],
  [/\bComunicacao\b/g, "Comunicação"],
  [/\benfase\b/g, "ênfase"],
  [/\bEnfase\b/g, "Ênfase"],
  [/\bavancadas\b/g, "avançadas"],
  [/\bAvancadas\b/g, "Avançadas"],
  [/\bespirito\b/g, "espírito"],
  [/\bEspirito\b/g, "Espírito"],
  [/\btecnicas\b/g, "técnicas"],
  [/\bTecnicas\b/g, "Técnicas"],
  [/\bcompreensao\b/g, "compreensão"],
  [/\bCompreensao\b/g, "Compreensão"],
  [/\baguado\b/g, "aguçado"],
  [/\bAguado\b/g, "Aguçado"],
  [/\bservicos\b/g, "serviços"],
  [/\bServicos\b/g, "Serviços"],
  [/\btopicos\b/g, "tópicos"],
  [/\bTopicos\b/g, "Tópicos"],
  [/\bagencia\b/g, "agência"],
  [/\bAgencia\b/g, "Agência"],
  [/\binteligencia\b/g, "inteligência"],
  [/\bInteligencia\b/g, "Inteligência"],
  [/\bportfolio\b/g, "portfólio"],
  [/\bPortfolio\b/g, "Portfólio"],
  [/\bpagina\b/g, "página"],
  [/\bPagina\b/g, "Página"],
  [/\bpaginas\b/g, "páginas"],
  [/\bPaginas\b/g, "Páginas"],
  [/\bvideos\b/g, "vídeos"],
  [/\bVideos\b/g, "Vídeos"],
  [/\bnao\b/g, "não"],
  [/\bNao\b/g, "Não"],
];

function normalizeText(value: string) {
  let next = value;
  for (const [pattern, replacement] of REGEX_REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }

  return next
    .replaceAll(" estrategica", " estratégica")
    .replaceAll(" estrategicas", " estratégicas")
    .replaceAll(" pratica", " prática")
    .replaceAll(" praticas", " práticas")
    .replaceAll(" Praticas", " Práticas")
    .replaceAll(" analise", " análise")
    .replaceAll(" evolucao", " evolução")
    .replaceAll(" mudancas", " mudanças")
    .replaceAll(" opcao", " opção")
    .replaceAll(" essencia", " essência")
    .replaceAll(" sensiveis", " sensíveis")
    .replaceAll(" titulo", " título")
    .replaceAll(" Titulos", " Títulos")
    .replaceAll(" botoes", " botões")
    .replaceAll(" memoraveis", " memoráveis");
}

function fixBlock(block: ContentBlock): ContentBlock {
  switch (block.type) {
    case "paragraph":
    case "heading1":
    case "heading2":
    case "heading3":
      return { ...block, text: normalizeText(block.text) };
    case "unordered-list":
    case "ordered-list":
      return { ...block, items: block.items.map(normalizeText) };
    case "style-guide":
      return {
        ...block,
        title: normalizeText(block.title),
        summary: normalizeText(block.summary),
        principles: block.principles.map((item) => ({
          ...item,
          title: normalizeText(item.title),
          description: normalizeText(item.description),
        })),
      };
    case "color-palette":
      return {
        ...block,
        title: normalizeText(block.title),
        colors: block.colors.map((item) => ({
          ...item,
          name: normalizeText(item.name),
          role: normalizeText(item.role),
          usage: normalizeText(item.usage),
        })),
      };
    case "typography":
      return {
        ...block,
        title: normalizeText(block.title),
        fonts: block.fonts.map((item) => ({
          ...item,
          label: normalizeText(item.label),
          sample: normalizeText(item.sample),
        })),
      };
    case "icon-grid":
      return {
        ...block,
        title: normalizeText(block.title),
        icons: block.icons.map((item) => ({
          ...item,
          name: normalizeText(item.name),
          notes: normalizeText(item.notes),
        })),
      };
    case "user-flow":
      return {
        ...block,
        title: normalizeText(block.title),
        steps: block.steps.map((item) => ({
          ...item,
          title: normalizeText(item.title),
          description: normalizeText(item.description),
          outcome: normalizeText(item.outcome),
        })),
      };
    case "sitemap":
      return {
        ...block,
        title: normalizeText(block.title),
        sections: block.sections.map((item) => ({
          ...item,
          title: normalizeText(item.title),
          description: normalizeText(item.description),
          children: item.children.map(normalizeText),
        })),
      };
    case "quote":
      return {
        ...block,
        text: normalizeText(block.text),
        author: normalizeText(block.author),
      };
    case "cta":
      return {
        ...block,
        text: normalizeText(block.text),
        buttonText: normalizeText(block.buttonText),
      };
    case "image":
    case "video":
    case "embed":
      return { ...block, caption: normalizeText(block.caption) };
    case "code":
    case "divider":
      return block;
    default:
      return block;
  }
}

function fixProfile(profile: ProfileData): ProfileData {
  return {
    ...profile,
    availableText: "Disponível para trabalho",
    aboutTitle: "Sobre mim",
    aboutParagraph1:
      "Olá, eu sou Gabriel Baltar, UX/UI Designer e Product Designer com mais de 5 anos de experiência criando experiências digitais visualmente marcantes e centradas no usuário.",
    aboutParagraph2:
      "Minha jornada no design começou com a curiosidade sobre como as interfaces digitais funcionam e com o desejo de criar algo significativo. Ao longo dos anos, aprimorei minhas habilidades em design de interfaces, pesquisa com usuários e otimização da experiência.",
  };
}

function fixProjects(projects: Project[]) {
  return projects.map((project) => {
    const next: Project = {
      ...project,
      subtitle: normalizeText(project.subtitle),
      services: normalizeText(project.services),
      description: normalizeText(project.description),
      seoTitle: normalizeText(project.seoTitle),
      seoDescription: normalizeText(project.seoDescription),
      tags: project.tags.map(normalizeText),
      contentBlocks: project.contentBlocks.map(fixBlock),
    };

    if (project.slug === "brandify") {
      next.subtitle = "UX/UI Case Study";
      next.description =
        "Brandify é uma plataforma de marketing digital que ajuda empresas a criar e gerenciar suas marcas de forma eficiente e estratégica.";
      next.contentBlocks = [
        { ...next.contentBlocks[0], type: "heading1", text: "Sobre a Brandify" },
        {
          ...next.contentBlocks[1],
          type: "paragraph",
          text: "Brandify é uma <span data-inline-tag=\"true\" data-inline-tag-label=\"plataforma\" contenteditable=\"false\">plataforma</span> de marketing digital que ajuda empresas a criar e gerenciar suas marcas de forma eficiente e estratégica.",
          lineHeight: 20,
        },
        next.contentBlocks[2],
        {
          ...next.contentBlocks[3],
          type: "unordered-list",
          items: [
            "Design de Interface",
            "Desenvolvimento Web",
            "Gerenciamento de Conteúdo",
          ],
          lineHeight: 32,
        },
        next.contentBlocks[4],
        {
          ...next.contentBlocks[5],
          type: "color-palette",
          title: "Paleta de cores",
          colors: next.contentBlocks[5].type === "color-palette"
            ? next.contentBlocks[5].colors.map((color, index) => {
                if (index === 0) {
                  return {
                    ...color,
                    name: "Primary",
                    role: "Primária",
                    usage: "Títulos, botões e destaques",
                  };
                }
                if (index === 1) {
                  return {
                    ...color,
                    name: "Cor primária",
                    role: "Acento",
                    usage: "Estados ativos, links e sinais visuais",
                  };
                }
                return color;
              })
            : [],
        },
        {
          ...next.contentBlocks[6],
          type: "icon-grid",
          title: "Iconografia",
          icons: next.contentBlocks[6].type === "icon-grid"
            ? next.contentBlocks[6].icons.map((icon) => ({
                ...icon,
                notes: normalizeText(icon.notes),
              }))
            : [],
        },
        next.contentBlocks[7],
        {
          ...next.contentBlocks[8],
          type: "user-flow",
          title: "Fluxo do usuário",
          steps: next.contentBlocks[8].type === "user-flow"
            ? next.contentBlocks[8].steps.map((step, index) => {
                if (index === 0) {
                  return {
                    ...step,
                    description: "Como o usuário chega à experiência.",
                    outcome: "Primeira impressão",
                  };
                }
                if (index === 1) {
                  return {
                    ...step,
                    title: "Ação principal",
                    description: "A etapa central do fluxo é a decisão mais importante.",
                    outcome: "Conversão",
                  };
                }
                if (index === 2) {
                  return {
                    ...step,
                    outcome: "Acesso ao aplicativo",
                  };
                }
                if (index === 3) {
                  return {
                    ...step,
                    outcome: "Área logada",
                  };
                }
                return step;
              })
            : [],
        },
        {
          ...next.contentBlocks[9],
          type: "sitemap",
          title: "Sitemap",
          sections: next.contentBlocks[9].type === "sitemap"
            ? next.contentBlocks[9].sections.map((section) => ({
                ...section,
                description: normalizeText(section.description),
                children: section.children.map(normalizeText),
              }))
            : [],
        },
        {
          ...next.contentBlocks[10],
          type: "style-guide",
          title: "Style guide",
          summary: next.contentBlocks[10].type === "style-guide" ? normalizeText(next.contentBlocks[10].summary) : "",
          principles: next.contentBlocks[10].type === "style-guide"
            ? next.contentBlocks[10].principles.map((principle) => ({
                ...principle,
                title: normalizeText(principle.title),
                description:
                  principle.title === "Clareza"
                    ? "Explique a direção visual e a regra principal desta interface."
                    : normalizeText(principle.description),
              }))
            : [],
        },
        next.contentBlocks[11],
        next.contentBlocks[12],
        {
          ...next.contentBlocks[13],
          type: "typography",
          title: "Tipografia",
          fonts: next.contentBlocks[13].type === "typography"
            ? next.contentBlocks[13].fonts.map((font) => ({
                ...font,
                sample: normalizeText(font.sample),
              }))
            : [],
        },
        next.contentBlocks[14],
        next.contentBlocks[15],
      ];
    }

    if (project.slug === "shiro") {
      next.description = "Estudo de caso de um projeto da MAG Seguros.";
      next.contentBlocks = [
        { type: "heading1", text: "Sobre o projeto" },
        {
          type: "paragraph",
          text: "GAC / GAC Líderes é uma solução da MAG Seguros para planejar, executar e acompanhar atividades comerciais com consistência.",
        },
        next.contentBlocks[2],
        next.contentBlocks[3],
        {
          ...next.contentBlocks[4],
          type: "paragraph",
          text: "A MAG Seguros precisava padronizar e dar previsibilidade ao trabalho da força de vendas: planejar, executar e acompanhar atividades comerciais com consistência, saindo de controles manuais e descentralizados para uma operação orientada a dados dentro do Salesforce. Em 6 semanas, liderei UX/UI ponta a ponta e entreguei o GAC Líderes, uma solução mobile-first (80% dos acessos eram via celular), com separação clara de fluxos Hunter (prospecção) e Farmer (carteira), agenda integrada e status automatizados para reduzir cliques e erro operacional.",
        },
        {
          ...next.contentBlocks[5],
          type: "unordered-list",
          items: [
            "Empresa: MAG Seguros.",
            "Linha de negócio: Seguros de vida / previdência.",
            "Equipe: Gabriel Baltar (UX/UI Designer), Marcelo Costa Teixeira (Analista de Informações Comerciais), Luiz Fernando Jesus Santos Morais (Arquiteto de Soluções), Mateus de Oliveira Ponce (Desenvolvedor Salesforce) e Lucas Salles de Oliveira (Desenvolvedor Salesforce).",
            "Plataforma: Salesforce.",
            "Ferramentas utilizadas: Figma, Microsoft Clarity, Salesforce e Miro.",
          ],
        },
      ];
    }

    if (project.slug === "automize") {
      next.subtitle = "Agência de Inteligência Artificial";
      next.description = "Automize é uma agência de inteligência artificial.";
    }

    return next;
  });
}

function fixPosts(posts: BlogPost[]) {
  return posts.map((post) => {
    const next: BlogPost = {
      ...post,
      description: normalizeText(post.description),
      content: normalizeText(post.content),
      category: post.category ? normalizeText(post.category) : post.category,
      services: post.services ? normalizeText(post.services) : post.services,
      seoTitle: normalizeText(post.seoTitle),
      seoDescription: normalizeText(post.seoDescription),
      tags: post.tags.map(normalizeText),
      contentBlocks: post.contentBlocks.map(fixBlock),
    };

    if (post.slug === "the-future-of-web-design-trends-to-watch-in-2024") {
      next.description = "Uma análise aprofundada das tendências emergentes em web design.";
      next.contentBlocks = [
        { type: "heading1", text: "O Futuro do Design Web" },
        {
          type: "paragraph",
          text: "O design web está em constante evolução, e 2024 promete trazer mudanças significativas.",
        },
        { type: "heading2", text: "Tendências principais" },
        { type: "unordered-list", items: ["Design com IA", "Microinterações", "Design sustentável"] },
      ];
    }

    if (post.slug === "responsive-design-best-practices") {
      next.description = "As melhores práticas para criar websites responsivos.";
      next.contentBlocks = [
        { type: "heading1", text: "Práticas de Design Responsivo" },
        {
          type: "paragraph",
          text: "O design responsivo não é mais uma opção, é uma necessidade.",
        },
      ];
    }

    if (post.slug === "the-art-of-minimalist-web-design") {
      next.description = "Os princípios do design minimalista.";
      next.contentBlocks = [
        { type: "heading1", text: "A Arte do Design Minimalista" },
        {
          type: "paragraph",
          text: "Menos é mais. Essa é a essência do design minimalista.",
        },
      ];
    }

    return next;
  });
}

function fixPages(pages: Page[]) {
  return pages.map((page) => {
    const next: Page = {
      ...page,
      title: normalizeText(page.title),
      description: normalizeText(page.description),
      seoTitle: normalizeText(page.seoTitle),
      seoDescription: normalizeText(page.seoDescription),
      contentBlocks: page.contentBlocks.map(fixBlock),
    };

    if (page.slug === "sobre") {
      next.description = "Página institucional sobre o portfólio.";
      next.contentBlocks = [
        { type: "heading1", text: "Sobre mim" },
        {
          type: "paragraph",
          text: "Sou um designer apaixonado por criar experiências digitais memoráveis.",
        },
      ];
    }

    return next;
  });
}

async function main() {
  const client = createAdminSupabaseClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const current = await loadCmsData(client);
  const nextProfile = fixProfile(current.profile);
  const nextProjects = fixProjects(current.projects);
  const nextPosts = fixPosts(current.blogPosts);
  const nextPages = fixPages(current.pages);
  const nextExperiences = current.experiences.map((item) => ({
    ...item,
    tasks: item.tasks.map(normalizeText),
  }));
  const nextEducation = current.education.map((item) => ({
    ...item,
    description: normalizeText(item.description),
  }));
  const nextStack = current.stack.map((item) => ({
    ...item,
    description: normalizeText(item.description),
  }));
  const nextRecommendations = current.recommendations.map((item) => ({
    ...item,
    quote: normalizeText(item.quote),
  }));

  await saveSiteSettings(client, current.siteSettings);
  await saveProfile(client, nextProfile);
  await Promise.all([
    saveProjects(client, current.projects, nextProjects),
    saveBlogPosts(client, current.blogPosts, nextPosts),
    savePages(client, current.pages, nextPages),
    saveExperiences(client, current.experiences, nextExperiences),
    saveEducation(client, current.education, nextEducation),
    saveCertifications(client, current.certifications, current.certifications),
    saveStack(client, current.stack, nextStack),
    saveAwards(client, current.awards, current.awards),
    saveRecommendations(client, current.recommendations, nextRecommendations),
  ]);

  console.log("Correções de ortografia aplicadas ao CMS.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
