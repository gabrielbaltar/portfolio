# Portfolio + CMS Monorepo

Refatoracao do export do Figma Make para uma arquitetura de producao com duas aplicacoes React/Vite separadas, backend compartilhado no Supabase e deploy preparado para o Render.

## Estrutura

```text
apps/
  web/                 # portfolio publico
  cms/                 # CMS/admin autenticado
packages/
  ui/                  # componentes e layout compartilhados
  core/                # tipos, defaults, slug utils e seed legacy
  supabase/            # cliente, auth e repositorios
scripts/
  seed-supabase.ts     # seed/migracao dos dados mockados antigos
supabase/
  migrations/
    0001_initial_schema.sql
render.yaml            # blueprint com 2 static sites no Render
archive/
  legacy-figma-export-src/   # snapshot do export original, fora da arvore ativa
```

## Arquitetura ativa

- `apps/web` publica o portfolio no dominio raiz.
- `apps/cms` publica o admin em subdominio separado.
- `packages/ui` preserva o layout exportado do Figma e evita redesenho.
- `packages/core` concentra schema, defaults, seed e utilitarios compartilhados.
- `packages/supabase` isola auth, storage e acesso a dados.
- O site publico consome apenas conteudo `published`.
- O CMS usa Supabase Auth real, RLS, versionamento e upload no Storage.

## Requisitos

- Node.js `>=20 <23`
- npm `>=10`
- um projeto Supabase
- opcional: conta no Render

## Variaveis de ambiente

### Raiz

Arquivo: [`.env.example`](./.env.example)

Usado apenas por scripts administrativos, principalmente seed/migracao.

| Variavel | Obrigatoria | Uso |
| --- | --- | --- |
| `SUPABASE_URL` | Sim | URL do projeto Supabase para scripts root |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Apenas para scripts root. Nunca usar no front-end |

### Web publico

Arquivo: [`apps/web/.env.example`](./apps/web/.env.example)

| Variavel | Obrigatoria | Uso |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Sim | URL publica do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave anon usada no front-end |
| `VITE_PUBLIC_POSTHOG_KEY` | Nao | Chave publica do PostHog |
| `VITE_PUBLIC_POSTHOG_HOST` | Nao | Host da instancia PostHog; se ausente, o app usa `https://us.i.posthog.com` |
| `VITE_EMAILJS_SERVICE_ID` | Nao | Service ID do EmailJS para formulario de contato |
| `VITE_EMAILJS_TEMPLATE_ID` | Nao | Template ID do EmailJS para formulario de contato |
| `VITE_EMAILJS_PUBLIC_KEY` | Nao | Public key do EmailJS |

### CMS

Arquivo: [`apps/cms/.env.example`](./apps/cms/.env.example)

| Variavel | Obrigatoria | Uso |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Sim | URL publica do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave anon usada no front-end |
| `VITE_PUBLIC_SITE_URL` | Sim | URL do portfolio para o link "Ver portfolio" |
| `VITE_PUBLIC_POSTHOG_KEY` | Nao | Chave publica do PostHog |
| `VITE_PUBLIC_POSTHOG_HOST` | Nao | Host da instancia PostHog; se ausente, o app usa `https://us.i.posthog.com` |

## Rodando localmente

1. Instale as dependencias na raiz:

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

4. Rode o portfolio publico:

```bash
npm run dev:web
```

O web roda em `http://localhost:4173`.

5. Em outro terminal, rode o CMS:

```bash
npm run dev:cms
```

O CMS roda em `http://localhost:4174`.

## Supabase

### 1. Criar o projeto

No Supabase, copie:

- `Project URL`
- `anon` key
- `service_role` key

### 2. Aplicar a migracao SQL

Arquivo: [`supabase/migrations/0001_initial_schema.sql`](./supabase/migrations/0001_initial_schema.sql)

Opcao A, SQL Editor:

1. Abra o SQL Editor no Supabase.
2. Cole o conteudo do arquivo.
3. Execute o script.
4. Rode `NOTIFY pgrst, 'reload schema';` se quiser forcar refresh do schema cache.

Opcao B, Supabase CLI:

```bash
supabase db push
```

### 3. Tabelas de negocio

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

### 4. Buckets

A migracao cria automaticamente:

- `portfolio-public`
  - bucket publico para assets publicados do portfolio/blog
- `portfolio-private`
  - bucket privado para rascunhos, previews e midia restrita

### 5. Politicas e auth

- RLS esta habilitado em todas as tabelas de negocio.
- O portfolio publico le apenas `projects`, `blog_posts` e `pages` com `status = 'published'`.
- O CMS exige sessao autenticada do Supabase Auth.
- O front-end usa apenas `anon key`.
- `service_role` fica restrita a scripts root.

### 6. Criar usuario admin

O projeto atual trata qualquer usuario autenticado como editor do CMS.

1. Va em `Supabase Dashboard > Authentication > Users`.
2. Crie um usuario por email e senha.
3. Entre no CMS com essas credenciais.

### 7. Migrar os dados mockados antigos

Arquivo: [`scripts/seed-supabase.ts`](./scripts/seed-supabase.ts)

Depois de preencher o `.env` da raiz:

```bash
npm run seed:supabase
```

Esse script:

- le o dataset legacy reaproveitado de `packages/core`
- busca o estado atual no Supabase
- aplica upserts granulares por entidade
- popula o banco com o conteudo mockado original do export

## Build e validacao

```bash
npm run typecheck
npm run build
```

Saida dos builds:

- `dist/web`
- `dist/cms`

## Deploy no Render

Arquivo: [`render.yaml`](./render.yaml)

O blueprint cria dois static sites:

- `portfolio-web`
  - dominio esperado: `example.com`
- `portfolio-cms`
  - dominio esperado: `admin.example.com`

### O que vai para o Render

`portfolio-web`

- tipo: `Static Site`
- build command: `npm ci && npm run build:web`
- publish directory: `dist/web`
- rewrite SPA: `/* -> /index.html`

`portfolio-cms`

- tipo: `Static Site`
- build command: `npm ci && npm run build:cms`
- publish directory: `dist/cms`
- rewrite SPA: `/* -> /index.html`
- `X-Robots-Tag: noindex, nofollow`

### Variaveis de producao

No `portfolio-web`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLIC_POSTHOG_KEY` se usar PostHog
- `VITE_PUBLIC_POSTHOG_HOST` se usar PostHog; se omitir, o app usa `https://us.i.posthog.com`
- `VITE_EMAILJS_SERVICE_ID` se usar formulario
- `VITE_EMAILJS_TEMPLATE_ID` se usar formulario
- `VITE_EMAILJS_PUBLIC_KEY` se usar formulario

No `portfolio-cms`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLIC_SITE_URL=https://example.com`
- `VITE_PUBLIC_POSTHOG_KEY` se usar PostHog
- `VITE_PUBLIC_POSTHOG_HOST` se usar PostHog; se omitir, o app usa `https://us.i.posthog.com`

Nunca configure `SUPABASE_SERVICE_ROLE_KEY` no Render para esses dois static sites.

## Keepalive opcional do Supabase

Se o projeto Supabase gratuito estiver pausando por inatividade, este repo inclui um keepalive simples via GitHub Actions:

- workflow: `.github/workflows/supabase-keepalive.yml`
- script: `scripts/supabase-keepalive.mjs`

Como funciona:

- a cada 12 horas, o GitHub Actions faz um `SELECT` leve em `site_settings`
- a chamada usa apenas a `anon key`
- se o projeto estiver acordado, o job retorna `200`

Secrets necessarios no GitHub:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Configuracao:

1. Abra `GitHub > Settings > Secrets and variables > Actions`.
2. Crie os secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
3. Va em `Actions` e rode manualmente o workflow `Supabase Keepalive` uma vez.

Observacao:

- isso e apenas best effort para gerar atividade periodica
- a forma garantida de evitar pause e usar um plano pago do Supabase

### Deploy por Blueprint

1. Garanta que o repositorio esta publicado no GitHub.
2. Ajuste `render.yaml` com os nomes e dominios reais antes do primeiro deploy:
   - troque `example.com`
   - troque `admin.example.com`
3. No Render, escolha `New +` > `Blueprint`.
4. Selecione o repositorio.
5. Revise os dois servicos criados.
6. Preencha as variaveis marcadas com `sync: false`.
7. Execute o deploy.

### Deploy manual no Dashboard

Se preferir nao usar Blueprint, crie dois `Static Site`.

`portfolio-web`

- branch: `main`
- root directory: deixe vazio
- build command: `npm ci && npm run build:web`
- publish directory: `dist/web`
- rewrite rule: `/*` para `/index.html`

`portfolio-cms`

- branch: `main`
- root directory: deixe vazio
- build command: `npm ci && npm run build:cms`
- publish directory: `dist/cms`
- rewrite rule: `/*` para `/index.html`

Depois, configure as mesmas variaveis de ambiente do blueprint.

## Dominio e DNS

### Dominio principal

1. Conecte `example.com` ao servico `portfolio-web`.
2. No Render, abra `Settings > Custom Domains`.
3. Adicione o dominio raiz.
4. Crie no seu provedor de DNS exatamente os registros que o Render mostrar para o apex/root domain.

Importante: o dominio raiz varia por provedor e por tipo de flattening/ALIAS/ANAME. Siga o target exibido no painel do Render, nao um valor generico copiado de outro projeto.

### Subdominio admin

1. Conecte `admin.example.com` ao servico `portfolio-cms`.
2. No Render, abra `Settings > Custom Domains`.
3. Adicione o subdominio.
4. No seu DNS, crie o `CNAME` apontando para o target fornecido pelo Render.

### `www`

Se voce quiser usar `www.example.com`, adicione esse host no servico do portfolio e deixe o Render configurar o redirecionamento canonico conforme a estrategia do seu dominio principal.

### SSL

O Render emite o certificado automaticamente depois que o DNS propaga.

## Checklist de validacao em producao

### Portfolio

- `https://example.com` abre sem rotas `/admin`
- refresh em rotas como `/blog`, `/projects` e paginas dinamicas funciona
- apenas conteudo `published` aparece
- imagens/videos publicos carregam do Supabase Storage
- formulario de contato funciona se EmailJS estiver configurado
- PostHog recebe eventos se as chaves estiverem configuradas

### CMS

- `https://admin.example.com` abre o login do CMS
- usuarios nao autenticados nao acessam rotas internas
- login e logout invalidam a sessao de verdade
- criar, editar, publicar e arquivar conteudo funciona
- upload de midia funciona com os buckets do Supabase
- o CMS abre apenas em desktop e fica `noindex`

## Resumo tecnico

### O que foi alterado

- separacao do SPA unico em `apps/web` e `apps/cms`
- extracao de UI compartilhada para `packages/ui`
- extracao de tipos, seeds e utilitarios para `packages/core`
- extracao da integracao Supabase para `packages/supabase`
- substituicao do login mock por Supabase Auth
- substituicao do upload base64/localStorage por Supabase Storage
- criacao de migracao SQL com RLS e buckets
- criacao de seed para migrar o conteudo mockado legado
- preparacao de blueprint e DNS para deploy no Render

### Decisoes arquiteturais

- `packages/ui` preserva o layout exportado do Figma Make sem redesenho
- `packages/core` evita drift de schema entre portfolio, CMS e scripts
- `packages/supabase` isola cliente, auth e repositorios para futura migracao a SSR
- `content_blocks` ficam em JSON estruturado para manter flexibilidade editorial
- `content_versions` salva snapshots para rollback simples

### Riscos remanescentes

- o bundle principal ainda esta grande e o Vite reporta chunks acima de 500 kB
- o CMS hoje diferencia apenas usuarios autenticados, nao papeis finos de autorizacao
- ainda existe conteudo do export original em `packages/ui/src/imports`, embora fora do fluxo principal

### Proximos passos recomendados

- adicionar code splitting por rota
- adicionar papeis de usuario se houver mais de um editor/admin
- criar testes automatizados para repositorios Supabase e fluxos principais do CMS
- adicionar observabilidade mais detalhada para os deploys e para o uso editorial
