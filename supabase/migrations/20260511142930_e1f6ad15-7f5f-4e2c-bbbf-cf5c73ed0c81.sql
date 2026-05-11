DROP POLICY IF EXISTS "Owners/admins can add members" ON public.company_members;

CREATE POLICY "Owners/admins or invitee can add members"
ON public.company_members FOR INSERT TO authenticated
WITH CHECK (
  public.has_company_role(auth.uid(), company_id, ARRAY['owner','admin'])
  OR (
    NOT EXISTS (SELECT 1 FROM public.company_members m WHERE m.company_id = company_members.company_id)
    AND user_id = auth.uid() AND role = 'owner'
  )
  OR (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.company_invitations inv
      WHERE inv.company_id = company_members.company_id
        AND inv.status = 'pending'
        AND lower(inv.email) = lower(coalesce(public.get_user_email(auth.uid()), ''))
        AND inv.role = company_members.role
    )
  )
);
