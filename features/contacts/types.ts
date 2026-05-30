export type ContactStatus = "New" | "Active" | "Pending" | "Inactive" | "Archived";
export type RelationshipType = "Lead" | "Customer" | "Client" | "Vendor" | "Partner" | "Freelancer" | "Investor" | "Internal" | "Other";

export interface ContactActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  author: string;
  email?: string;
  avatar?: string | null;
  initials?: string;
  reactions?: Record<string, import("@/features/tasks").Reaction>;
}

export interface ContactContextData {
  value?: number;
  stage?: string;
  [key: string]: any;
}

export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  initials: string;
  industry: string;
  status: ContactStatus;
  relationshipType: RelationshipType;
  contextData: ContactContextData;
  isArchived: boolean;
  tags: string[];
  persons: Person[];
  activities: ContactActivity[];
  assignedStaff: string[];
  createdAt: string;
  lastContacted: string;
}
