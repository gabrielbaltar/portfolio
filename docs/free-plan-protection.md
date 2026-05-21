# Protecao do plano gratuito

Este projeto deve tratar Supabase como origem de administracao, nao como CDN publica.

## Padrao de producao

- `portfolio-web` usa `VITE_PUBLIC_DATA_SOURCE=static`.
- Imagens publicas devem ser espelhadas em `apps/web/public/cms-assets` antes do deploy.
- `portfolio-api` usa `CMS_REPOSITORY_PROVIDER_ORDER=static,turso,supabase`, para evitar chamadas ao Supabase quando o snapshot local esta disponivel.
- `VITE_SUPABASE_MEDIA_MODE=placeholder` bloqueia URLs diretas do Supabase Storage no site publico quando alguma URL escapou do mirror.

## Rotina antes de publicar conteudo novo

1. Exportar snapshot publico:

```bash
npm run cms:export-supabase
```

2. Espelhar midias do Storage para o build publico:

```bash
npm run cms:mirror-media
```

3. Auditar Storage sem apagar nada:

```bash
npm run cms:storage-audit
```

4. Se o relatorio em `data/fallback/supabase-storage-maintenance-report.json` estiver correto, aplicar limpeza:

```bash
npm run cms:storage-cleanup
```

## Regra de seguranca da limpeza

`cms:storage-cleanup` apaga apenas objetos que nao aparecem em nenhum conteudo do CMS e preserva objetos recentes por `SUPABASE_CLEANUP_MIN_AGE_DAYS` dias. O padrao e 7 dias para evitar apagar upload que ainda esta sendo editado.

## Quando o Supabase estiver bloqueado

Se o Storage retornar HTTP 402, nao da para recuperar arquivos que ainda nao foram espelhados sem esperar o ciclo do plano reiniciar ou reenviar os arquivos pelo CMS. Enquanto isso, o site publico continua funcionando com snapshot estatico e substitui midias diretas do Supabase por placeholder.
