// Supabase client for the external CONTRACTR Supabase project.
// Reads credentials from build-time env vars (VITE_SUPABASE_URL,
// VITE_SUPABASE_ANON_KEY). Auth, database queries and session management
// all run against this project — not Lovable Cloud.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : undefined);

const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (typeof process !== "undefined" ? process.env.VITE_SUPABASE_ANON_KEY : undefined);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const missing = [
    ...(!SUPABASE_URL ? ["VITE_SUPABASE_URL"] : []),
    ...(!SUPABASE_ANON_KEY ? ["VITE_SUPABASE_ANON_KEY"] : []),
  ].join(", ");
  throw new Error(
    `[CONTRACTR] Missing Supabase env var(s): ${missing}. Add them as Build Secrets in Workspace Settings.`,
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export type { Database } from "@/integrations/supabase/types";
