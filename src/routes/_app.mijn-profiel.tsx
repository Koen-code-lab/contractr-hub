import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MapPin, CheckCircle2, Award, Building2, Calendar } from "lucide-react";

export const Route = createFileRoute("/_app/mijn-profiel")({
  component: MijnProfiel,
});

function MijnProfiel() {
  return (
    <>
      <PageHeader title="Mijn profiel" subtitle="Zo zien anderen jou op CONTRACTR." />

      {/* Banner + Avatar */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden mb-6">
        <div className="h-44 bg-gradient-to-br from-foreground via-foreground to-foreground/80 relative">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, oklch(0.83 0.16 90 / 0.4), transparent 50%)" }} />
        </div>
        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex flex-wrap items-end gap-6 justify-between">
            <div className="flex items-end gap-5">
              <div className="w-32 h-32 rounded-3xl bg-card border-4 border-card shadow-elevated flex items-center justify-center text-3xl font-display font-bold bg-gradient-to-br from-accent to-accent/70">
                JV
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-display font-bold">Jan Vermeulen</h2>
                  <CheckCircle2 className="w-5 h-5 text-accent fill-accent/30" />
                </div>
                <div className="text-muted-foreground mt-1">Algemeen aannemer · Vermeulen Bouw NV</div>
                <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Antwerpen, België</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> 24 medewerkers</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Sinds 2008</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              <button className="px-5 py-2.5 rounded-full bg-muted text-sm font-medium">Profiel delen</button>
              <button className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">Profiel bewerken</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold text-lg mb-3">Over ons</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vermeulen Bouw NV is een familiale algemene aannemer met 24 vakmensen, gespecialiseerd in
              renovatie en kleine nieuwbouw in de regio Antwerpen-Mechelen. We werken met VCA**-certificering
              en zijn al meer dan 15 jaar partner van toonaangevende bouwheren.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Specialisaties</h3>
            <div className="flex flex-wrap gap-2">
              {["Renovatie", "Ruwbouw", "Funderingen", "Metselwerk", "Dakwerken", "Patrimonium", "Werforganisatie", "Coördinatie"].map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium">{s}</span>
              ))}
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Recente projecten</h3>
            <div className="space-y-4">
              {[
                { titel: "Renovatie herenhuis Cogels-Osylei", waarde: "€ 850k", jaar: "2025" },
                { titel: "Nieuwbouw kantoor Mechelen", waarde: "€ 1.2M", jaar: "2024" },
                { titel: "Restauratie dakwerken kerk", waarde: "€ 320k", jaar: "2024" },
              ].map((p) => (
                <div key={p.titel} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                  <div>
                    <div className="font-medium">{p.titel}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Antwerpen · {p.jaar}</div>
                  </div>
                  <div className="font-semibold">{p.waarde}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold mb-4">Certificeringen</h3>
            <div className="space-y-3">
              {["VCA** (2025)", "ISO 9001", "Erkend aannemer kl. 5", "BENOR partner"].map((c) => (
                <div key={c} className="flex gap-2 items-center text-sm">
                  <Award className="w-4 h-4 text-accent" /> {c}
                </div>
              ))}
            </div>
          </section>
          <section className="bg-foreground text-background rounded-2xl p-6">
            <h3 className="font-display font-semibold mb-4">Profielvolledigheid</h3>
            <div className="text-3xl font-display font-bold">87%</div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-3">
              <div className="bg-accent h-2 rounded-full" style={{ width: "87%" }} />
            </div>
            <p className="text-xs opacity-70 mt-3">Voeg je referenties toe om 100% te bereiken.</p>
          </section>
        </aside>
      </div>
    </>
  );
}
