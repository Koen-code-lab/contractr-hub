import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Briefcase, MapPin, Calendar, Euro, Building2 } from "lucide-react";

export const Route = createFileRoute("/_app/bekijk-opdrachten")({
  component: BekijkOpdrachten,
});

const opdrachten = [
  { titel: "Funderingswerken nieuwbouw kantoor", bedrijf: "BAM Belgium", locatie: "Antwerpen", budget: "€ 240.000", deadline: "15/06/2026", tags: ["Funderingen", "Beton", "6 weken"] },
  { titel: "Renovatie historisch kantoorpand", bedrijf: "CIT Blaton", locatie: "Brussel", budget: "€ 1.2M", deadline: "30/09/2026", tags: ["Renovatie", "Patrimonium", "12 weken"] },
  { titel: "Dakwerken industriegebouw 8.000m²", bedrijf: "Willemen Group", locatie: "Mechelen", budget: "€ 85.000", deadline: "20/05/2026", tags: ["Dakwerken", "Industrieel"] },
  { titel: "Wegenwerken N9 segment 2A", bedrijf: "Aswebo", locatie: "Gent", budget: "€ 540.000", deadline: "01/08/2026", tags: ["Infrastructuur", "Asfalt"] },
  { titel: "Elektrische installatie woontoren", bedrijf: "Immobel", locatie: "Luik", budget: "€ 320.000", deadline: "10/07/2026", tags: ["Elektriciteit", "BA5", "8 weken"] },
];

function BekijkOpdrachten() {
  return (
    <>
      <PageHeader
        title="Bekijk opdrachten"
        subtitle="Ontdek lopende aanbestedingen en projecten waar je op kan bieden."
        actions={
          <div className="flex gap-2">
            {["Alle", "Open", "Onderhandeling", "Gewonnen"].map((t, i) => (
              <button
                key={t}
                className={`px-4 py-2 rounded-full text-sm font-medium ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"}`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      <div className="space-y-4">
        {opdrachten.map((o, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-elevated transition-all hover:border-foreground/20">
            <div className="flex flex-wrap items-start gap-4 justify-between">
              <div className="flex gap-4 items-start flex-1 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-lg">{o.titel}</h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="w-3.5 h-3.5" /> {o.bedrijf}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {o.tags.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Budget</div>
                  <div className="text-xl font-display font-bold">{o.budget}</div>
                </div>
                <button className="px-5 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90">
                  Bied nu
                </button>
              </div>
            </div>
            <div className="border-t border-border mt-5 pt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {o.locatie}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Deadline {o.deadline}</span>
              <span className="flex items-center gap-1.5"><Euro className="w-4 h-4" /> Vaste prijs</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
