// Supabase client for the external CONTRACTR Supabase project.
//
// URL and anon (publishable) key are hardcoded on purpose: the anon key is
// a public client identifier, protected by RLS on the database side. This
// removes any dependency on Workspace build secrets.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = "https://vktffxcdghgufxvnozzg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdGZmeGNkZ2hndWZ4dm5venpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzU3MzIsImV4cCI6MjA5MzU1MTczMn0.J9YHNbU1ODFuo7unE5TNPASX-atPRGOQMdFP8vxmEzo";

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
