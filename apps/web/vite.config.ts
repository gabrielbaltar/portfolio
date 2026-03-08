import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function figmaAssetResolver() {
  return {
    name: "figma-asset-resolver",
    resolveId(source: string) {
      if (!source.startsWith("figma:asset/")) return null;
      const assetFile = source.slice("figma:asset/".length);
      return path.resolve(__dirname, "../../packages/ui/src/assets", assetFile);
    },
  };
}

export default defineConfig({
  root: __dirname,
  plugins: [figmaAssetResolver(), react(), tailwindcss()],
  server: {
    port: 4173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@portfolio/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@portfolio/core": path.resolve(__dirname, "../../packages/core/src"),
      "@portfolio/supabase": path.resolve(__dirname, "../../packages/supabase/src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../../dist/web"),
    emptyOutDir: true,
  },
});
