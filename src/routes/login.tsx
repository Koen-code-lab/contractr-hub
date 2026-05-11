import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Construction, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: Login,
});

function Login() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const target = redirect && redirect.startsWith("/") ? redirect : "/dashboard";
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: target, replace: true });
  }, [user, navigate, target]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
        else navigate({ to: target, replace: true });
      } else if (mode === "register") {
        const { error } = await signUp(email, password, fullName);
        if (error) setError(error.message);
        else setInfo("Account aangemaakt. Controleer je e-mail om je adres te bevestigen.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) setError(error.message);
        else setInfo("Als dit e-mailadres bestaat, hebben we een herstellink verzonden. Controleer je inbox.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 80% 20%, oklch(0.83 0.16 90 / 0.6), transparent 60%)",
        }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
              <Construction className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl tracking-tight">CONTRACTR</div>
              <div className="text-xs uppercase tracking-[0.2em] opacity-60">Bouw netwerk België</div>
            </div>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-5xl font-display font-bold tracking-tight leading-tight">
            Het netwerk dat<br />
            <span className="text-accent">de Belgische bouw</span><br />
            in beweging brengt.
          </h1>
          <p className="mt-6 text-lg opacity-80 max-w-md">
            Match opdrachten met capaciteit. Bouw je netwerk. Groei sneller met geverifieerde partners.
          </p>
        </div>
        <div className="relative text-xs opacity-60">© 2026 CONTRACTR. Antwerpen — Brussel — Gent.</div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <Construction className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="font-display font-bold text-xl">CONTRACTR</div>
          </div>

          <div className="flex gap-1 p-1 bg-muted rounded-full mb-8 w-fit">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); setInfo(null); }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === m ? "bg-card shadow-card" : "text-muted-foreground"}`}
              >
                {m === "login" ? "Inloggen" : "Registreren"}
              </button>
            ))}
          </div>

          <h2 className="text-3xl font-display font-bold tracking-tight">
            {mode === "login" ? "Welkom terug" : "Maak je account"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {mode === "login" ? "Log in om verder te gaan op CONTRACTR." : "Word lid van het netwerk voor de Belgische bouw."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            {mode === "register" && (
              <div>
                <label className="text-sm font-medium block mb-2">Volledige naam</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jan Janssens"
                  className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium block mb-2">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@bedrijf.be"
                className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Wachtwoord</label>
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

            {error && <div className="text-sm text-destructive">{error}</div>}
            {info && <div className="text-sm text-success">{info}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Even geduld…" : mode === "login" ? "Inloggen" : "Account aanmaken"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Door verder te gaan, ga je akkoord met onze <a className="underline">Voorwaarden</a> en <a className="underline">Privacy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
