import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Mail, Copy, Shield, UserPlus, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  useTeamMembers,
  useInvitations,
  useMyMembership,
  type CompanyRole,
} from "@/lib/team";
import { LoadingState } from "@/components/States";
import { WhatsAppInviteButton } from "@/components/WhatsAppInviteButton";
import { buildWhatsAppMessage, inviteLink, openWhatsApp } from "@/lib/whatsappInvite";

export function TeamManagement({ companyId }: { companyId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: myMembership } = useMyMembership(companyId);
  const { data: members, isLoading } = useTeamMembers(companyId);
  const { data: invitations } = useInvitations(companyId);

  const myRole: CompanyRole | null = myMembership?.role ?? null;
  const canManage = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CompanyRole>("member");
  const [inviting, setInviting] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["team-members", companyId] });
    qc.invalidateQueries({ queryKey: ["company-invitations", companyId] });
  };

  const onInvite = async () => {
    if (!user || !inviteEmail.trim()) return;
    setInviting(true);
    const { error } = await supabase.from("company_invitations").insert({
      company_id: companyId,
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      invited_by: user.id,
    });
    setInviting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Uitnodiging verstuurd naar ${inviteEmail}`);
    setInviteEmail("");
    setInviteRole("member");
    invalidate();
  };

  const onChangeRole = async (memberId: string, role: CompanyRole) => {
    const { error } = await supabase
      .from("company_members")
      .update({ role })
      .eq("id", memberId);
    if (error) return toast.error(error.message);
    toast.success("Rol bijgewerkt");
    invalidate();
  };

  const onRemove = async (memberId: string, isSelf: boolean) => {
    if (!confirm(isSelf ? "Wil je het bedrijf verlaten?" : "Lid verwijderen uit team?")) return;
    const { error } = await supabase.from("company_members").delete().eq("id", memberId);
    if (error) return toast.error(error.message);
    toast.success(isSelf ? "Bedrijf verlaten" : "Lid verwijderd");
    invalidate();
  };

  const onRevoke = async (invId: string) => {
    const { error } = await supabase.from("company_invitations").delete().eq("id", invId);
    if (error) return toast.error(error.message);
    toast.success("Uitnodiging ingetrokken");
    invalidate();
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    void navigator.clipboard.writeText(url);
    toast.success("Uitnodigingslink gekopieerd");
  };

  if (isLoading) return <LoadingState />;

  const ownerCount = (members ?? []).filter((m) => m.role === "owner").length;

  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg">Teamleden</h3>
          <p className="text-sm text-muted-foreground">
            Beheer wie toegang heeft tot dit bedrijfsaccount.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-muted">
          {members?.length ?? 0} {(members?.length ?? 0) === 1 ? "lid" : "leden"}
        </span>
      </header>

      {/* Members list */}
      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
        {(members ?? []).map((m) => {
          const isSelf = m.user_id === user?.id;
          const isLastOwner = m.role === "owner" && ownerCount <= 1;
          return (
            <div key={m.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                {(m.profile?.full_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {m.profile?.full_name ?? "Onbekend"} {isSelf && <span className="text-xs text-muted-foreground">(jij)</span>}
                </div>
                <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {m.role}
                </div>
              </div>
              {isOwner && !isSelf ? (
                <select
                  value={m.role}
                  onChange={(e) => onChangeRole(m.id, e.target.value as CompanyRole)}
                  className="h-9 px-3 rounded-lg bg-muted text-sm outline-none"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted capitalize">{m.role}</span>
              )}
              {(canManage || isSelf) && !isLastOwner && (
                <button
                  onClick={() => onRemove(m.id, isSelf)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                  title={isSelf ? "Verlaten" : "Verwijderen"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Invite form */}
      {canManage && (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserPlus className="w-4 h-4" />
            Nieuw teamlid uitnodigen
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="naam@bedrijf.be"
              className="flex-1 h-11 px-4 rounded-xl bg-muted text-sm outline-none"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as CompanyRole)}
              className="h-11 px-3 rounded-xl bg-muted text-sm outline-none"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              {isOwner && <option value="owner">Owner</option>}
            </select>
            <button
              onClick={onInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {inviting ? "Versturen…" : "Uitnodigen"}
            </button>
          </div>
        </div>
      )}

      {/* Pending invitations */}
      {canManage && invitations && invitations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Openstaande uitnodigingen</h4>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 p-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{inv.email}</div>
                  <div className="text-xs text-muted-foreground capitalize">{inv.role}</div>
                </div>
                <button
                  onClick={() => copyInviteLink(inv.token)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                  title="Link kopiëren"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRevoke(inv.id)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive"
                  title="Intrekken"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
