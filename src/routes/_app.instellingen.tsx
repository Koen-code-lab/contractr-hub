import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingState, ErrorState } from "@/components/States";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/instellingen")({
  validateSearch: z.object({
    tab: z.enum(["account", "bedrijf", "notificaties", "privacy", "facturatie", "beveiliging"]).optional(),
  }),
  component: Instellingen,
});

const TABS = [
  { id: "account", label: "Account" },
  { id: "bedrijf", label: "Bedrijf" },
  { id: "notificaties", label: "Notificaties" },
  { id: "privacy", label: "Privacy" },
  { id: "facturatie", label: "Facturatie" },
  { id: "beveiliging", label: "Beveiliging" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Instellingen() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const active: TabId = tab ?? "account";

  return (
    <>
      <PageHeader title="Instellingen" subtitle="Beheer je account, voorkeuren en privacy." />

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate({ search: { tab: t.id } })}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                active === t.id ? "bg-foreground text-background font-semibold" : "hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {active === "account" && <AccountSection />}
          {active === "bedrijf" && <BedrijfSection />}
          {active === "notificaties" && <NotificatiesSection />}
          {active === "privacy" && <PrivacySection />}
          {active === "facturatie" && <FacturatieSection />}
          {active === "beveiliging" && <BeveiligingSection />}
        </div>
      </div>
    </>
  );
}

/* ---------------- Account ---------------- */

function AccountSection() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ full_name: "", phone: "", region: "", bio: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        region: data.region ?? "",
        bio: data.bio ?? "",
      });
    }
  }, [data]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: form.full_name || null,
        phone: form.phone || null,
        region: form.region || null,
        bio: form.bio || null,
      },
      { onConflict: "id" },
    );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account opgeslagen");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-lg mb-4">Accountgegevens</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Volledige naam" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
        <Field label="Email" value={user?.email ?? ""} onChange={() => {}} disabled />
        <Field label="Telefoon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Field label="Regio" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-2">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-muted text-sm outline-none resize-none"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Opslaan…" : "Opslaan"}
        </button>
      </div>
    </section>
  );
}

/* ---------------- Bedrijf ---------------- */

function BedrijfSection() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const companyId = profile?.company_id ?? null;

  const { data: company, isLoading, error } = useQuery({
    queryKey: ["company", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("*").eq("id", companyId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    name: "",
    vat_number: "",
    region: "",
    address: "",
    city: "",
    postal_code: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name ?? "",
        vat_number: company.vat_number ?? "",
        region: company.region ?? "",
        address: company.address ?? "",
        city: company.city ?? "",
        postal_code: company.postal_code ?? "",
        description: company.description ?? "",
      });
    }
  }, [company]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let id = companyId;
      if (!id) {
        const { data, error } = await supabase
          .from("companies")
          .insert({ name: form.name || "Nieuw bedrijf" })
          .select("id")
          .single();
        if (error) throw error;
        id = data.id;
        const { error: pErr } = await supabase
          .from("profiles")
          .upsert({ id: user.id, company_id: id }, { onConflict: "id" });
        if (pErr) throw pErr;
      }
      const { error: uErr } = await supabase
        .from("companies")
        .update({
          name: form.name || "Nieuw bedrijf",
          vat_number: form.vat_number || null,
          region: form.region || null,
          address: form.address || null,
          city: form.city || null,
          postal_code: form.postal_code || null,
          description: form.description || null,
        })
        .eq("id", id!);
      if (uErr) throw uErr;
      toast.success("Bedrijf opgeslagen");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
      qc.invalidateQueries({ queryKey: ["company"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-lg mb-1">Bedrijfsgegevens</h3>
      {!companyId && (
        <p className="text-sm text-muted-foreground mb-4">
          Nog geen bedrijf gekoppeld. Vul de gegevens in en klik op opslaan om een bedrijf aan te maken.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Field label="Bedrijfsnaam" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="BTW-nummer" value={form.vat_number} onChange={(v) => setForm({ ...form, vat_number: v })} />
        <Field label="Regio" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
        <Field label="Adres" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Field label="Stad" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Field label="Postcode" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-2">Beschrijving</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-muted text-sm outline-none resize-none"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Opslaan…" : "Opslaan"}
        </button>
      </div>
    </section>
  );
}

/* ---------------- Other tabs ---------------- */

function NotificatiesSection() {
  const [prefs, setPrefs] = useState([
    { l: "Nieuwe opdrachten in je regio", d: true },
    { l: "Reacties op je publicaties", d: true },
    { l: "Wekelijkse netwerk samenvatting", d: false },
    { l: "Productupdates en nieuws", d: false },
  ]);
  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-lg mb-4">Notificatievoorkeuren</h3>
      <div className="space-y-4">
        {prefs.map((n, i) => (
          <label key={n.l} className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm">{n.l}</span>
            <button
              type="button"
              onClick={() => setPrefs(prefs.map((p, idx) => (idx === i ? { ...p, d: !p.d } : p)))}
              className={`relative w-11 h-6 rounded-full transition-colors ${n.d ? "bg-accent" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${n.d ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </label>
        ))}
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-lg mb-2">Privacy</h3>
      <p className="text-sm text-muted-foreground">Bepaal wie je profiel en publicaties kan zien. Deze instellingen volgen binnenkort.</p>
    </section>
  );
}

function FacturatieSection() {
  return (
    <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
      <h3 className="font-display font-semibold text-lg mb-2">Facturatie</h3>
      <p className="text-sm text-muted-foreground">Je gebruikt momenteel het gratis plan. Facturatieopties volgen binnenkort.</p>
    </section>
  );
}

function BeveiligingSection() {
  const { signOut } = useAuth();
  return (
    <div className="space-y-6">
      <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
        <h3 className="font-display font-semibold text-lg mb-2">Sessie</h3>
        <p className="text-sm text-muted-foreground mb-4">Log uit op dit apparaat.</p>
        <button onClick={() => signOut()} className="px-5 py-2.5 rounded-full bg-muted text-sm font-medium">
          Uitloggen
        </button>
      </section>
      <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
        <h3 className="font-display font-semibold text-lg mb-2">Gevarenzone</h3>
        <p className="text-sm text-muted-foreground mb-4">Account verwijderen kan niet ongedaan worden gemaakt.</p>
        <button className="px-5 py-2.5 rounded-full bg-destructive text-destructive-foreground text-sm font-medium">
          Account verwijderen
        </button>
      </section>
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-2">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-11 px-4 rounded-xl bg-muted text-sm outline-none disabled:opacity-60"
      />
    </div>
  );
}
