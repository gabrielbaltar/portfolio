// Translation service with cached browser-side translation for dynamic CMS content.

export type TranslationLanguage = "pt" | "en";

const CACHE_KEY = "portfolio_translations_cache_v5";
const LEGACY_CACHE_KEYS = [
  "portfolio_translations_cache_v4",
  "portfolio_translations_cache_v3",
  "portfolio_translations_cache",
];
const GOOGLE_API_URL = "https://translate.googleapis.com/translate_a/single";
const MYMEMORY_API_URL = "https://api.mymemory.translated.net/get";
const MAX_REQUEST_CHARS = 420;
const TRANSLATE_CONCURRENCY = 8;

const inFlightTranslations = new Map<string, Promise<string>>();
let legacyCacheCleared = false;

const PORTUGUESE_HINTS = new Set([
  "de",
  "do",
  "da",
  "dos",
  "das",
  "que",
  "com",
  "para",
  "uma",
  "um",
  "mais",
  "como",
  "sobre",
  "projeto",
  "artigo",
  "disponivel",
  "disponível",
  "conteudo",
  "conteúdo",
  "experiencia",
  "experiência",
  "ferramentas",
  "gestao",
  "gestão",
  "usuario",
  "usuário",
  "paginas",
  "páginas",
  "trabalho",
]);

const ENGLISH_HINTS = new Set([
  "the",
  "and",
  "with",
  "from",
  "your",
  "this",
  "that",
  "about",
  "project",
  "article",
  "content",
  "available",
  "design",
  "website",
  "user",
  "pages",
  "settings",
  "case",
  "study",
  "work",
  "tools",
  "read",
  "view",
  "more",
]);

const EXACT_TRANSLATION_OVERRIDES: Record<string, Partial<Record<"pt" | "en", string>>> = {
  "Disponível para trabalho": { en: "Available for work" },
  "Disponivel para trabalho": { en: "Available for work" },
  "Sobre mim": { en: "About me" },
  "Sobre a Brandify": { en: "About Brandify" },
  "Sobre Brandify": { en: "About Brandify" },
  "Fluxo do usuário": { en: "User flow" },
  "Fluxo do usuario": { en: "User flow" },
  "Tipografia": { en: "Typography" },
  "Paleta de cores": { en: "Color palette" },
  "Iconografia": { en: "Iconography" },
  "Estudo de caso": { en: "Case study" },
  "Portal do Parceiro": { en: "Partner portal" },
  "Gerenciamento de Conteúdo": { en: "Content management" },
  "Gerenciamento de Conteudo": { en: "Content management" },
  "Configurações": { en: "Settings" },
  Configuracoes: { en: "Settings" },
  "Design de Interface": { en: "Interface design" },
  "Desenvolvimento Web": { en: "Web development" },
  "Product Design": { pt: "Design de produto" },
  "Agency Website": { pt: "Website institucional" },
  "AI Agency": { pt: "Agência de IA" },
};

type ProtectedTerm = {
  placeholder: string;
  value: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function restoreProtectedTerms(text: string, protectedTerms: ProtectedTerm[]) {
  return protectedTerms.reduce((result, term) => {
    return result.replace(new RegExp(escapeRegExp(term.placeholder), "g"), term.value);
  }, text);
}

function prepareProtectedTerms(text: string) {
  const protectedTerms: ProtectedTerm[] = [];
  let counter = 0;

  const makePlaceholder = (value: string) => {
    const placeholder = `__PORTFOLIO_KEEP_${counter}__`;
    counter += 1;
    protectedTerms.push({ placeholder, value: value.trim() });
    return placeholder;
  };

  let preparedText = text.replace(/-\[([^\]]+)\]/g, (_match, phrase: string) => {
    const normalized = phrase.trim();
    return normalized ? makePlaceholder(normalized) : phrase;
  });

  preparedText = preparedText.replace(/(^|[\s(])\-([A-Za-z0-9][A-Za-z0-9.+/#:_-]*)/g, (match, prefix: string, token: string) => {
    const normalized = token.trim();
    if (!normalized) return match;
    return `${prefix}${makePlaceholder(normalized)}`;
  });

  const displayText = restoreProtectedTerms(preparedText, protectedTerms);
  return {
    preparedText,
    displayText,
    protectedTerms,
  };
}

function getCache(): Record<string, string> {
  clearLegacyCache();
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

function setCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full — silently fail
  }
}

function clearLegacyCache() {
  if (legacyCacheCleared || typeof window === "undefined") return;
  legacyCacheCleared = true;

  try {
    LEGACY_CACHE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
}

function makeCacheKey(text: string, from: string, to: string): string {
  return `${from}>${to}:${text}`;
}

export function detectTextLanguage(
  text: string,
  fallback: TranslationLanguage = "pt",
): TranslationLanguage {
  const normalized = prepareProtectedTerms(text).displayText
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ");

  if (!normalized) return fallback;

  let portugueseScore = 0;
  let englishScore = 0;

  if (/[áàâãéêíóôõúç]/i.test(text)) portugueseScore += 4;
  if (/\b(?:ção|ções|mente|dade|agens?)\b/i.test(normalized)) portugueseScore += 2;
  if (/\b(?:ing|tion|ness|ment)\b/i.test(normalized)) englishScore += 1;
  if (/\b(?:you're|you're|we're|they're|don't|doesn't|isn't|it's|that's)\b/i.test(normalized)) englishScore += 3;

  const words = normalized.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (PORTUGUESE_HINTS.has(word)) portugueseScore += 1;
    if (ENGLISH_HINTS.has(word)) englishScore += 1;
  }

  if (portugueseScore === englishScore) {
    return fallback;
  }

  return portugueseScore > englishScore ? "pt" : "en";
}

function getTranslationOverride(text: string, _from: string, to: string) {
  const normalized = prepareProtectedTerms(text).displayText.trim();
  if (!normalized) return null;

  const exact = EXACT_TRANSLATION_OVERRIDES[normalized];
  if (exact && (to === "pt" || to === "en")) {
    const value = exact[to];
    if (value) return value;
  }

  return null;
}

function normalizeTranslatedText(
  original: string,
  translated: unknown,
  provider: "google" | "mymemory",
) {
  if (typeof translated !== "string") return null;

  let value = translated.trim();
  if (!value) return null;

  if (
    provider === "mymemory" &&
    /MYMEMORY WARNING|YOU USED ALL AVAILABLE FREE TRANSLATIONS/i.test(value)
  ) {
    return null;
  }

  if (
    original.length < 100 &&
    value === value.toUpperCase() &&
    original !== original.toUpperCase()
  ) {
    value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  return value;
}

function splitOversizedToken(token: string, maxChars: number) {
  if (token.length <= maxChars) return [token];

  const parts: string[] = [];
  let current = "";

  const words = token.split(/(\s+)/);
  for (const word of words) {
    if (word.length > maxChars) {
      if (current) {
        parts.push(current);
        current = "";
      }

      for (let index = 0; index < word.length; index += maxChars) {
        parts.push(word.slice(index, index + maxChars));
      }
      continue;
    }

    if ((current + word).length > maxChars && current) {
      parts.push(current);
      current = word;
      continue;
    }

    current += word;
  }

  if (current) {
    parts.push(current);
  }

  return parts.length > 0 ? parts : [token];
}

function splitTextIntoChunks(text: string, maxChars: number = MAX_REQUEST_CHARS) {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let current = "";
  const tokens = text.split(/(\n+|(?<=[.!?])\s+|,\s+|;\s+)/);

  for (const token of tokens) {
    if (!token) continue;

    if (token.length > maxChars) {
      const oversizedParts = splitOversizedToken(token, maxChars);
      oversizedParts.forEach((part) => {
        if ((current + part).length > maxChars && current) {
          chunks.push(current);
          current = "";
        }
        if (part.length > maxChars) {
          chunks.push(part);
        } else {
          current += part;
        }
      });
      continue;
    }

    if ((current + token).length > maxChars && current) {
      chunks.push(current);
      current = token;
      continue;
    }

    current += token;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [text];
}

async function translateSingle(
  text: string,
  from: string,
  to: string
): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  const protectedText = prepareProtectedTerms(text);
  const sourceText = protectedText.preparedText;
  const displayText = protectedText.displayText;

  const cache = getCache();
  const key = makeCacheKey(text, from, to);
  if (cache[key]) return cache[key];

  const override = getTranslationOverride(text, from, to);
  if (override) {
    cache[key] = override;
    setCache(cache);
    return override;
  }

  if (sourceText.length > MAX_REQUEST_CHARS) {
    const translatedChunks = await Promise.all(
      splitTextIntoChunks(sourceText).map((chunk) =>
        translateSingle(
          restoreProtectedTerms(chunk, protectedText.protectedTerms),
          from,
          to,
        ),
      ),
    );
    const combined = translatedChunks.join("");
    cache[key] = combined;
    setCache(cache);
    return combined;
  }

  if (inFlightTranslations.has(key)) {
    return inFlightTranslations.get(key)!;
  }

  const request = (async () => {
    const translated =
      (await translateWithGoogle(sourceText, from, to)) ??
      (await translateWithMyMemory(sourceText, from, to));

    if (translated == null) {
      return displayText;
    }

    const finalValue = restoreProtectedTerms(translated, protectedText.protectedTerms);

    const nextCache = getCache();
    nextCache[key] = finalValue;
    setCache(nextCache);
    return finalValue;
  })()
    .finally(() => {
      inFlightTranslations.delete(key);
    });

  inFlightTranslations.set(key, request);
  return request;
}

export async function translateBatch(
  texts: string[],
  from: string = "pt",
  to: string = "en"
): Promise<string[]> {
  if (from === to) return texts.map((text) => prepareProtectedTerms(text).displayText);

  const cache = getCache();
  const results: string[] = new Array(texts.length);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  // Check cache first
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text || text.trim().length === 0) {
      results[i] = text;
      continue;
    }

    const override = getTranslationOverride(text, from, to);
    if (override) {
      results[i] = override;
      cache[makeCacheKey(text, from, to)] = override;
      continue;
    }

    const key = makeCacheKey(text, from, to);
    if (cache[key]) {
      results[i] = cache[key];
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(text);
    }
  }

  if (uncachedTexts.length === 0) return results;

  for (let start = 0; start < uncachedTexts.length; start += TRANSLATE_CONCURRENCY) {
    const chunkTexts = uncachedTexts.slice(start, start + TRANSLATE_CONCURRENCY);
    const chunkIndices = uncachedIndices.slice(start, start + TRANSLATE_CONCURRENCY);
    const translatedChunk = await Promise.all(
      chunkTexts.map((text) => translateSingle(text, from, to)),
    );

    translatedChunk.forEach((translated, offset) => {
      results[chunkIndices[offset]] = translated;
    });

    if (start + TRANSLATE_CONCURRENCY < uncachedTexts.length) {
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }

  return results;
}

export async function translateBatchToLanguage(
  texts: string[],
  targetLang: TranslationLanguage,
): Promise<string[]> {
  if (texts.length === 0) return texts;

  const fallbackSource: TranslationLanguage = targetLang === "en" ? "pt" : "en";
  const results: string[] = new Array(texts.length);
  const groups: Record<TranslationLanguage, { indices: number[]; texts: string[] }> = {
    pt: { indices: [], texts: [] },
    en: { indices: [], texts: [] },
  };

  texts.forEach((text, index) => {
    const normalized = text?.trim();
    if (!normalized) {
      results[index] = text;
      return;
    }

    const sourceLang = detectTextLanguage(normalized, fallbackSource);
    if (sourceLang === targetLang) {
      results[index] = prepareProtectedTerms(text).displayText;
      return;
    }

    groups[sourceLang].indices.push(index);
    groups[sourceLang].texts.push(text);
  });

  const translations = await Promise.all(
    (Object.entries(groups) as Array<[TranslationLanguage, { indices: number[]; texts: string[] }]>)
      .filter(([, group]) => group.texts.length > 0)
      .map(async ([sourceLang, group]) => {
        const translated = await translateBatch(group.texts, sourceLang, targetLang);
        return { indices: group.indices, translated };
      }),
  );

  translations.forEach(({ indices, translated }) => {
    indices.forEach((index, itemIndex) => {
      results[index] = translated[itemIndex];
    });
  });

  return results.map((value, index) => value ?? texts[index]);
}

// Translate a single text (convenience)
export async function translateText(
  text: string,
  from: string = "pt",
  to: string = "en"
): Promise<string> {
  const [result] = await translateBatch([text], from, to);
  return result;
}

// Clear translation cache
export function clearTranslationCache() {
  clearLegacyCache();
  localStorage.removeItem(CACHE_KEY);
}

async function translateWithGoogle(text: string, from: string, to: string) {
  try {
    const url =
      `${GOOGLE_API_URL}?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}` +
      `&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const payload = await response.json();
    const translated = Array.isArray(payload?.[0])
      ? payload[0]
          .map((segment: unknown) => (
            Array.isArray(segment) && typeof segment[0] === "string" ? segment[0] : ""
          ))
          .join("")
      : null;

    return normalizeTranslatedText(text, translated, "google");
  } catch {
    return null;
  }
}

async function translateWithMyMemory(text: string, from: string, to: string) {
  try {
    const url = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const response = await fetch(url);
    const payload = await response.json();

    if (payload?.responseStatus && payload.responseStatus >= 400) {
      return null;
    }

    return normalizeTranslatedText(text, payload?.responseData?.translatedText, "mymemory");
  } catch {
    return null;
  }
}
