import { useEffect, useRef, useState } from "react";
import { useCMS, type CMSData, type ContentBlock } from "./cms-data";
import { useLanguage, type Language } from "./language-context";
import { translateBatchToLanguage } from "./translation-service";
import {
  applyRichTextTranslation,
  collectRichTextTranslation,
  type RichTextTranslationEntry,
} from "./rich-text-translation";
import { richTextToPlainText } from "./rich-text";

const translatedDataCache = new Map<string, CMSData>();
const prefetchPromises = new Map<string, Promise<CMSData>>();
const TRANSLATED_DATA_CACHE_KEY = "portfolio_translated_cms_cache_v5";
const LEGACY_TRANSLATED_DATA_CACHE_KEYS = ["portfolio_translated_cms_cache_v4"];
let translatedCacheHydrated = false;

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function dataHash(data: CMSData): string {
  const { media: _media, ...translationRelevant } = data;
  return hashString(JSON.stringify(translationRelevant));
}

function getCacheKey(hash: string, lang: Language) {
  return `${lang}:${hash}`;
}

function cloneData<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

type TranslationEntry = {
  path: string;
  index: number;
};

type RichTranslationEntry = {
  path: string;
  entry: RichTextTranslationEntry;
};

function hydrateTranslatedCache() {
  if (translatedCacheHydrated || typeof window === "undefined") return;
  translatedCacheHydrated = true;

  try {
    LEGACY_TRANSLATED_DATA_CACHE_KEYS.forEach((key) => localStorage.removeItem(key));
    const raw = localStorage.getItem(TRANSLATED_DATA_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, CMSData>;
    Object.entries(parsed).forEach(([key, value]) => {
      translatedDataCache.set(key, value);
    });
  } catch {
    translatedDataCache.clear();
  }
}

function persistTranslatedCache() {
  if (typeof window === "undefined") return;

  try {
    const snapshot = Object.fromEntries(Array.from(translatedDataCache.entries()).slice(-8));
    localStorage.setItem(TRANSLATED_DATA_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage failures.
  }
}

function setPathValue(target: Record<string, any>, path: string, value: string) {
  const segments = path.split(".");
  let current: any = target;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    const next = /^\d+$/.test(segment) ? Number(segment) : segment;
    current = current[next];
    if (current == null) return;
  }

  const last = segments[segments.length - 1];
  const key = /^\d+$/.test(last) ? Number(last) : last;
  current[key] = value;
}

function collectBlockTexts(
  blocks: ContentBlock[] | undefined,
  basePath: string,
  addText: (path: string, text: string) => void,
  addRichText: (path: string, text: string) => void,
) {
  blocks?.forEach((block, index) => {
    const blockPath = `${basePath}.${index}`;

    if (block.type === "style-guide") {
      addRichText(`${blockPath}.title`, block.title);
      addRichText(`${blockPath}.summary`, block.summary);
      block.principles.forEach((principle, principleIndex) => {
        addText(`${blockPath}.principles.${principleIndex}.title`, principle.title);
        addText(`${blockPath}.principles.${principleIndex}.description`, principle.description);
      });
      return;
    }

    if (block.type === "color-palette") {
      addRichText(`${blockPath}.title`, block.title);
      block.colors.forEach((color, colorIndex) => {
        addText(`${blockPath}.colors.${colorIndex}.name`, color.name);
        addText(`${blockPath}.colors.${colorIndex}.role`, color.role);
        addText(`${blockPath}.colors.${colorIndex}.usage`, color.usage);
      });
      return;
    }

    if (block.type === "typography") {
      addRichText(`${blockPath}.title`, block.title);
      block.fonts.forEach((font, fontIndex) => {
        addText(`${blockPath}.fonts.${fontIndex}.label`, font.label);
        addRichText(`${blockPath}.fonts.${fontIndex}.sample`, font.sample);
      });
      return;
    }

    if (block.type === "icon-grid") {
      addRichText(`${blockPath}.title`, block.title);
      block.icons.forEach((icon, iconIndex) => {
        addText(`${blockPath}.icons.${iconIndex}.name`, icon.name);
        addText(`${blockPath}.icons.${iconIndex}.notes`, icon.notes);
      });
      return;
    }

    if (block.type === "user-flow") {
      addRichText(`${blockPath}.title`, block.title);
      block.steps.forEach((step, stepIndex) => {
        addText(`${blockPath}.steps.${stepIndex}.title`, step.title);
        addText(`${blockPath}.steps.${stepIndex}.description`, step.description);
        addText(`${blockPath}.steps.${stepIndex}.outcome`, step.outcome);
      });
      return;
    }

    if (block.type === "sitemap") {
      addRichText(`${blockPath}.title`, block.title);
      block.sections.forEach((section, sectionIndex) => {
        addText(`${blockPath}.sections.${sectionIndex}.title`, section.title);
        addText(`${blockPath}.sections.${sectionIndex}.description`, section.description);
        section.children.forEach((child, childIndex) => addText(`${blockPath}.sections.${sectionIndex}.children.${childIndex}`, child));
      });
      return;
    }

    if (block.type === "code") {
      if (typeof block.caption === "string") {
        addRichText(`${blockPath}.caption`, block.caption);
      }
      return;
    }

    if ("text" in block && typeof block.text === "string") {
      addRichText(`${blockPath}.text`, block.text);
    }

    if ("items" in block && Array.isArray(block.items)) {
      block.items.forEach((item, itemIndex) => addRichText(`${blockPath}.items.${itemIndex}`, item));
    }

    if ("caption" in block && typeof block.caption === "string") {
      addRichText(`${blockPath}.caption`, block.caption);
    }

    if ("author" in block && typeof block.author === "string") {
      addText(`${blockPath}.author`, block.author);
    }

    if ("buttonText" in block && typeof block.buttonText === "string") {
      addRichText(`${blockPath}.buttonText`, block.buttonText);
    }
  });
}

async function translateCMSData(data: CMSData, targetLang: Language): Promise<CMSData> {
  const texts: string[] = [];
  const map: TranslationEntry[] = [];
  const richEntries: RichTranslationEntry[] = [];
  const textIndex = new Map<string, number>();

  const addText = (path: string, text: string) => {
    const normalized = text.trim();
    if (!normalized) return;

    let index = textIndex.get(normalized);
    if (index === undefined) {
      index = texts.length;
      texts.push(normalized);
      textIndex.set(normalized, index);
    }

    map.push({ path, index });
  };

  const addTextValue = (text: string) => {
    const normalized = text.trim();
    if (!normalized) return -1;

    let index = textIndex.get(normalized);
    if (index === undefined) {
      index = texts.length;
      texts.push(normalized);
      textIndex.set(normalized, index);
    }

    return index;
  };

  const addRichText = (path: string, value: string) => {
    const entry = collectRichTextTranslation(value, addTextValue);
    if (!entry) {
      addText(path, richTextToPlainText(value));
      return;
    }
    richEntries.push({ path, entry });
  };

  const siteSettingsFields: Array<keyof CMSData["siteSettings"]> = [
    "siteTitle",
    "siteDescription",
    "footerCredit",
    "footerCopyright",
    "seoTitle",
    "seoDescription",
  ];

  siteSettingsFields.forEach((field) => addText(`siteSettings.${field}`, data.siteSettings[field] as string));
  Object.entries(data.siteSettings.projectCardOverrides || {}).forEach(([projectId, override]) => {
    addText(`siteSettings.projectCardOverrides.${projectId}.title`, override.title || "");
    addText(`siteSettings.projectCardOverrides.${projectId}.subtitle`, override.subtitle || "");
  });

  const profileFields: Array<keyof CMSData["profile"]> = [
    "role",
    "location",
    "availableText",
    "aboutTitle",
    "aboutParagraph1",
    "aboutParagraph2",
    "currentJobTitle",
  ];

  profileFields.forEach((field) => addText(`profile.${field}`, data.profile[field] as string));

  data.projects.forEach((project, projectIndex) => {
    addText(`projects.${projectIndex}.title`, project.title);
    addText(`projects.${projectIndex}.subtitle`, project.subtitle);
    addText(`projects.${projectIndex}.category`, project.category);
    addText(`projects.${projectIndex}.services`, project.services);
    addText(`projects.${projectIndex}.client`, project.client);
    addText(`projects.${projectIndex}.year`, project.year);
    addText(`projects.${projectIndex}.description`, project.description);
    addText(`projects.${projectIndex}.seoTitle`, project.seoTitle);
    addText(`projects.${projectIndex}.seoDescription`, project.seoDescription);
    project.tags.forEach((tag, tagIndex) => addText(`projects.${projectIndex}.tags.${tagIndex}`, tag));
    collectBlockTexts(project.contentBlocks, `projects.${projectIndex}.contentBlocks`, addText, addRichText);
  });

  data.blogPosts.forEach((post, postIndex) => {
    addText(`blogPosts.${postIndex}.title`, post.title);
    addText(`blogPosts.${postIndex}.subtitle`, post.subtitle || "");
    addText(`blogPosts.${postIndex}.publisher`, post.publisher);
    addText(`blogPosts.${postIndex}.date`, post.date);
    addText(`blogPosts.${postIndex}.description`, post.description);
    addText(`blogPosts.${postIndex}.content`, post.content);
    addText(`blogPosts.${postIndex}.category`, post.category || "");
    addText(`blogPosts.${postIndex}.services`, post.services || "");
    addText(`blogPosts.${postIndex}.author`, post.author);
    addText(`blogPosts.${postIndex}.readTime`, post.readTime);
    addText(`blogPosts.${postIndex}.seoTitle`, post.seoTitle);
    addText(`blogPosts.${postIndex}.seoDescription`, post.seoDescription);
    post.tags.forEach((tag, tagIndex) => addText(`blogPosts.${postIndex}.tags.${tagIndex}`, tag));
    collectBlockTexts(post.contentBlocks, `blogPosts.${postIndex}.contentBlocks`, addText, addRichText);
  });

  data.pages.forEach((page, pageIndex) => {
    addText(`pages.${pageIndex}.title`, page.title);
    addText(`pages.${pageIndex}.description`, page.description);
    addText(`pages.${pageIndex}.seoTitle`, page.seoTitle);
    addText(`pages.${pageIndex}.seoDescription`, page.seoDescription);
    collectBlockTexts(page.contentBlocks, `pages.${pageIndex}.contentBlocks`, addText, addRichText);
  });

  data.experiences.forEach((experience, experienceIndex) => {
    addText(`experiences.${experienceIndex}.company`, experience.company);
    addText(`experiences.${experienceIndex}.role`, experience.role);
    addText(`experiences.${experienceIndex}.location`, experience.location);
    addText(`experiences.${experienceIndex}.period`, experience.period);
    experience.tasks.forEach((task, taskIndex) => addText(`experiences.${experienceIndex}.tasks.${taskIndex}`, task));
  });

  data.education.forEach((education, educationIndex) => {
    addText(`education.${educationIndex}.degree`, education.degree);
    addText(`education.${educationIndex}.location`, education.location);
    addText(`education.${educationIndex}.period`, education.period);
    addText(`education.${educationIndex}.university`, education.university);
    addText(`education.${educationIndex}.description`, education.description);
  });

  data.certifications.forEach((certification, certificationIndex) => {
    addText(`certifications.${certificationIndex}.title`, certification.title);
    addText(`certifications.${certificationIndex}.issuer`, certification.issuer);
  });

  data.stack.forEach((item, stackIndex) => {
    addText(`stack.${stackIndex}.name`, item.name);
    addText(`stack.${stackIndex}.description`, item.description);
  });

  data.awards.forEach((award, awardIndex) => {
    addText(`awards.${awardIndex}.title`, award.title);
    addText(`awards.${awardIndex}.issuer`, award.issuer);
  });

  data.recommendations.forEach((recommendation, recommendationIndex) => {
    addText(`recommendations.${recommendationIndex}.name`, recommendation.name);
    addText(`recommendations.${recommendationIndex}.role`, recommendation.role);
    addText(`recommendations.${recommendationIndex}.quote`, recommendation.quote);
  });

  if (texts.length === 0) return data;

  const translatedTexts = await translateBatchToLanguage(texts, targetLang);
  const translatedData = cloneData(data);

  map.forEach(({ path, index }) => {
    const translatedValue = translatedTexts[index];
    if (!translatedValue) return;
    setPathValue(translatedData as Record<string, any>, path, translatedValue);
  });

  richEntries.forEach(({ path, entry }) => {
    const translatedValue = applyRichTextTranslation(
      entry,
      (index, original) => translatedTexts[index] || original,
    );
    setPathValue(translatedData as Record<string, any>, path, translatedValue);
  });

  return translatedData;
}

function startPrefetch(sourceData: CMSData, hash: string, targetLang: Language) {
  const cacheKey = getCacheKey(hash, targetLang);
  hydrateTranslatedCache();

  if (translatedDataCache.has(cacheKey)) {
    return Promise.resolve(translatedDataCache.get(cacheKey)!);
  }

  if (prefetchPromises.has(cacheKey)) {
    return prefetchPromises.get(cacheKey)!;
  }

  const promise = translateCMSData(sourceData, targetLang)
    .then((result) => {
      translatedDataCache.delete(cacheKey);
      translatedDataCache.set(cacheKey, result);
      persistTranslatedCache();
      prefetchPromises.delete(cacheKey);
      return result;
    })
    .catch(() => {
      prefetchPromises.delete(cacheKey);
      return sourceData;
    });

  prefetchPromises.set(cacheKey, promise);
  return promise;
}

export function useTranslatedCMS() {
  const { data } = useCMS();
  const { lang } = useLanguage();
  const [translatedData, setTranslatedData] = useState<CMSData>(data);
  const [isTranslating, setIsTranslating] = useState(false);
  const translationRef = useRef(0);
  const currentHash = dataHash(data);

  useEffect(() => {
    const translationId = ++translationRef.current;
    const cacheKey = getCacheKey(currentHash, lang);
    hydrateTranslatedCache();
    const cached = translatedDataCache.get(cacheKey);

    if (cached) {
      setTranslatedData(cached);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    void startPrefetch(data, currentHash, lang).then((result) => {
      if (translationRef.current !== translationId) return;
      setTranslatedData(result);
      setIsTranslating(false);
    });
  }, [lang, data, currentHash]);

  useEffect(() => {
    void startPrefetch(data, currentHash, "pt");
    void startPrefetch(data, currentHash, "en");
  }, [data, currentHash]);

  return { data: translatedData, isTranslating };
}
