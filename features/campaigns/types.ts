import type { UserIdentity } from "@/lib/user-identity";

export type CampaignStatus = "Planning" | "Active" | "Paused" | "Completed" | "Cancelled" | "Archived";
export type CampaignPriority = "Low" | "Medium" | "High" | "Critical";

export interface CampaignActivity {
  id: string;
  type: "update" | "comment" | "task" | "schedule";
  description: string;
  timestamp: string;
  userId?: string;
  author: string;
  email?: string;
  avatar?: string | null;
  initials?: string;
}

export interface Campaign {
  id: string;
  name: string;
  title?: string;
  description: string;
  status: CampaignStatus;
  priority: CampaignPriority;
  owner: string | UserIdentity;
  startDate: string;
  endDate: string;
  linkedTasks: { id: string; title: string; status: string }[];
  campaignAccounts: { id: string; name: string; platform: string; username: string }[];
  budget?: number;
  currency?: string;
  tags: string[];
  activities: CampaignActivity[];
  createdAt: string;
  updatedAt: string;
}
