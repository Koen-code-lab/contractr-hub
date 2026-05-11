-- =========================================================
-- Multi-user company teams
-- =========================================================

CREATE TABLE IF NOT EXISTS public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','removed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_members_user ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company ON public.company_members(company_id);

CREATE TABLE IF NOT EXISTS public.company_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked')),
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_company_invitations_email ON public.company_invitations(lower(email));
CREATE INDEX IF NOT EXISTS idx_company_invitations_company ON public.company_invitations(company_id);

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

-- ---------- Helper functions (security definer) ----------

CREATE OR REPLACE FUNCTION public.is_company_member(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = _user_id AND company_id = _company_id AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_company_role(_user_id uuid, _company_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = _user_id AND company_id = _company_id
      AND status = 'active' AND role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = _user_id;
$$;

-- ---------- RLS: company_members ----------

CREATE POLICY "Members can view their company's members"
ON public.company_members FOR SELECT TO authenticated
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Owners/admins can add members"
ON public.company_members FOR INSERT TO authenticated
WITH CHECK (
  public.has_company_role(auth.uid(), company_id, ARRAY['owner','admin'])
  OR (
    -- bootstrap: first member in a company becomes owner
    NOT EXISTS (SELECT 1 FROM public.company_members m WHERE m.company_id = company_members.company_id)
    AND user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Owners can update member roles"
ON public.company_members FOR UPDATE TO authenticated
USING (public.has_company_role(auth.uid(), company_id, ARRAY['owner']))
WITH CHECK (public.has_company_role(auth.uid(), company_id, ARRAY['owner']));

CREATE POLICY "Owners/admins can remove members; users can remove self"
ON public.company_members FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_company_role(auth.uid(), company_id, ARRAY['owner'])
  OR (
    public.has_company_role(auth.uid(), company_id, ARRAY['admin'])
    AND role <> 'owner'
  )
);

-- ---------- RLS: company_invitations ----------

CREATE POLICY "Members can view company invitations"
ON public.company_invitations FOR SELECT TO authenticated
USING (
  public.is_company_member(auth.uid(), company_id)
  OR lower(email) = lower(coalesce(public.get_user_email(auth.uid()), ''))
);

CREATE POLICY "Owners/admins can create invitations"
ON public.company_invitations FOR INSERT TO authenticated
WITH CHECK (
  invited_by = auth.uid()
  AND public.has_company_role(auth.uid(), company_id, ARRAY['owner','admin'])
);

CREATE POLICY "Owners/admins or invitee can update invitations"
ON public.company_invitations FOR UPDATE TO authenticated
USING (
  public.has_company_role(auth.uid(), company_id, ARRAY['owner','admin'])
  OR lower(email) = lower(coalesce(public.get_user_email(auth.uid()), ''))
);

CREATE POLICY "Owners/admins can delete invitations"
ON public.company_invitations FOR DELETE TO authenticated
USING (public.has_company_role(auth.uid(), company_id, ARRAY['owner','admin']));

-- ---------- Backfill existing companies ----------

INSERT INTO public.company_members (company_id, user_id, role, status)
SELECT p.company_id, p.id, 'owner', 'active'
FROM public.profiles p
WHERE p.company_id IS NOT NULL
ON CONFLICT (company_id, user_id) DO NOTHING;
