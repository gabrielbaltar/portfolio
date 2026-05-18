import path from "node:path";
import fs from "node:fs";
import { rewriteCMSMediaUrls, type MediaManifest } from "./media";
import { createStaticProvider } from "./static-provider";
import { createSupabaseProvider } from "./supabase-provider";
import { createTursoProvider } from "./turso-provider";
import type { CMSProvider, CMSRepository, CMSRepositoryLogger, CMSRepositoryResult } from "./types";

export interface CMSRepositoryOptions {
  providers: CMSProvider[];
  timeoutMs?: number;
  logger?: CMSRepositoryLogger;
  mediaManifest?: MediaManifest | null;
  mediaAssetBaseUrl?: string;
}

export interface DefaultCMSRepositoryOptions {
  fallbackJsonPath?: string;
  mediaManifestPath?: string;
  mediaAssetBaseUrl?: string;
  logger?: CMSRepositoryLogger;
  timeoutMs?: number;
}

const defaultLogger: CMSRepositoryLogger = {
  info: (message) => console.info(message),
  warn: (message) => console.warn(message),
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export function createCMSRepository({
  providers,
  timeoutMs = 3000,
  logger = defaultLogger,
  mediaManifest = null,
  mediaAssetBaseUrl,
}: CMSRepositoryOptions): CMSRepository {
  return {
    async loadPublicCMSData(): Promise<CMSRepositoryResult> {
      let lastError: unknown = null;

      for (const provider of providers) {
        try {
          const loaded = await withTimeout(provider.loadPublicCMSData(), timeoutMs, provider.name);
          const data = mediaManifest
            ? rewriteCMSMediaUrls(loaded, mediaManifest, { assetBaseUrl: mediaAssetBaseUrl })
            : loaded;
          logger.info(`[cms-repository] provider used: ${provider.name}`);
          return { provider: provider.name, data };
        } catch (error) {
          lastError = error;
          const message = error instanceof Error ? error.message : String(error);
          logger.warn(`[cms-repository] provider failed: ${provider.name} - ${message}`);
        }
      }

      throw lastError instanceof Error ? lastError : new Error("All CMS providers failed.");
    },
  };
}

function getOptionalEnv(name: string) {
  return process.env[name]?.trim() || "";
}

function readMediaManifest(manifestPath: string, logger: CMSRepositoryLogger) {
  if (!fs.existsSync(manifestPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as MediaManifest;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`[cms-repository] media manifest ignored: ${message}`);
    return null;
  }
}

export function createDefaultCMSRepository(options: DefaultCMSRepositoryOptions = {}) {
  const providers: CMSProvider[] = [];
  const logger = options.logger ?? defaultLogger;
  const supabaseUrl = getOptionalEnv("SUPABASE_URL") || getOptionalEnv("VITE_SUPABASE_URL");
  const supabaseKey =
    getOptionalEnv("SUPABASE_ANON_KEY") ||
    getOptionalEnv("VITE_SUPABASE_ANON_KEY") ||
    getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");
  const tursoUrl = getOptionalEnv("TURSO_DATABASE_URL");
  const tursoAuthToken = getOptionalEnv("TURSO_AUTH_TOKEN");
  const fallbackJsonPath =
    options.fallbackJsonPath ||
    getOptionalEnv("CMS_FALLBACK_JSON_PATH") ||
    path.resolve(process.cwd(), "data/fallback/public-cms-snapshot.json");
  const mediaManifestPath =
    options.mediaManifestPath ||
    getOptionalEnv("CMS_MEDIA_MANIFEST_PATH") ||
    path.resolve(process.cwd(), "data/fallback/media-manifest.json");
  const mediaAssetBaseUrl = options.mediaAssetBaseUrl || getOptionalEnv("CMS_PUBLIC_ASSET_BASE_URL") || undefined;
  const mediaManifest = readMediaManifest(mediaManifestPath, logger);

  if (supabaseUrl && supabaseKey) {
    providers.push(createSupabaseProvider({ url: supabaseUrl, key: supabaseKey, timeoutMs: options.timeoutMs ?? 3000 }));
  }

  if (tursoUrl) {
    providers.push(createTursoProvider({ url: tursoUrl, authToken: tursoAuthToken || undefined }));
  }

  providers.push(createStaticProvider({ snapshotPath: fallbackJsonPath }));

  return createCMSRepository({
    providers,
    timeoutMs: options.timeoutMs,
    logger,
    mediaManifest,
    mediaAssetBaseUrl,
  });
}
