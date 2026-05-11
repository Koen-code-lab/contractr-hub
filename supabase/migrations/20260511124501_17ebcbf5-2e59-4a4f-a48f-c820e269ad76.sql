CREATE TABLE public.post_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  capacity_post_id uuid REFERENCES public.capacity_posts(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_url text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT post_attachments_one_parent CHECK (
    (project_id IS NOT NULL)::int + (capacity_post_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX idx_post_attachments_project ON public.post_attachments(project_id);
CREATE INDEX idx_post_attachments_capacity ON public.post_attachments(capacity_post_id);

ALTER TABLE public.post_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view attachments"
  ON public.post_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Uploaders can insert attachments"
  ON public.post_attachments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Uploader or owner can delete attachments"
  ON public.post_attachments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = uploaded_by
    OR (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.created_by = auth.uid()
    ))
    OR (capacity_post_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.capacity_posts c WHERE c.id = capacity_post_id AND c.created_by = auth.uid()
    ))
  );