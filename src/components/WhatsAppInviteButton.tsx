import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  createInvitation,
  inviteLink,
  buildWhatsAppMessage,
  openWhatsApp,
  type InviteType,
} from "@/lib/whatsappInvite";
import type { CompanyRole } from "@/lib/team";

type Props = {
  type: InviteType;
  companyId?: string | null;
  invitedByCompanyId?: string | null;
  role?: CompanyRole;
  email?: string | null;
  label?: string;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
};

export function WhatsAppInviteButton({
  type,
  companyId,
  invitedByCompanyId,
  role,
  email,
  label,
  className,
  variant = "primary",
  size = "md",
}: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (!user) {
      toast.error("Je moet ingelogd zijn om uit te nodigen.");
      return;
    }
    setBusy(true);
    try {
      const inv = await createInvitation({
        type,
        invitedByUserId: user.id,
        invitedByCompanyId: invitedByCompanyId ?? null,
        companyId: companyId ?? null,
        email: email ?? null,
        role: role ?? "member",
      });
      const link = inviteLink(inv.token);
      const msg = buildWhatsAppMessage(type, link);
      openWhatsApp(msg);
      toast.success("WhatsApp geopend met uitnodigingslink");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Uitnodiging aanmaken mislukt");
    } finally {
      setBusy(false);
    }
  };

  const sizeCls = size === "sm" ? "h-9 px-3 text-xs" : "h-10 px-4 text-sm";
  const variantCls =
    variant === "primary"
      ? "bg-[#25D366] text-white hover:opacity-90"
      : variant === "outline"
        ? "border border-border bg-card hover:bg-muted text-foreground"
        : "bg-muted hover:bg-muted/70 text-foreground";

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium disabled:opacity-50 transition-colors ${sizeCls} ${variantCls} ${className ?? ""}`}
    >
      <MessageCircle className="w-4 h-4" />
      {busy ? "Bezig…" : (label ?? (type === "team_member" ? "Nodig teamlid uit via WhatsApp" : "Nodig bedrijf uit"))}
    </button>
  );
}
