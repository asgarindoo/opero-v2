"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { Goal, KeyResult, User, Milestone, Activity } from "../types";

// Mock Users
export const USERS: Record<string, User> = {
  u1: { id: "u1", name: "Sarah Connor", initials: "SC" },
  u2: { id: "u2", name: "John Doe", initials: "JD" },
  u3: { id: "u3", name: "Alice Smith", initials: "AS" },
};

// Initial Mock Data
const INITIAL_GOALS: Goal[] = [
  {
    id: "g1",
    title: "Achieve Enterprise Market Penetration",
    description: "Secure 5 new Fortune 500 enterprise clients and expand our service offering to cover advanced compliance needs.",
    status: "on-track",
    priority: "high",
    ownerId: "u1",
    collaboratorIds: ["u2"],
    startDate: "2026-04-01",
    targetDate: "2026-09-30",
    progress: 0, // Will be calculated
    keyResults: [
      { id: "kr1", title: "Close 5 enterprise deals", target: 5, current: 3, unit: "deals", status: "on-track" },
      { id: "kr2", title: "Publish SOC2 Type II Report", target: 1, current: 1, unit: "report", status: "completed" },
      { id: "kr3", title: "Achieve $2M in Enterprise ARR", target: 2000000, current: 1200000, unit: "$", status: "at-risk" },
    ],
    milestones: [
      { id: "m1", title: "Finalize compliance roadmap", date: "2026-05-15", completed: true },
      { id: "m2", title: "Launch targeted enterprise campaign", date: "2026-06-01", completed: false },
    ],
    linkedItems: [
      { id: "t1", type: "task", title: "Update SOC2 Compliance Documentation", status: "Done" },
      { id: "f1", type: "flow", title: "Client Onboarding Redesign", status: "In Progress" },
    ],
    activities: [
      { id: "a1", userId: "u1", type: "progress_update", content: "Closed deal with ACME Corp.", timestamp: "2026-05-10T10:00:00Z" }
    ],
  },
  {
    id: "g2",
    title: "Launch Global Platform V2.0",
    description: "Roll out the new multi-tenant architecture with 99.99% uptime and zero critical bugs during the launch window.",
    status: "at-risk",
    priority: "critical",
    ownerId: "u2",
    collaboratorIds: ["u1", "u3"],
    startDate: "2026-01-15",
    targetDate: "2026-06-30",
    progress: 0,
    keyResults: [
      { id: "kr4", title: "Complete load testing for 100k CCU", target: 100, current: 40, unit: "k CCU", status: "behind" },
      { id: "kr5", title: "Zero critical bugs in staging", target: 0, current: 3, unit: "bugs", status: "at-risk" },
    ],
    milestones: [
      { id: "m3", title: "Alpha Release", date: "2026-03-01", completed: true },
      { id: "m4", title: "Beta Release", date: "2026-05-01", completed: true },
      { id: "m5", title: "Public Launch", date: "2026-06-30", completed: false },
    ],
    linkedItems: [],
    activities: [],
  },
  {
    id: "g3",
    title: "Optimize Customer Acquisition Cost",
    description: "Reduce CAC by 15% through organic channels and improved sales funnel conversion rates.",
    status: "on-track",
    priority: "medium",
    ownerId: "u3",
    collaboratorIds: [],
    startDate: "2026-07-01",
    targetDate: "2026-12-31",
    progress: 0,
    keyResults: [
      { id: "kr6", title: "Reduce ad spend by 10%", target: 10, current: 5, unit: "%", status: "on-track" },
      { id: "kr7", title: "Increase organic traffic by 25%", target: 25, current: 20, unit: "%", status: "on-track" },
    ],
    milestones: [],
    linkedItems: [],
    activities: [],
  }
];

// Helper to calculate progress
function calculateGoalProgress(keyResults: KeyResult[]): number {
  if (keyResults.length === 0) return 0;
  const totalPercentage = keyResults.reduce((acc, kr) => {
    // If target is 0, handle edge cases (like zero bugs). Assuming 100% if current <= target for inverted metrics, 
    // but for simplicity, let's just do standard (current/target)*100
    if (kr.target === 0) {
      return acc + (kr.current <= 0 ? 100 : 0);
    }
    return acc + Math.min(100, Math.max(0, (kr.current / kr.target) * 100));
  }, 0);
  return Math.round(totalPercentage / keyResults.length);
}

// Initial calculation
const PRE_CALCULATED_GOALS = INITIAL_GOALS.map(g => ({
  ...g,
  progress: calculateGoalProgress(g.keyResults)
}));

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  deleteGoals: (ids: string[]) => void;
  addKeyResult: (goalId: string, kr: Omit<KeyResult, "id">) => void;
  updateKeyResult: (goalId: string, krId: string, updates: Partial<KeyResult>) => void;
  addActivity: (goalId: string, activity: Omit<Activity, "id" | "timestamp">) => void;
  addMilestone: (goalId: string, ms: Omit<Milestone, "id">) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  currentUser: User;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>(PRE_CALCULATED_GOALS);

  // Hardcode current user for simulation
  const currentUser = USERS.u1;

  const addGoal = (goal: Goal) => {
    setGoals(prev => [goal, ...prev]);
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const deleteGoals = (ids: string[]) => {
    setGoals(prev => prev.filter(g => !ids.includes(g.id)));
  };

  const addKeyResult = (goalId: string, krData: Omit<KeyResult, "id">) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newKr: KeyResult = { ...krData, id: `kr_${Date.now()}` };
      const newKRs = [...g.keyResults, newKr];
      const newProgress = calculateGoalProgress(newKRs);
      return { ...g, keyResults: newKRs, progress: newProgress };
    }));
  };

  const updateKeyResult = (goalId: string, krId: string, updates: Partial<KeyResult>) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newKRs = g.keyResults.map(kr => kr.id === krId ? { ...kr, ...updates } : kr);
      const newProgress = calculateGoalProgress(newKRs);
      return { ...g, keyResults: newKRs, progress: newProgress };
    }));
  };

  const addMilestone = (goalId: string, msData: Omit<Milestone, "id">) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newMs: Milestone = { ...msData, id: `ms_${Date.now()}` };
      return { ...g, milestones: [...g.milestones, newMs] };
    }));
  };

  const addActivity = (goalId: string, activityData: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, activities: [newActivity, ...g.activities] } : g));
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m)
      };
    }));
  };

  const value = useMemo(() => ({
    goals, addGoal, updateGoal, deleteGoal, deleteGoals, addKeyResult, updateKeyResult, addMilestone, addActivity, toggleMilestone, currentUser
  }), [goals]);

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (!context) throw new Error("useGoals must be used within GoalsProvider");
  return context;
}
