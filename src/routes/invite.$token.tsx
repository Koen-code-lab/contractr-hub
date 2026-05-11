import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Construction, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { LoadingState } from "@/components/States";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$token")({
  component: AcceptInvite,
});

function AcceptInvite() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);

  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ["invitation", token, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_invitations")
        .select("*, company:companies(id, name, logo_url)")
        .eq("token", token)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", search: { redirect: `/invite/${token}` } as never });
    }
  }, [loading, user, navigate, token]);

  const inviteType = (invitation as { type?: string } | null | undefined)?.type ?? "team_member";

  const onAcceptTeam = async () => {
    if (!user || !invitation || !invitation.company_id) return;
    setAccepting(true);
    try {
      const { error: mErr } = await supabase.from("company_members").insert({
        company_id: invitation.company_id,
        user_id: user.id,
        role: invitation.role,
        status: "active",
      });
      if (mErr && !/duplicate/i.test(mErr.message)) throw mErr;

      const { data: prof } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      if (!prof?.company_id) {
        await supabase.from("profiles").update({ company_id: invitation.company_id }).eq("id", user.id);
      }

      await supabase
        .from("company_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      toast.success("Uitnodiging geaccepteerd");
      setDone(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Accepteren mislukt");
    } finally {
      setAccepting(false);
    }
  };

  const onAcceptCompany = async () => {
    if (!user || !invitation) return;
    setAccepting(true);
    try {
      await supabase
        .from("company_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);
      toast.success("Welkom op CONTRACTR!");
      // Check if user already has a company
      const { data: prof } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      setDone(true);
      setTimeout(() => {
        if (prof?.company_id) navigate({ to: "/dashboard" });
        else navigate({ to: "/bedrijf-aanmaken" });
      }, 1200);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Accepteren mislukt");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || !user) return <LoadingState />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center">
            <Construction className="w-6 h-6 text-accent-foreground" />
          </div>
          <div className="font-display font-bold text-2xl tracking-tight">CONTRACTR</div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error || !invitation ? (
          <div className="text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="font-display font-semibold text-xl">Uitnodiging niet gevonden</h2>
            <p className="text-sm text-muted-foreground">
              Deze link is mogelijk al gebruikt of ingetrokken.
            </p>
            <Link to="/dashboard" className="inline-block mt-2 text-sm underline">
              Naar dashboard
            </Link>
          </div>
        ) : invitation.status !== "pending" ? (
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
            <h2 className="font-display font-semibold text-xl">Reeds geaccepteerd</h2>
            <Link to="/dashboard" className="inline-block mt-2 text-sm underline">
              Naar dashboard
            </Link>
          </div>
        ) : done ? (
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-accent mx-auto" />
            <h2 className="font-display font-semibold text-xl">
              {inviteType === "team_member" ? "Welkom in het team!" : "Welkom op CONTRACTR!"}
            </h2>
            <p className="text-sm text-muted-foreground">Je wordt doorgestuurd…</p>
          </div>
        ) : inviteType === "company_invite" ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-accent/40 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="font-display font-semibold text-2xl">Welkom op CONTRACTR</h2>
            <p className="text-sm text-muted-foreground">
              Je bent uitgenodigd om je bedrijf aan te sluiten bij CONTRACTR — het netwerk voor de Belgische bouwsector.
            </p>
            <button
              onClick={onAcceptCompany}
              disabled={accepting}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {accepting ? "Bezig…" : "Bedrijfsprofiel aanmaken"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-2xl">Je bent uitgenodigd</h2>
            <p className="text-sm text-muted-foreground">
              Word lid van <strong>{invitation.company?.name ?? "dit bedrijf"}</strong> als{" "}
              <span className="capitalize">{invitation.role}</span>.
            </p>
            {invitation.email && (
              <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                Uitgenodigd e-mailadres: <strong>{invitation.email}</strong>
                {user.email && user.email.toLowerCase() !== invitation.email.toLowerCase() && (
                  <div className="text-destructive mt-1">
                    Let op: je bent ingelogd als {user.email}.
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onAcceptTeam}
              disabled={accepting}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {accepting ? "Bezig…" : "Uitnodiging accepteren"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
