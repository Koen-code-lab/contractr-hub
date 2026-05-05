import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BelgiumMap } from "@/components/BelgiumMap";
import { ArrowUpRight, Briefcase, HardHat, TrendingUp, Users, Plus, Building2, Clock } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const stats = [
  { label: "Actieve opdrachten", value: "24", delta: "+12%", icon: Briefcase },
  { label: "Capaciteit aanbod", value: "187", delta: "+8%", icon: HardHat },
  { label: "Netwerk connecties", value: "1.342", delta: "+24", icon: Users },
  { label: "Conversie", value: "68%", delta: "+3%", icon: TrendingUp },
];

const opdrachten = [
  { titel: "Funderingswerken nieuwbouw", bedrijf: "BAM Belgium", locatie: "Antwerpen", budget: "€ 240.000", status: "Open", dagen: 4 },
  { titel: "Dakwerken industriegebouw", bedrijf: "Willemen Group", locatie: "Mechelen", budget: "€ 85.000", status: "Onderhandeling", dagen: 2 },
  { titel: "Renovatie kantoorpand", bedrijf: "CIT Blaton", locatie: "Brussel", budget: "€ 1.2M", status: "Open", dagen: 7 },
  { titel: "Wegenwerken N9", bedrijf: "Aswebo", locatie: "Gent", budget: "€ 540.000", status: "Open", dagen: 10 },
];

const aanbod = [
  { naam: "Kraanmachinist + Liebherr LTM", bedrijf: "De Smet Construct", beschikbaar: "Vanaf 12/05" },
  { naam: "Team metselaars (4)", bedrijf: "Vandemoortele BV", beschikbaar: "Direct" },
  { naam: "Electriciens BA5", bedrijf: "ElectroPro", beschikbaar: "Vanaf 20/05" },
];

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Welkom terug, Jan"
        subtitle="Een overzicht van het netwerk, je opdrachten en beschikbare capaciteit in België."
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
        {/* Map */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Capaciteit in België</h3>
              <p className="text-sm text-muted-foreground">Realtime overzicht per regio</p>
            </div>
            <Link to="/zoek-capaciteit" className="text-sm font-medium hover:underline inline-flex items-center gap-1">
              Verkennen <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <BelgiumMap className="h-80" />
        </div>

        {/* Activity */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
          <h3 className="font-display font-semibold text-lg mb-4">Recente activiteit</h3>
          <div className="space-y-4">
            {[
              { who: "Sofie D.", what: "heeft je opdracht bekeken", when: "5 min" },
              { who: "BAM Belgium", what: "biedt op je publicatie", when: "1 u" },
              { who: "ElectroPro", what: "heeft connectie aanvaard", when: "3 u" },
              { who: "Willemen Group", what: "stuurde een bericht", when: "gisteren" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {a.who.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 text-sm">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.what}</span>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {a.when}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opdrachten table */}
      <div className="bg-card rounded-2xl border border-border shadow-card mb-8 overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg">Aanbevolen opdrachten</h3>
            <p className="text-sm text-muted-foreground">Geselecteerd op basis van je profiel</p>
          </div>
          <Link to="/bekijk-opdrachten" className="text-sm font-medium hover:underline inline-flex items-center gap-1">
            Alle opdrachten <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Opdracht</th>
                <th className="text-left px-6 py-3 font-medium">Locatie</th>
                <th className="text-left px-6 py-3 font-medium">Budget</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Sluit over</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {opdrachten.map((o, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="font-medium">{o.titel}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {o.bedrijf}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{o.locatie}</td>
                  <td className="px-6 py-4 font-medium">{o.budget}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      o.status === "Open" ? "bg-accent/20 text-accent-foreground" : "bg-muted text-foreground"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{o.dagen} dagen</td>
                  <td className="px-6 py-4">
                    <Link to="/bekijk-opdrachten" className="text-sm font-medium hover:underline">Bekijk</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aanbod cards */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Beschikbare capaciteit dichtbij</h3>
        <Link to="/zoek-capaciteit" className="text-sm font-medium hover:underline">Alles bekijken</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {aanbod.map((a, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
              <HardHat className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="font-semibold">{a.naam}</div>
            <div className="text-sm text-muted-foreground mt-1">{a.bedrijf}</div>
            <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Beschikbaar: {a.beschikbaar}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
