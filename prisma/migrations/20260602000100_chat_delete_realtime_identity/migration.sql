-- Supabase Realtime DELETE payloads only include primary keys unless replica
-- identity is FULL. Chat clients use old row data to route delete events to
-- the right channel, so keep the old tuple available for realtime delivery.
ALTER TABLE "chat_message" REPLICA IDENTITY FULL;
ALTER TABLE "chat_channel" REPLICA IDENTITY FULL;
