import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeCMSData, type CMSData } from "../packages/core/src/index.ts";
import {
  createAdminSupabaseClient,
  loadCmsData,
  saveAwards,
  saveBlogPosts,
  saveCertifications,
  saveEducation,
  saveExperiences,
  savePages,
  saveProfile,
  saveProjects,
  savePublicCMSDataSnapshot,
  saveRecommendations,
  saveSiteSettings,
  saveStack,
} from "../packages/supabase/src/index.ts";
import { mapMediaToRow } from "../packages/supabase/src/mappers.ts";

type SnapshotFile = {
  cachedAt: number;
  data: CMSData;
};

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function getEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function readSnapshot() {
  const snapshotPath = path.join(rootDir, "recovered", "cms-snapshot.json");
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as SnapshotFile;
  return normalizeCMSData(snapshot.data);
}

async function syncMediaMetadata(client: ReturnType<typeof createAdminSupabaseClient>, data: CMSData) {
  if (data.media.length === 0) return;

  const { error } = await client.from("media").upsert(data.media.map(mapMediaToRow));
  if (error) {
    throw new Error(`Erro ao restaurar metadados de midia: ${error.message}`);
  }
}

async function main() {
  const client = createAdminSupabaseClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));
  const recovered = readSnapshot();
  const current = await loadCmsData(client);

  await saveSiteSettings(client, recovered.siteSettings);
  await saveProfile(client, recovered.profile);
  await Promise.all([
    saveProjects(client, current.projects, recovered.projects),
    saveBlogPosts(client, current.blogPosts, recovered.blogPosts),
    savePages(client, current.pages, recovered.pages),
    saveExperiences(client, current.experiences, recovered.experiences),
    saveEducation(client, current.education, recovered.education),
    saveCertifications(client, current.certifications, recovered.certifications),
    saveStack(client, current.stack, recovered.stack),
    saveAwards(client, current.awards, recovered.awards),
    saveRecommendations(client, current.recommendations, recovered.recommendations),
    syncMediaMetadata(client, recovered),
  ]);
  await savePublicCMSDataSnapshot(client, recovered);

  console.log(
    `Snapshot restaurado: ${recovered.projects.length} projetos, ${recovered.blogPosts.length} artigos, ${recovered.pages.length} paginas, ${recovered.media.length} midias.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
