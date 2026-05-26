export type CampaignStatus = "Planning" | "Active" | "Paused" | "Completed" | "Cancelled" | "Archived";
export type CampaignPriority = "Low" | "Medium" | "High" | "Critical";

export interface CampaignActivity {
  id: string;
  type: "update" | "goal" | "comment" | "staff_change" | "task" | "schedule";
  description: string;
  timestamp: string;
  author: string;
}

export interface CampaignGoal {
  id: string;
  description: string;
  isCompleted: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  priority: CampaignPriority;
  owner: string;
  startDate: string;
  endDate: string;
  assignedStaff: string[]; // List of names
  linkedTasks: { id: string; title: string; status: string }[];
  campaignAccounts: { id: string; name: string; platform: string; username: string }[];
  budget?: number;
  currency?: string;
  tags: string[];
  goals: CampaignGoal[];
  activities: CampaignActivity[];
  attachments: string[]; // URLs or file names
  notes: string;
  createdAt: string;
  updatedAt: string;
}
