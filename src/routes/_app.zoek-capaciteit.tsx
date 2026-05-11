import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MapPin, HardHat, Search, Calendar, Paperclip } from "lucide-react";
import { useCapacityPosts, useCapacityAttachmentSummaries, type CapacityFilters } from "@/lib/queries";
import { formatAttachmentSummary } from "@/lib/attachments";
import { EmptyState, LoadingState, ErrorState } from "@/components/States";
import { BELGIAN_REGIONS } from "@/lib/regions";

export const Route = createFileRoute("/_app/zoek-capaciteit")({
  component: ZoekCapaciteit,
});

const specialiteiten = ["Funderingen", "Metselwerken", "Dakwerken", "Elektriciteit", "Sanitair", "Afwerking", "Hijsen / Kranen", "Wegenwerken"];

function ZoekCapaciteit() {
  const [draft, setDraft] = useState<CapacityFilters>({});
  const [active, setActive] = useState<CapacityFilters>({});
  const { data, isLoading, error } = useCapacityPosts(active);
  const capacityIds = (data ?? []).map((p) => p.id);
  const { data: attachmentSummaries } = useCapacityAttachmentSummaries(capacityIds);

  const toggleSpec = (s: string) =>
    setDraft((d) => {
      const cur = d.specialisations ?? [];
      return {
        ...d,
        specialisations: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
      };
    });

  return (
    <>
      <PageHeader
        title="Zoek capaciteit"
        subtitle="Vind beschikbare bouwbedrijven, vakmensen en materieel in heel België."
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-card rounded-2xl border border-border shadow-card p-5 h-fit lg:sticky lg:top-24 space-y-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Zoeken</div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={draft.keyword ?? ""}
                onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
                placeholder="Naam, vaardigheid..."
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-muted text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Specialiteit</div>
            <div className="space-y-2">
              {specialiteiten.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-foreground rounded"
                    checked={(draft.specialisations ?? []).includes(s)}
                    onChange={() => toggleSpec(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
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
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Beschikbaar voor</div>
            <input
              type="date"
              value={draft.availableFrom ?? ""}
              onChange={(e) => setDraft({ ...draft, availableFrom: e.target.value || undefined })}
              className="w-full h-10 px-3 rounded-xl bg-muted text-sm outline-none"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Sorteren</div>
            <select
              value={draft.sort ?? "newest"}
              onChange={(e) => setDraft({ ...draft, sort: e.target.value as CapacityFilters["sort"] })}
              className="w-full h-10 px-3 rounded-xl bg-muted text-sm outline-none"
            >
              <option value="newest">Nieuwste</option>
              <option value="available">Vroegst beschikbaar</option>
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
              onClick={() => { setDraft({}); setActive({}); }}
              className="w-full h-9 rounded-xl bg-muted text-sm font-medium hover:bg-secondary"
            >
              Wis filters
            </button>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-muted-foreground">
              <b className="text-foreground">{data?.length ?? 0}</b> resultaten in België
            </span>
          </div>

          {isLoading && <LoadingState />}
          {error && <ErrorState error={error} />}
          {!isLoading && !error && (data?.length ?? 0) === 0 && (
            <EmptyState
              title="Geen capaciteit gevonden"
              description="Er zijn geen capaciteitsaanbiedingen die aan je filters voldoen."
            />
          )}

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.map((p) => {
              const company = (p as { company?: { id?: string; name?: string } }).company;
              return (
                <div key={p.id} className="bg-card rounded-2xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center">
                      <HardHat className="w-5 h-5" />
                    </div>
                    {p.available_from && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-accent/20 text-accent-foreground">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(p.available_from).toLocaleDateString("nl-BE")}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mt-4">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{company?.name ?? p.description ?? ""}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                    {p.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.region}</span>}
                    {p.specialisation && <span className="px-2 py-0.5 rounded-full bg-muted">{p.specialisation}</span>}
                    {(() => {
                      const label = formatAttachmentSummary(attachmentSummaries?.get(p.id));
                      return label ? <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {label}</span> : null;
                    })()}
                  </div>
                  <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                    <div className="text-sm font-bold">{p.capacity_value ? `€ ${p.capacity_value}/u` : "Op aanvraag"}</div>
                    {company?.id ? (
                      <Link to="/bedrijven/$companyId" params={{ companyId: company.id }} className="text-sm font-semibold px-4 py-1.5 rounded-full bg-accent text-accent-foreground">
                        Bekijk
                      </Link>
                    ) : (
                      <button className="text-sm font-semibold px-4 py-1.5 rounded-full bg-accent text-accent-foreground">Contacteer</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
