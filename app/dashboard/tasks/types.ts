// ─── Primitive Types ──────────────────────────────────────────────────────────

export type Priority         = "urgent" | "high" | "medium" | "low";
export type Status           = "Backlog" | "Todo" | "In Progress" | "In Review" | "Done" | "Cancelled";
export type RecurringSchedule = "none" | "daily" | "weekly" | "biweekly" | "monthly";
export type RelationshipType = "blocks" | "blocked-by" | "relates-to" | "duplicates";

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface Member {
  id: string;
  name: string;
  initials: string;
  role?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  assigneeId?: string;
}

export interface SubSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  subtasks?: SubSubtask[];
}

export interface TaskRelationship {
  id: string;
  type: RelationshipType;
  targetId: string;
  targetTitle: string;
}

export interface ExternalLink {
  id: string;
  url: string;
  title: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  reactors: string[]; // member names
}

export interface Comment {
  id: string;
  author: string;
  initials: string;
  body: string;
  timestamp: string;
  reactions?: Record<string, Reaction>; // emoji → Reaction
  mentions?: string[]; // member ids mentioned
}

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  detail?: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;          // human-readable e.g. "2.4 MB"
  type: "pdf" | "image" | "doc" | "sheet" | "other";
  objectUrl?: string;    // URL.createObjectURL for client-side preview/download
  mimeType?: string;     // original MIME type
  uploadedAt?: string;   // ISO date string
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignees: Member[];
  labels: string[];
  startDate?: string | null;
  due: string | null;
  reminderDate?: string | null;
  recurring?: RecurringSchedule;
  created: string;
  estimatedHours?: number | null;
  checklist: ChecklistItem[];
  subtasks?: Subtask[];
  relationships?: TaskRelationship[];
  externalLinks?: ExternalLink[];
  comments: Comment[];
  reactions?: Record<string, Reaction>;
  activity: ActivityEntry[];
  attachments: Attachment[];
  watchers?: string[];              // member ids
  project?: string;
}

// ─── Team Members Roster ──────────────────────────────────────────────────────

export const TEAM_MEMBERS: Member[] = [
  { id: "m1", name: "Ari Ramadhan",   initials: "AR", role: "Product Manager"    },
  { id: "m2", name: "Budi Kurniawan", initials: "BK", role: "Lead Developer"     },
  { id: "m3", name: "Citra Rahayu",  initials: "CR", role: "Finance Analyst"    },
  { id: "m4", name: "Dani Santoso",  initials: "DS", role: "Operations Manager" },
  { id: "m5", name: "Evan Fauzi",    initials: "EF", role: "Automation Engineer" },
  { id: "m6", name: "Farhan Alif",   initials: "FA", role: "Junior Developer"   },
  { id: "m7", name: "Gita Permata",  initials: "GP", role: "UI/UX Designer"     },
  { id: "m8", name: "Hana Dewi",     initials: "HD", role: "Marketing Lead"     },
];

// ─── Seed Data ────────────────────────────────────────────────────────────────

export const SEED_TASKS: Task[] = [
  {
    id: "T-001",
    title: "Revamp client onboarding deck for Q2",
    description: "Update the onboarding slide deck to reflect new branding, pricing tiers, and onboarding flow changes introduced in Q2. Coordinate with design team for assets.",
    priority: "high",
    status: "In Progress",
    assignees: [TEAM_MEMBERS[0], TEAM_MEMBERS[1]],
    labels: ["Design", "Client"],
    startDate: "2026-05-01",
    due: "2026-05-09",
    reminderDate: "2026-05-08",
    recurring: "none",
    created: "2026-05-01",
    estimatedHours: 8,
    project: "Client Success",
    checklist: [
      { id: "c1", text: "Audit existing deck slides",      done: true  },
      { id: "c2", text: "Gather new brand assets",         done: true  },
      { id: "c3", text: "Update pricing section",          done: true  },
      { id: "c4", text: "Revise onboarding flow diagrams", done: false },
      { id: "c5", text: "QA review & export PDF",          done: false },
    ],
    relationships: [
      { id: "r1", type: "relates-to", targetId: "T-006", targetTitle: "Design new client invoice template" },
    ],
    externalLinks: [
      { id: "l1", url: "https://figma.com/deck-v3", title: "Figma Design File" },
    ],
    comments: [
      { id: "cm1", author: "Ari Ramadhan", initials: "AR", body: "Slides 1–8 are updated. Need the new color tokens from design before finishing the rest.", timestamp: "2h ago", reactions: { "👍": { emoji: "👍", count: 2, reactedByMe: false, reactors: ["Budi K.", "Citra R."] } } },
      { id: "cm2", author: "Budi Kurniawan", initials: "BK", body: "Will send over the tokens today. Let's wrap by EOD.", timestamp: "1h ago" },
    ],
    activity: [
      { id: "a1", actor: "AR", action: "created this task",        timestamp: "May 1"  },
      { id: "a2", actor: "BK", action: "was assigned",             timestamp: "May 2"  },
      { id: "a3", actor: "AR", action: "moved to", detail: "In Progress", timestamp: "May 3" },
      { id: "a4", actor: "AR", action: "checked off", detail: "Audit existing deck slides", timestamp: "May 4" },
    ],
    attachments: [
      { id: "at1", name: "onboarding-deck-v3.pdf", size: "2.4 MB", type: "pdf" },
      { id: "at2", name: "brand-assets-q2.zip",    size: "18 MB",  type: "other" },
    ],
    watchers: ["m3", "m7"],
  },
  {
    id: "T-002",
    title: "Set up WhatsApp bot for CS team",
    description: "Configure and deploy the WhatsApp bot integration for the customer support team. Map common intents, set up fallback routing, and test end-to-end.",
    priority: "medium",
    status: "In Progress",
    assignees: [TEAM_MEMBERS[1]],
    labels: ["Bot", "Automation"],
    due: "2026-05-10",
    recurring: "none",
    created: "2026-05-02",
    estimatedHours: 12,
    project: "Bot Integrations",
    checklist: [
      { id: "c1", text: "Connect WhatsApp Business API", done: true  },
      { id: "c2", text: "Map intent categories",         done: false },
      { id: "c3", text: "Configure fallback routing",    done: false },
      { id: "c4", text: "End-to-end QA test",            done: false },
    ],
    relationships: [
      { id: "r1", type: "relates-to", targetId: "T-005", targetTitle: "Deploy automation: lead capture → task" },
    ],
    externalLinks: [],
    comments: [
      { id: "cm1", author: "Budi Kurniawan", initials: "BK", body: "API credentials are in, starting intent mapping now.", timestamp: "3h ago" },
    ],
    activity: [
      { id: "a1", actor: "BK", action: "created this task",              timestamp: "May 2" },
      { id: "a2", actor: "BK", action: "moved to", detail: "In Progress", timestamp: "May 5" },
    ],
    attachments: [],
    watchers: ["m5"],
  },
  {
    id: "T-003",
    title: "Write Q2 financial summary report",
    description: "Compile all Q2 financial data into an executive summary report for management review. Include revenue, expense breakdown, and variance analysis.",
    priority: "high",
    status: "Todo",
    assignees: [TEAM_MEMBERS[2]],
    labels: ["Finance"],
    due: "2026-05-12",
    recurring: "monthly",
    created: "2026-05-03",
    estimatedHours: 6,
    project: "Finance",
    checklist: [
      { id: "c1", text: "Pull revenue data from accounting", done: false },
      { id: "c2", text: "Compile expense breakdown",         done: false },
      { id: "c3", text: "Write variance analysis",           done: false },
    ],
    relationships: [],
    externalLinks: [
      { id: "l1", url: "https://sheets.google.com/q2-finance", title: "Q2 Finance Sheet" },
    ],
    comments: [],
    activity: [
      { id: "a1", actor: "CR", action: "created this task", timestamp: "May 3" },
    ],
    attachments: [{ id: "at1", name: "q1-report-reference.xlsx", size: "340 KB", type: "sheet" }],
    watchers: [],
  },
  {
    id: "T-004",
    title: "Review vendor proposal — office supplies",
    description: "Evaluate the incoming vendor proposal for office supplies procurement. Compare pricing, delivery SLAs, and payment terms.",
    priority: "low",
    status: "In Review",
    assignees: [TEAM_MEMBERS[3]],
    labels: ["Operations"],
    due: "2026-05-14",
    recurring: "none",
    created: "2026-05-04",
    estimatedHours: 3,
    project: "Operations",
    checklist: [
      { id: "c1", text: "Read proposal document",      done: true },
      { id: "c2", text: "Compare with existing vendor", done: true },
    ],
    subtasks: [],
    relationships: [],
    externalLinks: [],
    comments: [
      { id: "cm1", author: "Dani Santoso", initials: "DS", body: "New vendor is 12% cheaper. Flagging for management sign-off.", timestamp: "Yesterday" },
    ],
    activity: [
      { id: "a1", actor: "DS", action: "created this task",             timestamp: "May 4" },
      { id: "a2", actor: "DS", action: "moved to", detail: "In Review", timestamp: "May 7" },
    ],
    attachments: [{ id: "at1", name: "vendor-proposal-may26.pdf", size: "1.1 MB", type: "pdf" }],
    watchers: ["m1"],
  },
  {
    id: "T-005",
    title: "Deploy automation: lead capture → task",
    description: "Finalize and deploy the lead capture to task automation flow. Ensure Telegram and WhatsApp inputs are correctly routed and assigned.",
    priority: "medium",
    status: "Done",
    assignees: [TEAM_MEMBERS[4], TEAM_MEMBERS[0]],
    labels: ["Automation", "Bot"],
    due: "2026-05-08",
    recurring: "none",
    created: "2026-05-01",
    estimatedHours: 10,
    project: "Bot Integrations",
    checklist: [
      { id: "c1", text: "Build trigger logic",         done: true },
      { id: "c2", text: "Map to task schema",           done: true },
      { id: "c3", text: "Test with staging bot",        done: true },
      { id: "c4", text: "Deploy to production",         done: true },
    ],
    subtasks: [],
    relationships: [
      { id: "r1", type: "blocks", targetId: "T-002", targetTitle: "Set up WhatsApp bot for CS team" },
    ],
    externalLinks: [],
    comments: [
      { id: "cm1", author: "Evan Fauzi", initials: "EF", body: "Deployed and verified. Closing this.", timestamp: "Today" },
    ],
    activity: [
      { id: "a1", actor: "EF", action: "created this task",          timestamp: "May 1" },
      { id: "a2", actor: "AR", action: "was assigned",               timestamp: "May 2" },
      { id: "a3", actor: "EF", action: "moved to", detail: "Done",   timestamp: "May 8" },
    ],
    attachments: [],
    watchers: [],
  },
  {
    id: "T-006",
    title: "Design new client invoice template",
    description: "Create a polished, branded invoice template for client billing. Should include company logo, payment terms, itemized billing, and footer contact info.",
    priority: "medium",
    status: "Backlog",
    assignees: [],
    labels: ["Design", "Finance"],
    due: null,
    recurring: "none",
    created: "2026-05-05",
    estimatedHours: 5,
    project: "Finance",
    checklist: [],
    subtasks: [],
    relationships: [
      { id: "r1", type: "blocked-by", targetId: "T-001", targetTitle: "Revamp client onboarding deck for Q2" },
    ],
    externalLinks: [],
    comments: [],
    activity: [{ id: "a1", actor: "System", action: "task created", timestamp: "May 5" }],
    attachments: [],
    watchers: [],
  },
  {
    id: "T-007",
    title: "Onboard new team member — Farhan",
    description: "Complete the onboarding process for the new team member. Set up access, walk through tools, assign buddy, and schedule first 1:1.",
    priority: "high",
    status: "Todo",
    assignees: [TEAM_MEMBERS[0]],
    labels: ["Team", "Operations"],
    due: "2026-05-09",
    reminderDate: "2026-05-08T09:00",
    recurring: "none",
    created: "2026-05-06",
    estimatedHours: 4,
    project: "Operations",
    checklist: [
      { id: "c1", text: "Create system accounts",            done: true  },
      { id: "c2", text: "Share OPERO workspace invite",      done: true  },
      { id: "c3", text: "Tool walkthrough session",          done: false },
      { id: "c4", text: "Assign buddy",                      done: false },
      { id: "c5", text: "First 1:1 scheduled",               done: false },
    ],
    relationships: [],
    externalLinks: [
      { id: "l1", url: "https://notion.so/onboarding-guide", title: "Onboarding Guide" },
    ],
    comments: [],
    activity: [
      { id: "a1", actor: "AR", action: "created this task", timestamp: "May 6" },
    ],
    attachments: [{ id: "at1", name: "onboarding-checklist.docx", size: "45 KB", type: "doc" }],
    watchers: ["m2"],
  },
  {
    id: "T-008",
    title: "Update website pricing page for new plans",
    description: "Reflect the updated Pro and Ultra plan pricing on the public website. Coordinate with marketing on copy and launch timing.",
    priority: "urgent",
    status: "Todo",
    assignees: [TEAM_MEMBERS[1], TEAM_MEMBERS[2]],
    labels: ["Marketing", "Design"],
    due: "2026-05-09",
    reminderDate: "2026-05-08T14:00",
    recurring: "none",
    created: "2026-05-07",
    estimatedHours: 3,
    project: "Marketing",
    checklist: [
      { id: "c1", text: "Confirm new pricing with management", done: true  },
      { id: "c2", text: "Update copy on pricing page",         done: false },
      { id: "c3", text: "QA across devices",                   done: false },
      { id: "c4", text: "Deploy and announce",                 done: false },
    ],
    relationships: [],
    externalLinks: [
      { id: "l1", url: "https://opero.co/pricing", title: "Live Pricing Page" },
    ],
    comments: [
      { id: "cm1", author: "Citra Rahayu", initials: "CR", body: "Pricing confirmed. BK please push the copy update ASAP.", timestamp: "1h ago", mentions: ["m2"] },
    ],
    activity: [
      { id: "a1", actor: "BK", action: "created this task", timestamp: "May 7" },
      { id: "a2", actor: "CR", action: "was assigned",       timestamp: "May 7" },
    ],
    attachments: [],
    watchers: ["m8"],
  },
];

// ─── Static Lookups ───────────────────────────────────────────────────────────

export const ALL_STATUSES: Status[]   = ["Backlog", "Todo", "In Progress", "In Review", "Done", "Cancelled"];
export const ALL_PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];
export const ALL_RECURRING: { value: RecurringSchedule; label: string }[] = [
  { value: "none",      label: "No Repeat"  },
  { value: "daily",     label: "Daily"      },
  { value: "weekly",    label: "Weekly"     },
  { value: "biweekly",  label: "Bi-weekly"  },
  { value: "monthly",   label: "Monthly"    },
];

export const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  urgent: { label: "Urgent", color: "rgba(186,26,26,0.9)",  bg: "rgba(186,26,26,0.09)", dot: "rgba(186,26,26,0.8)" },
  high:   { label: "High",   color: "rgba(186,26,26,0.75)", bg: "rgba(186,26,26,0.06)", dot: "rgba(186,26,26,0.6)" },
  medium: { label: "Medium", color: "rgba(0,0,0,0.6)",      bg: "rgba(0,0,0,0.055)",    dot: "rgba(0,0,0,0.5)"     },
  low:    { label: "Low",    color: "rgba(0,0,0,0.38)",     bg: "rgba(0,0,0,0.035)",    dot: "rgba(0,0,0,0.3)"     },
};

export const STATUS_META: Record<Status, { color: string; bg: string; dot: string }> = {
  "Backlog":     { color: "rgba(0,0,0,0.38)",    bg: "rgba(0,0,0,0.04)",       dot: "rgba(0,0,0,0.25)"      },
  "Todo":        { color: "rgba(0,0,0,0.55)",    bg: "rgba(0,0,0,0.055)",      dot: "rgba(0,0,0,0.45)"      },
  "In Progress": { color: "rgba(0,0,0,0.8)",     bg: "rgba(0,0,0,0.07)",       dot: "rgba(0,0,0,0.7)"       },
  "In Review":   { color: "rgba(0,80,180,0.75)", bg: "rgba(0,80,180,0.07)",    dot: "rgba(0,80,180,0.6)"    },
  "Done":        { color: "rgba(0,120,60,0.8)",  bg: "rgba(0,120,60,0.08)",    dot: "rgba(0,120,60,0.7)"    },
  "Cancelled":   { color: "rgba(0,0,0,0.3)",     bg: "rgba(0,0,0,0.035)",      dot: "rgba(0,0,0,0.2)"       },
};

// ─── Custom Label Store (persisted to localStorage) ───────────────────────────

const LABEL_STORAGE_KEY = "opero_task_labels";

const DEFAULT_LABELS = [
  "Design", "Client", "Bot", "Automation",
  "Finance", "Operations", "Marketing", "Team",
];

function loadLabels(): string[] {
  if (typeof window === "undefined") return DEFAULT_LABELS;
  try {
    const raw = localStorage.getItem(LABEL_STORAGE_KEY);
    if (!raw) return DEFAULT_LABELS;
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LABELS;
  } catch { return DEFAULT_LABELS; }
}

export function getLabels(): string[] { return loadLabels(); }

export function addCustomLabel(label: string): string[] {
  const trimmed = label.trim();
  if (!trimmed) return loadLabels();
  const current = loadLabels();
  if (current.includes(trimmed)) return current;
  const next = [...current, trimmed];
  if (typeof window !== "undefined") localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteCustomLabel(label: string): string[] {
  const next = loadLabels().filter(l => l !== label);
  if (typeof window !== "undefined") localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify(next));
  return next;
}

// Backwards compat export
export const ALL_LABELS = DEFAULT_LABELS;

export function getMemberById(id: string): Member | undefined {
  return TEAM_MEMBERS.find(m => m.id === id);
}
