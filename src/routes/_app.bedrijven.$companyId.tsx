import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BadgeCheck, MapPin, Building2, Briefcase, HardHat, Users, MessageSquare, UserPlus, Calendar, ArrowLeft } from "lucide-react";
import {
  useCompany,
  useCompanyProjects,
  useCompanyCapacity,
  useCompanyMembers,
  useConnections,
} from "@/lib/queries";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  getOrCreateCompanyConversation,
  requestCompanyConnection,
  findCompanyConnection,
  getMyCompanyId,
  type ConnectionRow,
} from "@/lib/connections";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCompanyGate } from "@/lib/companyGate";

export const Route = createFileRoute("/_app/bedrijven/$companyId")({
  component: CompanyProfile,
});

function CompanyProfile() {
  const { companyId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const company = useCompany(companyId);
  const projects = useCompanyProjects(companyId);
  const capacity = useCompanyCapacity(companyId);
  const members = useCompanyMembers(companyId);
  const connections = useConnections();
  const [busy, setBusy] = useState<"connect" | "message" | null>(null);
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null);
  const { requireCompany } = useCompanyGate();

  useEffect(() => {
    if (!user) return;
    getMyCompanyId(user.id).then(setMyCompanyId).catch(() => setMyCompanyId(null));
  }, [user]);

  if (company.isLoading) return <LoadingState />;
  if (company.error) return <ErrorState error={company.error} />;
  if (!company.data) return <EmptyState title="Bedrijf niet gevonden" description="Dit bedrijfsprofiel bestaat niet of is niet toegankelijk." />;

  const c = company.data;
  const isMyCompany = !!myCompanyId && myCompanyId === companyId;
  const memberHasNoContact = !((members.data ?? []).some((m) => m.id !== user?.id));

  const existingConn: ConnectionRow | undefined = findCompanyConnection(
    (connections.data ?? []) as ConnectionRow[],
    myCompanyId,
    companyId,
  );

  const handleConnect = async () => {
    if (!user) { toast.error("Log in om te verbinden."); return; }
    if (!requireCompany()) return;
    setBusy("connect");
    try {
      await requestCompanyConnection(user.id, companyId);
      toast.success("Verbindingsverzoek verstuurd.");
      qc.invalidateQueries({ queryKey: ["connections"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(null); }
  };

  const handleMessage = async () => {
    if (!user) { toast.error("Log in om te berichten."); return; }
    if (!requireCompany()) return;
    setBusy("message");
    try {
      await getOrCreateCompanyConversation(user.id, companyId);
      if (memberHasNoContact) {
        toast.info("Nog geen contactpersoon beschikbaar. Stuur een algemeen bedrijfsbericht.");
      }
      navigate({ to: "/berichten" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(null); }
  };

  const recentProjects = (c.recent_projects ?? []) as Array<{ name?: string; year?: string | number; location?: string }>;

  const connectLabel =
    existingConn?.status === "accepted"
      ? "Verbonden"
      : existingConn?.status === "pending"
        ? "Verzoek verzonden"
        : "Verbind";

  return (
    <>
      <PageHeader
        title={c.name}
        subtitle={c.type ?? c.company_type ?? "Bouwbedrijf"}
      />

      <div className="bg-card rounded-2xl border border-border shadow-card p-8 mb-6">
        <div className="flex flex-wrap gap-6 items-start">
          <CompanyAvatar name={c.name} logoUrl={(c as { logo_url?: string | null }).logo_url ?? null} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-bold text-2xl">{c.name}</h2>
              {c.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success">
                  <BadgeCheck className="w-3.5 h-3.5" /> Geverifieerd
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-4">
              {c.region && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {c.region}</span>}
              {c.city && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {c.city}</span>}
              {c.employees != null && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.employees} werknemers</span>}
            </div>
            {c.description && <p className="text-sm mt-4 max-w-3xl">{c.description}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {isMyCompany ? (
              <div className="px-4 py-2.5 rounded-full bg-muted text-sm font-medium text-muted-foreground text-center">
                Dit is jouw bedrijfsprofiel.
              </div>
            ) : (
              <>
                <button
                  onClick={handleConnect}
                  disabled={busy !== null || !!existingConn}
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> {connectLabel}
                </button>
                <button
                  onClick={handleMessage}
                  disabled={busy !== null}
                  className="px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Bericht
                </button>
              </>
            )}
            <Link
              to="/mijn-netwerk"
              className="px-5 py-2.5 rounded-full bg-muted text-sm font-semibold inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Terug naar netwerk
            </Link>
          </div>
        </div>

        {(() => {
          const specs = (c as { specialisations?: string[] }).specialisations ?? [];
          if (specs.length === 0) return null;
          return (
            <div className="mt-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Specialisaties</div>
              <div className="flex flex-wrap gap-2">
                {specs.map((s) => <span key={s} className="px-3 py-1 rounded-full bg-muted text-sm">{s}</span>)}
              </div>
            </div>
          );
        })()}
        {(c.certifications?.length ?? 0) > 0 && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Certificaten</div>
            <div className="flex flex-wrap gap-2">
              {c.certifications.map((s: string) => (
                <span key={s} className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <section className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Actieve opdrachten</h3>
          {projects.isLoading && <div className="text-sm text-muted-foreground">Laden…</div>}
          {!projects.isLoading && (projects.data?.length ?? 0) === 0 && (
            <div className="text-sm text-muted-foreground">Nog geen opdrachten gepubliceerd.</div>
          )}
          <ul className="space-y-3">
            {projects.data?.map((p) => (
              <li key={p.id} className="border border-border rounded-xl p-4">
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                  {p.region && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.region}</span>}
                  {p.start_date && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(p.start_date).toLocaleDateString("nl-BE")}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><HardHat className="w-4 h-4" /> Beschikbare capaciteit</h3>
          {capacity.isLoading && <div className="text-sm text-muted-foreground">Laden…</div>}
          {!capacity.isLoading && (capacity.data?.length ?? 0) === 0 && (
            <div className="text-sm text-muted-foreground">Nog geen capaciteitsaanbod.</div>
          )}
          <ul className="space-y-3">
            {capacity.data?.map((p) => (
              <li key={p.id} className="border border-border rounded-xl p-4">
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                  {p.region && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.region}</span>}
                  {p.available_from && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(p.available_from).toLocaleDateString("nl-BE")}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {recentProjects.length > 0 && (
        <section className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Recente realisaties</h3>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((p, i) => (
              <li key={i} className="border border-border rounded-xl p-4">
                <div className="font-medium">{p.name ?? "Project"}</div>
                <div className="text-xs text-muted-foreground mt-1">{[p.location, p.year].filter(Boolean).join(" • ")}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6">
        <Link to="/mijn-netwerk" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Terug naar netwerk
        </Link>
      </div>
    </>
  );
}
