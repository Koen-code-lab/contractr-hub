import { Activity, Briefcase, HardHat, Sparkles } from "lucide-react";

const regios = [
  { naam: "Antwerpen", capaciteit: 48, opdrachten: 12, matches: 9 },
  { naam: "Oost-Vlaanderen", capaciteit: 36, opdrachten: 8, matches: 6 },
  { naam: "West-Vlaanderen", capaciteit: 22, opdrachten: 5, matches: 3 },
  { naam: "Vlaams-Brabant", capaciteit: 31, opdrachten: 9, matches: 7 },
  { naam: "Limburg", capaciteit: 18, opdrachten: 4, matches: 2 },
  { naam: "Brussel", capaciteit: 27, opdrachten: 11, matches: 8 },
  { naam: "Henegouwen", capaciteit: 19, opdrachten: 6, matches: 4 },
  { naam: "Luik", capaciteit: 24, opdrachten: 7, matches: 5 },
];

export function RegionActivity({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-card rounded-2xl border border-border shadow-card overflow-hidden ${className}`}>
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Activity className="w-4 h-4" /> Activiteit per regio
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live overzicht in België</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground font-medium">Vandaag</span>
      </div>

      <div className="grid grid-cols-3 text-xs uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">
        <div className="px-6 py-2.5 col-span-1">Regio</div>
        <div className="px-3 py-2.5 text-right flex items-center justify-end gap-1"><HardHat className="w-3 h-3" /> Cap.</div>
        <div className="px-3 py-2.5 text-right flex items-center justify-end gap-1"><Briefcase className="w-3 h-3" /> Opdr.</div>
      </div>

      <ul className="divide-y divide-border">
        {regios.map((r) => (
          <li key={r.naam} className="grid grid-cols-3 items-center text-sm hover:bg-muted/30 transition-colors">
            <div className="px-6 py-3 font-medium">{r.naam}</div>
            <div className="px-3 py-3 text-right tabular-nums">{r.capaciteit}</div>
            <div className="px-3 py-3 text-right tabular-nums flex items-center justify-end gap-2">
              <span>{r.opdrachten}</span>
              <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">
                <Sparkles className="w-2.5 h-2.5" /> {r.matches}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-6 py-4 border-t border-border grid grid-cols-3 gap-2 text-center bg-muted/20">
        <div>
          <div className="text-lg font-display font-bold">225</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Capaciteit</div>
        </div>
        <div>
          <div className="text-lg font-display font-bold">62</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Opdrachten</div>
        </div>
        <div>
          <div className="text-lg font-display font-bold text-accent-foreground">44</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Matches</div>
        </div>
      </div>
    </div>
  );
}
