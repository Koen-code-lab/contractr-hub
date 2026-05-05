import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Eye, MessageSquare, Edit, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/_app/mijn-publicaties")({
  component: MijnPublicaties,
});

const publicaties = [
  { titel: "Team metselaars beschikbaar Vlaanderen", type: "Capaciteit", status: "Actief", views: 487, reacties: 12, datum: "02/05/2026" },
  { titel: "Renovatie kantoorpand Brussel", type: "Opdracht", status: "Actief", views: 312, reacties: 8, datum: "28/04/2026" },
  { titel: "Kraanmachinist Liebherr LTM", type: "Capaciteit", status: "Verlopen", views: 198, reacties: 5, datum: "15/04/2026" },
  { titel: "Funderingswerken Antwerpen", type: "Opdracht", status: "Gesloten", views: 521, reacties: 14, datum: "01/04/2026" },
];

function MijnPublicaties() {
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
        {[{ l: "Totaal publicaties", v: "18" }, { l: "Actief", v: "9" }, { l: "Totaal views", v: "4.812" }, { l: "Reacties", v: "127" }].map((s) => (
          <div key={s.l} className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className="text-3xl font-display font-bold">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Publicatie</th>
              <th className="text-left px-6 py-3 font-medium">Type</th>
              <th className="text-left px-6 py-3 font-medium">Status</th>
              <th className="text-left px-6 py-3 font-medium">Views</th>
              <th className="text-left px-6 py-3 font-medium">Reacties</th>
              <th className="text-left px-6 py-3 font-medium">Datum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {publicaties.map((p, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">{p.titel}</td>
                <td className="px-6 py-4 text-muted-foreground">{p.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    p.status === "Actief" ? "bg-success/15 text-success" :
                    p.status === "Verlopen" ? "bg-muted text-muted-foreground" : "bg-foreground/10"
                  }`}>{p.status}</span>
                </td>
                <td className="px-6 py-4 text-muted-foreground"><span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{p.views}</span></td>
                <td className="px-6 py-4 text-muted-foreground"><span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{p.reacties}</span></td>
                <td className="px-6 py-4 text-muted-foreground">{p.datum}</td>
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
    </>
  );
}
