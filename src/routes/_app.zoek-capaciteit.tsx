import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BelgiumMap } from "@/components/BelgiumMap";
import { Filter, MapPin, Star, HardHat, Search } from "lucide-react";

export const Route = createFileRoute("/_app/zoek-capaciteit")({
  component: ZoekCapaciteit,
});

const profielen = [
  { naam: "De Smet Construct", specialiteit: "Kraanverhuur & Hijsen", regio: "Antwerpen", rating: 4.9, reviews: 124, prijs: "€ 95/u", beschikbaar: "Direct" },
  { naam: "Vandemoortele BV", specialiteit: "Metselwerken", regio: "Gent", rating: 4.8, reviews: 87, prijs: "€ 65/u", beschikbaar: "12/05" },
  { naam: "ElectroPro Belgium", specialiteit: "Elektriciteit BA5", regio: "Brussel", rating: 5.0, reviews: 56, prijs: "€ 78/u", beschikbaar: "Direct" },
  { naam: "Dakwerken Janssens", specialiteit: "Industriële daken", regio: "Mechelen", rating: 4.7, reviews: 42, prijs: "€ 70/u", beschikbaar: "20/05" },
  { naam: "Beton Express", specialiteit: "Funderingen", regio: "Luik", rating: 4.6, reviews: 78, prijs: "€ 110/u", beschikbaar: "Direct" },
  { naam: "Tegelwerken Coppens", specialiteit: "Afwerking", regio: "Leuven", rating: 4.9, reviews: 61, prijs: "€ 55/u", beschikbaar: "15/05" },
];

function ZoekCapaciteit() {
  return (
    <>
      <PageHeader
        title="Zoek capaciteit"
        subtitle="Vind beschikbare bouwbedrijven, vakmensen en materieel in heel België."
      />

      {/* Filter bar */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-card mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Specialiteit, vaardigheid, materieel..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select className="h-11 px-4 rounded-xl bg-muted text-sm border-0 outline-none">
          <option>Alle regio's</option>
          <option>Antwerpen</option>
          <option>Brussel</option>
          <option>Vlaanderen</option>
          <option>Wallonië</option>
        </select>
        <select className="h-11 px-4 rounded-xl bg-muted text-sm border-0 outline-none">
          <option>Beschikbaarheid</option>
          <option>Direct</option>
          <option>Deze maand</option>
        </select>
        <button className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filteren
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {profielen.map((p) => (
            <div key={p.naam} className="bg-card rounded-2xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-success/15 text-success font-medium">
                  {p.beschikbaar}
                </span>
              </div>
              <h3 className="font-semibold mt-4">{p.naam}</h3>
              <p className="text-sm text-muted-foreground">{p.specialiteit}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.regio}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-accent text-accent" /> {p.rating} ({p.reviews})</span>
              </div>
              <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                <div className="text-sm font-bold">{p.prijs}</div>
                <button className="text-sm font-medium px-3 py-1.5 rounded-full bg-primary text-primary-foreground">Contact</button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <BelgiumMap className="h-96 sticky top-24" />
        </div>
      </div>
    </>
  );
}
