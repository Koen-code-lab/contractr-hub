import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { BELGIAN_REGIONS } from "@/lib/regions";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/mijn-publicaties/$projectId/edit")({
  component: EditOpdracht,
});

const URGENCIES = ["Niet dringend", "Binnen 1 maand", "Binnen 2 weken", "Spoed"];
const STATUSES = ["actief", "concept", "gepauzeerd", "gearchiveerd"] as const;

function normalizeTitle(s: string) {
  return s.replace(/[\s.,;:!?]+$/u, "").trim();
}

function EditOpdracht() {
  const { projectId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects").select("*").eq("id", projectId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    title: "", category: "Nieuwbouw", region: "", location: "",
    budget_max: "", start_date: "", deadline: "", urgency: "",
    description: "", status: "actief",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title ?? "",
      category: data.category ?? "Nieuwbouw",
      region: data.region ?? "",
      location: data.location ?? "",
      budget_max: data.budget_max != null ? String(data.budget_max) : "",
      start_date: data.start_date ?? "",
      deadline: data.deadline ?? "",
      urgency: data.urgency ?? "",
      description: data.description ?? "",
      status: data.status ?? "actief",
    });
  }, [data]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState title="Niet gevonden" description="Deze opdracht bestaat niet." />;
  if (user && data.created_by !== user.id) {
    return <EmptyState title="Geen toegang" description="Je kan enkel je eigen publicaties bewerken." />;
  }

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Titel is verplicht."); return; }
    setSaving(true);
    const { error } = await supabase.from("projects").update({
      title: normalizeTitle(form.title),
      category: form.category || null,
      region: form.region || null,
      location: form.location || null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      start_date: form.start_date || null,
      deadline: form.deadline || null,
      urgency: form.urgency || null,
      description: form.description || null,
      status: form.status,
    }).eq("id", projectId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Opgeslagen.");
    qc.invalidateQueries({ queryKey: ["project", projectId] });
    qc.invalidateQueries({ queryKey: ["my-projects", user?.id] });
    navigate({ to: "/opdracht/$projectId", params: { projectId } });
  };

  return (
    <>
      <PageHeader
        title="Bewerk opdracht"
        subtitle={data.title}
        actions={
          <Link to="/opdracht/$projectId" params={{ projectId }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Terug
          </Link>
        }
      />
      <form onSubmit={save} className="bg-card rounded-2xl border border-border p-8 shadow-card space-y-6 max-w-3xl">
        <div>
          <label className="text-sm font-medium block mb-2">Titel *</label>
          <input value={form.title} onChange={update("title")} onBlur={(e) => setForm((f) => ({ ...f, title: normalizeTitle(e.target.value) }))} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Categorie</label>
            <select value={form.category} onChange={update("category")} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
              <option>Nieuwbouw</option><option>Renovatie</option><option>Onderhoud</option><option>Infrastructuur</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Provincie</label>
            <select value={form.region} onChange={update("region")} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
              <option value="">—</option>
              {BELGIAN_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Stad / locatie</label>
            <input value={form.location} onChange={update("location")} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Budget (€)</label>
            <input type="number" value={form.budget_max} onChange={update("budget_max")} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Startdatum</label>
            <input type="date" value={form.start_date} onChange={update("start_date")} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Deadline</label>
            <input type="date" value={form.deadline} onChange={update("deadline")} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Urgentie</label>
            <select value={form.urgency} onChange={update("urgency")} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
              <option value="">—</option>
              {URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Status</label>
            <select value={form.status} onChange={update("status")} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Omschrijving</label>
          <textarea value={form.description} onChange={update("description")} rows={6} className="w-full px-4 py-3 rounded-xl bg-muted text-sm outline-none" />
        </div>
        <div className="flex gap-3 justify-end">
          <Link to="/opdracht/$projectId" params={{ projectId }} className="px-5 py-2.5 rounded-full bg-muted text-sm font-medium">Annuleren</Link>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
            {saving ? "Bezig..." : "Opslaan"}
          </button>
        </div>
      </form>
    </>
  );
}
