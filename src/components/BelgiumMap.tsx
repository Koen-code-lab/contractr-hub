export function BelgiumMap({ className = "" }: { className?: string }) {
  return (
    <div className={`relative rounded-2xl bg-muted overflow-hidden border border-border ${className}`}>
      <svg viewBox="0 0 400 320" className="w-full h-full">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="oklch(0.9 0 0)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="320" fill="url(#grid)" />
        {/* Stylised Belgium silhouette */}
        <path
          d="M70 110 L110 70 L160 60 L210 80 L260 70 L310 100 L340 140 L330 190 L290 230 L240 250 L180 260 L130 240 L90 210 L60 170 Z"
          fill="oklch(0.18 0 0)"
          fillOpacity="0.06"
          stroke="oklch(0.18 0 0)"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        {/* Pins */}
        {[
          { x: 180, y: 140, label: "Brussel" },
          { x: 230, y: 110, label: "Antwerpen" },
          { x: 140, y: 130, label: "Gent" },
          { x: 250, y: 200, label: "Luik" },
          { x: 110, y: 180, label: "Kortrijk" },
          { x: 200, y: 220, label: "Namen" },
        ].map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="14" fill="oklch(0.83 0.16 90)" fillOpacity="0.25" />
            <circle cx={p.x} cy={p.y} r="5" fill="oklch(0.83 0.16 90)" stroke="oklch(0.18 0 0)" strokeWidth="1.5" />
            <text x={p.x + 10} y={p.y + 4} fontSize="10" fill="oklch(0.18 0 0)" fontWeight="600">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium border border-border">
        🇧🇪 België — Live capaciteit
      </div>
    </div>
  );
}
