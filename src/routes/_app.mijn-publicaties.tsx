import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Eye, Edit, MoreHorizontal } from "lucide-react";
import { useMyPublications } from "@/lib/queries";
import { EmptyState, LoadingState, ErrorState } from "@/components/States";

export const Route = createFileRoute("/_app/mijn-publicaties")({
  component: MijnPublicaties,
});

const statusLabel: Record<string, string> = {
  actief: "Actief",
  in_gesprek: "In gesprek",
  gesloten: "Gesloten",
  verlopen: "Verlopen",
};

function MijnPublicaties() {
  const { data, isLoading, error } = useMyPublications();
  const total = data?.length ?? 0;
  const actief = data?.filter((p) => p.status === "actief").length ?? 0;
  const totalViews = data?.reduce((s, p) => s + (p.views ?? 0), 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Mijn publicaties"
        subtitle="Beheer je opdrachten en capaciteitsaanbod op één plaats."
        actions={
          <div className="flex gap-2">
            {["Alles", "Capaciteit", "Opdrachten"].map((t, i) => (
              <button key={t} className={`px-4 py-2 rounded-full text-sm font-medium ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t}</button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { l: "Totaal publicaties", v: total },
          { l: "Actief", v: actief },
          { l: "Totaal views", v: totalViews },
          { l: "Reacties", v: 0 },
        ].map((s) => (
          <div key={s.l} className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className="text-3xl font-display font-bold">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {!isLoading && !error && data && data.length === 0 && (
        <EmptyState title="Nog geen publicaties" description="Plaats een opdracht of bied capaciteit aan om hier te verschijnen." />
      )}

      {data && data.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Publicatie</th>
                <th className="text-left px-6 py-3 font-medium">Type</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Views</th>
                <th className="text-left px-6 py-3 font-medium">Datum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{p.title}</td>
                  <td className="px-6 py-4 text-muted-foreground capitalize">{p.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      p.status === "actief" ? "bg-success/15 text-success" :
                      p.status === "verlopen" ? "bg-muted text-muted-foreground" : "bg-foreground/10"
                    }`}>{statusLabel[p.status] ?? p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground"><span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{p.views ?? 0}</span></td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("nl-BE")}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
