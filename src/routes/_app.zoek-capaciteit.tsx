import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { RegionActivity } from "@/components/RegionActivity";
import { MapPin, HardHat, Search, Calendar } from "lucide-react";
import { useCapacityPosts } from "@/lib/queries";
import { EmptyState, LoadingState, ErrorState } from "@/components/States";

export const Route = createFileRoute("/_app/zoek-capaciteit")({
  component: ZoekCapaciteit,
});

const specialiteiten = ["Funderingen", "Metselwerken", "Dakwerken", "Elektriciteit", "Sanitair", "Afwerking", "Hijsen / Kranen", "Wegenwerken"];
const regios = ["Antwerpen", "Brussel", "Oost-Vlaanderen", "West-Vlaanderen", "Limburg", "Vlaams-Brabant", "Henegouwen", "Luik"];

function ZoekCapaciteit() {
  const { data, isLoading, error } = useCapacityPosts();

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
              <input placeholder="Naam, vaardigheid..." className="w-full h-10 pl-10 pr-3 rounded-xl bg-muted text-sm outline-none" />
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Specialiteit</div>
            <div className="space-y-2">
              {specialiteiten.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="accent-foreground rounded" />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Regio</div>
            <select className="w-full h-10 px-3 rounded-xl bg-muted text-sm outline-none">
              <option>Alle regio's</option>
              {regios.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Beschikbaarheid</div>
            <div className="space-y-2">
              {["Direct", "Deze week", "Deze maand", "Volgend kwartaal"].map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="b" className="accent-foreground" />
                  {b}
                </label>
              ))}
            </div>
          </div>
          <button className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            Filter toepassen
          </button>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-muted-foreground">
              <b className="text-foreground">{data?.length ?? 0}</b> resultaten in België
            </span>
            <select className="h-9 px-3 rounded-lg bg-muted text-sm outline-none">
              <option>Sorteer: Relevantie</option>
              <option>Beschikbaarheid</option>
            </select>
          </div>

          {isLoading && <LoadingState />}
          {error && <ErrorState error={error} />}
          {!isLoading && !error && data && data.length === 0 && (
            <EmptyState title="Geen capaciteit gevonden" description="Er zijn nog geen capaciteitsaanbiedingen op CONTRACTR." />
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {data?.map((p) => {
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
                    <div className="text-sm font-bold">{p.hourly_rate ? `€ ${p.hourly_rate}/u` : "Op aanvraag"}</div>
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
