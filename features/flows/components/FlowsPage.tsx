"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { FLOW_CATEGORIES, type Flow, type FlowCategory } from "@/features/flows/types";
import FlowCard from "@/features/flows/components/FlowCard";
import FlowDetail from "@/features/flows/components/FlowDetail";
import CreateFlowModal from "@/features/flows/components/CreateFlowModal";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";
import FlowListView from "@/features/flows/components/FlowListView";
import { createFlow, deleteFlow, listFlows, updateFlow } from "@/features/flows/services/flows.client";
import { CardGridSkeleton, EmptyState, ErrorState, RowSkeleton } from "@/components/common/DataState";

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grid">("grid");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | FlowCategory>("All");
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listFlows<Flow>()
      .then((data) => {
        if (!cancelled) {
          setFlows(data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load flows:", err);
        if (!cancelled) {
          setFlows([]);
          setError(err instanceof Error ? err.message : "Failed to load flows");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Tabs for the sub-header
  const categories = [
    { id: "All", label: "All Flows" },
    ...FLOW_CATEGORIES.map(cat => ({ id: cat, label: cat }))
  ];

  // Filtering logic
  const filtered = useMemo(() => {
    return flows.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [flows, search, selectedCategory]);

  const selectedFlow = useMemo(() =>
    flows.find(f => f.id === selectedFlowId) || null
    , [flows, selectedFlowId]);

  // Handler for creating a new flow
  const handleCreateFlow = async (newFlow: Flow) => {
    try {
      const saved = await createFlow<Flow>(newFlow);
      setFlows(prev => [saved, ...prev]);
      setIsCreateModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create flow");
    }
  };

  // Handler for updating a flow
  const handleUpdateFlow = async (updated: Flow) => {
    try {
      const saved = await updateFlow<Flow>(updated.id, updated);
      setFlows(prev => prev.map(f => f.id === saved.id ? saved : f));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update flow");
    }
  };

  // Handler for deleting/archiving a flow
  const handleDeleteFlow = async (id: string) => {
    try {
      await deleteFlow(id);
      setFlows(prev => prev.filter(f => f.id !== id));
      setSelectedFlowId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete flow");
    }
  };

  if (selectedFlow) {
    return (
      <FlowDetail
        flow={selectedFlow}
        onClose={() => setSelectedFlowId(null)}
        onUpdate={handleUpdateFlow}
        onDelete={handleDeleteFlow}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#fef8f8] overflow-hidden">
      <ModuleHeader
        title="Flows"
        count={filtered.length}
        className="!bg-[#f9f5f5] border-black/[0.06]"
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
              placeholder="Search processes..."
              width={180}
            />
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              NEW FLOW
            </Button>
          </div>
        )}
      />

      <ModuleTabs
        tabs={categories}
        activeTab={selectedCategory}
        onTabChange={(id) => setSelectedCategory(id as "All" | FlowCategory)}
        background="bg-[#fbf5f5]"
        className="border-black/[0.03]"
        rightContent={(
          <div className="flex items-center gap-6 px-6">

          </div>
        )}
      />

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          view === "grid" ? <CardGridSkeleton /> : <RowSkeleton rows={9} />
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length > 0 ? (
          view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filtered.map(flow => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  onClick={() => setSelectedFlowId(flow.id)}
                />
              ))}
            </div>
          ) : (
            <FlowListView
              flows={filtered}
              onFlowClick={(flow) => setSelectedFlowId(flow.id)}
              onBulkDelete={async (ids) => {
                try {
                  for (const id of ids) {
                    await deleteFlow(id);
                  }
                  setFlows(prev => prev.filter(f => !ids.includes(f.id)));
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Failed to delete flows");
                }
              }}
            />
          )
        ) : (
          <EmptyState
            icon="schema"
            title="No flows found"
            description="There are no flows matching your current view or search filters."
          />
        )}
      </main>

      {isCreateModalOpen && (
        <CreateFlowModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateFlow}
        />
      )}
    </div>
  );
}

