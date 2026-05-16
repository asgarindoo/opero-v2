// ─── Primitive Types ──────────────────────────────────────────────────────────

export type FlowCategory = 
  | "Onboarding" 
  | "Approvals" 
  | "Recruitment" 
  | "Marketing" 
  | "Operations" 
  | "Finance" 
  | "Production";

export type FlowStatus = "Active" | "Completed" | "Archived" | "Paused";

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface FlowStage {
  id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
  checklist: ChecklistItem[];
  order: number;
}

export type WorkflowStageType = "start" | "task" | "approval" | "decision" | "completion";

export type WorkflowStage = FlowStage & {
  stageType?: WorkflowStageType;
  approvalRequired?: boolean;
  slaHours?: number;
  isCompletion?: boolean;
  isDefault?: boolean;
};

export interface FlowNote {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  text: string;
  timestamp: string;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  category: FlowCategory;
  status: FlowStatus;
  progress: number; // 0 - 100
  stages: FlowStage[];
  dueDate?: string;
  updated: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  notes?: FlowNote[];
  relatedTasksCount?: number;
  relatedDocsCount?: number;
  isActive?: boolean;
  tasksCount?: number;
  usageStats?: {
    successRate: number;
    avgCompletionDays: number;
  };
}

export const STAGE_TYPE_META: Record<WorkflowStageType, { label: string }> = {
  start: { label: "Start" },
  task: { label: "Task" },
  approval: { label: "Approval" },
  decision: { label: "Decision" },
  completion: { label: "Completion" },
};

// ─── Metadata & Lookups ──────────────────────────────────────────────────────

export const FLOW_CATEGORIES: FlowCategory[] = [
  "Onboarding", "Approvals", "Recruitment", "Marketing", "Operations", "Finance", "Production"
];

export const CATEGORY_COLORS: Record<FlowCategory, string> = {
  Onboarding: "text-blue-500 bg-blue-50",
  Approvals: "text-emerald-500 bg-emerald-50",
  Recruitment: "text-amber-500 bg-amber-50",
  Marketing: "text-rose-500 bg-rose-50",
  Operations: "text-slate-500 bg-slate-50",
  Finance: "text-indigo-500 bg-indigo-50",
  Production: "text-purple-500 bg-purple-50",
};

// ─── Sample Data ─────────────────────────────────────────────────────────────

export const SAMPLE_FLOWS: Flow[] = [
  {
    id: "f1",
    name: "Employee Onboarding - Q3",
    description: "Standard procedure for new engineering hires including hardware setup and orientation.",
    category: "Onboarding",
    status: "Active",
    progress: 45,
    updated: "2026-05-14T10:30:00Z",
    dueDate: "2026-06-01",
    owner: { id: "u1", name: "Alex Rivera" },
    relatedTasksCount: 4,
    relatedDocsCount: 2,
    stages: [
      {
        id: "s1",
        name: "Pre-boarding",
        isCompleted: true,
        order: 0,
        checklist: [
          { id: "c1", text: "Signed Contract", isCompleted: true },
          { id: "c2", text: "Hardware Selection", isCompleted: true }
        ]
      },
      {
        id: "s2",
        name: "First Week",
        isCompleted: false,
        order: 1,
        checklist: [
          { id: "c3", text: "Team Introduction", isCompleted: true },
          { id: "c4", text: "Dev Environment Setup", isCompleted: false },
          { id: "c5", text: "Product Walkthrough", isCompleted: false }
        ]
      }
    ]
  },
  {
    id: "f2",
    name: "Marketing Campaign Approval",
    description: "Multi-stage approval process for the Summer Solstice campaign creatives.",
    category: "Approvals",
    status: "Active",
    progress: 15,
    updated: "2026-05-13T16:45:00Z",
    owner: { id: "u2", name: "Sarah Chen" },
    stages: [
      {
        id: "s1",
        name: "Creative Review",
        isCompleted: false,
        order: 0,
        checklist: [
          { id: "c1", text: "Ad Copy Approval", isCompleted: true },
          { id: "c2", text: "Visual Asset Review", isCompleted: false }
        ]
      }
    ]
  },
  {
    id: "f3",
    name: "Senior Frontend Developer Hire",
    description: "Recruitment process for the core platform engineering team.",
    category: "Recruitment",
    status: "Active",
    progress: 75,
    updated: "2026-05-14T09:15:00Z",
    owner: { id: "u1", name: "Alex Rivera" },
    relatedTasksCount: 8,
    stages: [
      {
        id: "s1",
        name: "Interview Phase",
        isCompleted: true,
        order: 0,
        checklist: [
          { id: "c1", text: "Technical Assessment", isCompleted: true },
          { id: "c2", text: "Architecture Review", isCompleted: true }
        ]
      },
      {
        id: "s2",
        name: "Offer Stage",
        isCompleted: false,
        order: 1,
        checklist: [
          { id: "c3", text: "Reference Checks", isCompleted: true },
          { id: "c4", text: "Offer Negotiation", isCompleted: false }
        ]
      }
    ]
  }
];
