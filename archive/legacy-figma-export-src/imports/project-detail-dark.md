Quero que você recrie com 100% de fidelidade (pixel-perfect) a tela do screenshot: página de DETALHE DE PROJETO (“Brandify - Modern Agency TemplateB”) em dark theme, com navbar pill flutuante no topo, breadcrumb pequeno “Projects”, título grande + link “Visit Website”, bloco de descrição + metadados em 4 colunas (Category / Services / Client / Year), uma imagem hero grande do projeto, texto descritivo em 2 parágrafos, uma seção com 3 imagens/frames grandes empilhados (mockups do projeto), depois “View more projects” com grid 2 colunas (4 cards), e por fim “Let’s talk” com info + formulário e footer.

REGRA DE OURO (FIDELIDADE)
1) Importe o screenshot como Reference, trave e coloque opacity 20–30% por cima do frame.
2) Construa tudo por baixo com Auto Layout e ajuste tamanhos até casar 1:1.

FRAME / FUNDO / CONTAINER
- Frame: Desktop 1440px (altura longa ~3300–4200px), Auto Layout vertical.
- Background: preto com vinheta suave (centro levemente mais claro).
  Base #0B0B0D; radial suave #141418 (10–15%).
- Container central: max-width 860–920px; alinhado ao centro; conteúdo alinhado à esquerda.
- Espaçamento entre seções: 56–96px (bem arejado).

TIPOGRAFIA (Inter)
- Breadcrumb/labels: 12px, cor #7A7A7A.
- Título do projeto: 28–34px, semibold, #EDEDED.
- Link “Visit Website”: 12–13px, underline fino, #CFCFCF.
- Texto corpo: 14–16px, line-height 160–175%, cor #A6A6A6.
- Metadados (labels): 11–12px, #6F6F6F; valores: 13–14px, #D6D6D6.

NAVBAR PILL (FIXA NO TOPO)
- Navbar flutuante/sticky centralizada.
- Altura 36–40px; padding 14–16px; gap 14–18px.
- Radius 14–16px.
- Fundo #1F2023 com blur MUITO sutil e borda 1px #2A2A2A (35–45%).
- Itens: “Intro”, “About”, “Work”, “Experience”, “Education”, “Stack”, “Blog”, “Contact”.
- Hover: texto clareia; ativo: #FFFFFF.

TOPO DA PÁGINA (BREADCRUMB + TÍTULO + LINK)
- Logo abaixo da navbar, alinhe:
  - “Projects” (breadcrumb pequeno)
  - Título: “Brandify - Modern Agency TemplateB”
  - Abaixo do título, link: “Visit Website” (underline)
- Margem top desde o topo do frame: 90–120px (para não colar na navbar).

BLOCO DE DESCRIÇÃO + METADADOS (4 COLUNAS)
- Após o link “Visit Website”, inclua um parágrafo curto descrevendo o template (tom profissional).
- Em seguida, um bloco de metadados em 4 colunas (distribuição horizontal com bastante espaço):
  1) Category → “Agency Website”
  2) Services → “Web Design”
  3) Client → “Framer Template”
  4) Year → “2024”
- Cada coluna: label (muted) em cima + valor abaixo.
- Alinhamento: tudo à esquerda, mas as colunas espaçadas igualmente (space-between).

IMAGEM HERO PRINCIPAL (GRANDE)
- Um card de imagem grande centralizado, ocupando quase toda a largura do container.
- Wrapper:
  - Radius 14–16px
  - Fundo #0F1012
  - Borda 1px #2A2A2A (35–45%)
  - Padding 14–18px
- Imagem interna com radius 12–14px (ligeiramente menor que o wrapper).

TEXTO DESCRITIVO (2 PARÁGRAFOS)
- Abaixo da hero, dois parágrafos com o mesmo estilo do screenshot.
- Cor #A6A6A6, line-height alto, largura confortável (sem cards, só texto).

SEÇÃO DE IMAGENS/FRAMES DO PROJETO (3 BLOCOS GRANDES EMPILHADOS)
- Três imagens grandes, uma abaixo da outra, com o MESMO estilo do wrapper:
  - Wrapper dark #0F1012, borda sutil, radius 14–16, padding 14–18
  - Imagem interna radius 12–14
- Espaçamento entre esses blocos: 32–44px.

SEÇÃO “View more projects”
- Cabeçalho em linha:
  - Esquerda: “View more projects”
  - Direita: link “View all” (underline fino)
- Abaixo, grid 2 colunas com 4 cards (2 linhas):
  Cards: Shiro / Vivid / Capture / Automize, cada um com:
  - Thumb grande (radius 12–14)
  - Rodapé escuro com nome + categoria
  - Wrapper com borda sutil e radius 14–16
- Gap entre cards: 24–32px (horizontal e vertical).
- Hover: elevar 2–4px + borda levemente mais clara.

SEÇÃO FINAL “Let’s talk” (IGUAL À PÁGINA PROJECTS)
- Título: “Let’s talk”
- Duas colunas:
  - Esquerda: Time / Email / Phone / Socials (Twitter, Instagram, LinkedIn)
  - Direita: Form com label “Reach out:” + inputs
- Estilo inputs:
  - Fundo #15161A, borda #2A2A2A, radius 8–10
  - Placeholder #6F6F6F; texto #EDEDED
- Botão full width:
  - Fundo #F2F2F2, texto #111, radius 8–10, altura 36–40px

FOOTER
- Linha final discreta:
  - Esquerda: “Designed in Framer By Thaar”
  - Direita: “© Copyright 2024”
- Texto 11–12px, #6F6F6F.

AUTO LAYOUT / NOMES DE CAMADAS
- Page/ProjectDetail
  - Nav/Pill
  - Header/Breadcrumb
  - Header/Title
  - Header/VisitWebsiteLink
  - Intro/Description
  - Meta/4Cols
  - Media/Hero
  - Content/Paragraphs
  - Media/Gallery (3 blocks)
  - MoreProjects/Header
  - MoreProjects/Grid2x2
  - Contact/Let’sTalk
  - Footer

Agora gere o layout completo seguindo exatamente o screenshot (proporções, espaçamentos, cantos e contraste). Use Auto Layout em tudo.