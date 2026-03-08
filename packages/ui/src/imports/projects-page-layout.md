Quero que você recrie com MÁXIMA FIDELIDADE a tela do screenshot: uma página “Projects” (one-page/scroll) em dark theme, com navbar pill flutuante no topo, título “Projects”, lista vertical de cards grandes com thumbnails e legenda (nome + categoria), e seção final “Let’s talk” com info + formulário. O layout deve bater 1:1 com o espaçamento, proporções, cantos arredondados e contraste do screenshot.

IMPORTANTE (para fidelidade 100%)
1) Importe o screenshot como “Reference”, trave a layer e deixe opacity 20–30% por cima do frame.
2) Construa tudo por baixo usando Auto Layout, ajustando até casar pixel a pixel.

FRAME / FUNDO / CONTAINER
- Frame: Desktop 1440px (altura longa, ~2600–3600px) com Auto Layout vertical.
- Background: preto com vinheta suave (centro ligeiramente mais claro).
  Base #0B0B0D; overlay radial sutil #141418 (10–15%).
- Container central: max-width 860–920px, alinhado ao centro, conteúdo alinhado à esquerda.
- Espaçamento entre seções: 56–88px (bem “arejado”).

TIPOGRAFIA
- Fonte: Inter.
- Breadcrumb (“Home”): 12px, cor #7C7C7C.
- Título “Projects”: 28–32px, semibold, cor #EDEDED.
- Labels de card (nome): 14–16px semibold, #EDEDED.
- Categoria: 12–13px, #8E8E8E.
- Textos de contato: 12–14px, #A0A0A0.

NAVBAR (PILL FIXA NO TOPO)
- Elemento “floating/sticky” centralizado no topo.
- Altura 36–40px; padding horizontal 14–16px; gap 14–18px.
- Radius 14–16px.
- Fundo: #1F2023 com blur MUITO sutil (glass leve).
- Borda: 1px #2A2A2A (30–40%).
- Itens (12–13px): “Intro”, “About”, “Work”, “Experience”, “Education”, “Stack”, “Blog”, “Contact”.
- Hover: texto clareia; ativo: texto #FFFFFF.
- (Opcional) micro-sombra suave para destacar do fundo.

HEADER DA PÁGINA
- Abaixo da navbar, alinhe:
  - Breadcrumb “Home” (pequeno, em cima)
  - Título “Projects”
- Margem top confortável (para não colar na navbar): 80–110px desde o topo do frame.

LISTA DE PROJECTS (CARDS GRANDES EMPILHADOS)
Estrutura: uma coluna, cards ocupando toda a largura do container, com grande thumbnail e um rodapé escuro com nome + categoria (como no screenshot).

Config geral dos cards:
- Card wrapper:
  - Background: #0F1012
  - Radius: 14–16px
  - Borda: 1px #2A2A2A (35–45%)
  - Padding interno: 14–18px (thumb “respira”)
- Thumb (imagem):
  - Preencher quase todo o card.
  - Radius: 12–14px (dentro do card, ligeiramente menor que o card).
  - Imagem com leve “matte”/contrast (não super vibrante).
- Área de legenda (embaixo do thumb):
  - Faixa escura sólida (sem muita transparência) #0C0D0F.
  - Padding: 14–16px.
  - Alinhamento: esquerda.
  - 2 linhas: Nome do projeto + categoria.

Espaçamento entre cards:
- Gap vertical: 28–36px.

Cards (na ordem do screenshot) e textos:
1) Brandify — “Agency Website”
2) Shiro — “Personal Portfolio”
3) Vivid — “App Showcase”
4) Capture — “Video Agency”
5) Automize — “AI Agency”
6) Lyne — “Portfolio & Agency”

INTERAÇÕES DOS CARDS (subtis)
- Hover: elevar 2–4px + borda um pouco mais clara (#3A3A3A) + sombra suave.
- Clique: abre “Project detail” (pode ser link/ancora, mas no layout só precisa do estado hover).

SEÇÃO FINAL “Let’s talk” (2 COLUNAS)
- Título: “Let’s talk” (20–22px semibold).
- Grid 2 colunas dentro do container:
  - Coluna esquerda (info):
    - “Time for me: 12:31 PM”
    - “Email: johnsmith@gmail.com”
    - “Phone: 123 456 7890”
    - “Socials: Twitter / Instagram / LinkedIn”
    - Tudo com espaçamento vertical 10–14px.
  - Coluna direita (form):
    - Label “Reach out:”
    - Input 1: “Your Full name”
    - Input 2: “Your Email address”
    - Textarea: “Message” (maior)
    - Botão full width: “Send Message”

FORM (estilo fiel)
- Inputs/textarea:
  - Altura input: 36–40px
  - Textarea: 110–140px
  - Fundo: #15161A
  - Borda: 1px #2A2A2A
  - Radius: 8–10px
  - Texto: #EDEDED; placeholder #6F6F6F
- Botão:
  - Full width, altura 36–40px
  - Fundo branco #F2F2F2
  - Texto escuro #111
  - Radius: 8–10px
  - Hover: levemente mais escuro.

FOOTER (LINHA FINAL)
- Duas pontas, alinhado ao container:
  - Esquerda: “Designed in Framer By Thaar”
  - Direita: “© Copyright 2024”
- Texto pequeno 11–12px, cor #6F6F6F.
- Espaçamento acima do footer: 28–40px.

ÂNCORAS / SCROLL
- Cada item da navbar deve rolar para uma âncora/section correspondente (Intro/About/Work/Experience/Education/Stack/Blog/Contact).
- Nesta tela, o foco visual é “Work/Projects” e “Contact”.

NOMENCLATURA DE LAYERS (para organização no Make)
- Page/Projects
  - Nav/Pill
  - Header/Breadcrumb
  - Header/Title
  - Projects/List
    - ProjectCard/Brandify
    - ProjectCard/Shiro
    - ProjectCard/Vivid
    - ProjectCard/Capture
    - ProjectCard/Automize
    - ProjectCard/Lyne
  - Contact/Let’sTalk
  - Footer

Agora gere o layout completo seguindo exatamente o screenshot: mesmas proporções, cantos, distâncias e hierarquia visual. Use Auto Layout em tudo.