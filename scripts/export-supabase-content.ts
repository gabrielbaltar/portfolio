import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSupabaseProvider } from "../packages/cms-repository/src/index.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function getEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const provider = createSupabaseProvider({
    url: getEnv("SUPABASE_URL"),
    key: process.env.SUPABASE_ANON_KEY?.trim() || getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    timeoutMs: Number(process.env.CMS_PROVIDER_TIMEOUT_MS || 15000),
  });
  const data = await provider.loadPublicCMSData();
  const snapshot = { cachedAt: Date.now(), data };

  writeJson(path.join(rootDir, "data", "fallback", "public-cms-snapshot.json"), snapshot);
  writeJson(path.join(rootDir, "packages", "core", "src", "recovered", "public-cms-snapshot.json"), snapshot);

  console.log(
    `Supabase export concluido: ${data.projects.length} projetos, ${data.blogPosts.length} artigos, ${data.pages.length} paginas.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
