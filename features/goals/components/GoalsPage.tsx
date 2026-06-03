"use client";

import { useState, useMemo } from "react";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { useGoals } from "@/features/goals";
import GoalCard from "@/features/goals/components/GoalCard";
import GoalListView from "@/features/goals/components/GoalListView";
import GoalDetail from "@/features/goals/components/GoalDetail";
import CreateGoalModal from "@/features/goals/components/CreateGoalModal";
import { CardGridSkeleton, EmptyState, ErrorState, RowSkeleton } from "@/components/common/DataState";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";
import { useTenant } from "@/components/providers/TenantProvider";
import { canUse } from "@/lib/client/rbac";

type GoalFilter = "all" | "active" | "archive";

export default function GoalsPage() {
  const { role } = useTenant();
  const canDeleteGoals = canUse(role, "goals.delete");
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
            if (!canDeleteGoals) return;
            deleteGoal(id);
            setSelectedGoalId(null);
          }}
          canDelete={canDeleteGoals}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fef8f8]">
      <ModuleHeader
        title="Goals"
        count={goals.length}
        rightContent={(
          <div className="flex items-center gap-3">
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

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search goals..."
              width={180}
            />
            
            <Button
              onClick={() => setShowCreate(true)}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              NEW GOAL
            </Button>
          </div>
        )}
      />

      <ModuleTabs
        tabs={[
          { id: "all", label: "All Goals" },
          { id: "active", label: "Active" },
          { id: "archive", label: "Archive" }
        ]}
        activeTab={filter}
        onTabChange={(id) => setFilter(id as GoalFilter)}
        background="bg-transparent"
        className="border-black/[0.03]"
      />

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto bg-[#fef8f8]">
        {loading ? (
          view === "list" ? <RowSkeleton rows={9} /> : <div className="p-8"><CardGridSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length > 0 ? (
          view === "list" ? (
            <GoalListView goals={filtered} onGoalClick={(goal) => setSelectedGoalId(goal.id)} canDelete={canDeleteGoals} />
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
