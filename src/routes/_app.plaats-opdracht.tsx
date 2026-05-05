import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { FileUploadSection } from "@/components/FileUploadSection";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/_app/plaats-opdracht")({
  component: PlaatsOpdracht,
});

function PlaatsOpdracht() {
  return (
    <>
      <PageHeader
        title="Plaats opdracht"
        subtitle="Beschrijf je project en vind geverifieerde bouwpartners in jouw regio."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <form className="lg:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-card space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2">Projectnaam</label>
            <input className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Bv. Renovatie kantoorpand Centrum" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Type werk</label>
              <select className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
                <option>Nieuwbouw</option>
                <option>Renovatie</option>
                <option>Onderhoud</option>
                <option>Infrastructuur</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Locatie</label>
              <input className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" placeholder="Adres of stad" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Budget (€)</label>
              <input className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" placeholder="240000" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Startdatum</label>
              <input type="date" className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Omschrijving</label>
            <textarea rows={6} className="w-full px-4 py-3 rounded-xl bg-muted text-sm outline-none" placeholder="Werkomschrijving, omvang, gewenste kwalificaties..." />
          </div>
          <div>
            <label className="text-sm font-medium block mb-3">Vereiste expertise</label>
            <div className="flex flex-wrap gap-2">
              {["Funderingen", "Ruwbouw", "Dakwerken", "Sanitair", "Elektriciteit", "HVAC", "Afwerking", "Grondwerken"].map((t) => (
                <label key={t} className="px-3 py-1.5 rounded-full bg-muted text-sm cursor-pointer hover:bg-secondary">
                  <input type="checkbox" className="mr-2 accent-current" /> {t}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="px-5 py-2.5 rounded-full bg-muted text-sm font-medium">Concept</button>
            <button className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Opdracht plaatsen</button>
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
