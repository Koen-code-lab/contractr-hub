import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { FileUploadSection } from "@/components/FileUploadSection";
import { HardHat } from "lucide-react";

export const Route = createFileRoute("/_app/bied-capaciteit-aan")({
  component: BiedCapaciteitAan,
});

function BiedCapaciteitAan() {
  return (
    <>
      <PageHeader
        title="Bied capaciteit aan"
        subtitle="Publiceer je beschikbare team, materieel of expertise op het CONTRACTR-netwerk."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <form className="lg:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-card space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2">Titel publicatie</label>
            <input className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Bv. Team metselaars beschikbaar in Vlaanderen" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Categorie</label>
              <select className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
                <option>Ruwbouw</option>
                <option>Afwerking</option>
                <option>Technieken</option>
                <option>Materieel</option>
                <option>Infrastructuur</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Regio</label>
              <select className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
                <option>Heel België</option>
                <option>Vlaanderen</option>
                <option>Wallonië</option>
                <option>Brussel</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Beschikbaar vanaf</label>
              <input type="date" className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Tarief (€/u)</label>
              <input className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" placeholder="65" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Beschrijving</label>
            <textarea rows={5} className="w-full px-4 py-3 rounded-xl bg-muted text-sm outline-none" placeholder="Wat bied je aan? Welke ervaring, certificaten, materieel..." />
          </div>
          <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-foreground/30 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <div className="mt-3 font-medium">Upload foto's of certificaten</div>
            <div className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF tot 10MB</div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="px-5 py-2.5 rounded-full bg-muted text-sm font-medium">Concept opslaan</button>
            <button className="px-6 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold">Publiceren</button>
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
