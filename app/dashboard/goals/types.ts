export type GoalStatus = "on-track" | "at-risk" | "behind" | "completed";
export type Priority = "low" | "medium" | "high" | "critical";

export interface User {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  status: GoalStatus;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface LinkedItem {
  id: string;
  type: "task" | "flow" | "project";
  title: string;
  status: string;
  url?: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: "comment" | "status_change" | "progress_update" | "milestone_completed";
  content: string;
  timestamp: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  priority: Priority;
  ownerId: string;
  collaboratorIds: string[];
  startDate: string;
  targetDate: string;
  progress: number; // Auto-calculated in context based on Key Results
  
  keyResults: KeyResult[];
  milestones: Milestone[];
  linkedItems: LinkedItem[];
  activities: Activity[];
  
  parentId?: string; // For hierarchy
}
