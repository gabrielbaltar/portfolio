import { useEffect, useRef, useState } from "react";
import { useCMS, type CMSData, type ContentBlock } from "./cms-data";
import { useLanguage, type Language } from "./language-context";
import { translateBatch } from "./translation-service";

const translatedDataCache = new Map<string, CMSData>();
const prefetchPromises = new Map<string, Promise<CMSData>>();

function dataHash(data: CMSData): string {
  const parts = [
    data.projects.length,
    data.blogPosts.length,
    data.pages.length,
    data.experiences.length,
    data.education.length,
    data.certifications.length,
    data.stack.length,
    data.awards.length,
    data.recommendations.length,
    data.projects.map((item) => item.updatedAt || item.id).join(","),
    data.blogPosts.map((item) => item.updatedAt || item.id).join(","),
    data.pages.map((item) => item.updatedAt || item.id).join(","),
    data.profile.aboutParagraph1?.slice(0, 30) || "",
    data.siteSettings.siteDescription?.slice(0, 30) || "",
  ];

  return parts.join("|");
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

function collectBlockTexts(blocks: ContentBlock[] | undefined, basePath: string, addText: (path: string, text: string) => void) {
  blocks?.forEach((block, index) => {
    const blockPath = `${basePath}.${index}`;

    if ("text" in block && typeof block.text === "string") {
      addText(`${blockPath}.text`, block.text);
    }

    if ("items" in block && Array.isArray(block.items)) {
      block.items.forEach((item, itemIndex) => addText(`${blockPath}.items.${itemIndex}`, item));
    }

    if ("caption" in block && typeof block.caption === "string") {
      addText(`${blockPath}.caption`, block.caption);
    }

    if ("author" in block && typeof block.author === "string") {
      addText(`${blockPath}.author`, block.author);
    }

    if ("buttonText" in block && typeof block.buttonText === "string") {
      addText(`${blockPath}.buttonText`, block.buttonText);
    }
  });
}

async function translateCMSData(data: CMSData, targetLang: Language): Promise<CMSData> {
  if (targetLang === "pt") return data;

  const texts: string[] = [];
  const map: TranslationEntry[] = [];
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

  const siteSettingsFields: Array<keyof CMSData["siteSettings"]> = [
    "siteTitle",
    "siteDescription",
    "footerCredit",
    "footerCopyright",
    "seoTitle",
    "seoDescription",
  ];

  siteSettingsFields.forEach((field) => addText(`siteSettings.${field}`, data.siteSettings[field] as string));

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
    addText(`projects.${projectIndex}.subtitle`, project.subtitle);
    addText(`projects.${projectIndex}.category`, project.category);
    addText(`projects.${projectIndex}.services`, project.services);
    addText(`projects.${projectIndex}.description`, project.description);
    addText(`projects.${projectIndex}.seoTitle`, project.seoTitle);
    addText(`projects.${projectIndex}.seoDescription`, project.seoDescription);
    project.tags.forEach((tag, tagIndex) => addText(`projects.${projectIndex}.tags.${tagIndex}`, tag));
    collectBlockTexts(project.contentBlocks, `projects.${projectIndex}.contentBlocks`, addText);
  });

  data.blogPosts.forEach((post, postIndex) => {
    addText(`blogPosts.${postIndex}.title`, post.title);
    addText(`blogPosts.${postIndex}.subtitle`, post.subtitle || "");
    addText(`blogPosts.${postIndex}.description`, post.description);
    addText(`blogPosts.${postIndex}.content`, post.content);
    addText(`blogPosts.${postIndex}.category`, post.category || "");
    addText(`blogPosts.${postIndex}.services`, post.services || "");
    addText(`blogPosts.${postIndex}.seoTitle`, post.seoTitle);
    addText(`blogPosts.${postIndex}.seoDescription`, post.seoDescription);
    post.tags.forEach((tag, tagIndex) => addText(`blogPosts.${postIndex}.tags.${tagIndex}`, tag));
    collectBlockTexts(post.contentBlocks, `blogPosts.${postIndex}.contentBlocks`, addText);
  });

  data.pages.forEach((page, pageIndex) => {
    addText(`pages.${pageIndex}.title`, page.title);
    addText(`pages.${pageIndex}.description`, page.description);
    addText(`pages.${pageIndex}.seoTitle`, page.seoTitle);
    addText(`pages.${pageIndex}.seoDescription`, page.seoDescription);
    collectBlockTexts(page.contentBlocks, `pages.${pageIndex}.contentBlocks`, addText);
  });

  data.experiences.forEach((experience, experienceIndex) => {
    addText(`experiences.${experienceIndex}.role`, experience.role);
    addText(`experiences.${experienceIndex}.location`, experience.location);
    experience.tasks.forEach((task, taskIndex) => addText(`experiences.${experienceIndex}.tasks.${taskIndex}`, task));
  });

  data.education.forEach((education, educationIndex) => {
    addText(`education.${educationIndex}.degree`, education.degree);
    addText(`education.${educationIndex}.location`, education.location);
    addText(`education.${educationIndex}.description`, education.description);
  });

  data.certifications.forEach((certification, certificationIndex) => {
    addText(`certifications.${certificationIndex}.title`, certification.title);
  });

  data.stack.forEach((item, stackIndex) => {
    addText(`stack.${stackIndex}.description`, item.description);
  });

  data.awards.forEach((award, awardIndex) => {
    addText(`awards.${awardIndex}.title`, award.title);
  });

  data.recommendations.forEach((recommendation, recommendationIndex) => {
    addText(`recommendations.${recommendationIndex}.role`, recommendation.role);
    addText(`recommendations.${recommendationIndex}.quote`, recommendation.quote);
  });

  if (texts.length === 0) return data;

  const translatedTexts = await translateBatch(texts, "pt", targetLang);
  const translatedData = cloneData(data);

  map.forEach(({ path, index }) => {
    const translatedValue = translatedTexts[index];
    if (!translatedValue) return;
    setPathValue(translatedData as Record<string, any>, path, translatedValue);
  });

  return translatedData;
}

function startPrefetch(sourceData: CMSData, hash: string, targetLang: Language) {
  if (targetLang === "pt") return Promise.resolve(sourceData);

  const cacheKey = getCacheKey(hash, targetLang);

  if (translatedDataCache.has(cacheKey)) {
    return Promise.resolve(translatedDataCache.get(cacheKey)!);
  }

  if (prefetchPromises.has(cacheKey)) {
    return prefetchPromises.get(cacheKey)!;
  }

  const promise = translateCMSData(sourceData, targetLang)
    .then((result) => {
      translatedDataCache.set(cacheKey, result);
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
    if (lang === "pt") {
      setTranslatedData(data);
      setIsTranslating(false);
      return;
    }

    const translationId = ++translationRef.current;
    const cacheKey = getCacheKey(currentHash, lang);
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
    void startPrefetch(data, currentHash, "en");
  }, [data, currentHash]);

  return { data: lang === "pt" ? data : translatedData, isTranslating };
}
