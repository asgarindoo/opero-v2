export type ActivityCategory = "INFO" | "UPDATE" | "WARNING" | "AUTOMATION" | "SECURITY";
export type ActivityModule = "TASKS" | "MARKETING" | "TEAM" | "FINANCE" | "DOCUMENTS" | "SYSTEM" | "SALES" | "CAMPAIGNS" | "FLOWS" | "GOALS";
export type ActionType = "Created" | "Updated" | "Deleted" | "Completed" | "Signed" | "Triggered" | "Invited" | "Uploaded" | "Connected" | "Published" | "Archived" | "Approved" | "Sent";

export interface ActivityLog {
  id: string;
  category: ActivityCategory;
  module: ActivityModule;
  action: ActionType;
  entityName: string;
  entityType: string;
  entityId: string;
  user: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
  description?: string;
}

export interface ActivityGroup {
  date: string;
  activities: ActivityLog[];
}
