Quero que você recrie com 100% de fidelidade (pixel-perfect) a tela do screenshot: página de DETALHE DE POST do BLOG em dark theme, com navbar pill flutuante no topo, breadcrumb “Blog”, data pequena, título grande, subtítulo/lead curto, uma imagem hero grande com gradiente azul/ciano, conteúdo do artigo com parágrafos e lista numerada (10 itens), depois seção “Read more articles” com lista de 3 cards (imagem à esquerda + texto à direita + link “Read article”), e por fim “Let’s talk” com info + formulário e footer.

REGRA DE OURO (FIDELIDADE)
1) Importe o screenshot como Reference, trave e coloque opacity 20–30% por cima do frame.
2) Construa tudo por baixo com Auto Layout e ajuste até casar 1:1 em espaçamentos, tamanhos e cantos.

FRAME / FUNDO / CONTAINER
- Frame: Desktop 1440px, altura longa ~3600–4600px, Auto Layout vertical.
- Background: preto com vinheta suave (centro levemente mais claro).
  Base #0B0B0D; radial sutil #141418 (10–15%).
- Container central: max-width 860–920px, centralizado; conteúdo alinhado à esquerda.
- Ritmo vertical: 56–96px entre seções.

TIPOGRAFIA (Inter)
- Breadcrumb/labels: 12px, #7A7A7A.
- Data: 12px, #7A7A7A.
- Título do post: 30–36px, semibold, #EDEDED.
- Lead/descrição curta: 14–16px, #A6A6A6, line-height 160–175%.
- Corpo do artigo: 14–16px, #A6A6A6, line-height 170–185%.
- Subtítulos numerados (1., 2., etc): 14–16px semibold, #E0E0E0.
- Links (ex.: “Read article”): 12–13px, underline fino, #CFCFCF.

NAVBAR PILL (FIXA NO TOPO)
- Navbar flutuante/sticky centralizada no topo.
- Altura 36–40px; padding 14–16px; gap 14–18px.
- Radius 14–16px.
- Fundo #1F2023 com blur MUITO sutil + borda 1px #2A2A2A (35–45%).
- Itens: “Intro”, “About”, “Work”, “Experience”, “Education”, “Stack”, “Blog”, “Contact”.
- Hover: clareia; ativo: “Blog” pode ficar mais branco.

TOPO DO POST (BREADCRUMB + DATA + TÍTULO + LEAD)
- Breadcrumb pequeno: “Blog”
- Data em linha abaixo: “15 de mai. de 2024” (ou placeholder idêntico ao screenshot)
- Título: “The Future of Web Design: Trends to Watch in 2024”
- Lead: 2–3 linhas explicando o artigo (tom editorial, igual ao screenshot).
- Espaçamento entre esses elementos: 10–16px.

HERO IMAGE (GRANDE COM GRADIENTE AZUL/CERULEAN)
- Card/hero grande abaixo do lead, ocupando quase toda a largura do container.
- Wrapper:
  - Radius 14–16px
  - Fundo com gradiente horizontal/diagonal azul → ciano (bem forte, tipo “neon suave”)
    Ex.: #1E2BFF → #00C2FF (ajuste para ficar igual ao screenshot)
  - Padding interno: 18–22px (para “moldurar” a imagem interna)
- Dentro do wrapper: uma imagem/screenshot de UI centralizada (um retângulo com cantos 10–12px), com sombra suave.
- A hero deve ser o elemento mais chamativo da página.

CONTEÚDO DO ARTIGO (TEXTO LONGO)
- Após a hero, renderize:
  - 1–2 parágrafos introdutórios.
  - Lista numerada de 10 itens (1 a 10), cada item com:
    - Título do item (semibold)
    - Parágrafo curto (2–4 linhas) em #A6A6A6
  Itens no estilo:
    1. Immersive Experiences with AR/VR
    2. AI-Driven Personalization
    3. Dark Mode and Low Light Design
    4. Micro-interactions...
    ...
    10. Enhanced Accessibility
- Espaçamento:
  - Entre parágrafos: 14–18px
  - Entre itens numerados: 18–26px
- Largura de leitura confortável: mantenha o texto no container sem caixas pesadas.

SEÇÃO “Read more articles” (LISTA DE CARDS)
- Header em linha:
  - Esquerda: “Read more articles”
  - Direita: “View all posts” (underline fino)
- Abaixo, lista vertical com 3 cards (empilhados) no formato 2 colunas:
  - Coluna esquerda: thumbnail (grande) com radius 12–14.
  - Coluna direita: título do artigo (semibold), meta (categoria + data), resumo curto (2–3 linhas) e link “Read article”.
- Card wrapper:
  - Fundo #0F1012
  - Borda 1px #2A2A2A (35–45%)
  - Radius 14–16
  - Padding 14–18
- Espaçamento entre cards: 22–32px.
- Hover: elevar 2–4px + borda levemente mais clara.

SEÇÃO FINAL “Let’s talk” (IGUAL ÀS OUTRAS PÁGINAS)
- Título: “Let’s talk”
- Duas colunas:
  - Esquerda: Time / Email / Phone / Socials (Twitter, Instagram, LinkedIn)
  - Direita: label “Reach out:” + inputs “Your name”, “Your Email address”, textarea “Message” + botão.
- Inputs:
  - Fundo #15161A, borda #2A2A2A, radius 8–10, texto #EDEDED, placeholder #6F6F6F.
- Botão full width:
  - Fundo #F2F2F2, texto #111, altura 36–40px, radius 8–10.

FOOTER
- Linha final:
  - Esquerda: “Designed in Framer By Thaar”
  - Direita: “© Copyright 2024”
- Texto 11–12px, #6F6F6F.

AUTO LAYOUT / NOMES DE CAMADAS
- Page/BlogPostDetail
  - Nav/Pill
  - Header/Breadcrumb
  - Header/Date
  - Header/Title
  - Header/Lead
  - Media/HeroGradient
  - Content/IntroParagraphs
  - Content/NumberedList (10 items)
  - MoreArticles/Header
  - MoreArticles/List (3 cards)
  - Contact/Let’sTalk
  - Footer

Agora gere o layout completo exatamente como no screenshot: mesmas proporções da hero, espaçamentos, cantos arredondados, hierarquia e contraste. Use Auto Layout em tudo.