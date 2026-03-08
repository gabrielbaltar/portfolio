Crie uma evolução do meu projeto atual de Portfolio + CMS, mantendo 100% do estilo visual, identidade, componentes, tipografia, grid, espaçamentos, cores e linguagem de interface já existentes.
Não quero redesign visual.
Quero apenas ajustes de arquitetura do produto, lógica de navegação, experiência de edição e comportamento do CMS, seguindo o layout atual do projeto.

Contexto do projeto

Hoje meu portfolio público e meu CMS estão dentro do mesmo projeto.
Quero evoluir essa solução para uma arquitetura mais profissional, pensando em publicação real, separação de responsabilidades e escalabilidade.

Objetivo principal

Reestruture a experiência e a lógica do produto para que existam dois sistemas conectados, porém separados:

Portfolio público

Site público, focado em exibir projetos, cases, páginas institucionais, artigos e contato.

Deve ser otimizado para performance, SEO, publicação e navegação pública.

Não deve expor estrutura administrativa.

CMS/Admin

Painel privado para gerenciar conteúdo do portfolio.

Deve permitir criar, editar, organizar, versionar e publicar conteúdo.

Precisa ter uma experiência mais flexível e moderna, inspirada em Notion, mas sem copiar visualmente o Notion.

A edição deve seguir meu layout atual, só que com uma experiência de edição mais fluida, visual e customizável.

Diretriz de arquitetura

Quero que a proposta considere uma arquitetura onde:

o Portfolio público fique separado do CMS/Admin

ambos possam conversar por API / banco / CMS headless / camada de publicação

exista uma visão de publicação pensando em:

domínio principal para o portfolio

subdomínio admin para o CMS

conexão com VPS / hospedagem / deploy do sistema

separação entre ambiente público e administrativo

futura escalabilidade e manutenção mais simples

O que quero que seja resolvido

Hoje a tela de criação do CMS está muito baseada em formulários com muitos campos, o que deixa a experiência rígida.
Quero manter esse modelo atual porque ele ajuda em conteúdo estruturado, validações e organização.
Porém, quero adicionar uma segunda forma de edição:

Modo 1 — Edição estruturada

manter a experiência atual estilo formulário

boa para cadastro organizado

ideal para campos como:

título

slug

categoria

tags

data

status

capa

SEO

links

metadados

ordem

destaque

tecnologias

tempo de leitura

autor

etc.

Modo 2 — Edição visual / inline

nova experiência inspirada em Notion

permitir editar o conteúdo diretamente no preview, antes de salvar/publicar

permitir edição inline de:

texto

headings

subtítulos

parágrafos

listas

links

imagens

legendas

blocos destacados

quote

botões

cards

seções

embed de mídia

grids simples

o usuário deve conseguir clicar no preview e editar o conteúdo ali mesmo

a experiência deve parecer mais natural, viva e contextual

o preview deve funcionar como uma “prévia editável”, não apenas uma visualização estática

Conceito ideal da experiência

Quero que o CMS tenha uma experiência híbrida:

Form mode para estrutura e governança

Visual mode para edição rápida e intuitiva

ambos sincronizados em tempo real

Exemplo de comportamento desejado:

altero o título no formulário → o preview atualiza automaticamente

clico no título dentro do preview → posso editar inline

troco uma imagem diretamente no preview → o campo correspondente do formulário também atualiza

adiciono uma lista ou bloco visualmente → o CMS registra isso na estrutura do conteúdo

tudo isso antes de salvar/publicar

Inspirar-se em Notion no comportamento, não no visual

Quero referências do tipo:

edição inline

blocos reorganizáveis

sensação de liberdade na escrita

inserção contextual de conteúdo

visualização viva do documento

experiência menos “engessada”

toolbar contextual ao selecionar texto ou bloco

possibilidade de adicionar novos blocos entre seções

arrastar e reordenar blocos

feedback visual claro do que está sendo editado

Mas repito:
não alterar o design system atual
não mudar o visual para parecer Notion
não trocar a identidade do projeto
apenas adaptar a experiência de edição para esse modelo dentro do meu layout existente

O que quero no resultado

Crie a proposta de UX/UI e arquitetura de tela para esse novo fluxo do CMS, incluindo:

1. Estrutura de produto

Proponha a divisão do ecossistema em:

Portfolio público

CMS/Admin privado

relação entre ambos

fluxo de publicação

fluxo de preview

fluxo de salvar como rascunho

fluxo de publicar

fluxo de atualizar conteúdo já publicado

2. Fluxo de navegação do CMS

Quero telas e fluxos para:

login

dashboard

listagem de conteúdos

criação de conteúdo

edição de conteúdo

preview editável

biblioteca de mídia

SEO/configurações

versões / histórico

publicação

gerenciamento de páginas e projetos

organização por status:

draft

review

published

archived

3. Nova tela de criação/edição

A tela principal de edição deve contemplar:

opção de alternar entre:

modo formulário

modo visual

modo dividido (form + preview)

preview editável em tempo real

barra superior com ações principais:

salvar rascunho

visualizar

comparar alterações

publicar

desfazer/refazer

navegação lateral para estrutura do conteúdo

possibilidade de editar blocos direto no preview

suporte a blocos reutilizáveis

boa hierarquia para conteúdos longos

4. Modelo de edição híbrida

Desenhe uma UX em que:

o formulário continue existindo

o editor visual seja complementar

ambos sejam sincronizados

o usuário escolha o jeito mais confortável de trabalhar

o sistema não perca consistência de dados

Requisitos de experiência

A proposta deve priorizar:

sensação de controle

menor fricção

menos dependência de campos excessivos

mais contexto visual

edição mais natural

preview fiel

clareza entre rascunho e publicado

confiança antes de publicar

escalabilidade para adicionar novos tipos de conteúdo no futuro

Requisitos funcionais do CMS

Considere que o CMS deve permitir:

criar páginas institucionais

criar projetos/cases

criar artigos/posts

editar conteúdo com blocos

subir e trocar imagens

editar links

controlar slug e SEO

ordenar seções

salvar rascunho

publicar/despublicar

duplicar conteúdo

pré-visualizar antes de publicar

ter histórico de alterações

ter estados de conteúdo

suportar futuros módulos sem quebrar a experiência

Componentes e comportamentos que quero ver

Inclua no projeto telas/componentes para:

header do CMS

sidebar

lista de conteúdos

filtros e busca

cards ou tabela de conteúdos

editor de formulário

editor visual inline

toolbar contextual de texto

toolbar de bloco

inserção de imagem

editor de link

bloco de lista

bloco de quote

bloco de CTA

ordenação por drag and drop

seletor de status

autosave/draft state

comparativo de alterações

indicador de conteúdo publicado vs não publicado

preview desktop e mobile

modal ou drawer para mídia

confirmação antes de publicar

mensagens de sucesso/erro/rascunho salvo

Requisitos de arquitetura de informação

Organize a solução para que o CMS seja preparado para crescer.
Pense em uma estrutura modular, clara e escalável, por exemplo:

Conteúdo

Projetos

Artigos

Páginas

Mídia

SEO

Navegação

Configurações

Publicação

Histórico

Requisitos técnicos a serem considerados no conceito

Mesmo sendo uma proposta visual/UX, considere na lógica do sistema:

Portfolio e CMS como aplicações separadas

CMS autenticado

portfolio público consumindo conteúdo publicado

preview consumindo versão draft

integração com VPS/hospedagem

possibilidade de deploy separado

futura escalabilidade

segurança básica da área admin

performance no site público

manutenção mais simples

possibilidade de usar API/headless CMS/backend próprio

Output esperado do Figma Make

Quero que você gere:

telas novas/adaptadas do CMS

fluxo completo de criação, edição, preview e publicação

estrutura visual da experiência híbrida formulário + edição inline

organização do produto separado em Portfolio público e CMS privado

estados de interface principais

componentes necessários para a edição estilo Notion dentro do meu layout atual

sugestões de arquitetura de navegação e módulos

wireframes de alta fidelidade usando o estilo visual atual do projeto

Restrições importantes

não mudar a identidade visual

não recriar o design do zero

não transformar o produto em outro estilo

não deixar com aparência genérica de dashboard template

não copiar a interface do Notion

usar o meu layout atual como base

melhorar apenas a experiência, lógica e arquitetura

manter coerência com o design system existente

Critério de sucesso

A solução final deve transmitir que:

o CMS ficou mais moderno e flexível

a edição ficou mais natural

o preview virou parte ativa da edição

o formulário continua útil

a arquitetura ficou mais profissional para publicação real

portfolio e CMS agora fazem mais sentido separados

o produto está pronto para crescer sem perder organização

Crie essa solução com foco em UX de produto real, arquitetura escalável, edição híbrida, governança de conteúdo e experiência de publicação profissional, sempre mantendo o meu layout e linguagem visual atuais.