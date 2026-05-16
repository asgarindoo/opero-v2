export type ContentStatus = "Draft" | "In Review" | "Approved" | "Scheduled" | "Published";
export type Platform = "Instagram" | "Email" | "Web" | "LinkedIn" | "Twitter" | "TikTok";
export type ContentType = "Image" | "Video" | "Article" | "Thread" | "Email";

export interface Asset {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
  date: Date;
  tags: string[];
}

export interface ContentPost {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  status: ContentStatus;
  type: ContentType;
  category: string; // Added for editorial categorization
  assignee: string;
  date: Date;
  endDate?: Date; // Added for multi-date/range support
  time: string;
  tags: string[];
  assets: string[]; // Asset IDs
  notes?: string;
}
