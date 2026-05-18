"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from "react";
import { Goal, KeyResult, User, Milestone, Activity } from "../types";
import {
  createTenantRecord,
  deleteTenantRecord,
  listTenantRecords,
  updateTenantRecord,
  getProfile,
} from "@/lib/client/tenant-records";

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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({ id: "", name: "", initials: "" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [items, profile] = await Promise.all([
          listTenantRecords<Goal>("goals"),
          getProfile(),
        ]);
        if (!cancelled) {
          setGoals(items.map(g => ({ ...g, progress: calculateGoalProgress(g.keyResults) })));
          if (profile?.user) {
            const name = profile.user.name || profile.user.email || "User";
            setCurrentUser({
              id: profile.user.id,
              name,
              initials: name
                .split(/\s+/)
                .map((p: string) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
            });
          }
        }
      } catch (err) {
        console.error("Failed to load goals:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addGoal = (goal: Goal) => {
    const next = { ...goal, progress: calculateGoalProgress(goal.keyResults) };
    createTenantRecord<Goal>("goals", next)
      .then((created) => setGoals(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create goal:", err));
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updated = { ...g, ...updates };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      updateTenantRecord<Goal>("goals", recordId, updated).catch((err) => {
        console.error("Failed to update goal:", err);
      });
      return updated;
    }));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    const recordId = goals.find(g => g.id === goalId) as { recordId?: string } | undefined;
    const targetId = recordId?.recordId ?? goalId;
    deleteTenantRecord("goals", targetId).catch((err) => {
      console.error("Failed to delete goal:", err);
    });
  };

  const deleteGoals = (ids: string[]) => {
    setGoals(prev => prev.filter(g => !ids.includes(g.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = goals.find(g => g.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteTenantRecord("goals", targetId).catch((err) => {
          console.error("Failed to delete goal:", err);
        });
      })
    ).catch(() => undefined);
  };

  const addKeyResult = (goalId: string, krData: Omit<KeyResult, "id">) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newKr: KeyResult = { ...krData, id: `kr_${Date.now()}` };
      const newKRs = [...g.keyResults, newKr];
      const newProgress = calculateGoalProgress(newKRs);
      const updated = { ...g, keyResults: newKRs, progress: newProgress };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      updateTenantRecord<Goal>("goals", recordId, updated).catch((err) => {
        console.error("Failed to add key result:", err);
      });
      return updated;
    }));
  };

  const updateKeyResult = (goalId: string, krId: string, updates: Partial<KeyResult>) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newKRs = g.keyResults.map(kr => kr.id === krId ? { ...kr, ...updates } : kr);
      const newProgress = calculateGoalProgress(newKRs);
      const updated = { ...g, keyResults: newKRs, progress: newProgress };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      updateTenantRecord<Goal>("goals", recordId, updated).catch((err) => {
        console.error("Failed to update key result:", err);
      });
      return updated;
    }));
  };

  const addMilestone = (goalId: string, msData: Omit<Milestone, "id">) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newMs: Milestone = { ...msData, id: `ms_${Date.now()}` };
      const updated = { ...g, milestones: [...g.milestones, newMs] };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      updateTenantRecord<Goal>("goals", recordId, updated).catch((err) => {
        console.error("Failed to add milestone:", err);
      });
      return updated;
    }));
  };

  const addActivity = (goalId: string, activityData: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updated = { ...g, activities: [newActivity, ...g.activities] };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      updateTenantRecord<Goal>("goals", recordId, updated).catch((err) => {
        console.error("Failed to add activity:", err);
      });
      return updated;
    }));
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updated = {
        ...g,
        milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m)
      };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      updateTenantRecord<Goal>("goals", recordId, updated).catch((err) => {
        console.error("Failed to toggle milestone:", err);
      });
      return updated;
    }));
  };

  const value = useMemo(() => ({
    goals, addGoal, updateGoal, deleteGoal, deleteGoals, addKeyResult, updateKeyResult, addMilestone, addActivity, toggleMilestone, currentUser
  }), [goals, currentUser]);

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (!context) throw new Error("useGoals must be used within GoalsProvider");
  return context;
}
