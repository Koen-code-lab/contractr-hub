import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { UserPlus, MessageSquare, MapPin } from "lucide-react";

export const Route = createFileRoute("/_app/mijn-netwerk")({
  component: MijnNetwerk,
});

const connecties = [
  { naam: "Sofie Dubois", rol: "Project Manager", bedrijf: "BAM Belgium", regio: "Antwerpen", connecties: 312 },
  { naam: "Thomas Janssens", rol: "Voorman", bedrijf: "Willemen", regio: "Mechelen", connecties: 178 },
  { naam: "Marie Lemaire", rol: "Architect", bedrijf: "Studio L+M", regio: "Brussel", connecties: 524 },
  { naam: "Kevin De Vos", rol: "Aannemer", bedrijf: "DV Bouw", regio: "Gent", connecties: 89 },
  { naam: "Aïcha Benali", rol: "Werfleider", bedrijf: "CIT Blaton", regio: "Brussel", connecties: 267 },
  { naam: "Pieter Maes", rol: "Calculator", bedrijf: "Aswebo", regio: "Gent", connecties: 144 },
];

const suggesties = [
  { naam: "Lucas Peeters", rol: "Werfleider", bedrijf: "Democo", wederzijds: 8 },
  { naam: "Emma Vergauwen", rol: "BIM Manager", bedrijf: "Besix", wederzijds: 14 },
  { naam: "Yannick Smet", rol: "Veiligheidscoörd.", bedrijf: "VINCI", wederzijds: 5 },
];

function MijnNetwerk() {
  return (
    <>
      <PageHeader
        title="Mijn netwerk"
        subtitle="Bouw aan een sterk professioneel netwerk in de Belgische bouwsector."
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ l: "Connecties", v: "1.342" }, { l: "Volgers", v: "489" }, { l: "Profielweergaves", v: "127" }].map((s) => (
          <div key={s.l} className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className="text-3xl font-display font-bold">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-4">Mijn connecties</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {connecties.map((c) => (
              <div key={c.naam} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-foreground to-foreground/70 text-background flex items-center justify-center font-bold">
                    {c.naam.split(" ").map((s) => s[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{c.naam}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.rol} · {c.bedrijf}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.regio}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 h-9 rounded-full bg-muted text-xs font-medium inline-flex items-center justify-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Bericht</button>
                  <button className="h-9 px-3 rounded-full bg-foreground text-background text-xs font-medium">Profiel</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <h3 className="font-display font-semibold text-lg mb-4">Voorgesteld voor jou</h3>
          <div className="space-y-3">
            {suggesties.map((s) => (
              <div key={s.naam} className="bg-card rounded-2xl border border-border p-4 shadow-card">
                <div className="flex gap-3 items-start">
                  <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center font-bold text-sm">
                    {s.naam.split(" ").map((x) => x[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{s.naam}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.rol} · {s.bedrijf}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.wederzijds} wederzijdse</div>
                  </div>
                </div>
                <button className="w-full mt-3 h-9 rounded-full bg-accent text-accent-foreground text-xs font-semibold inline-flex items-center justify-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" /> Verbinden
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
