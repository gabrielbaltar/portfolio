// Translation service using free MyMemory API
// Caches translations in localStorage to avoid redundant API calls

const CACHE_KEY = "portfolio_translations_cache";
const API_URL = "https://api.mymemory.translated.net/get";

// Separator for batch translations
const BATCH_SEPARATOR = " ||| ";

function getCache(): Record<string, string> {
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

function makeCacheKey(text: string, from: string, to: string): string {
  return `${from}>${to}:${text}`;
}

// Translate a single text string
async function translateSingle(
  text: string,
  from: string,
  to: string
): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  const cache = getCache();
  const key = makeCacheKey(text, from, to);
  if (cache[key]) return cache[key];

  try {
    const url = `${API_URL}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      let translated = data.responseData.translatedText;
      // MyMemory sometimes returns ALL CAPS for short text — fix that
      if (
        text.length < 100 &&
        translated === translated.toUpperCase() &&
        text !== text.toUpperCase()
      ) {
        translated =
          translated.charAt(0).toUpperCase() +
          translated.slice(1).toLowerCase();
      }
      cache[key] = translated;
      setCache(cache);
      return translated;
    }
    return text;
  } catch {
    return text;
  }
}

// Translate a batch of texts, using cache when available
export async function translateBatch(
  texts: string[],
  from: string = "pt",
  to: string = "en"
): Promise<string[]> {
  if (from === to) return texts;

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
    const key = makeCacheKey(text, from, to);
    if (cache[key]) {
      results[i] = cache[key];
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(text);
    }
  }

  if (uncachedTexts.length === 0) return results;

  // Batch into chunks of ~450 chars to stay within API limits (500 char max per request)
  const MAX_CHARS = 450;
  const batches: { texts: string[]; indices: number[] }[] = [];
  let currentBatch: string[] = [];
  let currentIndices: number[] = [];
  let currentLength = 0;

  for (let i = 0; i < uncachedTexts.length; i++) {
    const text = uncachedTexts[i];
    const addedLength =
      text.length + (currentBatch.length > 0 ? BATCH_SEPARATOR.length : 0);

    if (currentLength + addedLength > MAX_CHARS && currentBatch.length > 0) {
      batches.push({ texts: [...currentBatch], indices: [...currentIndices] });
      currentBatch = [];
      currentIndices = [];
      currentLength = 0;
    }

    currentBatch.push(text);
    currentIndices.push(uncachedIndices[i]);
    currentLength += addedLength;
  }

  if (currentBatch.length > 0) {
    batches.push({ texts: currentBatch, indices: currentIndices });
  }

  // Process batches with concurrency limit
  const CONCURRENCY = 5;
  for (let b = 0; b < batches.length; b += CONCURRENCY) {
    const batchSlice = batches.slice(b, b + CONCURRENCY);
    const promises = batchSlice.map(async (batch) => {
      if (batch.texts.length === 1) {
        // Single text — translate directly
        const translated = await translateSingle(
          batch.texts[0],
          from,
          to
        );
        results[batch.indices[0]] = translated;
      } else {
        // Multiple texts — join with separator
        const joined = batch.texts.join(BATCH_SEPARATOR);
        try {
          const url = `${API_URL}?q=${encodeURIComponent(joined)}&langpair=${from}|${to}`;
          const res = await fetch(url);
          const data = await res.json();

          if (
            data.responseStatus === 200 &&
            data.responseData?.translatedText
          ) {
            const translated = data.responseData.translatedText;
            const parts = translated.split(/\s*\|\|\|\s*/);

            const updatedCache = getCache();
            for (let j = 0; j < batch.indices.length; j++) {
              const translatedPart =
                j < parts.length ? parts[j].trim() : batch.texts[j];
              results[batch.indices[j]] = translatedPart;
              updatedCache[makeCacheKey(batch.texts[j], from, to)] =
                translatedPart;
            }
            setCache(updatedCache);
          } else {
            // Fallback: translate individually
            for (let j = 0; j < batch.texts.length; j++) {
              const t = await translateSingle(batch.texts[j], from, to);
              results[batch.indices[j]] = t;
            }
          }
        } catch {
          // On error, keep original texts
          for (let j = 0; j < batch.indices.length; j++) {
            results[batch.indices[j]] = batch.texts[j];
          }
        }
      }
    });

    await Promise.all(promises);
    // Small delay to respect rate limits
    if (b + CONCURRENCY < batches.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return results;
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
  localStorage.removeItem(CACHE_KEY);
}