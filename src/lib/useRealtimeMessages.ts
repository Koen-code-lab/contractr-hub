import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

/**
 * Global realtime subscription for messages.
 * Mounted once at the app shell. RLS on the messages table restricts
 * delivery to conversations the current user participates in.
 */
export function useRealtimeMessages() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;
    if (channelRef.current) return;

    const channel = supabase
      .channel(`messages-rt-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as MessageRow;
          if (!msg?.id) return;

          // Update active conversation thread (dedupe by id).
          qc.setQueriesData<MessageRow[]>(
            { queryKey: ["messages", msg.conversation_id] },
            (prev) => {
              if (!prev) return prev;
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            },
          );

          // Refresh conversation list (last message, ordering).
          qc.invalidateQueries({ queryKey: ["conversations"] });

          // Toast for incoming messages from others.
          if (msg.sender_id !== user.id) {
            const activeId = (qc.getQueryData(["active-conversation"]) as string | undefined) ?? null;
            if (activeId !== msg.conversation_id) {
              toast("Nieuw bericht", {
                description: msg.body.length > 80 ? msg.body.slice(0, 80) + "…" : msg.body,
              });
            }
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user, qc]);
}
