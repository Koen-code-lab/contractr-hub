import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Send, Search, Paperclip } from "lucide-react";

export const Route = createFileRoute("/_app/berichten")({
  component: Berichten,
});

const conversaties = [
  { naam: "Sofie Dubois", bedrijf: "BAM Belgium", laatste: "Bedankt voor je offerte!", tijd: "5m", ongelezen: 2 },
  { naam: "Willemen Group", bedrijf: "Project Mechelen", laatste: "Kunnen we morgen bellen?", tijd: "1u", ongelezen: 0 },
  { naam: "ElectroPro", bedrijf: "Voorstel BA5", laatste: "Hier is de planning...", tijd: "3u", ongelezen: 1 },
  { naam: "Marie Lemaire", bedrijf: "Studio L+M", laatste: "Zien we elkaar op de werf?", tijd: "Gisteren", ongelezen: 0 },
  { naam: "CIT Blaton", bedrijf: "Renovatie Brussel", laatste: "We accepteren je voorstel", tijd: "2d", ongelezen: 0 },
];

const messages = [
  { from: "them", text: "Dag Jan, bedankt voor je interesse in onze opdracht.", time: "10:14" },
  { from: "me", text: "Graag gedaan! Heb je de specificaties van het funderingswerk?", time: "10:15" },
  { from: "them", text: "Ja, ik stuur je het lastenboek meteen door. We zoeken een team van 6 met VCA.", time: "10:17" },
  { from: "me", text: "Perfect, dat past in onze planning. Kunnen we volgende week een werfbezoek inplannen?", time: "10:20" },
  { from: "them", text: "Bedankt voor je offerte!", time: "10:32" },
];

function Berichten() {
  return (
    <>
      <PageHeader title="Berichten" subtitle="Communiceer rechtstreeks met je netwerk." />

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden grid md:grid-cols-[320px_1fr] h-[640px]">
        {/* List */}
        <div className="border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Zoek gesprek..." className="w-full h-10 pl-10 pr-4 rounded-full bg-muted text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversaties.map((c, i) => (
              <button key={c.naam} className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 ${i === 0 ? "bg-muted/40" : ""}`}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                    {c.naam.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-sm truncate">{c.naam}</div>
                      <div className="text-xs text-muted-foreground">{c.tijd}</div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{c.bedrijf}</div>
                    <div className="text-xs mt-1 truncate flex items-center gap-2">
                      <span className="truncate">{c.laatste}</span>
                      {c.ongelezen > 0 && <span className="ml-auto bg-accent text-accent-foreground rounded-full px-1.5 text-[10px] font-bold">{c.ongelezen}</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-col min-w-0">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">SD</div>
            <div>
              <div className="font-semibold text-sm">Sofie Dubois</div>
              <div className="text-xs text-success">● Online</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.from === "me" ? "bg-foreground text-background" : "bg-card border border-border"
                }`}>
                  <div>{m.text}</div>
                  <div className={`text-[10px] mt-1 ${m.from === "me" ? "opacity-60" : "text-muted-foreground"}`}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border flex gap-2 items-center">
            <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center"><Paperclip className="w-4 h-4" /></button>
            <input placeholder="Schrijf een bericht..." className="flex-1 h-11 px-4 rounded-full bg-muted text-sm outline-none" />
            <button className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </>
  );
}
