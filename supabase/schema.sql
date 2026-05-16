-- OPERO Team Chat Schema
-- This schema provides the foundation for isolated, multi-tenant real-time chat.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CHAT CHANNELS
CREATE TABLE IF NOT EXISTS public.chat_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL
);

-- 2. CHAT MEMBERS
CREATE TABLE IF NOT EXISTS public.chat_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

-- 3. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MESSAGE REACTIONS
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    emoji VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- 5. USER PRESENCE
CREATE TABLE IF NOT EXISTS public.user_presence (
    user_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'offline', -- 'online', 'away', 'offline'
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_chat_messages_channel_created ON public.chat_messages(channel_id, created_at DESC);
CREATE INDEX idx_chat_members_user ON public.chat_members(user_id);
CREATE INDEX idx_chat_channels_tenant ON public.chat_channels(tenant_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- Assumptions: 
-- 1. auth.uid() returns the user's UUID.
-- 2. get_user_tenant_id() is a custom function that extracts the user's tenant_id from JWT or profile.
-- ==========================================

ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Channels Policies
CREATE POLICY "Users can view channels in their tenant" 
ON public.chat_channels FOR SELECT 
USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert channels in their tenant" 
ON public.chat_channels FOR INSERT 
WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Messages Policies
CREATE POLICY "Users can view messages in their tenant" 
ON public.chat_messages FOR SELECT 
USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert messages in their tenant" 
ON public.chat_messages FOR INSERT 
WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages FOR UPDATE 
USING (user_id = auth.uid() AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own messages" 
ON public.chat_messages FOR DELETE 
USING (user_id = auth.uid() AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Setup Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
