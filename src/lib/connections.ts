import { supabase } from "@/lib/supabase";

export type ConnectionRow = {
  id: string;
  status: "pending" | "accepted" | "rejected";
  requester_id: string;
  addressee_id: string | null;
  requester_company_id: string | null;
  addressee_company_id: string | null;
  created_at: string;
};

/** Get the current user's company id (or null). */
export async function getMyCompanyId(myId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", myId)
    .maybeSingle();
  if (error) throw error;
  return data?.company_id ?? null;
}

/**
 * Find or create a conversation targeted at a company.
 * Optionally tied to a specific project.
 */
export async function getOrCreateCompanyConversation(
  myId: string,
  companyId: string,
  projectId?: string | null,
): Promise<string> {
  const myCompanyId = await getMyCompanyId(myId);

  // Build candidate set: any conversation matching this project (or null) whose
  // target_company_id is either side of the (myCompany, targetCompany) pair.
  const targetIds = [companyId, ...(myCompanyId ? [myCompanyId] : [])];
  let candQ = supabase
    .from("conversations")
    .select("id, participant_a, participant_b, target_company_id, project_id")
    .in("target_company_id", targetIds);
  if (projectId) candQ = candQ.eq("project_id", projectId);
  else candQ = candQ.is("project_id", null);
  const { data: candidates, error: candErr } = await candQ;
  if (candErr) throw candErr;

  if (candidates && candidates.length) {
    // Resolve company_id for each participant to detect the company pair
    const participantIds = Array.from(
      new Set(
        candidates
          .flatMap((c) => [c.participant_a, c.participant_b])
          .filter(Boolean) as string[],
      ),
    );
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, company_id")
      .in("id", participantIds);
    const profCompany = new Map((profs ?? []).map((p) => [p.id, p.company_id]));

    // 1) Strict company-pair match (preferred): both sides resolve to the pair
    const pairMatch = candidates.find((c) => {
      const aC = profCompany.get(c.participant_a) ?? null;
      const bC = c.participant_b ? profCompany.get(c.participant_b) ?? null : null;
      const sideCompanies = new Set([aC, bC, c.target_company_id].filter(Boolean) as string[]);
      if (!myCompanyId) return false;
      return sideCompanies.has(myCompanyId) && sideCompanies.has(companyId);
    });
    if (pairMatch) return pairMatch.id;

    // 2) Fallback: I am a participant and target_company_id matches (legacy rows / no company yet)
    const meMatch = candidates.find(
      (c) =>
        c.target_company_id === companyId &&
        (c.participant_a === myId || c.participant_b === myId),
    );
    if (meMatch) return meMatch.id;
  }

  // Try to attach a representative for the target company (excluding me)
  const { data: rep } = await supabase
    .from("profiles")
    .select("id")
    .eq("company_id", companyId)
    .neq("id", myId)
    .limit(1)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    participant_a: myId,
    participant_b: rep?.id ?? null,
    target_company_id: companyId,
  };
  if (projectId) payload.project_id = projectId;

  const { data: created, error: createErr } = await supabase
    .from("conversations")
    .insert(payload as never)
    .select("id")
    .single();
  if (createErr) throw createErr;
  return created.id;
}

/** Create a project_interests record (idempotent on (project_id, interested_user_id)). */
export async function createProjectInterest(params: {
  projectId: string;
  interestedUserId: string;
  interestedCompanyId: string | null;
  ownerUserId: string;
  ownerCompanyId: string | null;
  message?: string | null;
}) {
  const { error } = await supabase
    .from("project_interests" as never)
    .upsert(
      {
        project_id: params.projectId,
        interested_user_id: params.interestedUserId,
        interested_company_id: params.interestedCompanyId,
        owner_user_id: params.ownerUserId,
        owner_company_id: params.ownerCompanyId,
        message: params.message ?? null,
        status: "interested",
      } as never,
      { onConflict: "project_id,interested_user_id" } as never,
    );
  if (error) throw error;
}

export async function hasMyProjectInterest(projectId: string, myId: string): Promise<boolean> {
  const { data } = await supabase
    .from("project_interests" as never)
    .select("id")
    .eq("project_id", projectId)
    .eq("interested_user_id", myId)
    .limit(1)
    .maybeSingle();
  return !!data;
}

export type ProjectInterestRow = {
  id: string;
  project_id: string;
  interested_user_id: string;
  interested_company_id: string | null;
  owner_user_id: string;
  owner_company_id: string | null;
  status: string;
  message: string | null;
  created_at: string;
};

/**
 * Request a connection between my company and another company.
 * Falls back to user-level (no company) when the requester has no company yet.
 */
export async function requestCompanyConnection(
  myId: string,
  targetCompanyId: string,
): Promise<ConnectionRow> {
  const myCompanyId = await getMyCompanyId(myId);

  // Avoid duplicates between the two companies (or user→company if no company)
  if (myCompanyId) {
    const { data: dup } = await supabase
      .from("connections")
      .select("*")
      .or(
        `and(requester_company_id.eq.${myCompanyId},addressee_company_id.eq.${targetCompanyId}),and(requester_company_id.eq.${targetCompanyId},addressee_company_id.eq.${myCompanyId})`,
      )
      .limit(1)
      .maybeSingle();
    if (dup) return dup as ConnectionRow;
  }

  const { data, error } = await supabase
    .from("connections")
    .insert({
      requester_id: myId,
      requester_company_id: myCompanyId,
      addressee_company_id: targetCompanyId,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ConnectionRow;
}

export async function updateConnection(id: string, status: "accepted" | "rejected") {
  const { error } = await supabase.from("connections").update({ status }).eq("id", id);
  if (error) throw error;
}

/**
 * Find the connection row (if any) between my company and a target company.
 */
export function findCompanyConnection(
  rows: ConnectionRow[],
  myCompanyId: string | null,
  targetCompanyId: string,
): ConnectionRow | undefined {
  return rows.find(
    (r) =>
      (r.requester_company_id === myCompanyId && r.addressee_company_id === targetCompanyId) ||
      (r.requester_company_id === targetCompanyId && r.addressee_company_id === myCompanyId),
  );
}
