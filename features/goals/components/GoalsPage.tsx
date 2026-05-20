"use client";

import { useState, useMemo } from "react";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { useGoals } from "@/features/goals";
import GoalCard from "@/features/goals/components/GoalCard";
import GoalListView from "@/features/goals/components/GoalListView";
import GoalDetail from "@/features/goals/components/GoalDetail";
import CreateGoalModal from "@/features/goals/components/CreateGoalModal";
import { CardGridSkeleton, EmptyState, ErrorState, RowSkeleton } from "@/components/common/DataState";

type GoalFilter = "all" | "active" | "archive";

export default function GoalsPage() {
  const { goals, loading, error, addGoal, updateGoal, deleteGoal } = useGoals();
  const [view, setView] = useState<"list" | "grid">("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GoalFilter>("all");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    let r = goals;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    }

    // Status tab filter
    if (filter === "active") {
      r = r.filter(g => !g.archived);
    } else if (filter === "archive") {
      r = r.filter(g => !!g.archived);
    }

    return r;
  }, [goals, search, filter]);

  const selectedGoal = useMemo(() =>
    goals.find(g => g.id === selectedGoalId) || null
    , [goals, selectedGoalId]);

  if (selectedGoal) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <GoalDetail
          goal={selectedGoal}
          onClose={() => setSelectedGoalId(null)}
          onUpdate={(updated) => updateGoal(updated.id, updated)}
          onDelete={(id) => {
            deleteGoal(id);
            setSelectedGoalId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* ── Standardized Toolbar ── */}
      <div
        className="flex items-center justify-between px-6 py-3.5 border-b shrink-0"
        style={{ borderColor: "rgba(0,0,0,0.07)", background: "var(--color-background)" }}
      >
        {/* Left: title + count */}
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[16px] font-semibold tracking-tight" style={{ color: "var(--color-on-surface)" }}>Goals</h1>
          <span
            className="font-label-caps text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)" }}
          >
            {goals.length}
          </span>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-black/[0.04] rounded-lg mr-2">
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-40 hover:opacity-100"}`}
            >
              <List size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-40 hover:opacity-100"}`}
            >
              <LayoutGrid size={14} strokeWidth={2} />
            </button>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-[6px]"
            style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.02)" }}
          >
            <Search size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.45, flexShrink: 0 }} />
            <input
              placeholder="Search goals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="font-body-md text-[12px] bg-transparent outline-none w-[180px]"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] font-label-caps text-[10px] font-semibold uppercase tracking-[0.06em] hover:-translate-y-px transition-all"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            <Plus size={12} strokeWidth={2.5} /> NEW GOAL
          </button>
        </div>
      </div>

      {/* ── Sub-header: Navigation & Context ── */}
      <div className="px-6 py-2 border-b border-black/[0.03] shrink-0 flex items-center justify-between bg-[#fbf5f5]">
        <div className="flex gap-8">
          <button
            onClick={() => setFilter("all")}
            className="relative py-1 group"
          >
            <span className={`font-display text-[12px] font-semibold transition-colors ${filter === "all" ? "text-primary" : "text-on-surface-variant opacity-45 group-hover:opacity-100"}`}>All Goals</span>
            {filter === "all" && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setFilter("active")}
            className="relative py-1 group"
          >
            <span className={`font-display text-[12px] font-semibold transition-colors ${filter === "active" ? "text-primary" : "text-on-surface-variant opacity-45 group-hover:opacity-100"}`}>Active</span>
            {filter === "active" && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setFilter("archive")}
            className="relative py-1 group"
          >
            <span className={`font-display text-[12px] font-semibold transition-colors ${filter === "archive" ? "text-primary" : "text-on-surface-variant opacity-45 group-hover:opacity-100"}`}>Archive</span>
            {filter === "archive" && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />}
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto bg-[#fef8f8]">
        {loading ? (
          view === "list" ? <RowSkeleton rows={9} /> : <div className="p-8"><CardGridSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length > 0 ? (
          view === "list" ? (
            <GoalListView goals={filtered} onGoalClick={(goal) => setSelectedGoalId(goal.id)} />
          ) : (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filtered.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoalId(goal.id)} />
                ))}
              </div>
            </div>
          )
        ) : (
          <EmptyState
            icon="target"
            title="No goals found"
            description="There are no goals matching your current view or search filters."
          />
        )}
      </main>

      {showCreate && (
        <CreateGoalModal
          onClose={() => setShowCreate(false)}
          onCreate={addGoal}
        />
      )}
    </div>
  );
}
