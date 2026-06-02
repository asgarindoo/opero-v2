export type ContactStatus = "New" | "Active" | "Pending" | "Inactive" | "Archived";
export type RelationshipType = "Lead" | "Customer" | "Client" | "Vendor" | "Partner" | "Freelancer" | "Investor" | "Internal" | "Other";

export interface ContactComment {
  id: string;
  userId?: string;
  author: string;
  email?: string;
  avatar?: string | null;
  initials: string;
  body: string;
  timestamp: string;
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
  persons: Person[];
  comments: ContactComment[];
  createdAt: string;
  lastContacted: string;
}
