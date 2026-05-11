import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { RegionActivity } from "@/components/RegionActivity";
import { ArrowUpRight, Briefcase, HardHat, TrendingUp, Users, Plus, Eye, MessageSquare, Sparkles, MapPin } from "lucide-react";
import { useMyProjects, useMyCapacityPosts, useProjects } from "@/lib/queries";
import { WhatsAppInviteButton } from "@/components/WhatsAppInviteButton";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const stats = [
  { label: "Actieve opdrachten", value: "24", delta: "+12%", icon: Briefcase },
  { label: "Capaciteit aanbod", value: "187", delta: "+8%", icon: HardHat },
  { label: "Netwerk connecties", value: "1.342", delta: "+24", icon: Users },
  { label: "Match conversie", value: "68%", delta: "+3%", icon: TrendingUp },
];

function formatBudget(b: number | null | undefined) {
  if (b == null) return "—";
  return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(b));
}

function Dashboard() {
  const myProjects = useMyProjects();
  const myCapacity = useMyCapacityPosts();
  const opps = useProjects({ status: "actief" });

  const publicaties = [
    ...(myProjects.data ?? []).map((p) => ({
      id: p.id, type: "opdracht" as const, titel: p.title, status: p.status,
    })),
    ...(myCapacity.data ?? []).map((c) => ({
      id: c.id, type: "capaciteit" as const, titel: c.title,
      status: (c as { status?: string }).status ?? "actief",
    })),
  ].slice(0, 5);

  const opportuniteiten = (opps.data ?? []).slice(0, 4);

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
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <Link to="/mijn-publicaties" className="px-6 py-5 border-b border-border flex items-center justify-between hover:bg-muted/30">
            <div>
              <h3 className="font-display font-semibold text-lg">Mijn publicaties</h3>
              <p className="text-sm text-muted-foreground">Je actieve opdrachten en capaciteitsaanbod</p>
            </div>
            <span className="text-sm font-medium inline-flex items-center gap-1">
              Alles bekijken <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          {publicaties.length === 0 ? (
            <div className="px-6 py-10 text-sm text-muted-foreground text-center">Nog geen publicaties.</div>
          ) : (
            <ul className="divide-y divide-border">
              {publicaties.map((p) => (
                <li key={`${p.type}-${p.id}`}>
                  <Link
                    to={p.type === "opdracht" ? "/opdracht/$projectId" : "/mijn-publicaties"}
                    params={p.type === "opdracht" ? { projectId: p.id } : undefined}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-muted/30"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      p.type === "capaciteit" ? "bg-accent/20 text-accent-foreground" : "bg-foreground text-background"
                    }`}>
                      {p.type === "capaciteit" ? <HardHat className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.titel}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span className="capitalize">{p.type}</span>
                        <span>•</span>
                        <span className="font-medium">{p.status}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium hidden sm:inline-flex items-center gap-1">
                      Bekijk <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <RegionActivity />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-foreground" /> Nieuwe opportuniteiten
          </h3>
          <p className="text-sm text-muted-foreground">Opdrachten die nu open staan</p>
        </div>
        <Link to="/bekijk-opdrachten" className="text-sm font-medium hover:underline inline-flex items-center gap-1">
          Alle opdrachten <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {opportuniteiten.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">
          Nog geen opportuniteiten beschikbaar.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {opportuniteiten.map((o) => {
            const company = (o as { company?: { name?: string } }).company;
            return (
              <Link
                key={o.id}
                to="/opdracht/$projectId"
                params={{ projectId: o.id }}
                className="bg-card rounded-2xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow block"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  {o.category && (
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">
                      {o.category}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold mt-4 leading-tight line-clamp-2">{o.title}</h4>
                {company?.name && <div className="text-xs text-muted-foreground mt-1 truncate">{company.name}</div>}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {o.region ?? o.location ?? "België"}
                  </span>
                  <span className="text-sm font-bold">{formatBudget(o.budget_max)}</span>
                </div>
                <span className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                  Bekijk
                </span>
              </Link>
            );
          })}
        </div>
      )}
      <Eye className="hidden" />
      <MessageSquare className="hidden" />
    </>
  );
}
