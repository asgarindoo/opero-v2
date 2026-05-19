export type PresenceStatus = "online" | "away" | "offline";

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  status: PresenceStatus;
}

export interface ChatChannel {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  is_private: boolean;
  members?: string[];
  created_at: string;
}

export interface ChatReaction {
  id: string;
  emoji: string;
  user_id: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  attachments?: { type: string; url: string; name: string }[];
  reactions: ChatReaction[];
  created_at: string;
  edited_at?: string;
}

// For Mock Data
export interface ChatState {
  channels: ChatChannel[];
  messages: Record<string, ChatMessage[]>; // channel_id -> messages
  users: Record<string, User>; // user_id -> user
  currentUserId: string;
}
