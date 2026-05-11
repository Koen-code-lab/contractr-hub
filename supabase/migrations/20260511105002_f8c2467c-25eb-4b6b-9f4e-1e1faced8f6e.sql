-- Link conversations to a project (optional)
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS project_id uuid;

CREATE INDEX IF NOT EXISTS conversations_project_id_idx
  ON public.conversations(project_id);

-- Project interests table
CREATE TABLE IF NOT EXISTS public.project_interests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  interested_user_id uuid NOT NULL,
  interested_company_id uuid,
  owner_user_id uuid NOT NULL,
  owner_company_id uuid,
  status text NOT NULL DEFAULT 'interested',
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_interests_project_id_idx
  ON public.project_interests(project_id);
CREATE INDEX IF NOT EXISTS project_interests_interested_user_idx
  ON public.project_interests(interested_user_id);
CREATE INDEX IF NOT EXISTS project_interests_owner_user_idx
  ON public.project_interests(owner_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS project_interests_unique_per_user
  ON public.project_interests(project_id, interested_user_id);

ALTER TABLE public.project_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interested user can create interest"
  ON public.project_interests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = interested_user_id);

CREATE POLICY "Participants can view interests"
  ON public.project_interests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = interested_user_id
    OR auth.uid() = owner_user_id
    OR (
      owner_company_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.company_id = owner_company_id
      )
    )
  );

CREATE POLICY "Participants can update interest status"
  ON public.project_interests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = interested_user_id
    OR auth.uid() = owner_user_id
    OR (
      owner_company_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.company_id = owner_company_id
      )
    )
  );
