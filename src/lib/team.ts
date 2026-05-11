import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export type CompanyRole = "owner" | "admin" | "member";

export type TeamMember = {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
  status: string;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  email?: string | null;
};

export type Invitation = {
  id: string;
  company_id: string;
  email: string;
  role: CompanyRole;
  token: string;
  status: string;
  invited_by: string;
  created_at: string;
  accepted_at: string | null;
};

export function useMyMembership(companyId: string | null | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-membership", user?.id, companyId],
    enabled: !!user && !!companyId,
    queryFn: async (): Promise<{ role: CompanyRole } | null> => {
      const { data, error } = await supabase
        .from("company_members")
        .select("role")
        .eq("company_id", companyId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as { role: CompanyRole } | null;
    },
  });
}

export function useTeamMembers(companyId: string | null | undefined) {
  return useQuery({
    queryKey: ["team-members", companyId],
    enabled: !!companyId,
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from("company_members")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as TeamMember[];
      if (rows.length === 0) return [];
      const userIds = rows.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({ ...r, profile: map.get(r.user_id) ?? null }));
    },
  });
}

export function useInvitations(companyId: string | null | undefined) {
  return useQuery({
    queryKey: ["company-invitations", companyId],
    enabled: !!companyId,
    queryFn: async (): Promise<Invitation[]> => {
      const { data, error } = await supabase
        .from("company_invitations")
        .select("*")
        .eq("company_id", companyId!)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Invitation[];
    },
  });
}
