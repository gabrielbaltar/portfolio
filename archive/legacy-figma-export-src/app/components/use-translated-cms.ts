import { useState, useEffect, useRef } from "react";
import { useCMS, type CMSData } from "./cms-data";
import { useLanguage } from "./language-context";
import { translateBatch } from "./translation-service";

// In-memory cache of the full EN-translated CMS data, keyed by a hash of the PT data.
// This survives across re-renders (but not page reloads — localStorage cache in
// translation-service.ts handles that layer).
let prefetchedEN: { hash: string; data: CMSData } | null = null;
let prefetchInProgress: Promise<CMSData> | null = null;

function dataHash(data: CMSData): string {
  // Quick hash based on updatedAt timestamps + counts to detect changes
  const parts = [
    data.projects.length,
    data.blogPosts.length,
    data.experiences.length,
    data.projects.map((p) => p.updatedAt || p.id).join(","),
    data.blogPosts.map((p) => p.updatedAt || p.id).join(","),
    data.profile.name,
    data.profile.aboutParagraph1?.slice(0, 30) || "",
  ];
  return parts.join("|");
}

export function useTranslatedCMS() {
  const { data } = useCMS();
  const { lang } = useLanguage();
  const [translatedData, setTranslatedData] = useState<CMSData>(data);
  const [isTranslating, setIsTranslating] = useState(false);
  const translationRef = useRef(0);
  const currentHash = dataHash(data);

  // Start prefetching EN translation on mount and whenever data changes
  useEffect(() => {
    // Use requestIdleCallback (or setTimeout fallback) to avoid blocking the main thread
    const schedule = typeof requestIdleCallback !== "undefined" ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 500);
    const id = schedule(() => {
      startPrefetch(data, currentHash);
    });
    return () => {
      if (typeof cancelIdleCallback !== "undefined" && typeof id === "number") {
        cancelIdleCallback(id);
      }
    };
  }, [data, currentHash]);

  useEffect(() => {
    if (lang === "pt") {
      setTranslatedData(data);
      setIsTranslating(false);
      return;
    }

    const translationId = ++translationRef.current;

    // Check if we already have the prefetched EN version
    if (prefetchedEN && prefetchedEN.hash === currentHash) {
      setTranslatedData(prefetchedEN.data);
      setIsTranslating(false);
      return;
    }

    // If prefetch is in progress, wait for it
    if (prefetchInProgress) {
      setIsTranslating(true);
      prefetchInProgress.then((result) => {
        if (translationRef.current === translationId) {
          setTranslatedData(result);
          setIsTranslating(false);
        }
      });
      return;
    }

    // No prefetch available — translate now (fallback)
    setIsTranslating(true);
    (async () => {
      try {
        const translated = await translateCMSData(data);
        prefetchedEN = { hash: currentHash, data: translated };
        if (translationRef.current === translationId) {
          setTranslatedData(translated);
          setIsTranslating(false);
        }
      } catch {
        if (translationRef.current === translationId) {
          setTranslatedData(data);
          setIsTranslating(false);
        }
      }
    })();
  }, [lang, data, currentHash]);

  return { data: translatedData, isTranslating };
}

async function startPrefetch(sourceData: CMSData, hash: string) {
  // Already have this version cached
  if (prefetchedEN && prefetchedEN.hash === hash) return prefetchedEN.data;
  // Already fetching this version
  if (prefetchInProgress) return prefetchInProgress;

  const promise = translateCMSData(sourceData).then((result) => {
    prefetchedEN = { hash, data: result };
    prefetchInProgress = null;
    return result;
  }).catch(() => {
    prefetchInProgress = null;
    return sourceData;
  });

  prefetchInProgress = promise;
  return promise;
}

async function translateCMSData(data: CMSData): Promise<CMSData> {
  const texts: string[] = [];
  const map: { path: string; index: number }[] = [];

  function addText(path: string, text: string) {
    if (text && text.trim().length > 0) {
      map.push({ path, index: texts.length });
      texts.push(text);
    }
  }

  // Profile - only translatable fields
  const profileFields = [
    "role",
    "location",
    "availableText",
    "aboutTitle",
    "aboutParagraph1",
    "aboutParagraph2",
    "currentJobTitle",
  ];
  for (const field of profileFields) {
    const value = (data.profile as Record<string, unknown>)[field];
    if (typeof value === "string") {
      addText(`profile.${field}`, value);
    }
  }

  // Projects
  data.projects.forEach((project, pi) => {
    addText(`projects.${pi}.category`, project.category);
    addText(`projects.${pi}.subtitle`, project.subtitle);
    addText(`projects.${pi}.services`, project.services);
    addText(`projects.${pi}.description`, project.description);
    project.contentBlocks?.forEach((block, bi) => {
      if ("text" in block && block.text) {
        addText(`projects.${pi}.blocks.${bi}.text`, block.text);
      }
      if ("items" in block) {
        block.items.forEach((item, ii) => {
          addText(`projects.${pi}.blocks.${bi}.items.${ii}`, item);
        });
      }
      if ("caption" in block && block.caption) {
        addText(`projects.${pi}.blocks.${bi}.caption`, block.caption);
      }
    });
  });

  // Experiences
  data.experiences.forEach((exp, ei) => {
    addText(`experiences.${ei}.role`, exp.role);
    addText(`experiences.${ei}.location`, exp.location);
    exp.tasks.forEach((task, ti) => {
      addText(`experiences.${ei}.tasks.${ti}`, task);
    });
  });

  // Education
  data.education.forEach((edu, ei) => {
    addText(`education.${ei}.degree`, edu.degree);
    addText(`education.${ei}.location`, edu.location);
    addText(`education.${ei}.description`, edu.description);
  });

  // Certifications
  data.certifications.forEach((cert, ci) => {
    addText(`certifications.${ci}.title`, cert.title);
  });

  // Stack
  data.stack.forEach((item, si) => {
    addText(`stack.${si}.description`, item.description);
  });

  // Awards
  data.awards.forEach((award, ai) => {
    addText(`awards.${ai}.title`, award.title);
  });

  // Recommendations
  data.recommendations.forEach((rec, ri) => {
    addText(`recommendations.${ri}.role`, rec.role);
    addText(`recommendations.${ri}.quote`, rec.quote);
  });

  // Blog posts
  data.blogPosts.forEach((post, bi) => {
    addText(`blogPosts.${bi}.title`, post.title);
    addText(`blogPosts.${bi}.description`, post.description);
    addText(`blogPosts.${bi}.content`, post.content);
    post.contentBlocks?.forEach((block, bki) => {
      if ("text" in block && block.text) {
        addText(`blogPosts.${bi}.blocks.${bki}.text`, block.text);
      }
      if ("items" in block) {
        block.items.forEach((item, ii) => {
          addText(`blogPosts.${bi}.blocks.${bki}.items.${ii}`, item);
        });
      }
      if ("caption" in block && block.caption) {
        addText(`blogPosts.${bi}.blocks.${bki}.caption`, block.caption);
      }
    });
  });

  if (texts.length === 0) return data;
  const translated = await translateBatch(texts, "pt", "en");

  const lookup: Record<string, string> = {};
  for (const { path, index } of map) {
    lookup[path] = translated[index];
  }

  const result: CMSData = JSON.parse(JSON.stringify(data));

  // Apply profile translations
  for (const field of profileFields) {
    const key = `profile.${field}`;
    if (lookup[key] !== undefined) {
      (result.profile as Record<string, unknown>)[field] = lookup[key];
    }
  }

  // Apply project translations
  result.projects.forEach((project, pi) => {
    if (lookup[`projects.${pi}.category`]) project.category = lookup[`projects.${pi}.category`];
    if (lookup[`projects.${pi}.subtitle`]) project.subtitle = lookup[`projects.${pi}.subtitle`];
    if (lookup[`projects.${pi}.services`]) project.services = lookup[`projects.${pi}.services`];
    if (lookup[`projects.${pi}.description`]) project.description = lookup[`projects.${pi}.description`];
    project.contentBlocks?.forEach((block, bi) => {
      if ("text" in block) {
        const key = `projects.${pi}.blocks.${bi}.text`;
        if (lookup[key]) (block as { text: string }).text = lookup[key];
      }
      if ("items" in block) {
        (block as { items: string[] }).items = (block as { items: string[] }).items.map(
          (_, ii) => lookup[`projects.${pi}.blocks.${bi}.items.${ii}`] || _
        );
      }
      if ("caption" in block) {
        const key = `projects.${pi}.blocks.${bi}.caption`;
        if (lookup[key]) (block as { caption: string }).caption = lookup[key];
      }
    });
  });

  // Apply experience translations
  result.experiences.forEach((exp, ei) => {
    if (lookup[`experiences.${ei}.role`]) exp.role = lookup[`experiences.${ei}.role`];
    if (lookup[`experiences.${ei}.location`]) exp.location = lookup[`experiences.${ei}.location`];
    exp.tasks = exp.tasks.map((task, ti) => lookup[`experiences.${ei}.tasks.${ti}`] || task);
  });

  // Apply education translations
  result.education.forEach((edu, ei) => {
    if (lookup[`education.${ei}.degree`]) edu.degree = lookup[`education.${ei}.degree`];
    if (lookup[`education.${ei}.location`]) edu.location = lookup[`education.${ei}.location`];
    if (lookup[`education.${ei}.description`]) edu.description = lookup[`education.${ei}.description`];
  });

  // Apply certification translations
  result.certifications.forEach((cert, ci) => {
    if (lookup[`certifications.${ci}.title`]) cert.title = lookup[`certifications.${ci}.title`];
  });

  // Apply stack translations
  result.stack.forEach((item, si) => {
    if (lookup[`stack.${si}.description`]) item.description = lookup[`stack.${si}.description`];
  });

  // Apply award translations
  result.awards.forEach((award, ai) => {
    if (lookup[`awards.${ai}.title`]) award.title = lookup[`awards.${ai}.title`];
  });

  // Apply recommendation translations
  result.recommendations.forEach((rec, ri) => {
    if (lookup[`recommendations.${ri}.role`]) rec.role = lookup[`recommendations.${ri}.role`];
    if (lookup[`recommendations.${ri}.quote`]) rec.quote = lookup[`recommendations.${ri}.quote`];
  });

  // Apply blog post translations
  result.blogPosts.forEach((post, bi) => {
    if (lookup[`blogPosts.${bi}.title`]) post.title = lookup[`blogPosts.${bi}.title`];
    if (lookup[`blogPosts.${bi}.description`]) post.description = lookup[`blogPosts.${bi}.description`];
    if (lookup[`blogPosts.${bi}.content`]) post.content = lookup[`blogPosts.${bi}.content`];
    post.contentBlocks?.forEach((block, bki) => {
      if ("text" in block) {
        const key = `blogPosts.${bi}.blocks.${bki}.text`;
        if (lookup[key]) (block as { text: string }).text = lookup[key];
      }
      if ("items" in block) {
        (block as { items: string[] }).items = (block as { items: string[] }).items.map(
          (_, ii) => lookup[`blogPosts.${bi}.blocks.${bki}.items.${ii}`] || _
        );
      }
      if ("caption" in block) {
        const key = `blogPosts.${bi}.blocks.${bki}.caption`;
        if (lookup[key]) (block as { caption: string }).caption = lookup[key];
      }
    });
  });

  return result;
}