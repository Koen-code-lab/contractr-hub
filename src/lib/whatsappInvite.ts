import { supabase } from "@/lib/supabase";
import type { CompanyRole } from "@/lib/team";

export type InviteType = "company_invite" | "team_member";

export type CreateInviteInput = {
  type: InviteType;
  invitedByUserId: string;
  invitedByCompanyId?: string | null;
  companyId?: string | null; // for team_member: the company to join
  email?: string | null;
  role?: CompanyRole;
};

export async function createInvitation(input: CreateInviteInput) {
  const payload = {
    type: input.type,
    invited_by: input.invitedByUserId,
    invited_by_company_id: input.invitedByCompanyId ?? null,
    company_id: input.companyId ?? null,
    email: input.email ?? null,
    role: input.role ?? "member",
    channel: "whatsapp",
  } as never;
  const { data, error } = await supabase
    .from("company_invitations")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

const PRODUCTION_ORIGIN = "https://contractr-platform.lovable.app";

export function inviteLink(token: string) {
  let origin = PRODUCTION_ORIGIN;
  if (typeof window !== "undefined" && window.location?.origin) {
    const current = window.location.origin;
    // Use production domain for lovable preview/sandbox hosts so shared links always work
    const isPreview =
      /\.lovable\.app$/.test(window.location.hostname) &&
      window.location.hostname !== "contractr-platform.lovable.app";
    origin = isPreview ? PRODUCTION_ORIGIN : current;
  }
  return `${origin}/invite/${token}`;
}

export function buildWhatsAppMessage(type: InviteType, link: string) {
  if (type === "team_member") {
    return `Hey, ik heb je toegevoegd aan ons bedrijfsaccount op CONTRACTR. Via deze link kan je registreren en kom je automatisch bij ons bedrijf terecht: ${link}`;
  }
  return `Hey, ik test momenteel CONTRACTR — een netwerkplatform voor de bouwsector om opdrachten, capaciteit en partners sneller te matchen. Ik dacht dat dit ook interessant kon zijn voor jullie. Registreer je vrijblijvend via: ${link}`;
}

export function openWhatsApp(message: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
}
