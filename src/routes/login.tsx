import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Construction, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left visual */}
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
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[{ v: "12.4k+", l: "Bedrijven" }, { v: "850M+", l: "Volume" }, { v: "98%", l: "Geverifieerd" }].map((s) => (
              <div key={s.l}>
                <div className="text-3xl font-display font-bold">{s.v}</div>
                <div className="text-xs opacity-60 uppercase tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs opacity-60">© 2026 CONTRACTR. Antwerpen — Brussel — Gent.</div>
      </div>

      {/* Right form */}
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
                onClick={() => { setMode(m); setStep(1); }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${mode === m ? "bg-card shadow-card" : "text-muted-foreground"}`}
              >
                {m === "login" ? "Inloggen" : "Registreren"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <>
              <h2 className="text-3xl font-display font-bold tracking-tight">Welkom terug</h2>
              <p className="text-muted-foreground mt-2">Log in om verder te gaan op CONTRACTR.</p>
              <form className="mt-8 space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">E-mail</label>
                  <input type="email" placeholder="naam@bedrijf.be" className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Wachtwoord</label>
                  <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex justify-between text-sm">
                  <label className="flex gap-2 items-center"><input type="checkbox" /> Onthoud mij</label>
                  <a className="font-medium hover:underline" href="#">Wachtwoord vergeten?</a>
                </div>
                <Link to="/dashboard" className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90">
                  Inloggen <ArrowRight className="w-4 h-4" />
                </Link>
              </form>
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? "bg-accent" : "bg-muted"}`} />
                ))}
              </div>
              <h2 className="text-3xl font-display font-bold tracking-tight">
                {step === 1 && "Maak je account"}
                {step === 2 && "Vertel over je bedrijf"}
                {step === 3 && "Bijna klaar"}
              </h2>
              <p className="text-muted-foreground mt-2">Stap {step} van 3</p>

              <form className="mt-8 space-y-4">
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Voornaam" className="h-12 px-4 rounded-xl bg-muted text-sm outline-none" />
                      <input placeholder="Achternaam" className="h-12 px-4 rounded-xl bg-muted text-sm outline-none" />
                    </div>
                    <input type="email" placeholder="E-mail" className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none" />
                    <input type="password" placeholder="Wachtwoord" className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none" />
                  </>
                )}
                {step === 2 && (
                  <>
                    <input placeholder="Bedrijfsnaam" className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none" />
                    <input placeholder="BTW-nummer (BE0...)" className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none" />
                    <select className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none">
                      <option>Type bedrijf</option>
                      <option>Algemeen aannemer</option>
                      <option>Onderaannemer</option>
                      <option>Studiebureau</option>
                      <option>Materieelverhuur</option>
                    </select>
                    <select className="w-full h-12 px-4 rounded-xl bg-muted text-sm outline-none">
                      <option>Regio</option>
                      <option>Antwerpen</option>
                      <option>Brussel</option>
                      <option>Vlaanderen</option>
                      <option>Wallonië</option>
                    </select>
                  </>
                )}
                {step === 3 && (
                  <div className="space-y-3">
                    {["Funderingen & Ruwbouw", "Afwerking", "Technieken (HVAC, elec, sanitair)", "Materieel & Verhuur", "Studiebureau & Advies"].map((s) => (
                      <label key={s} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-foreground/30 cursor-pointer">
                        <input type="checkbox" className="accent-current" />
                        <span className="text-sm font-medium flex-1">{s}</span>
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="flex-1 h-12 rounded-full bg-muted font-semibold">
                      Terug
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={() => setStep(step + 1)} className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2">
                      Volgende <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link to="/dashboard" className="flex-1 h-12 rounded-full bg-accent text-accent-foreground font-semibold inline-flex items-center justify-center gap-2">
                      Aanmaken <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </form>
            </>
          )}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Door verder te gaan, ga je akkoord met onze <a className="underline">Voorwaarden</a> en <a className="underline">Privacy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
