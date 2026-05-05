DROP POLICY "Authenticated can create companies" ON public.companies;
CREATE POLICY "Authenticated can create companies" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);