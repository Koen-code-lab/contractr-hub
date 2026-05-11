import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  ArrowLeft, Briefcase, MapPin, Calendar, Building2, Circle,
  MessageSquare, Edit, UserPlus, Sparkles, Check,
} from "lucide-react";
import {
  getOrCreateCompanyConversation,
  requestCompanyConnection,
  createProjectInterest,
  hasMyProjectInterest,
  getMyCompanyId,
  type ProjectInterestRow,
} from "@/lib/connections";
import { useConnections } from "@/lib/queries";
import { useCompanyGate } from "@/lib/companyGate";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/opdracht/$projectId")({
  component: OpdrachtDetail,
});

const statusLabel: Record<string, string> = {
  actief: "Open", in_gesprek: "In gesprek", gesloten: "Gesloten", verlopen: "Verlopen",
  concept: "Concept", gepauzeerd: "Gepauzeerd", gearchiveerd: "Gearchiveerd",
};

function formatBudget(b: number | null | undefined) {
  if (b == null) return "—";
  return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(b));
}

function normalizeTitle(s: string | null | undefined) {
  if (!s) return "";
  return s.replace(/[\s.,;:!?]+$/u, "").trim();
}

function mapsUrl(city?: string | null, region?: string | null) {
  const q = (city && city.trim()) || (region && `${region}, België`) || "";
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function OpdrachtDetail() {
  const { projectId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<"msg" | "connect" | "interest" | null>(null);
  const { requireCompany } = useCompanyGate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, company:companies(*)")
        .eq("id", projectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: alreadyInterested } = useQuery({
    queryKey: ["project-interest-mine", projectId, user?.id],
    enabled: !!user,
    queryFn: () => hasMyProjectInterest(projectId, user!.id),
  });

  const { data: connections } = useConnections();

  const isOwner = !!user && !!data && user.id === data.created_by;

  // Owner: list of interested companies
  const { data: interests } = useQuery({
    queryKey: ["project-interests", projectId],
    enabled: isOwner,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("project_interests" as never)
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const list = (rows ?? []) as ProjectInterestRow[];
      const companyIds = Array.from(new Set(list.map((r) => r.interested_company_id).filter(Boolean) as string[]));
      const userIds = Array.from(new Set(list.map((r) => r.interested_user_id)));
      const [{ data: companies }, { data: profiles }] = await Promise.all([
        companyIds.length
          ? supabase.from("companies").select("id, name").in("id", companyIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] }),
        userIds.length
          ? supabase.from("profiles").select("id, full_name").in("id", userIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
      ]);
      const cm = new Map((companies ?? []).map((c) => [c.id, c]));
      const pm = new Map((profiles ?? []).map((p) => [p.id, p]));
      return list.map((r) => ({
        ...r,
        company: r.interested_company_id ? cm.get(r.interested_company_id) ?? null : null,
        profile: pm.get(r.interested_user_id) ?? null,
      }));
    },
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState title="Opdracht niet gevonden" description="Deze opdracht bestaat niet (meer)." />;

  const company = (data as { company?: { id: string; name: string } | null }).company ?? null;
  const title = normalizeTitle(data.title);
  const locUrl = mapsUrl(data.location, data.region);

  // Connection state with owner company
  const ownerCompanyId = company?.id ?? null;
  const myConn = (connections ?? []).find((c) => {
    if (!ownerCompanyId) return false;
    return (
      c.requester_company_id === ownerCompanyId ||
      c.addressee_company_id === ownerCompanyId
    );
  });
  const connStatus: "none" | "pending" | "accepted" =
    !myConn ? "none" : myConn.status === "accepted" ? "accepted" : "pending";

  const handleMessage = async () => {
    if (!company?.id || !user) { toast.error("Geen bedrijf gekoppeld."); return; }
    if (!requireCompany()) return;
    setBusy("msg");
    try {
      const conversationId = await getOrCreateCompanyConversation(user.id, company.id, projectId);
      // Prefill a first context message if conversation is brand new (no messages yet)
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId);
      if ((count ?? 0) === 0) {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: user.id,
          body: `Ik neem contact op over: ${title}`,
        });
      }
      navigate({ to: "/berichten", search: { c: conversationId } as never });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };

  const handleConnect = async () => {
    if (!company?.id || !user) { toast.error("Geen bedrijf gekoppeld."); return; }
    if (!requireCompany()) return;
    setBusy("connect");
    try {
      await requestCompanyConnection(user.id, company.id);
      toast.success("Verzoek verzonden.");
      qc.invalidateQueries({ queryKey: ["connections"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };

  const handleInterest = async () => {
    if (!user) { toast.error("Niet ingelogd."); return; }
    if (!requireCompany()) return;
    setBusy("interest");
    try {
      const myCompanyId = await getMyCompanyId(user.id);
      await createProjectInterest({
        projectId,
        interestedUserId: user.id,
        interestedCompanyId: myCompanyId,
        ownerUserId: data.created_by,
        ownerCompanyId: company?.id ?? null,
        message: `Interesse in: ${title}`,
      });
      // Also open / create a conversation tied to the project and post a message
      if (company?.id) {
        const conversationId = await getOrCreateCompanyConversation(user.id, company.id, projectId);
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: user.id,
          body: `Hallo, ik heb interesse in uw opdracht "${title}". Graag verneem ik meer details.`,
        });
      }
      toast.success("Interesse verstuurd");
      qc.invalidateQueries({ queryKey: ["project-interest-mine", projectId] });
      qc.invalidateQueries({ queryKey: ["project-interests", projectId] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={data.category ?? undefined}
        actions={
          <Link to="/bekijk-opdrachten" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Terug naar opdrachten
          </Link>
        }
      />

      <div className="bg-card rounded-2xl border border-border p-6 shadow-card mb-6">
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div className="flex gap-4 items-start flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Circle className="w-2.5 h-2.5 fill-current text-success" />
                <span className="text-xs font-semibold uppercase tracking-wider text-success">
                  {statusLabel[data.status] ?? data.status}
                </span>
                {data.urgency && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">{data.urgency}</span>
                )}
              </div>
              <h2 className="font-display font-bold text-2xl leading-tight">{title}</h2>
              {company?.name && (
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <Link to="/bedrijven/$companyId" params={{ companyId: company.id }} className="hover:underline">{company.name}</Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Budget</div>
              <div className="text-2xl font-display font-bold">{formatBudget(data.budget_max)}</div>
            </div>
            {isOwner ? (
              <Link
                to="/opdracht/$projectId/edit"
                params={{ projectId }}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
              >
                <Edit className="w-4 h-4" /> Bewerk opdracht
              </Link>
            ) : (
              <div className="flex flex-wrap gap-2 justify-end">
                {(() => {
                  const orphan = !company?.id;
                  const orphanTitle = orphan ? "Bedrijfsprofiel ontbreekt" : undefined;
                  return (
                    <>
                      <button
                        onClick={handleInterest}
                        disabled={busy !== null || !!alreadyInterested || orphan}
                        title={orphanTitle}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60"
                      >
                        {alreadyInterested ? (<><Check className="w-4 h-4" /> Interesse verstuurd</>) : (<><Sparkles className="w-4 h-4" /> Interesse tonen</>)}
                      </button>
                      <button onClick={handleMessage} disabled={busy !== null || orphan} title={orphanTitle} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold disabled:opacity-50">
                        <MessageSquare className="w-4 h-4" /> Bericht
                      </button>
                      <button
                        onClick={handleConnect}
                        disabled={busy !== null || connStatus !== "none" || orphan}
                        title={orphanTitle}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium disabled:opacity-60"
                      >
                        <UserPlus className="w-4 h-4" />
                        {connStatus === "accepted" ? "Verbonden" : connStatus === "pending" ? "Verzoek verzonden" : "Verbind"}
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border mt-5 pt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
          {locUrl ? (
            <a href={locUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground hover:underline">
              <MapPin className="w-4 h-4" /> {data.location || data.region}
            </a>
          ) : (
            (data.location || data.region) && (
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {data.location || data.region}</span>
            )
          )}
          {data.location && data.region && data.location !== data.region && (
            <span className="flex items-center gap-1.5 text-xs">({data.region})</span>
          )}
          {data.deadline && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Deadline {new Date(data.deadline).toLocaleDateString("nl-BE")}</span>}
          {data.start_date && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Start {new Date(data.start_date).toLocaleDateString("nl-BE")}</span>}
        </div>
      </div>

      {data.description && (
        <section className="bg-card rounded-2xl border border-border p-6 shadow-card mb-6">
          <h3 className="font-display font-semibold text-lg mb-3">Omschrijving</h3>
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{data.description}</p>
        </section>
      )}

      {isOwner && (
        <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
          <h3 className="font-display font-semibold text-lg mb-4">Geïnteresseerde bedrijven</h3>
          {(!interests || interests.length === 0) ? (
            <p className="text-sm text-muted-foreground">Nog geen interesses ontvangen.</p>
          ) : (
            <ul className="divide-y divide-border">
              {interests.map((it) => {
                const name = it.company?.name ?? it.profile?.full_name ?? "Onbekend";
                return (
                  <li key={it.id} className="py-3 flex flex-wrap items-center gap-3 justify-between">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm">{name}</div>
                      {it.message && <div className="text-xs text-muted-foreground truncate">{it.message}</div>}
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(it.created_at).toLocaleString("nl-BE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {it.interested_company_id && (
                        <Link
                          to="/bedrijven/$companyId"
                          params={{ companyId: it.interested_company_id }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium"
                        >
                          Bekijk profiel
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          if (!user || !it.interested_company_id) {
                            toast.error("Geen bedrijf gekoppeld."); return;
                          }
                          const conversationId = await getOrCreateCompanyConversation(user.id, it.interested_company_id, projectId);
                          navigate({ to: "/berichten", search: { c: conversationId } as never });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Bericht
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
