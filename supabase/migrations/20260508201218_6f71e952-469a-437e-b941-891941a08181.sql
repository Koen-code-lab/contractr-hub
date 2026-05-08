-- Connections: company-level
ALTER TABLE public.connections
  ADD COLUMN IF NOT EXISTS requester_company_id uuid,
  ADD COLUMN IF NOT EXISTS addressee_company_id uuid,
  ALTER COLUMN addressee_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_connections_req_company ON public.connections(requester_company_id);
CREATE INDEX IF NOT EXISTS idx_connections_addr_company ON public.connections(addressee_company_id);

DROP POLICY IF EXISTS "Participants can view connections" ON public.connections;
CREATE POLICY "Participants can view connections"
ON public.connections FOR SELECT TO authenticated
USING (
  auth.uid() = requester_id
  OR auth.uid() = addressee_id
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.company_id IS NOT NULL
      AND p.company_id IN (requester_company_id, addressee_company_id)
  )
);

DROP POLICY IF EXISTS "Participants can update connections" ON public.connections;
CREATE POLICY "Participants can update connections"
ON public.connections FOR UPDATE TO authenticated
USING (
  auth.uid() = requester_id
  OR auth.uid() = addressee_id
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.company_id IS NOT NULL
      AND p.company_id IN (requester_company_id, addressee_company_id)
  )
);

-- Conversations: target a company
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS target_company_id uuid,
  ALTER COLUMN participant_b DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_target_company ON public.conversations(target_company_id);

DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations"
ON public.conversations FOR SELECT TO authenticated
USING (
  auth.uid() = participant_a
  OR auth.uid() = participant_b
  OR (
    target_company_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = target_company_id
    )
  )
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = participant_a
  OR auth.uid() = participant_b
);

-- Messages: align visibility with new conversations policy
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
ON public.messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (
        auth.uid() = c.participant_a
        OR auth.uid() = c.participant_b
        OR (
          c.target_company_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.company_id = c.target_company_id
          )
        )
      )
  )
);

DROP POLICY IF EXISTS "Senders can insert messages" ON public.messages;
CREATE POLICY "Senders can insert messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (
        auth.uid() = c.participant_a
        OR auth.uid() = c.participant_b
        OR (
          c.target_company_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.company_id = c.target_company_id
          )
        )
      )
  )
);