import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { MapPin, CheckCircle2, Award, Building2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BELGIAN_REGIONS } from "@/lib/regions";

export const Route = createFileRoute("/_app/mijn-profiel")({
  component: MijnProfiel,
});

type CompanyExtras = {
  employees?: number | null;
  certifications?: string[];
  recent_projects?: { titel: string; waarde: string; jaar: string }[];
};

function MijnProfiel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, company:companies(*)")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const profile = profileQ.data;
  const company = (profile as { company?: Record<string, unknown> } | null)?.company as
    | (Record<string, unknown> & CompanyExtras)
    | undefined;

  const initials = (profile?.full_name ?? user?.email ?? "JV")
    .split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  const companyName = (company?.name as string | undefined) ?? "Mijn bedrijf";
  const companyType = (company?.company_type as string | undefined) ?? (profile?.role ?? "Algemeen aannemer");
  const companyCity = (company?.city as string | undefined) ?? profile?.region ?? "België";
  const employees = (company?.employees as number | null | undefined) ?? null;
  const aboutText = (company?.description as string | undefined) ?? "";
  const specialisations = (profile?.specialisations as string[] | undefined) ?? [];
  const certifications = (company?.certifications as string[] | undefined) ?? [];
  const recentProjects = (company?.recent_projects as { titel: string; waarde: string; jaar: string }[] | undefined) ?? [];

  return (
    <>
      <PageHeader title="Mijn profiel" subtitle="Zo zien anderen jou op CONTRACTR." />

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden mb-6">
        <div className="h-44 bg-gradient-to-br from-foreground via-foreground to-foreground/80 relative">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, oklch(0.83 0.16 90 / 0.4), transparent 50%)" }} />
        </div>
        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex flex-wrap items-end gap-6 justify-between">
            <div className="flex items-end gap-5">
              <div className="w-32 h-32 rounded-3xl bg-card border-4 border-card shadow-elevated flex items-center justify-center text-3xl font-display font-bold bg-gradient-to-br from-accent to-accent/70">
                {initials}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-display font-bold">{profile?.full_name ?? "Mijn naam"}</h2>
                  <CheckCircle2 className="w-5 h-5 text-accent fill-accent/30" />
                </div>
                <div className="text-muted-foreground mt-1">{companyType} · {companyName}</div>
                <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {companyCity}</span>
                  {employees != null && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {employees} medewerkers</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Sinds {profile?.created_at ? new Date(profile.created_at).getFullYear() : "—"}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              <button className="px-5 py-2.5 rounded-full bg-muted text-sm font-medium">Profiel delen</button>
              <button
                onClick={() => setOpen(true)}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
              >
                Profiel bewerken
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold text-lg mb-3">Over ons</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {aboutText || "Voeg een omschrijving van je bedrijf toe via 'Profiel bewerken'."}
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Specialisaties</h3>
            {specialisations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen specialisaties toegevoegd.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {specialisations.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium">{s}</span>
                ))}
              </div>
            )}
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Recente projecten</h3>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen projecten toegevoegd.</p>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((p) => (
                  <div key={p.titel} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                    <div>
                      <div className="font-medium">{p.titel}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.jaar}</div>
                    </div>
                    <div className="font-semibold">{p.waarde}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-display font-semibold mb-4">Certificeringen</h3>
            {certifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen certificeringen.</p>
            ) : (
              <div className="space-y-3">
                {certifications.map((c) => (
                  <div key={c} className="flex gap-2 items-center text-sm">
                    <Award className="w-4 h-4 text-accent" /> {c}
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="bg-foreground text-background rounded-2xl p-6">
            <h3 className="font-display font-semibold mb-4">Profielvolledigheid</h3>
            <div className="text-3xl font-display font-bold">
              {Math.min(100, [companyName !== "Mijn bedrijf", aboutText, specialisations.length, certifications.length, recentProjects.length, employees != null].filter(Boolean).length * 16)}%
            </div>
            <p className="text-xs opacity-70 mt-3">Vul je profiel verder aan via 'Profiel bewerken'.</p>
          </section>
        </aside>
      </div>

      <ProfileEditDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        company={company}
        onSaved={() => qc.invalidateQueries({ queryKey: ["profile", user?.id] })}
      />
    </>
  );
}

function ProfileEditDialog({
  open, onOpenChange, profile, company, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: any;
  company: any;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    company_type: "",
    city: "",
    employees: "",
    specialisations: "",
    certifications: "",
    description: "",
    recent_projects: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      full_name: profile?.full_name ?? "",
      company_name: company?.name ?? "",
      company_type: company?.company_type ?? "",
      city: company?.city ?? "",
      employees: company?.employees != null ? String(company.employees) : "",
      specialisations: (profile?.specialisations ?? []).join(", "),
      certifications: (company?.certifications ?? []).join(", "),
      description: company?.description ?? "",
      recent_projects: ((company?.recent_projects ?? []) as any[])
        .map((p) => `${p.titel} | ${p.waarde} | ${p.jaar}`).join("\n"),
    });
  }, [open, profile, company]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Niet ingelogd");
      const specs = form.specialisations.split(",").map((s) => s.trim()).filter(Boolean);
      const certs = form.certifications.split(",").map((s) => s.trim()).filter(Boolean);
      const projects = form.recent_projects
        .split("\n").map((line) => line.trim()).filter(Boolean)
        .map((line) => {
          const [titel, waarde, jaar] = line.split("|").map((s) => s.trim());
          return { titel: titel ?? "", waarde: waarde ?? "", jaar: jaar ?? "" };
        });

      // 1. upsert company
      let companyId: string | null = company?.id ?? profile?.company_id ?? null;
      const companyPayload = {
        name: form.company_name || "Mijn bedrijf",
        company_type: form.company_type || null,
        city: form.city || null,
        employees: form.employees ? Number(form.employees) : null,
        certifications: certs,
        recent_projects: projects,
        description: form.description || null,
      };

      const companiesTable = supabase.from("companies") as any;
      if (companyId) {
        const { error } = await companiesTable.update(companyPayload).eq("id", companyId);
        if (error) throw error;
      } else if (form.company_name.trim()) {
        const { data, error } = await companiesTable.insert(companyPayload).select("id").single();
        if (error) throw error;
        companyId = data.id;
      }

      // 2. upsert profile
      const { error: pErr } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: form.full_name || null,
          specialisations: specs,
          company_id: companyId,
        }, { onConflict: "id" });
      if (pErr) throw pErr;
    },
    onSuccess: () => {
      toast.success("Profiel opgeslagen");
      onSaved();
      onOpenChange(false);
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Opslaan mislukt", { description: e?.details ?? e?.hint });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profiel bewerken</DialogTitle>
          <DialogDescription>Werk je persoonlijke en bedrijfsgegevens bij.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Naam">
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bedrijfsnaam">
              <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            </Field>
            <Field label="Type bedrijf">
              <Input value={form.company_type} onChange={(e) => setForm({ ...form, company_type: e.target.value })} placeholder="Bv. Algemeen aannemer" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Locatie (stad)">
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="Aantal medewerkers">
              <Input type="number" min="0" value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} />
            </Field>
          </div>
          <Field label="Specialisaties (komma-gescheiden)">
            <Input value={form.specialisations} onChange={(e) => setForm({ ...form, specialisations: e.target.value })} placeholder="Renovatie, Ruwbouw, Dakwerken" />
          </Field>
          <Field label="Certificeringen (komma-gescheiden)">
            <Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="VCA**, ISO 9001" />
          </Field>
          <Field label="Over ons">
            <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Recente projecten (één per regel: titel | waarde | jaar)">
            <Textarea
              rows={3}
              value={form.recent_projects}
              onChange={(e) => setForm({ ...form, recent_projects: e.target.value })}
              placeholder="Renovatie herenhuis | € 850k | 2025"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuleren</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Opslaan…" : "Opslaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
