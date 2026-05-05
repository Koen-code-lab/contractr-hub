import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { RegionActivity } from "@/components/RegionActivity";
import { ArrowUpRight, Briefcase, HardHat, TrendingUp, Users, Plus, Eye, MessageSquare, Sparkles, MapPin } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const stats = [
  { label: "Actieve opdrachten", value: "24", delta: "+12%", icon: Briefcase },
  { label: "Capaciteit aanbod", value: "187", delta: "+8%", icon: HardHat },
  { label: "Netwerk connecties", value: "1.342", delta: "+24", icon: Users },
  { label: "Match conversie", value: "68%", delta: "+3%", icon: TrendingUp },
];

const publicaties = [
  { titel: "Team metselaars beschikbaar Vlaanderen", type: "Capaciteit", status: "Actief", views: 487, reacties: 12 },
  { titel: "Renovatie kantoorpand Brussel", type: "Opdracht", status: "Actief", views: 312, reacties: 8 },
  { titel: "Kraanmachinist Liebherr LTM", type: "Capaciteit", status: "Actief", views: 198, reacties: 5 },
];

const opportuniteiten = [
  { titel: "Funderingswerken nieuwbouw Eilandje", bedrijf: "BAM Contractors", locatie: "Antwerpen", budget: "€ 240.000", match: "Past bij jouw specialisatie" },
  { titel: "Dakwerken industriegebouw Zaventem", bedrijf: "Willemen Groep", locatie: "Mechelen", budget: "€ 85.000", match: "Goede match" },
  { titel: "Wegenwerken N9 — segment 2A", bedrijf: "Aswebo", locatie: "Gent", budget: "€ 540.000", match: "Relevante match" },
  { titel: "Renovatie kantoorpand Zavel", bedrijf: "CIT Blaton", locatie: "Brussel", budget: "€ 1,2M", match: "Goede match" },
];

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Welkom bij CONTRACTR"
        subtitle="Het netwerk voor capaciteit en opdrachten in de Belgische bouwsector."
        actions={
          <>
            <Link to="/plaats-opdracht" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              <Plus className="w-4 h-4" /> Plaats opdracht
            </Link>
            <Link to="/bied-capaciteit-aan" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90">
              <HardHat className="w-4 h-4" /> Bied capaciteit aan
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-success font-medium">{s.delta}</span>
              </div>
              <div className="mt-4 text-3xl font-display font-bold tracking-tight">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Mijn publicaties */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg">Mijn publicaties</h3>
              <p className="text-sm text-muted-foreground">Je actieve opdrachten en capaciteitsaanbod</p>
            </div>
            <Link to="/mijn-publicaties" className="text-sm font-medium hover:underline inline-flex items-center gap-1">
              Alles bekijken <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {publicaties.map((p, i) => (
              <li key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-muted/30">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  p.type === "Capaciteit" ? "bg-accent/20 text-accent-foreground" : "bg-foreground text-background"
                }`}>
                  {p.type === "Capaciteit" ? <HardHat className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.titel}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{p.type}</span>
                    <span>•</span>
                    <span className="text-success font-medium">{p.status}</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {p.views}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {p.reacties}</span>
                </div>
                <Link to="/mijn-publicaties" className="text-sm font-medium hover:underline">Beheer</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Region activity */}
        <RegionActivity />
      </div>

      {/* Nieuwe opportuniteiten */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-foreground" /> Nieuwe opportuniteiten
          </h3>
          <p className="text-sm text-muted-foreground">Geselecteerd op basis van je profiel en specialiteiten</p>
        </div>
        <Link to="/bekijk-opdrachten" className="text-sm font-medium hover:underline inline-flex items-center gap-1">
          Alle opdrachten <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {opportuniteiten.map((o, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">
                {o.match}% match
              </span>
            </div>
            <h4 className="font-semibold mt-4 leading-tight">{o.titel}</h4>
            <div className="text-xs text-muted-foreground mt-1">{o.bedrijf}</div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {o.locatie}
              </span>
              <span className="text-sm font-bold">{o.budget}</span>
            </div>
            <Link to="/bekijk-opdrachten" className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
              Bied nu
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
