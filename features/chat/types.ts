export type ChatChannelType = "public";
export type ChatMessageType = "text" | "system";

export interface ChatUser {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
}

export interface ChatChannel {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  type: ChatChannelType;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  clientId?: string;
  organizationId: string;
  channelId: string;
  senderId: string | null;
  content: string;
  type: ChatMessageType;
  createdAt: string;
  updatedAt: string;
  sender: ChatUser | null;
  isPending?: boolean;
}

export interface ChatState {
  channels: ChatChannel[];
  messages: Record<string, ChatMessage[]>;
}
