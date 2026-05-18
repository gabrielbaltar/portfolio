import fs from "node:fs/promises";
import path from "node:path";

type QuotaMetric = {
  name: string;
  used: number;
  quota: number;
  ratio: number;
};

const threshold = Number(process.env.SUPABASE_QUOTA_GUARD_THRESHOLD || 0.8);
const outputPath = process.env.SUPABASE_QUOTA_GUARD_OUTPUT || "data/fallback/quota-guard.json";
const strict = process.env.SUPABASE_QUOTA_GUARD_STRICT === "true";

const metricEnvPairs = [
  ["egress", "SUPABASE_EGRESS_USED_GB", "SUPABASE_EGRESS_QUOTA_GB"],
  ["cachedEgress", "SUPABASE_CACHED_EGRESS_USED_GB", "SUPABASE_CACHED_EGRESS_QUOTA_GB"],
  ["storageSize", "SUPABASE_STORAGE_USED_GB", "SUPABASE_STORAGE_QUOTA_GB"],
  ["databaseSize", "SUPABASE_DATABASE_USED_GB", "SUPABASE_DATABASE_QUOTA_GB"],
] as const;

function numberFromEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function collectMetrics() {
  return metricEnvPairs.flatMap(([name, usedEnv, quotaEnv]) => {
    const used = numberFromEnv(usedEnv);
    const quota = numberFromEnv(quotaEnv);
    if (used == null || quota == null || quota <= 0) return [];
    return [{ name, used, quota, ratio: used / quota }];
  });
}

async function main() {
  const metrics = collectMetrics();
  const exceeded = metrics.filter((metric) => metric.ratio >= threshold);
  const protectedMode = exceeded.length > 0;
  const report = {
    generatedAt: new Date().toISOString(),
    threshold,
    protectedMode,
    metrics,
    recommendedFrontendEnv: protectedMode
      ? {
          VITE_PUBLIC_DATA_SOURCE: "repository",
          VITE_SUPABASE_MEDIA_MODE: "placeholder",
        }
      : {
          VITE_PUBLIC_DATA_SOURCE: "repository",
          VITE_SUPABASE_MEDIA_MODE: "lazy",
        },
    recommendedBackendEnv: {
      CMS_PROVIDER_TIMEOUT_MS: "3000",
    },
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  if (metrics.length === 0) {
    console.warn("[supabase-quota-guard] Nenhuma metrica configurada. Defina *_USED_GB e *_QUOTA_GB para ativar o guard.");
    return;
  }

  for (const metric of metrics) {
    console.log(
      `[supabase-quota-guard] ${metric.name}: ${(metric.ratio * 100).toFixed(1)}% (${metric.used}/${metric.quota} GB)`,
    );
  }

  if (protectedMode) {
    console.warn(
      `[supabase-quota-guard] Modo economico recomendado: ${exceeded.map((metric) => metric.name).join(", ")} >= ${Math.round(threshold * 100)}%.`,
    );
    if (strict) process.exitCode = 20;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
