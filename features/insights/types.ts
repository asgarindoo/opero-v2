export type InsightCategory = "Operations" | "Sales" | "Marketing" | "Team" | "Finance";

export interface DataPoint {
  label: string;
  value: number;
}

export interface Metric {
  id: string;
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend: number; // Percentage change
  category: InsightCategory;
}

export interface InsightTrend {
  id: string;
  title: string;
  category: InsightCategory;
  data: DataPoint[];
  color?: string;
}

export interface ActivityPoint {
  day: number; // 0-6
  hour: number; // 0-23
  intensity: number; // 0-1
}
