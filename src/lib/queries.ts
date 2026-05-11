import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { fetchAttachmentSummaries, type AttachmentSummary } from "@/lib/attachments";

export function useProjectAttachmentSummaries(projectIds: string[]) {
  const key = [...projectIds].sort().join(",");
  return useQuery({
    queryKey: ["attachment-summaries", "projects", key],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { projects } = await fetchAttachmentSummaries({ projectIds });
      return projects;
    },
  });
}

export function useCapacityAttachmentSummaries(capacityPostIds: string[]) {
  const key = [...capacityPostIds].sort().join(",");
  return useQuery({
    queryKey: ["attachment-summaries", "capacity", key],
    enabled: capacityPostIds.length > 0,
    queryFn: async () => {
      const { capacity } = await fetchAttachmentSummaries({ capacityPostIds });
      return capacity;
    },
  });
}

export type { AttachmentSummary };

export type ProjectFilters = {
  category?: string;
  region?: string;
  keyword?: string;
  status?: string;
  sort?: "newest" | "relevance";
};

export type CapacityFilters = {
  specialisations?: string[];
  region?: string;
  keyword?: string;
  availableFrom?: string; // ISO date — return posts available_from <= this date
  sort?: "newest" | "available";
};

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: async () => {
      let q = supabase
        .from("projects")
        .select("*, company:companies(id, name, region, verified, logo_url)");
      if (filters.category) q = q.eq("category", filters.category);
      if (filters.region) q = q.eq("region", filters.region);
      if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);
      if (filters.keyword?.trim()) {
        const k = filters.keyword.trim();
        q = q.or(`title.ilike.%${k}%,description.ilike.%${k}%,location.ilike.%${k}%`);
      }
      q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyPublications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-publications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCapacityPosts(filters: CapacityFilters = {}) {
  return useQuery({
    queryKey: ["capacity_posts", filters],
    queryFn: async () => {
      let q = supabase
        .from("capacity_posts")
        .select("*, company:companies(id, name, region, verified, logo_url)");
      if (filters.specialisations?.length) q = q.in("specialisation", filters.specialisations);
      if (filters.region) q = q.eq("region", filters.region);
      if (filters.availableFrom) q = q.lte("available_from", filters.availableFrom);
      if (filters.keyword?.trim()) {
        const k = filters.keyword.trim();
        q = q.or(`title.ilike.%${k}%,description.ilike.%${k}%,specialisation.ilike.%${k}%`);
      }
      q = filters.sort === "available"
        ? q.order("available_from", { ascending: true, nullsFirst: false })
        : q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyCapacityPosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-capacity-posts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capacity_posts")
        .select("*")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-projects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCompanyProjects(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company-projects", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCompanyCapacity(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company-capacity", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capacity_posts")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCompanyMembers(companyId: string | undefined) {
  return useQuery({
    queryKey: ["company-members", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("company_id", companyId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["connections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      const convos = data ?? [];
      if (convos.length === 0) return [];

      const companyIds = Array.from(new Set(convos.map((c) => c.target_company_id).filter(Boolean) as string[]));
      const profileIds = Array.from(new Set(
        convos.flatMap((c) => [c.participant_a, c.participant_b]).filter(Boolean) as string[],
      ));
      const projectIds = Array.from(new Set(
        convos.map((c) => (c as { project_id?: string | null }).project_id).filter(Boolean) as string[],
      ));

      const [companiesRes, profilesRes, projectsRes] = await Promise.all([
        companyIds.length
          ? supabase.from("companies").select("id, name, logo_url").in("id", companyIds)
          : Promise.resolve({ data: [] as { id: string; name: string; logo_url: string | null }[] }),
        profileIds.length
          ? supabase.from("profiles").select("id, full_name, company_id, avatar_url").in("id", profileIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string | null; company_id: string | null; avatar_url: string | null }[] }),
        projectIds.length
          ? supabase.from("projects").select("id, title").in("id", projectIds)
          : Promise.resolve({ data: [] as { id: string; title: string }[] }),
      ]);
      const companyMap = new Map((companiesRes.data ?? []).map((c) => [c.id, c]));
      const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
      const projectMap = new Map((projectsRes.data ?? []).map((p) => [p.id, p]));

      const enriched = await Promise.all(
        convos.map(async (c) => {
          const { data: last } = await supabase
            .from("messages")
            .select("body, created_at, sender_id")
            .eq("conversation_id", c.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const otherId = c.participant_a === user!.id ? c.participant_b : c.participant_a;
          const otherProfile = otherId ? profileMap.get(otherId) : null;
          const targetCompany = c.target_company_id ? companyMap.get(c.target_company_id) : null;
          const otherCompany = otherProfile?.company_id ? companyMap.get(otherProfile.company_id) : null;
          const pid = (c as { project_id?: string | null }).project_id ?? null;
          const project = pid ? projectMap.get(pid) ?? null : null;
          const companyName = targetCompany?.name ?? otherCompany?.name ?? otherProfile?.full_name ?? "Gesprek";
          const projectTitle = project?.title?.replace(/[\s.,;:!?]+$/u, "").trim() ?? null;
          return {
            ...c,
            last_message: last,
            target_company: targetCompany ?? null,
            other_profile: otherProfile ?? null,
            project: project ?? null,
            display_title: companyName,
            subject: projectTitle ? `mbt: ${projectTitle}` : null,
          };
        }),
      );
      // Dedupe duplicate threads: same project + same company pair → keep most recent.
      const myProfile = profileMap.get(user!.id);
      const myCompanyId = (myProfile as { company_id?: string | null } | undefined)?.company_id ?? null;
      const seen = new Map<string, typeof enriched[number]>();
      for (const c of enriched) {
        const otherCompanyId =
          c.target_company_id ??
          (c.other_profile as { company_id?: string | null } | null)?.company_id ??
          null;
        const pair = [myCompanyId, otherCompanyId].filter(Boolean).sort().join("~");
        const key = `${(c as { project_id?: string | null }).project_id ?? ""}|${pair || c.id}`;
        const prev = seen.get(key);
        const cTs = new Date((c.last_message?.created_at as string | undefined) ?? c.last_message_at).getTime();
        const pTs = prev ? new Date((prev.last_message?.created_at as string | undefined) ?? prev.last_message_at).getTime() : -Infinity;
        if (!prev || cTs > pTs) seen.set(key, c);
      }
      return Array.from(seen.values()).sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
      );
    },
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, company:companies(id, name, region)");
      if (error) throw error;
      return data ?? [];
    },
  });
}
