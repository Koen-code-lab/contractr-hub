// Supabase client for the external CONTRACTR Supabase project.
//
// URL and anon (publishable) key are hardcoded on purpose: the anon key is
// a public client identifier, protected by RLS on the database side. This
// removes any dependency on Workspace build secrets.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = "https://vktffxcdghgufxvnozzg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_3AhZfvv9IlmTyFb1eXlNZg_nkOXGgmN";

if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.info("[supabase] project =", SUPABASE_URL);
}

export const supabaseConfigError: string | null = null;
export const isSupabaseConfigured = true;

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
