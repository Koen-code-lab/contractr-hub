import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RegionActivity } from "@/components/RegionActivity";
import { Briefcase, MapPin, Calendar, Building2, Circle } from "lucide-react";
import { usePublicationsByType } from "@/lib/queries";
import { EmptyState, LoadingState, ErrorState } from "@/components/States";

export const Route = createFileRoute("/_app/bekijk-opdrachten")({
  component: BekijkOpdrachten,
});

const statusLabel: Record<string, string> = {
  actief: "Open",
  in_gesprek: "In gesprek",
  gesloten: "Gesloten",
  verlopen: "Verlopen",
};
const statusColor: Record<string, string> = {
  actief: "text-success",
  in_gesprek: "text-accent-foreground",
  gesloten: "text-destructive",
  verlopen: "text-muted-foreground",
};

const FILTERS: { label: string; value: "all" | "actief" | "in_gesprek" | "gesloten" }[] = [
  { label: "Alle", value: "all" },
  { label: "Open", value: "actief" },
  { label: "In gesprek", value: "in_gesprek" },
  { label: "Toegewezen", value: "gesloten" },
];

function formatBudget(b: number | null | undefined) {
  if (b == null) return "—";
  return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(b));
}

function BekijkOpdrachten() {
  const { data, isLoading, error } = usePublicationsByType("opdracht");

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
          {isLoading && <LoadingState />}
          {error && <ErrorState error={error} />}
          {!isLoading && !error && data && data.length === 0 && (
            <EmptyState title="Nog geen opdrachten" description="Er zijn momenteel geen opdrachten gepubliceerd." />
          )}
          {data?.map((o) => {
            const company = (o as { company?: { name?: string } }).company;
            return (
              <div key={o.id} className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-elevated hover:border-foreground/20 transition-all">
                <div className="flex flex-wrap items-start gap-4 justify-between">
                  <div className="flex gap-4 items-start flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Circle className={`w-2.5 h-2.5 fill-current ${statusColor[o.status] ?? ""}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${statusColor[o.status] ?? ""}`}>
                          {statusLabel[o.status] ?? o.status}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-lg leading-tight">{o.title}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Building2 className="w-3.5 h-3.5" /> {company?.name ?? "—"}
                      </div>
                      {o.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {o.tags.map((t: string) => (
                            <span key={t} className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Budget</div>
                      <div className="text-xl font-display font-bold">{formatBudget(o.budget)}</div>
                    </div>
                    <button className="px-5 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90">Bekijk</button>
                  </div>
                </div>
                <div className="border-t border-border mt-5 pt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                  {o.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {o.location}</span>}
                  {o.deadline && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Deadline {new Date(o.deadline).toLocaleDateString("nl-BE")}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <RegionActivity className="lg:sticky lg:top-24" />
        </div>
      </div>
    </>
  );
}
