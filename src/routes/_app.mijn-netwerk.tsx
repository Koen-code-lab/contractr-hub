import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MessageSquare, MapPin, BadgeCheck, Check, X } from "lucide-react";
import { useCompanies, useConnections, useProfiles } from "@/lib/queries";
import { EmptyState, LoadingState, ErrorState } from "@/components/States";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { getOrCreateConversation, updateConnection } from "@/lib/connections";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/mijn-netwerk")({
  component: MijnNetwerk,
});

function MijnNetwerk() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const companies = useCompanies();
  const connections = useConnections();
  const profiles = useProfiles();
  const [tab, setTab] = useState<"verbonden" | "verzoeken" | "alle">("alle");

  const profilesById = useMemo(() => {
    const m = new Map<string, { id: string; full_name: string | null; company_id: string | null }>();
    (profiles.data ?? []).forEach((p) => m.set(p.id, p as never));
    return m;
  }, [profiles.data]);

  const accepted = (connections.data ?? []).filter((c) => c.status === "accepted");
  const pendingIncoming = (connections.data ?? []).filter(
    (c) => c.status === "pending" && c.addressee_id === user?.id,
  );

  const connectedCompanyIds = useMemo(() => {
    const ids = new Set<string>();
    accepted.forEach((c) => {
      const otherId = c.requester_id === user?.id ? c.addressee_id : c.requester_id;
      const cid = profilesById.get(otherId)?.company_id;
      if (cid) ids.add(cid);
    });
    return ids;
  }, [accepted, profilesById, user?.id]);

  const visible = (companies.data ?? []).filter((c) => {
    if (tab === "verbonden") return connectedCompanyIds.has(c.id);
    return true;
  });

  const handleAccept = async (id: string, status: "accepted" | "rejected") => {
    try {
      await updateConnection(id, status);
      qc.invalidateQueries({ queryKey: ["connections"] });
      toast.success(status === "accepted" ? "Verbinding aanvaard." : "Verzoek geweigerd.");
    } catch (e) { toast.error((e as Error).message); }
  };

  const handleMessage = async (companyId: string) => {
    if (!user) return;
    // pick a member of the company to talk to
    const member = (profiles.data ?? []).find((p) => p.company_id === companyId && p.id !== user.id);
    if (!member) { toast.error("Dit bedrijf heeft nog geen contactpersoon."); return; }
    try {
      await getOrCreateConversation(user.id, member.id);
      navigate({ to: "/berichten" });
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <>
      <PageHeader
        title="Mijn netwerk"
        subtitle="Bouw aan een sterk professioneel netwerk in de Belgische bouwsector."
        actions={
          <div className="flex gap-2 flex-wrap">
            {([
              { v: "alle", l: "Alle bedrijven" },
              { v: "verbonden", l: `Verbonden (${connectedCompanyIds.size})` },
              { v: "verzoeken", l: `Verzoeken (${pendingIncoming.length})` },
            ] as const).map((t) => (
              <button key={t.v} onClick={() => setTab(t.v)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${tab === t.v ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t.l}</button>
            ))}
          </div>
        }
      />

      {tab === "verzoeken" ? (
        <div className="space-y-3">
          {pendingIncoming.length === 0 && <EmptyState title="Geen openstaande verzoeken" description="Wanneer iemand jou wil verbinden zie je het hier." />}
          {pendingIncoming.map((c) => {
            const requester = profilesById.get(c.requester_id);
            return (
              <div key={c.id} className="bg-card rounded-2xl border border-border p-5 shadow-card flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{requester?.full_name ?? "Nieuwe gebruiker"}</div>
                  <div className="text-xs text-muted-foreground">wil verbinden</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(c.id, "accepted")} className="h-9 px-4 rounded-full bg-success/15 text-success text-xs font-semibold inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Aanvaarden</button>
                  <button onClick={() => handleAccept(c.id, "rejected")} className="h-9 px-4 rounded-full bg-muted text-xs font-semibold inline-flex items-center gap-1"><X className="w-3.5 h-3.5" /> Weigeren</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {companies.isLoading && <LoadingState />}
          {companies.error && <ErrorState error={companies.error} />}
          {!companies.isLoading && !companies.error && visible.length === 0 && (
            <EmptyState title={tab === "verbonden" ? "Nog geen verbindingen" : "Nog geen bedrijven"} description="Bedrijven die zich aansluiten verschijnen hier." />
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((c) => (
              <div key={c.id} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-foreground to-foreground/70 text-background flex items-center justify-center font-bold">
                    {c.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate flex items-center gap-1">
                      {c.name}
                      {c.verified && <BadgeCheck className="w-4 h-4 text-accent-foreground" />}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{c.type ?? "Bedrijf"}</div>
                    {c.region && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {c.region}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleMessage(c.id)} className="flex-1 h-9 rounded-full bg-muted text-xs font-medium inline-flex items-center justify-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Bericht
                  </button>
                  <Link to="/bedrijven/$companyId" params={{ companyId: c.id }} className="h-9 px-3 rounded-full bg-foreground text-background text-xs font-medium inline-flex items-center">Bekijk</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
