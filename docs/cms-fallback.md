# CMS Fallback

O portfolio publico pode carregar conteudo por uma camada chamada CMS Repository.

Ordem de leitura:

1. Supabase
2. Turso
3. JSON local em `data/fallback/public-cms-snapshot.json`

Cada provider tem timeout padrao de 3 segundos. Quando um provider falha, o repository registra um log simples e tenta o proximo.

## Arquitetura

- `packages/cms-repository/src/repository.ts`: orquestra fallback automatico.
- `packages/cms-repository/src/supabase-provider.ts`: le o snapshot publico no Supabase.
- `packages/cms-repository/src/turso-provider.ts`: le `cms_content` no Turso.
- `packages/cms-repository/src/static-provider.ts`: le o JSON local final.
- `apps/api/src/server.ts`: expoe `GET /api/cms/public` sem vazar tokens.
- `packages/cms-repository/src/media.ts`: coleta e reescreve URLs de midia para o espelho estatico.
- `packages/ui/src/app/components/data-provider.ts`: no modo `repository`, o frontend chama a API publica e cai no snapshot embutido se a API falhar.
- `apps/web/public/cms-assets`: espelho estatico de imagens/videos publicos do CMS.

## Variaveis

Backend/API:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY tambem funciona no backend, mas nunca deve ir para Vite.
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token
CMS_PROVIDER_TIMEOUT_MS=3000
CMS_API_ALLOW_ORIGIN=https://your-public-domain.com
CMS_MEDIA_MANIFEST_PATH=data/fallback/media-manifest.json
CMS_PUBLIC_ASSET_BASE_URL=https://your-public-domain.com/cms-assets
```

Frontend web:

```bash
VITE_PUBLIC_DATA_SOURCE=repository
VITE_CMS_REPOSITORY_URL=https://your-api-domain.com/api/cms/public
VITE_SUPABASE_MEDIA_MODE=placeholder
```

Nao configure `TURSO_AUTH_TOKEN` ou `SUPABASE_SERVICE_ROLE_KEY` em `apps/web/.env`, `apps/cms/.env` ou qualquer variavel `VITE_*`.

## Midia

Para o portfolio publico, imagens e videos devem ser servidos pelo deploy estatico, nao pelo Supabase Storage.

Depois de exportar o snapshot publico, rode:

```bash
npm run cms:mirror-media
```

Esse script:

- encontra URLs de midia em perfil, projetos, artigos, paginas, galeria, cards e biblioteca de midia;
- baixa arquivos do Supabase Storage para `apps/web/public/cms-assets`;
- grava `data/fallback/media-manifest.json`;
- reescreve o snapshot local para apontar para `/cms-assets/...`.

Por padrao, apenas URLs do Supabase Storage sao espelhadas. Para tambem copiar midias externas, rode com `CMS_MIRROR_EXTERNAL_MEDIA=true`.

Em producao, mantenha `VITE_SUPABASE_MEDIA_MODE=placeholder`. Assim, se alguma URL do Supabase escapar sem espelho local, ela e bloqueada no frontend em vez de consumir egress do Supabase.

## Turso

Crie a tabela:

```bash
turso db shell your-db < scripts/turso-schema.sql
```

Exporte o conteudo publico do Supabase para JSON local:

```bash
npm run cms:export-supabase
```

Importe esse snapshot para o Turso:

```bash
npm run cms:import-turso
```

O import grava uma linha `snapshot/public` para leitura rapida e tambem linhas por tipo (`project`, `article`, `page`, `profile`, `site_settings`) para consultas futuras.

## Protecao de quota

O Supabase Free tem cotas separadas de egress cached/uncached e o egress e unificado entre Database, Auth, Storage, Edge Functions e outros servicos. O app reduz o consumo por padrao porque o site publico usa `repository`, Turso/JSON e midia estatica.

Para automatizar alerta/guard com o limite de 80%, preencha as metricas no ambiente de CI ou cron e rode:

```bash
SUPABASE_EGRESS_USED_GB=4 \
SUPABASE_EGRESS_QUOTA_GB=5 \
SUPABASE_CACHED_EGRESS_USED_GB=4 \
SUPABASE_CACHED_EGRESS_QUOTA_GB=5 \
npm run supabase:quota-guard
```

O script grava `data/fallback/quota-guard.json` com a recomendacao operacional. Com `SUPABASE_QUOTA_GUARD_STRICT=true`, ele retorna codigo de falha quando qualquer metrica configurada passa do threshold.

## Rodando localmente

Em um terminal:

```bash
npm run dev:api
```

Em outro:

```bash
VITE_PUBLIC_DATA_SOURCE=repository VITE_CMS_REPOSITORY_URL=http://localhost:8787/api/cms/public npm run dev:web
```

## Chamadas diretas ao Supabase

Leitura publica do portfolio deve passar pelo CMS Repository.

Ainda existem usos diretos de Supabase em scripts administrativos e no CMS autenticado para escrita, auth, upload e versionamento:

- `packages/supabase/src/*`: adaptador Supabase centralizado.
- `packages/ui/src/app/components/data-provider.ts`: usa Supabase apenas para o modo CMS/autenticado e para modo publico `supabase` explicito.
- `scripts/seed-supabase.ts`, `scripts/fix-cms-copy.ts`, `scripts/restore-recovered-snapshot.ts`, `scripts/update-recovered-snapshots.ts`: scripts administrativos.

## Modo de emergencia

Se o Storage do Supabase estiver perto da cota, publique o web com:

```bash
VITE_SUPABASE_MEDIA_MODE=placeholder
```

Isso troca imagens/videos do Supabase Storage por placeholders no frontend publico e reduz cached egress.
