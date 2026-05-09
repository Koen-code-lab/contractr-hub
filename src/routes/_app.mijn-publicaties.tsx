import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Eye, Edit, Trash2, Copy, Pause, Play, Archive } from "lucide-react";
import { useMyProjects, useMyCapacityPosts } from "@/lib/queries";
import { EmptyState, LoadingState, ErrorState } from "@/components/States";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/mijn-publicaties")({
  component: MijnPublicaties,
});

const statusLabel: Record<string, string> = {
  actief: "Actief",
  concept: "Concept",
  in_gesprek: "In gesprek",
  gesloten: "Gesloten",
  verlopen: "Verlopen",
  gepauzeerd: "Gepauzeerd",
  gearchiveerd: "Gearchiveerd",
};

type Row = {
  id: string;
  title: string;
  type: "opdracht" | "capaciteit";
  status: string;
  created_at: string;
};

function MijnPublicaties() {
  const projects = useMyProjects();
  const capacity = useMyCapacityPosts();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"alles" | "opdracht" | "capaciteit">("alles");

  const isLoading = projects.isLoading || capacity.isLoading;
  const error = projects.error ?? capacity.error;

  const data = useMemo<Row[]>(() => {
    const rows: Row[] = [
      ...(projects.data ?? []).map((p) => ({
        id: p.id, title: p.title, type: "opdracht" as const, status: p.status, created_at: p.created_at,
      })),
      ...(capacity.data ?? []).map((c) => ({
        id: c.id, title: c.title, type: "capaciteit" as const,
        status: (c as { status?: string }).status ?? "actief",
        created_at: c.created_at,
      })),
    ];
    return rows
      .filter((r) => filter === "alles" || r.type === filter)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [projects.data, capacity.data, filter]);

  const refetch = () => {
    qc.invalidateQueries({ queryKey: ["my-projects", user?.id] });
    qc.invalidateQueries({ queryKey: ["my-capacity-posts", user?.id] });
  };


  const setStatus = async (row: Row, status: string) => {
    if (row.type !== "opdracht") {
      toast.info("Status wijzigen is enkel beschikbaar voor opdrachten.");
      return;
    }
    const { error } = await supabase.from("projects").update({ status }).eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Status: ${statusLabel[status] ?? status}`);
    refetch();
  };

  const remove = async (row: Row) => {
    if (!confirm(`Verwijder "${row.title}"?`)) return;
    const { error } = row.type === "opdracht"
      ? await supabase.from("projects").delete().eq("id", row.id)
      : await supabase.from("capacity_posts").delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Verwijderd.");
    refetch();
  };

  const duplicate = async (row: Row) => {
    if (!user) return;
    if (row.type === "opdracht") {
      const { data: src } = await supabase.from("projects").select("*").eq("id", row.id).maybeSingle();
      if (!src) { toast.error("Bron niet gevonden."); return; }
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = src;
      const { error } = await supabase.from("projects").insert({ ...rest, created_by: user.id, title: `${row.title} (kopie)`, status: "concept" });
      if (error) { toast.error(error.message); return; }
    } else {
      const { data: src } = await supabase.from("capacity_posts").select("*").eq("id", row.id).maybeSingle();
      if (!src) { toast.error("Bron niet gevonden."); return; }
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = src;
      const { error } = await supabase.from("capacity_posts").insert({ ...rest, created_by: user.id, title: `${row.title} (kopie)` });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Gedupliceerd.");
    refetch();
  };

  const total = data.length;
  const actief = data.filter((p) => p.status === "actief").length;

  return (
    <>
      <PageHeader
        title="Mijn publicaties"
        subtitle="Beheer je opdrachten en capaciteitsaanbod op één plaats."
        actions={
          <div className="flex gap-2">
            {(["alles", "capaciteit", "opdracht"] as const).map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${filter === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {t === "alles" ? "Alles" : t === "capaciteit" ? "Capaciteit" : "Opdrachten"}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { l: "Totaal publicaties", v: total },
          { l: "Actief", v: actief },
          { l: "Opdrachten", v: projects.data?.length ?? 0 },
          { l: "Capaciteit", v: capacity.data?.length ?? 0 },
        ].map((s) => (
          <div key={s.l} className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className="text-3xl font-display font-bold">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {!isLoading && !error && data.length === 0 && (
        <EmptyState title="Je hebt nog geen publicaties." description="Plaats een opdracht of bied capaciteit aan om hier te verschijnen." />
      )}

      {data.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Publicatie</th>
                <th className="text-left px-6 py-3 font-medium">Type</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Datum</th>
                <th className="text-right px-6 py-3 font-medium">Acties</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => {
                const isPaused = p.status === "gepauzeerd";
                const isArchived = p.status === "gearchiveerd";
                return (
                  <tr key={`${p.type}-${p.id}`} className="border-t border-border hover:bg-muted/30 cursor-pointer">
                    <td className="px-6 py-4 font-medium">
                      <Link
                        to={p.type === "opdracht" ? "/opdracht/$projectId" : "/mijn-publicaties"}
                        params={p.type === "opdracht" ? { projectId: p.id } : undefined}
                        className="block hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">{p.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === "actief" ? "bg-success/15 text-success" :
                        isArchived ? "bg-muted text-muted-foreground" :
                        isPaused ? "bg-accent/20 text-accent-foreground" :
                        "bg-foreground/10"
                      }`}>{statusLabel[p.status] ?? p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("nl-BE")}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 justify-end">
                        {p.type === "opdracht" ? (
                          <Link
                            to="/mijn-publicaties/$projectId/edit"
                            params={{ projectId: p.id }}
                            title="Bewerken"
                            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
                          ><Edit className="w-3.5 h-3.5" /></Link>
                        ) : (
                          <Link
                            to="/bied-capaciteit-aan"
                            title="Bewerken"
                            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
                          ><Edit className="w-3.5 h-3.5" /></Link>
                        )}
                        {isPaused ? (
                          <button onClick={() => setStatus(p, "actief")} title="Hervatten" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><Play className="w-3.5 h-3.5" /></button>
                        ) : (
                          <button onClick={() => setStatus(p, "gepauzeerd")} title="Pauzeren" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><Pause className="w-3.5 h-3.5" /></button>
                        )}
                        <button onClick={() => setStatus(p, "gearchiveerd")} title="Archiveren" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><Archive className="w-3.5 h-3.5" /></button>
                        <button onClick={() => duplicate(p)} title="Dupliceren" className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(p)} title="Verwijderen" className="w-8 h-8 rounded-full hover:bg-destructive/10 text-destructive flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Eye className="hidden" />
    </>
  );
}
