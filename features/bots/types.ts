export type PlatformType = "Telegram" | "WhatsApp" | "Web";
export type BotStatus = "Active" | "Disabled" | "Archived" | "Pending Setup";

export interface AutomationConfig {
  autoReplyEnabled: boolean;
  welcomeMessageEnabled: boolean;
  defaultFallbackEnabled: boolean;
}

export interface BotCommand {
  id: string;
  command: string;
  description: string;
  actionType: "Reply" | "Trigger Workflow";
}

export interface BotActivity {
  id: string;
  type: "status_changed" | "broadcast_sent" | "config_updated" | "error";
  description: string;
  timestamp: string;
  author: string;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  platform: PlatformType;
  status: BotStatus;
  token?: string; // masked in UI
  webhookUrl?: string;
  metrics: {
    messagesSent: number;
    activeWorkflows: number;
  };
  automations: AutomationConfig;
  commands: BotCommand[];
  activities: BotActivity[];
  assignedStaff: string[];
  createdAt: string;
  updatedAt: string;
}
