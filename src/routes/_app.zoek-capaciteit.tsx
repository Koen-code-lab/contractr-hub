import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RegionActivity } from "@/components/RegionActivity";
import { MapPin, HardHat, Search, Calendar } from "lucide-react";
import { useCapacityPosts } from "@/lib/queries";
import { EmptyState, LoadingState, ErrorState } from "@/components/States";
import { BELGIAN_REGIONS } from "@/lib/regions";

export const Route = createFileRoute("/_app/zoek-capaciteit")({
  component: ZoekCapaciteit,
});

const specialiteiten = ["Funderingen", "Metselwerken", "Dakwerken", "Elektriciteit", "Sanitair", "Afwerking", "Hijsen / Kranen", "Wegenwerken"];
const regios = ["Antwerpen", "Brussel", "Oost-Vlaanderen", "West-Vlaanderen", "Limburg", "Vlaams-Brabant", "Henegouwen", "Luik"];
const beschikbaarheden = ["Direct", "Deze week", "Deze maand", "Volgend kwartaal"] as const;
type Beschikbaarheid = (typeof beschikbaarheden)[number];

type Filters = {
  search: string;
  specs: string[];
  region: string;
  availability: Beschikbaarheid | "";
};
const empty: Filters = { search: "", specs: [], region: "", availability: "" };

function withinAvailability(from: string | null | undefined, kind: Beschikbaarheid | "") {
  if (!kind) return true;
  if (!from) return false;
  const d = new Date(from);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (kind === "Direct") return diff <= 7;
  if (kind === "Deze week") return diff <= 7;
  if (kind === "Deze maand") return diff <= 31;
  if (kind === "Volgend kwartaal") return diff <= 92;
  return true;
}

function ZoekCapaciteit() {
  const { data, isLoading, error } = useCapacityPosts();

  const [draft, setDraft] = useState<Filters>(empty);
  const [active, setActive] = useState<Filters>(empty);

  const toggleSpec = (s: string) =>
    setDraft((d) => ({ ...d, specs: d.specs.includes(s) ? d.specs.filter((x) => x !== s) : [...d.specs, s] }));

  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = active.search.trim().toLowerCase();
    return list.filter((p) => {
      if (q) {
        const company = (p as { company?: { name?: string } }).company?.name ?? "";
        const hay = `${p.title} ${p.description ?? ""} ${p.specialisation ?? ""} ${company}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (active.specs.length && !active.specs.includes(p.specialisation ?? "")) return false;
      if (active.region && (p.region ?? "") !== active.region) return false;
      if (active.availability && !withinAvailability(p.available_from, active.availability)) return false;
      return true;
    });
  }, [data, active]);

  return (
    <>
      <PageHeader
        title="Zoek capaciteit"
        subtitle="Vind beschikbare bouwbedrijven, vakmensen en materieel in heel België."
      />

      <div className="grid lg:grid-cols-[280px_1fr_320px] gap-6">
        <aside className="bg-card rounded-2xl border border-border shadow-card p-5 h-fit lg:sticky lg:top-24 space-y-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Zoeken</div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={draft.search}
                onChange={(e) => setDraft({ ...draft, search: e.target.value })}
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
                    checked={draft.specs.includes(s)}
                    onChange={() => toggleSpec(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Regio</div>
            <select
              value={draft.region}
              onChange={(e) => setDraft({ ...draft, region: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-muted text-sm outline-none"
            >
              <option value="">Alle regio's</option>
              {regios.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Beschikbaarheid</div>
            <div className="space-y-2">
              {beschikbaarheden.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    className="accent-foreground"
                    checked={draft.availability === b}
                    onChange={() => setDraft({ ...draft, availability: b })}
                  />
                  {b}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActive(draft)}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              Filter toepassen
            </button>
            <button
              onClick={() => { setDraft(empty); setActive(empty); }}
              className="w-full h-9 rounded-xl bg-muted text-sm font-medium hover:bg-secondary"
            >
              Wis filters
            </button>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-muted-foreground">
              <b className="text-foreground">{filtered.length}</b> resultaten in België
            </span>
            <select className="h-9 px-3 rounded-lg bg-muted text-sm outline-none">
              <option>Sorteer: Relevantie</option>
              <option>Beschikbaarheid</option>
            </select>
          </div>

          {isLoading && <LoadingState />}
          {error && <ErrorState error={error} />}
          {!isLoading && !error && filtered.length === 0 && (
            <EmptyState
              title="Geen capaciteit gevonden"
              description={(data?.length ?? 0) === 0 ? "Er zijn nog geen capaciteitsaanbiedingen op CONTRACTR." : "Geen resultaten voor deze filters."}
            />
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((p) => {
              const company = (p as { company?: { name?: string } }).company;
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
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    {p.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.region}</span>}
                  </div>
                  <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                    <div className="text-sm font-bold">{p.capacity_value ? `€ ${p.capacity_value}/u` : "Op aanvraag"}</div>
                    <button className="text-sm font-semibold px-4 py-1.5 rounded-full bg-accent text-accent-foreground">Contacteer</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <RegionActivity />
        </div>
      </div>
    </>
  );
}
