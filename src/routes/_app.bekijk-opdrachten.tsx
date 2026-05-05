import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { RegionActivity } from "@/components/RegionActivity";
import { Briefcase, MapPin, Calendar, Building2, Circle } from "lucide-react";

export const Route = createFileRoute("/_app/bekijk-opdrachten")({
  component: BekijkOpdrachten,
});

const opdrachten = [
  { titel: "Funderingswerken nieuwbouw kantoor Eilandje", bedrijf: "BAM Contractors", locatie: "Antwerpen", budget: "€ 240.000", deadline: "15/06/2026", tags: ["Funderingen", "Beton", "6 weken"], status: "Open" },
  { titel: "Renovatie historisch kantoorpand Zavel", bedrijf: "CIT Blaton", locatie: "Brussel", budget: "€ 1,2M", deadline: "30/09/2026", tags: ["Renovatie", "Patrimonium"], status: "Open" },
  { titel: "Dakwerken industriegebouw 8.000 m²", bedrijf: "Willemen Groep", locatie: "Mechelen", budget: "€ 85.000", deadline: "20/05/2026", tags: ["Dakwerken", "Industrieel"], status: "In gesprek" },
  { titel: "Wegenwerken N9 — segment 2A", bedrijf: "Aswebo", locatie: "Gent", budget: "€ 540.000", deadline: "01/08/2026", tags: ["Infrastructuur", "Asfalt"], status: "Open" },
  { titel: "Elektrische installatie woontoren Médiacité", bedrijf: "Galère", locatie: "Luik", budget: "€ 320.000", deadline: "10/07/2026", tags: ["Elektriciteit", "BA5"], status: "Binnenkort gesloten" },
];

const statusColor: Record<string, string> = {
  "Open": "text-success",
  "In gesprek": "text-accent-foreground",
  "Binnenkort gesloten": "text-destructive",
};

function BekijkOpdrachten() {
  return (
    <>
      <PageHeader
        title="Bekijk opdrachten"
        subtitle="Ontdek lopende aanbestedingen en projecten waar je op kan bieden."
        actions={
          <div className="flex gap-2 flex-wrap">
            {["Alle", "Open", "In gesprek", "Toegewezen"].map((t, i) => (
              <button key={t} className={`px-4 py-2 rounded-full text-sm font-medium ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"}`}>
                {t}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          {opdrachten.map((o, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-elevated hover:border-foreground/20 transition-all">
              <div className="flex flex-wrap items-start gap-4 justify-between">
                <div className="flex gap-4 items-start flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Circle className={`w-2.5 h-2.5 fill-current ${statusColor[o.status]}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${statusColor[o.status]}`}>{o.status}</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg leading-tight">{o.titel}</h3>
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
                  <button className="px-5 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90">Bekijk</button>
                </div>
              </div>
              <div className="border-t border-border mt-5 pt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {o.locatie}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Deadline {o.deadline}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <RegionActivity className="lg:sticky lg:top-24" />
        </div>
      </div>
    </>
  );
}
