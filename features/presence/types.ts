export interface OnlineUser {
  userId: string;
  id: string;
  name: string;
  email: string;
  image: string | null;
  currentPage: string | null;
  lastSeenAt: string;
}

export interface PresenceRecord {
  userId: string;
  currentPage: string | null;
  lastSeenAt: string;
  isOnline: boolean;
}

export interface PresenceState {
  onlineCount: number;
  onlineUsers: OnlineUser[];
  presence: PresenceRecord[];
  isLoading: boolean;
  lastUpdatedAt: string | null;
}

export interface PresenceResponse {
  onlineCount: number;
  onlineUsers: OnlineUser[];
  presence: PresenceRecord[];
}
