import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createAdminSupabaseClient,
  loadCmsData,
  loadPublicCMSData,
} from "../packages/supabase/src/index.ts";

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
  const client = createAdminSupabaseClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));
  const cachedAt = Date.now();
  const [cmsData, publicData] = await Promise.all([loadCmsData(client), loadPublicCMSData(client)]);

  writeJson(path.join(rootDir, "recovered", "cms-snapshot.json"), {
    cachedAt,
    data: cmsData,
  });
  writeJson(path.join(rootDir, "recovered", "public-cms-snapshot.json"), {
    cachedAt,
    data: publicData,
  });
  writeJson(path.join(rootDir, "packages", "core", "src", "recovered", "public-cms-snapshot.json"), {
    cachedAt,
    data: publicData,
  });

  console.log(
    `Snapshots atualizados: ${publicData.projects.length} projetos publicos, ${publicData.blogPosts.length} artigos publicos.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
