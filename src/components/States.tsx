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
  const msg =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message ?? "Er ging iets mis.")
        : "Er ging iets mis.";
  const details =
    error && typeof error === "object" && "details" in error
      ? String((error as { details?: unknown }).details ?? "")
      : "";
  const hint =
    error && typeof error === "object" && "hint" in error
      ? String((error as { hint?: unknown }).hint ?? "")
      : "";
  return (
    <div className="bg-card rounded-2xl border border-destructive/30 p-6 text-sm text-destructive shadow-card space-y-1">
      <div className="font-semibold">Er ging iets mis</div>
      <div className="opacity-90 break-words">{msg}</div>
      {details && <div className="text-xs opacity-70 break-words">{details}</div>}
      {hint && <div className="text-xs opacity-70 break-words">Hint: {hint}</div>}
    </div>
  );
}
