import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/instellingen")({
  component: Instellingen,
});

function Instellingen() {
  return (
    <>
      <PageHeader title="Instellingen" subtitle="Beheer je account, voorkeuren en privacy." />

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <nav className="space-y-1">
          {["Account", "Bedrijf", "Notificaties", "Privacy", "Facturatie", "Beveiliging"].map((t, i) => (
            <button key={t} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm ${i === 0 ? "bg-foreground text-background font-semibold" : "hover:bg-muted"}`}>
              {t}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Accountgegevens</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { l: "Voornaam", v: "Jan" },
                { l: "Achternaam", v: "Vermeulen" },
                { l: "Email", v: "jan@vermeulenbouw.be" },
                { l: "Telefoon", v: "+32 470 12 34 56" },
              ].map((f) => (
                <div key={f.l}>
                  <label className="text-sm font-medium block mb-2">{f.l}</label>
                  <input defaultValue={f.v} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">Opslaan</button>
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Notificatievoorkeuren</h3>
            <div className="space-y-4">
              {[
                { l: "Nieuwe opdrachten in je regio", d: true },
                { l: "Reacties op je publicaties", d: true },
                { l: "Wekelijkse netwerk samenvatting", d: false },
                { l: "Productupdates en nieuws", d: false },
              ].map((n) => (
                <label key={n.l} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm">{n.l}</span>
                  <span className={`relative w-11 h-6 rounded-full transition-colors ${n.d ? "bg-accent" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${n.d ? "left-[22px]" : "left-0.5"}`} />
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold text-lg mb-2">Gevarenzone</h3>
            <p className="text-sm text-muted-foreground mb-4">Account verwijderen kan niet ongedaan worden gemaakt.</p>
            <button className="px-5 py-2.5 rounded-full bg-destructive text-destructive-foreground text-sm font-medium">Account verwijderen</button>
          </section>
        </div>
      </div>
    </>
  );
}
