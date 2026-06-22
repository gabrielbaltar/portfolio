const DISABLED_MEDIA_MODES = new Set(["off", "disabled", "placeholder", "none"]);
const ENABLED_MEDIA_MODES = new Set(["on", "enabled", "lazy", "supabase"]);

export function isSupabaseStorageUrl(value?: string | null) {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.hostname.endsWith(".supabase.co") && parsed.pathname.includes("/storage/v1/object/");
  } catch {
    return false;
  }
}

export function shouldBlockSupabaseMedia(value?: string | null) {
  const mode = (import.meta.env.VITE_SUPABASE_MEDIA_MODE || "").trim().toLowerCase();
  const shouldBlock = DISABLED_MEDIA_MODES.has(mode);
  return shouldBlock && isSupabaseStorageUrl(value);
}
