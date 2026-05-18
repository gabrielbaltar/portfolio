import fs from "node:fs/promises";
import path from "node:path";
import { normalizeCMSData, type CMSData } from "@portfolio/core";
import type { CMSProvider } from "./types";

export interface StaticProviderOptions {
  snapshotPath: string;
}

type SnapshotFile = {
  cachedAt?: number;
  data?: CMSData;
};

export function createStaticProvider({ snapshotPath }: StaticProviderOptions): CMSProvider {
  return {
    name: "static",
    async loadPublicCMSData() {
      const absolutePath = path.resolve(snapshotPath);
      const parsed = JSON.parse(await fs.readFile(absolutePath, "utf8")) as SnapshotFile | CMSData;
      const data = "data" in parsed && parsed.data ? parsed.data : parsed;
      return normalizeCMSData(data as CMSData);
    },
  };
}
