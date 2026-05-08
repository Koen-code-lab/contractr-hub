import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FileUploadSection } from "@/components/FileUploadSection";
import { Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/plaats-opdracht")({
  component: PlaatsOpdracht,
});

const EXPERTISES = ["Funderingen", "Ruwbouw", "Dakwerken", "Sanitair", "Elektriciteit", "HVAC", "Afwerking", "Grondwerken"];

function PlaatsOpdracht() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Nieuwbouw");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = async (status: "actief" | "concept", e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Log in om een opdracht te plaatsen.");
      return;
    }
    if (!title.trim()) {
      toast.error("Geef je opdracht een naam.");
      return;
    }
    setSubmitting(true);
    const desc = [description.trim(), tags.length ? `\n\nVereiste expertise: ${tags.join(", ")}` : ""].join("");
    const { data, error } = await supabase
      .from("projects")
      .insert({
        created_by: user.id,
        title: title.trim(),
        description: desc || null,
        category,
        location: location || null,
        budget_max: budget ? Number(budget) : null,
        start_date: startDate || null,
        status,
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "concept" ? "Concept opgeslagen." : "Opdracht geplaatst.");
    void data;
    navigate({ to: "/mijn-publicaties" });
  };

  return (
    <>
      <PageHeader
        title="Plaats opdracht"
        subtitle="Beschrijf je project en vind geverifieerde bouwpartners in jouw regio."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={(e) => submit("actief", e)} className="lg:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-card space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2">Projectnaam</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Bv. Renovatie kantoorpand Centrum" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Type werk</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
                <option>Nieuwbouw</option>
                <option>Renovatie</option>
                <option>Onderhoud</option>
                <option>Infrastructuur</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Locatie</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" placeholder="Adres of stad" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Budget (€)</label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" placeholder="240000" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Startdatum</label>
              <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Omschrijving</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full px-4 py-3 rounded-xl bg-muted text-sm outline-none" placeholder="Werkomschrijving, omvang, gewenste kwalificaties..." />
          </div>
          <div>
            <label className="text-sm font-medium block mb-3">Vereiste expertise</label>
            <div className="flex flex-wrap gap-2">
              {EXPERTISES.map((t) => (
                <label key={t} className={`px-3 py-1.5 rounded-full text-sm cursor-pointer ${tags.includes(t) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"}`}>
                  <input type="checkbox" checked={tags.includes(t)} onChange={() => toggleTag(t)} className="mr-2 accent-current" /> {t}
                </label>
              ))}
            </div>
          </div>
          <FileUploadSection />
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" disabled={submitting} onClick={(e) => submit("concept", e)} className="px-5 py-2.5 rounded-full bg-muted text-sm font-medium disabled:opacity-50">Concept</button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
              {submitting ? "Bezig..." : "Opdracht plaatsen"}
            </button>
          </div>
        </form>

        <aside className="bg-foreground text-background rounded-2xl p-6 h-fit">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
            <Briefcase className="w-5 h-5 text-accent-foreground" />
          </div>
          <h3 className="font-display font-semibold text-lg">Snel matchen</h3>
          <p className="text-sm opacity-80 mt-2">
            Gemiddeld ontvang je binnen 48 uur reacties van 5+ geverifieerde partners in jouw regio.
          </p>
          <div className="border-t border-white/10 mt-5 pt-5 grid grid-cols-2 gap-4 text-center">
            <div><div className="text-2xl font-display font-bold">48u</div><div className="text-xs opacity-70">Eerste reactie</div></div>
            <div><div className="text-2xl font-display font-bold">98%</div><div className="text-xs opacity-70">Geverifieerd</div></div>
          </div>
        </aside>
      </div>
    </>
  );
}
