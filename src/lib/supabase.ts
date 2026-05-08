// Supabase client for the external CONTRACTR Supabase project.
//
// Reads credentials from build-time env vars. Primary name:
// VITE_SUPABASE_ANON_KEY. We also accept VITE_SUPABASE_PUBLISHABLE_KEY
// because that is the variable Lovable's build pipeline injects for the
// same CONTRACTR project (it is the identical anon/publishable key —
// not a Lovable Cloud fallback). Auth, database queries and session
// management all run against this project.
//
// IMPORTANT: never throw at module init. Throwing here crashes SSR and
// produces the "{"unhandled":true,"message":"HTTPError"}" 500 page on
// every route. Instead we expose `supabaseConfigError` and a stub client
// so route components can render a readable error.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function readEnv(name: string): string | undefined {
  const fromVite = (import.meta.env as Record<string, string | undefined>)[name];
  if (fromVite) return fromVite;
  if (typeof process !== "undefined" && process.env) {
    const v = process.env[name];
    if (v) return v;
  }
  return undefined;
}

const SUPABASE_URL = readEnv("VITE_SUPABASE_URL");
const SUPABASE_ANON_KEY =
  readEnv("VITE_SUPABASE_ANON_KEY") || readEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

export const supabaseConfigError: string | null = (() => {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");
  return missing.length
    ? `Supabase niet geconfigureerd. Ontbrekende env var(s): ${missing.join(", ")}. Voeg ze toe in Workspace Settings → Build Secrets.`
    : null;
})();

export const isSupabaseConfigured = supabaseConfigError === null;

// Use a harmless placeholder if config is missing so module init never throws.
// Any actual call will fail in a controlled way; UI gates on
// `isSupabaseConfigured` to show a readable message.
const url = SUPABASE_URL || "https://placeholder.supabase.co";
const key = SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase: SupabaseClient<Database> = createClient<Database>(url, key, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type { Database } from "@/integrations/supabase/types";
