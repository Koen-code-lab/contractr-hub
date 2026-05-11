import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Send, Search, Paperclip } from "lucide-react";
import { useConversations, useMessages } from "@/lib/queries";
import { EmptyState } from "@/components/States";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { CompanyAvatar } from "@/components/CompanyAvatar";

export const Route = createFileRoute("/_app/berichten")({
  validateSearch: (s: Record<string, unknown>) => ({ c: typeof s.c === "string" ? s.c : undefined }),
  component: Berichten,
});

function Berichten() {
  const { user } = useAuth();
  const { c: deepLinkId } = Route.useSearch();
  const { data: conversations, isLoading, error } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const currentId = activeId ?? deepLinkId ?? conversations?.[0]?.id ?? null;
  const { data: messages } = useMessages(currentId);
  const [draft, setDraft] = useState("");
  const qc = useQueryClient();

  const send = async () => {
    if (!draft.trim() || !currentId || !user) return;
    const body = draft.trim();
    setDraft("");
    await supabase.from("messages").insert({ conversation_id: currentId, sender_id: user.id, body });
    qc.invalidateQueries({ queryKey: ["messages", currentId] });
  };

  return (
    <>
      <PageHeader title="Berichten" subtitle="Communiceer rechtstreeks met je netwerk." />

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden grid md:grid-cols-[320px_1fr] h-[640px]">
        <div className="border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Zoek gesprek..." className="w-full h-10 pl-10 pr-4 rounded-full bg-muted text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && <div className="p-4 text-sm text-muted-foreground">Laden…</div>}
            {error && <div className="p-4 text-sm text-destructive">Kon gesprekken niet laden.</div>}
            {!isLoading && conversations?.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground text-center">Nog geen gesprekken.</div>
            )}
            {conversations?.map((c) => {
              const isActive = c.id === currentId;
              const title = (c as { display_title?: string }).display_title ?? "Gesprek";
              const subject = (c as { subject?: string | null }).subject ?? null;
              const last = (c as { last_message?: { body: string; created_at: string } | null }).last_message;
              const initials = title.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 ${isActive ? "bg-muted/40" : ""}`}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-sm truncate">{title}</div>
                        <div className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(last?.created_at ?? c.last_message_at).toLocaleDateString("nl-BE", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                      {subject && <div className="text-[11px] text-muted-foreground truncate italic">{subject}</div>}
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {last?.body ?? "Nog geen berichten"}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          {!currentId ? (
            <div className="flex-1 flex items-center justify-center p-10">
              <EmptyState title="Selecteer een gesprek" description="Begin een gesprek vanuit een profiel of bedrijf." />
            </div>
          ) : (
            <>
              {(() => {
                const active = conversations?.find((c) => c.id === currentId);
                const title = (active as { display_title?: string } | undefined)?.display_title ?? "Gesprek";
                const subject = (active as { subject?: string | null } | undefined)?.subject ?? null;
                const initials = title.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">{initials}</div>
                    <div>
                      <div className="font-semibold text-sm">{title}</div>
                      {subject && <div className="text-[11px] text-muted-foreground italic">{subject}</div>}
                      <div className="text-xs text-muted-foreground">{messages?.length ?? 0} berichten</div>
                    </div>
                  </div>
                );
              })()}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
                {messages?.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center">Nog geen berichten in dit gesprek.</div>
                )}
                {messages?.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-foreground text-background" : "bg-card border border-border"}`}>
                        <div>{m.body}</div>
                        <div className={`text-[10px] mt-1 ${mine ? "opacity-60" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="p-4 border-t border-border flex gap-2 items-center"
              >
                <button type="button" className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"><Paperclip className="w-4 h-4" /></button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Schrijf een bericht..."
                  className="flex-1 h-11 px-4 rounded-full bg-muted text-sm outline-none"
                />
                <button type="submit" className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center"><Send className="w-4 h-4" /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
