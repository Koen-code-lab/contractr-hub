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
 * If the company has a contact user, also link that user as participant_b
 * so they get the conversation in their inbox immediately.
 * If not, the conversation is company-targeted only — any member of the
 * target company can claim/respond via RLS.
 */
export async function getOrCreateCompanyConversation(
  myId: string,
  companyId: string,
): Promise<string> {
  // Existing conversation targeted at this company by me
  const { data: existing, error: findErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant_a", myId)
    .eq("target_company_id", companyId)
    .limit(1)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing) return existing.id;

  // Try to attach a representative for this company (excluding me)
  const { data: rep } = await supabase
    .from("profiles")
    .select("id")
    .eq("company_id", companyId)
    .neq("id", myId)
    .limit(1)
    .maybeSingle();

  const { data: created, error: createErr } = await supabase
    .from("conversations")
    .insert({
      participant_a: myId,
      participant_b: rep?.id ?? null,
      target_company_id: companyId,
    })
    .select("id")
    .single();
  if (createErr) throw createErr;
  return created.id;
}

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
