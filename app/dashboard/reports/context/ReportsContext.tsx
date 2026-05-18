"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { Report, ReportType, ReportStatus } from "../types";
import { createReport, listReports, updateReport as saveReport } from "@/lib/client/services/report.service";

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

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | ReportType>("All");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listReports<Report>();
        if (!cancelled) setReports(items);
      } catch (err) {
        console.error("Failed to load reports:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addReport = (data: Omit<Report, "id" | "createdAt" | "updatedAt" | "status">) => {
    const newReport: Report = {
      ...data,
      id: "r" + Math.random().toString(36).substr(2, 9),
      status: "Ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    createReport<Report>(newReport)
      .then((created) => setReports(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create report:", err));
  };

  const generateReport = (id: string) => {
    setReports(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated: Report = { ...r, status: "Ready", lastGeneratedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const recordId = (r as { recordId?: string }).recordId ?? r.id;
      saveReport<Report>(recordId, updated).catch((err) => {
        console.error("Failed to generate report:", err);
      });
      return updated;
    }));
  };

  const archiveReport = (id: string) => {
    setReports(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated: Report = { ...r, status: "Archived", updatedAt: new Date().toISOString() };
      const recordId = (r as { recordId?: string }).recordId ?? r.id;
      saveReport<Report>(recordId, updated).catch((err) => {
        console.error("Failed to archive report:", err);
      });
      return updated;
    }));
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

