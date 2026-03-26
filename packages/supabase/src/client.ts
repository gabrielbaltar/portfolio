import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function createTimedFetch(timeoutMs: number): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => {
      controller.abort(new DOMException(`Supabase request timed out after ${timeoutMs}ms.`, "TimeoutError"));
    }, timeoutMs);

    const abortFromCaller = () => {
      controller.abort(init?.signal?.reason);
    };

    if (init?.signal) {
      if (init.signal.aborted) {
        abortFromCaller();
      } else {
        init.signal.addEventListener("abort", abortFromCaller, { once: true });
      }
    }

    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      globalThis.clearTimeout(timeoutId);
      init?.signal?.removeEventListener("abort", abortFromCaller);
    }
  };
}

export function createBrowserSupabaseClient(url: string, anonKey: string): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}

export function createTimedBrowserSupabaseClient(url: string, anonKey: string, timeoutMs: number): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: createTimedFetch(timeoutMs),
    },
  });
}

export function createAdminSupabaseClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
