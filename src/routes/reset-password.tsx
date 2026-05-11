import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Construction, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Supabase places recovery tokens in URL hash; the client auto-processes them.
    // Listen for PASSWORD_RECOVERY event or check for an active session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setValidSession(true);
        setReady(true);
      }
    });

    // Also check current session (covers case where event fired before listener attached)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValidSession(true);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Wachtwoord moet minstens 6 tekens bevatten.");
      return;
    }
    if (password !== confirm) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    toast.success("Wachtwoord succesvol gewijzigd");
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <Construction className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="font-display font-bold text-xl">CONTRACTR</div>
        </div>

        <h2 className="text-3xl font-display font-bold tracking-tight">
          Nieuw wachtwoord
        </h2>
        <p className="text-muted-foreground mt-2">
          Kies een nieuw wachtwoord voor je account.
        </p>

        {!ready ? (
          <div className="mt-8 text-sm text-muted-foreground">Bezig met laden…</div>
        ) : !validSession ? (
          <div className="mt-8 space-y-4">
            <div className="text-sm text-destructive">
              Deze herstellink is ongeldig of verlopen. Vraag een nieuwe aan.
            </div>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold"
            >
              Terug naar inloggen
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm font-medium block mb-2">Nieuw wachtwoord</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Bevestig wachtwoord</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Even geduld…" : "Wachtwoord opslaan"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
