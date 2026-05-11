import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MapPin, Calendar, Building2, Circle, Search, Paperclip } from "lucide-react";
import { useProjects, useProjectAttachmentSummaries, type ProjectFilters } from "@/lib/queries";
import { formatAttachmentSummary } from "@/lib/attachments";
import { EmptyState, LoadingState, ErrorState } from "@/components/States";
import { BELGIAN_REGIONS } from "@/lib/regions";
import { CompanyAvatar } from "@/components/CompanyAvatar";

type SearchParams = { region?: string; category?: string };

export const Route = createFileRoute("/_app/bekijk-opdrachten")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    region: typeof s.region === "string" ? s.region : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  component: BekijkOpdrachten,
});

const statusLabel: Record<string, string> = {
  actief: "Open",
  in_gesprek: "In gesprek",
  gesloten: "Gesloten",
  verlopen: "Verlopen",
};
const statusColor: Record<string, string> = {
  actief: "text-success",
  in_gesprek: "text-accent-foreground",
  gesloten: "text-destructive",
  verlopen: "text-muted-foreground",
};

const CATEGORIES = ["Nieuwbouw", "Renovatie", "Onderhoud", "Infrastructuur"];

function formatBudget(b: number | null | undefined) {
  if (b == null) return "—";
  return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(b));
}

function BekijkOpdrachten() {
  const search = Route.useSearch();
  const initial: ProjectFilters = { status: "actief", region: search.region, category: search.category };
  const [draft, setDraft] = useState<ProjectFilters>(initial);
  const [active, setActive] = useState<ProjectFilters>(initial);
  useEffect(() => {
    const next: ProjectFilters = { status: "actief", region: search.region, category: search.category };
    setDraft(next); setActive(next);
  }, [search.region, search.category]);
  const { data, isLoading, error } = useProjects(active);
  const projectIds = (data ?? []).map((p) => p.id);
  const { data: attachmentSummaries } = useProjectAttachmentSummaries(projectIds);

  return (
    <>
      <PageHeader
        title="Bekijk opdrachten"
        subtitle="Ontdek lopende aanbestedingen en projecten waar je op kan bieden."
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-card rounded-2xl border border-border shadow-card p-5 h-fit lg:sticky lg:top-24 space-y-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Zoeken</div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={draft.keyword ?? ""}
                onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
                placeholder="Trefwoord..."
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-muted text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Categorie</div>
            <select
              value={draft.category ?? ""}
              onChange={(e) => setDraft({ ...draft, category: e.target.value || undefined })}
              className="w-full h-10 px-3 rounded-xl bg-muted text-sm outline-none"
            >
              <option value="">Alle categorieën</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Provincie</div>
            <select
              value={draft.region ?? ""}
              onChange={(e) => setDraft({ ...draft, region: e.target.value || undefined })}
              className="w-full h-10 px-3 rounded-xl bg-muted text-sm outline-none"
            >
              <option value="">Alle provincies</option>
              {BELGIAN_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Status</div>
            <select
              value={draft.status ?? "all"}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-muted text-sm outline-none"
            >
              <option value="all">Alle</option>
              <option value="actief">Open</option>
              <option value="in_gesprek">In gesprek</option>
              <option value="gesloten">Toegewezen</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActive(draft)}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              Filter toepassen
            </button>
            <button
              onClick={() => { const reset = { status: "actief" } as ProjectFilters; setDraft(reset); setActive(reset); }}
              className="w-full h-9 rounded-xl bg-muted text-sm font-medium hover:bg-secondary"
            >
              Wis filters
            </button>
          </div>
        </aside>

        <div className="space-y-4">
          {isLoading && <LoadingState />}
          {error && <ErrorState error={error} />}
          {!isLoading && !error && (data?.length ?? 0) === 0 && (
            <EmptyState
              title="Geen opdrachten gevonden"
              description="Er zijn momenteel geen opdrachten die aan je filters voldoen."
            />
          )}
          {data?.map((o) => {
            const company = (o as { company?: { id?: string; name?: string; logo_url?: string | null } }).company;
            return (
              <div key={o.id} className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-elevated hover:border-foreground/20 hover:-translate-y-0.5 transition-all">
                <div className="flex flex-wrap items-start gap-4 justify-between">
                  <div className="flex gap-4 items-start flex-1 min-w-0">
                    <CompanyAvatar name={company?.name ?? o.title} logoUrl={company?.logo_url ?? null} size="lg" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Circle className={`w-2.5 h-2.5 fill-current ${statusColor[o.status] ?? ""}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${statusColor[o.status] ?? ""}`}>
                          {statusLabel[o.status] ?? o.status}
                        </span>
                        {o.urgency && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">{o.urgency}</span>
                        )}
                      </div>
                      <Link to="/opdracht/$projectId" params={{ projectId: o.id }} className="block hover:underline"><h3 className="font-display font-semibold text-lg leading-tight">{o.title}</h3></Link>
                      {company?.name && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {company.id ? (
                            <Link to="/bedrijven/$companyId" params={{ companyId: company.id }} className="hover:underline">
                              {company.name}
                            </Link>
                          ) : company.name}
                        </div>
                      )}
                      {o.category && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium">{o.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Budget</div>
                      <div className="text-xl font-display font-bold">{formatBudget(o.budget_max)}</div>
                    </div>
                    <Link to="/opdracht/$projectId" params={{ projectId: o.id }} className="px-5 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90">Bekijk</Link>
                  </div>
                </div>
                <div className="border-t border-border mt-5 pt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                  {o.region && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {o.region}</span>}
                  {o.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {o.location}</span>}
                  {o.deadline && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Deadline {new Date(o.deadline).toLocaleDateString("nl-BE")}</span>}
                  {o.start_date && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Start {new Date(o.start_date).toLocaleDateString("nl-BE")}</span>}
                  {(() => {
                    const label = formatAttachmentSummary(attachmentSummaries?.get(o.id));
                    return label ? <span className="flex items-center gap-1.5"><Paperclip className="w-4 h-4" /> {label}</span> : null;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
