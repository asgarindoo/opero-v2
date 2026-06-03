export type RoleType = "Owner" | "Admin" | "Staff";
export type MemberStatus = "active" | "invited" | "suspended";

export interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: RoleType;
  status: MemberStatus;
  department?: string;
  jobTitle?: string;
  initials: string;
  joinedAt?: string;
  lastActive?: string;
  presenceLastSeenAt?: string;
  isOnline?: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  target?: string;
  timestamp: string;
}

export interface InviteLink {
  id: string;
  url: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
  uses: number;
}
