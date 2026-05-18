import { createTimedBrowserSupabaseClient, loadPublicCMSData } from "@portfolio/supabase";
import type { CMSProvider } from "./types";

export interface SupabaseProviderOptions {
  url: string;
  key: string;
  timeoutMs?: number;
}

export function createSupabaseProvider({ url, key, timeoutMs = 3000 }: SupabaseProviderOptions): CMSProvider {
  const client = createTimedBrowserSupabaseClient(url, key, timeoutMs);

  return {
    name: "supabase",
    loadPublicCMSData() {
      return loadPublicCMSData(client);
    },
  };
}
