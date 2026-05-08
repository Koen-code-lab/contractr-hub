import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FileUploadSection, type UploadedFile } from "@/components/FileUploadSection";
import { HardHat } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { BELGIAN_REGIONS } from "@/lib/regions";

export const Route = createFileRoute("/_app/bied-capaciteit-aan")({
  component: BiedCapaciteitAan,
});

function BiedCapaciteitAan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [title, setTitle] = useState("");
  const [specialisation, setSpecialisation] = useState("Ruwbouw");
  const [region, setRegion] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [rate, setRate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (publish: boolean, e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Log in om capaciteit aan te bieden.");
      return;
    }
    if (!title.trim()) { toast.error("Geef je publicatie een titel."); return; }
    if (!specialisation) { toast.error("Kies een categorie."); return; }
    if (!region) { toast.error("Kies een provincie."); return; }
    if (!availableFrom) { toast.error("Kies een beschikbaarheidsdatum."); return; }
    setSubmitting(true);
    const { error } = await supabase.from("capacity_posts").insert({
      created_by: user.id,
      title: title.trim(),
      description: description.trim() || null,
      specialisation,
      region,
      available_from: availableFrom || null,
      capacity_type: "hourly_rate",
      capacity_value: rate ? Number(rate) : null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(publish ? "Capaciteit gepubliceerd." : "Concept opgeslagen.");
    navigate({ to: "/mijn-publicaties" });
  };

  return (
    <>
      <PageHeader
        title="Bied capaciteit aan"
        subtitle="Publiceer je beschikbare team, materieel of expertise op het CONTRACTR-netwerk."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={(e) => submit(true, e)} className="lg:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-card space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2">Titel publicatie</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Bv. Team metselaars beschikbaar in Vlaanderen" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Categorie</label>
              <select value={specialisation} onChange={(e) => setSpecialisation(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
                <option>Ruwbouw</option>
                <option>Afwerking</option>
                <option>Technieken</option>
                <option>Materieel</option>
                <option>Infrastructuur</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Provincie *</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
                <option value="">Kies provincie...</option>
                {BELGIAN_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Beschikbaar vanaf *</label>
              <input value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} type="date" className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Tarief (€/u)</label>
              <input value={rate} onChange={(e) => setRate(e.target.value)} type="number" className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" placeholder="65" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Beschrijving</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl bg-muted text-sm outline-none" placeholder="Wat bied je aan? Welke ervaring, certificaten, materieel..." />
          </div>
          <FileUploadSection files={files} onChange={setFiles} />
          <div className="flex gap-3 justify-end">
            <button type="button" disabled={submitting} onClick={(e) => submit(false, e)} className="px-5 py-2.5 rounded-full bg-muted text-sm font-medium disabled:opacity-50">Concept opslaan</button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold disabled:opacity-50">
              {submitting ? "Bezig..." : "Publiceren"}
            </button>
          </div>
        </form>

        <aside className="bg-card rounded-2xl border border-border p-6 shadow-card h-fit">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
            <HardHat className="w-5 h-5 text-accent-foreground" />
          </div>
          <h3 className="font-display font-semibold text-lg">Maak het verschil</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Publicaties met foto's en duidelijke beschrijvingen krijgen 3× meer reacties.
          </p>
          <ul className="text-sm space-y-3 mt-5">
            {["Toon je beste projecten", "Vermeld certificaten (VCA, BA5)", "Wees specifiek over regio", "Reageer binnen 24u"].map((t) => (
              <li key={t} className="flex gap-2"><span className="text-accent">●</span>{t}</li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
