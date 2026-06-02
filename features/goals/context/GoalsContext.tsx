"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from "react";
import { Goal, KeyResult, User, Milestone } from "@/features/goals";
import { createGoal, deleteGoal as removeGoal, listGoals, updateGoal as saveGoal } from "@/features/goals/services/goals.client";

// Helper to calculate progress
function normalizeGoal(goal: Goal): Goal {
  return {
    ...goal,
    keyResults: Array.isArray(goal.keyResults) ? goal.keyResults : [],
    milestones: Array.isArray(goal.milestones) ? goal.milestones : [],
    linkedItems: Array.isArray(goal.linkedItems) ? goal.linkedItems : [],
  };
}

function calculateGoalProgress(keyResults: KeyResult[] = [], milestones: Milestone[] = []): number {
  if (keyResults.length > 0) {
    const totalPercentage = keyResults.reduce((acc, kr) => {
      // Keep zero-target key results from dividing by zero.
      if (kr.target === 0) {
        return acc + (kr.current <= 0 ? 100 : 0);
      }
      return acc + Math.min(100, Math.max(0, (kr.current / kr.target) * 100));
    }, 0);
    return Math.round(totalPercentage / keyResults.length);
  }
  if (milestones.length > 0) {
    const completedCount = milestones.filter(m => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  }
  return 0;
}

interface GoalsContextType {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  addGoal: (goal: Goal) => Promise<Goal>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  deleteGoals: (ids: string[]) => void;
  addKeyResult: (goalId: string, kr: Omit<KeyResult, "id">) => void;
  updateKeyResult: (goalId: string, krId: string, updates: Partial<KeyResult>) => void;
  addMilestone: (goalId: string, ms: Omit<Milestone, "id">) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  currentUser: User;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentUser] = useState<User>({ id: "", name: "", initials: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listGoals<Goal>();
        if (!cancelled) {
          setGoals(items.map((g) => {
            const normalized = normalizeGoal(g);
            return { ...normalized, progress: calculateGoalProgress(normalized.keyResults, normalized.milestones) };
          }));
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load goals:", err);
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load goals");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addGoal = async (goal: Goal) => {
    const normalized = normalizeGoal(goal);
    const next = { ...normalized, progress: calculateGoalProgress(normalized.keyResults, normalized.milestones) };
    try {
      const created = await createGoal<Goal>(next);
      setGoals(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error("Failed to create goal:", err);
      throw err;
    }
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updated = normalizeGoal({ ...g, ...updates });
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      saveGoal<Goal>(recordId, updated).catch((err) => {
        console.error("Failed to update goal:", err);
      });
      return updated;
    }));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    const recordId = goals.find(g => g.id === goalId) as { recordId?: string } | undefined;
    const targetId = recordId?.recordId ?? goalId;
    removeGoal(targetId).catch((err) => {
      console.error("Failed to delete goal:", err);
    });
  };

  const deleteGoals = (ids: string[]) => {
    setGoals(prev => prev.filter(g => !ids.includes(g.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = goals.find(g => g.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return removeGoal(targetId).catch((err) => {
          console.error("Failed to delete goal:", err);
        });
      })
    ).catch(() => undefined);
  };

  const addKeyResult = (goalId: string, krData: Omit<KeyResult, "id">) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newKr: KeyResult = { ...krData, id: `kr_${Date.now()}` };
      const goal = normalizeGoal(g);
      const newKRs = [...goal.keyResults, newKr];
      const newProgress = calculateGoalProgress(newKRs, goal.milestones);
      const updated = { ...g, keyResults: newKRs, progress: newProgress };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      saveGoal<Goal>(recordId, updated).catch((err) => {
        console.error("Failed to add key result:", err);
      });
      return updated;
    }));
  };

  const updateKeyResult = (goalId: string, krId: string, updates: Partial<KeyResult>) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const goal = normalizeGoal(g);
      const newKRs = goal.keyResults.map(kr => kr.id === krId ? { ...kr, ...updates } : kr);
      const newProgress = calculateGoalProgress(newKRs, goal.milestones);
      const updated = { ...g, keyResults: newKRs, progress: newProgress };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      saveGoal<Goal>(recordId, updated).catch((err) => {
        console.error("Failed to update key result:", err);
      });
      return updated;
    }));
  };

  const addMilestone = (goalId: string, msData: Omit<Milestone, "id">) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const goal = normalizeGoal(g);
      const newMs: Milestone = { ...msData, id: `ms_${Date.now()}` };
      const updated = { ...goal, milestones: [...goal.milestones, newMs] };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      saveGoal<Goal>(recordId, updated).catch((err) => {
        console.error("Failed to add milestone:", err);
      });
      return updated;
    }));
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const goal = normalizeGoal(g);
      const nextMilestones = goal.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
      const newProgress = calculateGoalProgress(goal.keyResults, nextMilestones);
      const updated = {
        ...g,
        milestones: nextMilestones,
        progress: newProgress
      };
      const recordId = (g as { recordId?: string }).recordId ?? g.id;
      saveGoal<Goal>(recordId, updated).catch((err) => {
        console.error("Failed to toggle milestone:", err);
      });
      return updated;
    }));
  };

  const value = useMemo(() => ({
    goals, loading, error, addGoal, updateGoal, deleteGoal, deleteGoals, addKeyResult, updateKeyResult, addMilestone, toggleMilestone, currentUser
  }), [goals, loading, error, currentUser]);

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (!context) throw new Error("useGoals must be used within GoalsProvider");
  return context;
}
