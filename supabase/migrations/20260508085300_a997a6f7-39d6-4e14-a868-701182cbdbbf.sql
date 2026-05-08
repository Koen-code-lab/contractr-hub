
-- Extend companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS company_type text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Belgium',
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS specialisations text[] DEFAULT '{}'::text[];

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  location text,
  budget_min numeric,
  budget_max numeric,
  start_date date,
  deadline date,
  status text NOT NULL DEFAULT 'actief',
  visibility text NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view projects"
  ON public.projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Creators can insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- Project files
CREATE TABLE IF NOT EXISTS public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  visibility text NOT NULL DEFAULT 'public',
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view project files"
  ON public.project_files FOR SELECT TO authenticated USING (true);

CREATE POLICY "Project owners can insert files"
  ON public.project_files FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_files.project_id AND p.created_by = auth.uid()));

CREATE POLICY "Project owners can delete files"
  ON public.project_files FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_files.project_id AND p.created_by = auth.uid()));

-- Capacity posts
CREATE TABLE IF NOT EXISTS public.capacity_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  specialisation text,
  region text,
  available_from date,
  available_until date,
  capacity_type text,
  capacity_value numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.capacity_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view capacity posts"
  ON public.capacity_posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Creators can insert capacity posts"
  ON public.capacity_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update capacity posts"
  ON public.capacity_posts FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete capacity posts"
  ON public.capacity_posts FOR DELETE TO authenticated
  USING (auth.uid() = created_by);
