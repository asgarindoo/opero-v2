"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { Report, ReportType, ReportStatus } from "../types";

interface ReportsContextType {
  reports: Report[];
  addReport: (report: Omit<Report, "id" | "createdAt" | "updatedAt" | "status">) => void;
  generateReport: (id: string) => void;
  archiveReport: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: "All" | ReportType;
  setSelectedType: (type: "All" | ReportType) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

const MOCK_REPORTS: Report[] = [
  {
    id: "r1",
    title: "Q2 Sales Performance",
    type: "Sales",
    description: "Quarterly breakdown of revenue, conversion rates, and team targets.",
    status: "Ready",
    createdAt: "2026-04-10T08:00:00Z",
    updatedAt: "2026-05-12T10:00:00Z",
    lastGeneratedAt: "2026-05-12T10:00:00Z",
    author: "Alex Rivera",
    visibility: "Team",
    parameters: { dateRange: "Last Quarter", filters: {} }
  },
  {
    id: "r2",
    title: "Operational Efficiency Log",
    type: "Operations",
    description: "Detailed analysis of task completion velocity and bottleneck detection.",
    status: "Generating",
    createdAt: "2026-05-01T14:30:00Z",
    updatedAt: "2026-05-12T09:15:00Z",
    author: "Sam Chen",
    visibility: "Global",
    parameters: { dateRange: "Last 30 Days", filters: { team: "Engineering" } }
  },
  {
    id: "r3",
    title: "Inventory Turnover",
    type: "Inventory",
    description: "Stock movement report focusing on high-velocity items and low-stock alerts.",
    status: "Scheduled",
    createdAt: "2026-03-15T11:00:00Z",
    updatedAt: "2026-05-10T16:45:00Z",
    lastGeneratedAt: "2026-05-01T00:00:00Z",
    author: "Jordan Lee",
    visibility: "Private",
    parameters: { dateRange: "Weekly", filters: {} }
  }
];

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | ReportType>("All");

  const addReport = (data: Omit<Report, "id" | "createdAt" | "updatedAt" | "status">) => {
    const newReport: Report = {
      ...data,
      id: "r" + Math.random().toString(36).substr(2, 9),
      status: "Ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
  };

  const generateReport = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, status: "Generating", updatedAt: new Date().toISOString() } : r
    ));
    
    // Mock generation delay
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === id ? { ...r, status: "Ready", lastGeneratedAt: new Date().toISOString() } : r
      ));
    }, 2000);
  };

  const archiveReport = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, status: "Archived", updatedAt: new Date().toISOString() } : r
    ));
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "All" || r.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, selectedType]);

  const value = {
    reports: filteredReports,
    addReport,
    generateReport,
    archiveReport,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType
  };

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) throw new Error("useReports must be used within ReportsProvider");
  return context;
}
