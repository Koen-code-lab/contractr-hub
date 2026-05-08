
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS employees integer,
  ADD COLUMN IF NOT EXISTS certifications text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS recent_projects jsonb NOT NULL DEFAULT '[]'::jsonb;
