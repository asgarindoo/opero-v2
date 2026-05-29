export type ContentStatus = "Planned" | "Ready" | "Published" | "Skipped";
export type ContentType = "Post" | "Story" | "Reel" | "Carousel" | "Video" | "Article" | "Email" | "Other";

export interface ContentPost {
  id: string;
  title: string;
  targetAccountId?: string; // Reference to Channel.id
  status: ContentStatus;
  type: ContentType;
  date: string;
  time: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
