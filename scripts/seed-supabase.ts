import { legacySeedData } from "../packages/core/src/index.ts";
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
  saveRecommendations,
  saveSiteSettings,
  saveStack,
} from "../packages/supabase/src/index.ts";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variavel obrigatoria ausente: ${name}`);
  }
  return value;
}

function isMissingTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Could not find the table") ||
    message.includes("relation") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

async function main() {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const client = createAdminSupabaseClient(supabaseUrl, serviceRoleKey);
  let current;

  try {
    current = await loadCmsData(client);
  } catch (error) {
    if (isMissingTableError(error)) {
      throw new Error(
        "O schema do Supabase ainda nao esta completo. Aplique a migration supabase/migrations/0001_initial_schema.sql no projeto correto e tente novamente.",
      );
    }
    throw error;
  }

  await saveSiteSettings(client, legacySeedData.siteSettings);
  await saveProfile(client, legacySeedData.profile);

  await Promise.all([
    saveProjects(client, current.projects, legacySeedData.projects),
    saveBlogPosts(client, current.blogPosts, legacySeedData.blogPosts),
    savePages(client, current.pages, legacySeedData.pages),
    saveExperiences(client, current.experiences, legacySeedData.experiences),
    saveEducation(client, current.education, legacySeedData.education),
    saveCertifications(client, current.certifications, legacySeedData.certifications),
    saveStack(client, current.stack, legacySeedData.stack),
    saveAwards(client, current.awards, legacySeedData.awards),
    saveRecommendations(client, current.recommendations, legacySeedData.recommendations),
  ]);

  console.log("Seed concluido com sucesso.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
