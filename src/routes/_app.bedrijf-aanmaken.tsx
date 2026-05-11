import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { BELGIAN_REGIONS } from "@/lib/regions";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/_app/bedrijf-aanmaken")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: BedrijfAanmaken,
});

const COMPANY_TYPES = [
  "Algemeen aannemer",
  "Onderaannemer",
  "Studiebureau",
  "Architect",
  "Bouwheer / Opdrachtgever",
  "Materieelverhuur",
  "Leverancier",
  "Andere",
];

function BedrijfAanmaken() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { redirect } = Route.useSearch();

  const [name, setName] = useState("");
  const [companyType, setCompanyType] = useState(COMPANY_TYPES[0]);
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [employees, setEmployees] = useState("");
  const [certifications, setCertifications] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Log eerst in."); return; }
    if (!name.trim()) { toast.error("Bedrijfsnaam is verplicht."); return; }
    if (!companyType) { toast.error("Kies een type bedrijf."); return; }
    if (!region) { toast.error("Kies een provincie."); return; }
    setSaving(true);
    try {
      const { data: created, error } = await supabase
        .from("companies")
        .insert({
          name: name.trim(),
          company_type: companyType,
          type: companyType,
          region,
          description: description.trim() || null,
          employees: employees ? Number(employees) : null,
          certifications: certifications
            ? certifications.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          logo_url: logoUrl.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: pErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id, company_id: created.id }, { onConflict: "id" });
      if (pErr) throw pErr;

      toast.success("Bedrijfsprofiel aangemaakt.");
      qc.invalidateQueries({ queryKey: ["my-company-id"] });
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
      qc.invalidateQueries({ queryKey: ["companies"] });

      if (redirect && redirect.startsWith("/")) {
        window.location.href = redirect;
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Aanmaken mislukt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Maak je bedrijfsprofiel"
        subtitle="Een gekoppeld bedrijf is nodig om opdrachten te plaatsen, te verbinden en berichten te sturen."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="lg:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-card space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2">Bedrijfsnaam *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Bv. BouwPartners BV" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Type bedrijf *</label>
              <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
                {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Provincie *</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none">
                <option value="">Kies provincie...</option>
                {BELGIAN_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Aantal medewerkers</label>
              <input value={employees} onChange={(e) => setEmployees(e.target.value)} type="number" min={0} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" placeholder="12" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Logo URL</label>
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Certificaten</label>
            <input value={certifications} onChange={(e) => setCertifications(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none" placeholder="VCA, ISO 9001, BA5 (komma-gescheiden)" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Beschrijving</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl bg-muted text-sm outline-none" placeholder="Wat doet je bedrijf? Specialisaties, ervaring..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
              {saving ? "Bezig..." : "Bedrijfsprofiel aanmaken"}
            </button>
          </div>
        </form>

        <aside className="bg-card rounded-2xl border border-border p-6 shadow-card h-fit">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5 text-accent-foreground" />
          </div>
          <h3 className="font-display font-semibold text-lg">Waarom?</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Een geverifieerd bedrijfsprofiel maakt je herkenbaar in het netwerk en is voorwaardelijk om opdrachten te plaatsen, capaciteit aan te bieden en te communiceren.
          </p>
          <ul className="text-sm space-y-3 mt-5">
            {["Bedrijfsnaam zichtbaar", "Provincie voor matching", "Type voor filtering", "Daarna alles ontgrendeld"].map((t) => (
              <li key={t} className="flex gap-2"><span className="text-accent">●</span>{t}</li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
