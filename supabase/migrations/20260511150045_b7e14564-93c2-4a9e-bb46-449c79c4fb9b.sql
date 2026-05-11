-- Extend company_invitations for WhatsApp invite flow
ALTER TABLE public.company_invitations
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'team_member',
  ADD COLUMN IF NOT EXISTS invited_by_company_id uuid,
  ADD COLUMN IF NOT EXISTS target_company_id uuid,
  ADD COLUMN IF NOT EXISTS channel text;

-- email is required for team_member type, but optional for company_invite
ALTER TABLE public.company_invitations ALTER COLUMN email DROP NOT NULL;
-- company_id required for team_member; optional for company_invite
ALTER TABLE public.company_invitations ALTER COLUMN company_id DROP NOT NULL;

-- Ensure type values
ALTER TABLE public.company_invitations
  DROP CONSTRAINT IF EXISTS company_invitations_type_check;
ALTER TABLE public.company_invitations
  ADD CONSTRAINT company_invitations_type_check
  CHECK (type IN ('team_member','company_invite'));

-- Allow inviting users to create company_invite rows (no company_id required)
DROP POLICY IF EXISTS "Owners/admins can create invitations" ON public.company_invitations;
CREATE POLICY "Users can create invitations"
ON public.company_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  invited_by = auth.uid()
  AND (
    -- team_member: must be owner/admin of company_id
    (type = 'team_member' AND company_id IS NOT NULL
      AND has_company_role(auth.uid(), company_id, ARRAY['owner','admin']))
    OR
    -- company_invite: any authenticated user
    (type = 'company_invite')
  )
);

-- Allow viewing of company_invite rows by the inviter
DROP POLICY IF EXISTS "Members can view company invitations" ON public.company_invitations;
CREATE POLICY "Members can view company invitations"
ON public.company_invitations
FOR SELECT
TO authenticated
USING (
  invited_by = auth.uid()
  OR (company_id IS NOT NULL AND is_company_member(auth.uid(), company_id))
  OR (email IS NOT NULL AND lower(email) = lower(COALESCE(get_user_email(auth.uid()), '')))
);

-- Allow inviter to delete their own company_invite rows; existing policy keeps owners/admins for team_member
DROP POLICY IF EXISTS "Owners/admins can delete invitations" ON public.company_invitations;
CREATE POLICY "Inviters or owners/admins can delete invitations"
ON public.company_invitations
FOR DELETE
TO authenticated
USING (
  invited_by = auth.uid()
  OR (company_id IS NOT NULL AND has_company_role(auth.uid(), company_id, ARRAY['owner','admin']))
);

-- Allow inviter to update their own row, owners/admins, or invitee
DROP POLICY IF EXISTS "Owners/admins or invitee can update invitations" ON public.company_invitations;
CREATE POLICY "Inviters, owners/admins or invitee can update invitations"
ON public.company_invitations
FOR UPDATE
TO authenticated
USING (
  invited_by = auth.uid()
  OR (company_id IS NOT NULL AND has_company_role(auth.uid(), company_id, ARRAY['owner','admin']))
  OR (email IS NOT NULL AND lower(email) = lower(COALESCE(get_user_email(auth.uid()), '')))
);