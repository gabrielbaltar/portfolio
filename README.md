# Portfolio + CMS Monorepo

Refatoracao do export do Figma Make para uma arquitetura de producao com duas aplicacoes React/Vite separadas, backend compartilhado no Supabase e deploy preparado para o Render.

## Arquitetura ativa

```text
apps/
  web/                 # site publico
  cms/                 # admin autenticado
packages/
  ui/                  # componentes e layout reaproveitados do export original
  core/                # tipos, defaults, slug utils e seed legacy
  supabase/            # cliente, auth e repositorios
scripts/
  seed-supabase.ts     # migracao/seed dos dados mockados antigos
supabase/
  migrations/
    0001_initial_schema.sql
render.yaml            # blueprint com 2 static sites no Render
archive/
  legacy-figma-export-src/   # snapshot original do export, fora da arvore ativa
```

## O que mudou

- O app unico foi separado em `apps/web` e `apps/cms`.
- O layout original do Figma Make foi preservado e reaproveitado em `packages/ui`.
- O CMS deixou de persistir entidades em `localStorage`; a fonte de verdade agora e o Supabase.
- O login/logout do CMS agora usa Supabase Auth real.
- O upload de imagem/video agora usa Supabase Storage com buckets publico e privado.
- O site publico consome apenas registros `published`.
- O CMS passa a ler rascunhos, historico de versoes e assets privados com signed URL.
- O deploy ficou preparado para `example.com` e `admin.example.com`.

## Requisitos

- Node.js 20+
- npm 10+
- Um projeto Supabase
- Opcional para deploy: conta no Render

## Variaveis de ambiente

### Raiz

Arquivo: [`.env.example`](/Users/gabrielbaltar/Downloads/portfolio/.env.example)

Usado apenas por scripts administrativos, principalmente seed/migracao.

| Variavel | Obrigatoria | Uso |
| --- | --- | --- |
| `SUPABASE_URL` | Sim | URL do projeto Supabase para scripts root |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Apenas para seed/migracao. Nunca usar no front-end |

### Web publico

Arquivo: [`apps/web/.env.example`](/Users/gabrielbaltar/Downloads/portfolio/apps/web/.env.example)

| Variavel | Obrigatoria | Uso |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Sim | URL publica do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave anon usada no front-end |
| `VITE_CMS_URL` | Sim | URL do CMS para link "CMS" no site |
| `VITE_PUBLIC_POSTHOG_KEY` | Nao | Chave publica do PostHog para analytics |
| `VITE_PUBLIC_POSTHOG_HOST` | Nao | Host da instancia PostHog |
| `VITE_EMAILJS_SERVICE_ID` | Nao | Contact form via EmailJS |
| `VITE_EMAILJS_TEMPLATE_ID` | Nao | Contact form via EmailJS |
| `VITE_EMAILJS_PUBLIC_KEY` | Nao | Contact form via EmailJS |

### CMS

Arquivo: [`apps/cms/.env.example`](/Users/gabrielbaltar/Downloads/portfolio/apps/cms/.env.example)

| Variavel | Obrigatoria | Uso |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Sim | URL publica do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave anon usada no front-end |
| `VITE_PUBLIC_SITE_URL` | Sim | URL do site publico para link "Ver portfolio" |
| `VITE_PUBLIC_POSTHOG_KEY` | Nao | Chave publica do PostHog para analytics |
| `VITE_PUBLIC_POSTHOG_HOST` | Nao | Host da instancia PostHog |

## Rodando localmente

1. Instale dependencias na raiz:

```bash
npm install
```

2. Crie os arquivos `.env` com base nos exemplos:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp apps/cms/.env.example apps/cms/.env
```

3. Preencha as variaveis do Supabase.

4. Suba o site publico:

```bash
npm run dev:web
```

O web roda em `http://localhost:4173`.

5. Em outro terminal, suba o CMS:

```bash
npm run dev:cms
```

O CMS roda em `http://localhost:4174`.

## Supabase: banco, auth, storage e RLS

### 1. Criar o projeto

Crie um novo projeto no Supabase e copie:

- Project URL
- `anon` key
- `service_role` key

### 2. Aplicar a migracao SQL

Arquivo: [`supabase/migrations/0001_initial_schema.sql`](/Users/gabrielbaltar/Downloads/portfolio/supabase/migrations/0001_initial_schema.sql)

Opcao A, SQL Editor:

1. Abra o SQL Editor no Supabase.
2. Cole o conteudo do arquivo.
3. Execute o script.

Opcao B, Supabase CLI:

```bash
supabase db push
```

### 3. Tabelas criadas

- `site_settings`
- `profile`
- `projects`
- `blog_posts`
- `pages`
- `experiences`
- `education`
- `certifications`
- `stack`
- `awards`
- `recommendations`
- `media`
- `content_versions`

### 4. Buckets criados

A migracao cria automaticamente:

- `portfolio-public`
  - bucket publico para assets publicados do portfolio/blog
- `portfolio-private`
  - bucket privado para rascunhos, previews e midia restrita

### 5. Politicas de seguranca

- RLS esta habilitado em todas as tabelas de negocio.
- O app publico le apenas `projects`, `blog_posts` e `pages` com `status = 'published'`.
- O app publico le apenas assets do bucket publico.
- O CMS exige sessao autenticada do Supabase Auth.
- O CMS gera signed URLs para assets privados quando necessario.
- Nenhuma tela front-end usa `service_role`.

## Criar usuario admin

O projeto atual trata qualquer usuario autenticado como usuario de CMS. Portanto:

1. Va em Supabase Dashboard > Authentication > Users.
2. Crie um usuario por email e senha.
3. Use apenas contas realmente administrativas.

Para ambientes com multiplos perfis/permissoes, o proximo passo natural e adicionar uma tabela de `roles` por usuario.

## Migrar os dados mockados antigos

Arquivo: [`scripts/seed-supabase.ts`](/Users/gabrielbaltar/Downloads/portfolio/scripts/seed-supabase.ts)

Depois de preencher o `.env` da raiz:

```bash
npm run seed:supabase
```

Esse script:

- le o dataset legacy reaproveitado de `packages/core`
- busca o estado atual no Supabase
- aplica upserts granulares por entidade
- popula o banco com o conteudo mockado original do export

## Fluxo do CMS

- Login: Supabase Auth com email/senha
- Guardas de rota: paginas internas exigem sessao valida
- Logout: invalida sessao real no Supabase
- Persistencia: updates granulares por entidade, nao mais serializacao do CMS inteiro
- Versionamento: snapshots em `content_versions`
- Rollback: restauracao via historico no editor
- Midia: upload real de imagem e video com media library

## Fluxo do site publico

- Consome o mesmo backend do Supabase
- Filtra apenas conteudo publicado
- Resolve assets publicos via URL publica
- Mantem slugs, `title` e `meta description`
- Fica pronto para migracao futura para SSR/Astro/Next porque a camada de dados foi separada da UI

## Build e validacao

```bash
npm run typecheck
npm run build
```

Os builds gerados saem em:

- `dist/web`
- `dist/cms`

## Deploy no Render

Arquivo: [`render.yaml`](/Users/gabrielbaltar/Downloads/portfolio/render.yaml)

O blueprint cria dois static sites:

- `portfolio-web`
  - dominio esperado: `example.com`
- `portfolio-cms`
  - dominio esperado: `admin.example.com`

### Passo a passo

1. Suba este repositorio para GitHub, GitLab ou Bitbucket.
2. Antes do primeiro deploy, ajuste `render.yaml` com seus dominios reais e nomes de servico.
3. No Render, escolha `New +` > `Blueprint`.
4. Selecione o repositorio.
5. Revise os dois servicos criados pelo blueprint.
6. Preencha as variaveis marcadas com `sync: false`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CMS_URL` no web
   - `VITE_PUBLIC_SITE_URL` no CMS
   - `VITE_PUBLIC_POSTHOG_KEY` e `VITE_PUBLIC_POSTHOG_HOST` se usar analytics
   - `VITE_EMAILJS_*` se usar o formulario
7. Rode o deploy.

### Rewrites do React Router

Cada app statico ja esta configurado no blueprint com:

- `source: /*`
- `destination: /index.html`

Isso garante refresh e deep links em SPA.

## Dominio e DNS

### Dominio principal

- Conecte `example.com` ao servico `portfolio-web`.
- O Render vai informar os registros DNS exatos do apex/root domain.
- Configure os registros exatamente como o dashboard do Render indicar.

### Subdominio admin

- Conecte `admin.example.com` ao servico `portfolio-cms`.
- Em geral sera um `CNAME` apontando para o target fornecido pelo Render.

### SSL

- O Render emite certificado automaticamente depois que o DNS propaga.

## Resumo tecnico

### Alteracoes realizadas

- separacao do monolito SPA em dois apps independentes
- extracao de UI compartilhada para `packages/ui`
- extracao de tipos, seeds e utilitarios para `packages/core`
- extracao da integracao Supabase para `packages/supabase`
- substituicao do login mock por Supabase Auth
- substituicao do upload base64/localStorage por Supabase Storage
- criacao de migracao SQL com RLS e buckets
- criacao de seed para migrar o conteudo mockado legado
- preparacao de blueprint e envs para deploy no Render

### Decisoes arquiteturais

- `packages/ui` preserva o layout exportado do Figma Make e evita redesenho
- `packages/core` concentra schema forte e evita drift entre web e CMS
- `packages/supabase` isola cliente, auth e acesso a dados para facilitar futura migracao a SSR
- `content_blocks` ficam em JSON estruturado para manter flexibilidade editorial
- `content_versions` salva snapshots para rollback simples sem acoplamento a UI

### Riscos remanescentes

- O bundle principal ainda esta grande e o Vite reporta chunks acima de 500 kB
- O CMS hoje diferencia apenas usuarios autenticados, nao perfis finos de autorizacao
- Ainda existe conteudo gerado do export original em `packages/ui/src/imports`, embora o build ativo esteja controlado

### Proximos passos recomendados

- adicionar code splitting por rota nas duas apps
- criar papeis de usuario se houver mais de um editor/admin
- adicionar testes automatizados para repositorios Supabase e fluxos principais do CMS
- adicionar observabilidade e monitoramento do deploy
