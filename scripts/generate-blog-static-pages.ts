import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildArticleSeoData, trimTrailingSlash } from "@portfolio/core";
import { loadPublicCMSData } from "@portfolio/supabase";
import { createClient } from "@supabase/supabase-js";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function injectHead(template: string, headTags: string[]) {
  const withTitle = template.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${headTags[0]}</title>`,
  );

  return withTitle.replace(
    "</head>",
    `${headTags.slice(1).map((tag) => `    ${tag}`).join("\n")}\n  </head>`,
  );
}

async function main() {
  const distDir = path.join(process.cwd(), "dist", "web");
  const templatePath = path.join(distDir, "index.html");
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() || "";
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim() || "";
  const publicSiteUrl = trimTrailingSlash(process.env.VITE_PUBLIC_SITE_URL || "");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[generate-blog-static-pages] Skipping static article pages because Supabase public env vars are missing.");
    return;
  }

  const template = await readFile(templatePath, "utf8");
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const data = await loadPublicCMSData(client);
  const siteLocale = data.siteSettings.defaultLanguage === "en" ? "en-US" : "pt-BR";
  const posts = data.blogPosts.filter((post) => {
    const hasPassword = Boolean(post.password && post.password.trim() !== "");
    return (!post.status || post.status === "published") && !hasPassword;
  });

  if (!publicSiteUrl) {
    console.warn("[generate-blog-static-pages] VITE_PUBLIC_SITE_URL is not set. Generated OG URLs may stay relative.");
  }

  await Promise.all(
    posts.map(async (post) => {
      const articlePath = `/blog/${post.slug}`;
      const seo = buildArticleSeoData(post, data.siteSettings, {
        articleUrl: articlePath,
        siteUrl: publicSiteUrl,
        locale: siteLocale,
        fallbackTitle: data.profile.name || data.siteSettings.siteTitle || "Portfolio",
      });
      const headTags = [
        escapeHtml(seo.title),
        `<meta name="description" content="${escapeHtml(seo.description)}" />`,
        `<link rel="canonical" href="${escapeHtml(seo.url || articlePath)}" />`,
        `<meta property="og:type" content="article" />`,
        `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
        `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
        `<meta property="og:site_name" content="${escapeHtml(seo.siteName)}" />`,
        `<meta property="og:locale" content="${escapeHtml(seo.locale)}" />`,
        `<meta property="og:url" content="${escapeHtml(seo.url || articlePath)}" />`,
        `<meta name="twitter:card" content="${escapeHtml(seo.twitterCard)}" />`,
        `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
      ];

      if (seo.imageUrl) {
        headTags.push(
          `<meta property="og:image" content="${escapeHtml(seo.imageUrl)}" />`,
          `<meta property="og:image:alt" content="${escapeHtml(seo.title)}" />`,
          `<meta name="twitter:image" content="${escapeHtml(seo.imageUrl)}" />`,
          `<meta name="twitter:image:alt" content="${escapeHtml(seo.title)}" />`,
        );
      }

      const outputDir = path.join(distDir, "blog", post.slug);
      const outputPath = path.join(outputDir, "index.html");
      const html = injectHead(template, headTags);

      await mkdir(outputDir, { recursive: true });
      await writeFile(outputPath, html, "utf8");
    }),
  );

  console.log(`[generate-blog-static-pages] Generated ${posts.length} static article page(s).`);
}

main().catch((error) => {
  console.error("[generate-blog-static-pages] Failed to generate static article pages.", error);
  process.exit(1);
});
