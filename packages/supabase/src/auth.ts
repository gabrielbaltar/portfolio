import type { SupabaseClient } from "@supabase/supabase-js";

export async function signInWithPassword(client: SupabaseClient, email: string, password: string) {
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signOut(client: SupabaseClient) {
  const { error } = await client.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getSession(client: SupabaseClient) {
  const { data, error } = await client.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  return {
    authenticated: Boolean(data.session),
    user: data.session?.user ?? null,
  };
}

export function onAuthStateChange(client: SupabaseClient, callback: Parameters<SupabaseClient["auth"]["onAuthStateChange"]>[0]) {
  return client.auth.onAuthStateChange(callback);
}
