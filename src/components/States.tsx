export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-10 text-center shadow-card">
      <div className="font-display font-semibold text-lg">{title}</div>
      {description && <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{description}</p>}
    </div>
  );
}

export function LoadingState({ label = "Laden…" }: { label?: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-10 text-center shadow-card text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : "Er ging iets mis.";
  return (
    <div className="bg-card rounded-2xl border border-destructive/30 p-6 text-sm text-destructive shadow-card">
      {msg}
    </div>
  );
}
