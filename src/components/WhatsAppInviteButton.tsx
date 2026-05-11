import { useState } from "react";
import { MessageCircle, Copy, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  createInvitation,
  inviteLink,
  buildWhatsAppMessage,
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

type FallbackData = { link: string; message: string };

function waUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function copy(text: string, label: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} gekopieerd`),
      () => toast.error("Kopiëren mislukt"),
    );
  }
}

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
  const [fallback, setFallback] = useState<FallbackData | null>(null);

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
      const message = buildWhatsAppMessage(type, link);

      // 1) Try native share (mobile + some desktop browsers)
      const nav = typeof navigator !== "undefined" ? navigator : undefined;
      if (nav && typeof nav.share === "function") {
        try {
          await nav.share({ title: "CONTRACTR uitnodiging", text: message, url: link });
          return;
        } catch (err) {
          // user cancelled or share failed; fall through
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }

      // 2) Try opening WhatsApp directly in a new tab
      let opened: Window | null = null;
      try {
        opened = window.open(waUrl(message), "_blank", "noopener,noreferrer");
      } catch {
        opened = null;
      }
      if (!opened || opened.closed || typeof opened.closed === "undefined") {
        // 3) Popup blocked or iframe-restricted — show fallback modal
        setFallback({ link, message });
        return;
      }
      toast.success("WhatsApp geopend");
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
    <>
      <button
        onClick={onClick}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-medium disabled:opacity-50 transition-colors ${sizeCls} ${variantCls} ${className ?? ""}`}
      >
        <MessageCircle className="w-4 h-4" />
        {busy ? "Bezig…" : (label ?? (type === "team_member" ? "Nodig teamlid uit via WhatsApp" : "Nodig bedrijf uit"))}
      </button>

      {fallback && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setFallback(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-2xl border border-border shadow-card p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-semibold text-lg">Deel je uitnodiging</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  WhatsApp kon niet automatisch openen. Kopieer hieronder de link of het bericht.
                </p>
              </div>
              <button
                onClick={() => setFallback(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                aria-label="Sluiten"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Uitnodigingslink</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={fallback.link}
                  className="flex-1 h-10 px-3 rounded-lg bg-muted text-xs outline-none"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={() => copy(fallback.link, "Link")}
                  className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-muted hover:bg-muted/70 text-xs font-medium"
                >
                  <Copy className="w-3.5 h-3.5" /> Kopieer
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Bericht</label>
              <textarea
                readOnly
                value={fallback.message}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-muted text-xs outline-none resize-none"
                onFocus={(e) => e.currentTarget.select()}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copy(fallback.message, "Bericht")}
                  className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-muted hover:bg-muted/70 text-xs font-medium"
                >
                  <Copy className="w-3.5 h-3.5" /> Kopieer bericht
                </button>
                <a
                  href={waUrl(fallback.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-[#25D366] text-white text-xs font-medium hover:opacity-90"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
