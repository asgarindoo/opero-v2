export type ReportType = "Sales" | "Operations" | "Finance" | "Marketing" | "Activity";
export type ReportStatus = "Draft" | "Ready" | "Generating" | "Scheduled" | "Archived";
export type ExportFormat = "PDF" | "CSV" | "XLSX";

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  lastGeneratedAt?: string;
  author: string;
  visibility: "Private" | "Team" | "Global";
  parameters: {
    dateRange: string;
    filters: Record<string, any>;
  };
}

export interface ReportActivity {
  id: string;
  reportId: string;
  action: "Generated" | "Viewed" | "Exported" | "Modified";
  user: string;
  timestamp: string;
  metadata?: string;
}
