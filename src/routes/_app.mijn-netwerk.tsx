import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MessageSquare, MapPin, BadgeCheck } from "lucide-react";
import { useCompanies } from "@/lib/queries";
import { EmptyState, LoadingState, ErrorState } from "@/components/States";

export const Route = createFileRoute("/_app/mijn-netwerk")({
  component: MijnNetwerk,
});

function MijnNetwerk() {
  const { data, isLoading, error } = useCompanies();

  return (
    <>
      <PageHeader
        title="Mijn netwerk"
        subtitle="Bouw aan een sterk professioneel netwerk in de Belgische bouwsector."
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { l: "Bedrijven", v: data?.length ?? 0 },
          { l: "Geverifieerd", v: data?.filter((c) => c.verified).length ?? 0 },
          { l: "Regio's", v: new Set(data?.map((c) => c.region).filter(Boolean)).size },
        ].map((s) => (
          <div key={s.l} className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className="text-3xl font-display font-bold">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <h3 className="font-display font-semibold text-lg mb-4">Bedrijven op CONTRACTR</h3>

      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {!isLoading && !error && data && data.length === 0 && (
        <EmptyState title="Nog geen bedrijven" description="Bedrijven die zich aansluiten verschijnen hier." />
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((c) => (
          <div key={c.id} className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-foreground to-foreground/70 text-background flex items-center justify-center font-bold">
                {c.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate flex items-center gap-1">
                  {c.name}
                  {c.verified && <BadgeCheck className="w-4 h-4 text-accent-foreground" />}
                </div>
                <div className="text-xs text-muted-foreground truncate">{c.type ?? "Bedrijf"}</div>
                {c.region && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {c.region}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 h-9 rounded-full bg-muted text-xs font-medium inline-flex items-center justify-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Bericht
              </button>
              <button className="h-9 px-3 rounded-full bg-foreground text-background text-xs font-medium">Bekijk</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
