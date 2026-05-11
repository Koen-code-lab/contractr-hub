UPDATE public.projects p
SET company_id = pr.company_id
FROM public.profiles pr
WHERE p.created_by = pr.id
  AND p.company_id IS NULL
  AND pr.company_id IS NOT NULL;