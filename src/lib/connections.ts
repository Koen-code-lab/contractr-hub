import { supabase } from "@/lib/supabase";

/**
 * Find or create a 1:1 conversation between two users.
 * Returns the conversation id.
 */
export async function getOrCreateConversation(myId: string, otherId: string): Promise<string> {
  // Look for existing conversation with these two participants in either order
  const { data: existing, error: findErr } = await supabase
    .from("conversations")
    .select("id, participant_a, participant_b")
    .or(
      `and(participant_a.eq.${myId},participant_b.eq.${otherId}),and(participant_a.eq.${otherId},participant_b.eq.${myId})`,
    )
    .limit(1)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing) return existing.id;

  const { data: created, error: createErr } = await supabase
    .from("conversations")
    .insert({ participant_a: myId, participant_b: otherId })
    .select("id")
    .single();
  if (createErr) throw createErr;
  return created.id;
}

/**
 * Pick a representative profile of a company to message/connect with.
 * Excludes the current user.
 */
export async function pickCompanyRepresentative(
  companyId: string,
  myId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("company_id", companyId)
    .neq("id", myId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function requestConnection(myId: string, otherId: string) {
  // Don't duplicate
  const { data: existing } = await supabase
    .from("connections")
    .select("id, status")
    .or(
      `and(requester_id.eq.${myId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${myId})`,
    )
    .limit(1)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
    .from("connections")
    .insert({ requester_id: myId, addressee_id: otherId, status: "pending" })
    .select("id, status")
    .single();
  if (error) throw error;
  return data;
}

export async function updateConnection(id: string, status: "accepted" | "rejected") {
  const { error } = await supabase.from("connections").update({ status }).eq("id", id);
  if (error) throw error;
}
