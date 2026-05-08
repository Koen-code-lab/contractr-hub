-- Add region column to projects for Belgian province filtering
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS urgency text;

-- Useful indexes for server-side filtering
CREATE INDEX IF NOT EXISTS idx_projects_region ON public.projects(region);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_capacity_posts_region ON public.capacity_posts(region);
CREATE INDEX IF NOT EXISTS idx_capacity_posts_specialisation ON public.capacity_posts(specialisation);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);