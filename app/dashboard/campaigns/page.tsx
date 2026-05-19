"use client";

import React, { useState } from "react";
import { Activity, CircleDot, Columns3, GanttChartSquare, LayoutList, Plus, SlidersHorizontal } from "lucide-react";
import { CampaignsProvider, useCampaigns } from "@/features/campaigns/context/CampaignsContext";
import CampaignList from "@/features/campaigns/components/CampaignList";
import CampaignBoard from "@/features/campaigns/components/CampaignBoard";
import CampaignTimeline from "@/features/campaigns/components/CampaignTimeline";
import CampaignDrawer from "@/features/campaigns/components/CampaignDrawer";
import AddCampaignModal from "@/features/campaigns/components/AddCampaignModal";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";

type ViewMode = "list" | "board" | "timeline";
type FilterMode = "all" | "active" | "planning" | "paused";

const viewModes = [
  { id: "list" as ViewMode, label: "List", icon: LayoutList },
  { id: "board" as ViewMode, label: "Board", icon: Columns3 },
  { id: "timeline" as ViewMode, label: "Timeline", icon: GanttChartSquare },
];

function CampaignsPageContent() {
  const { campaigns } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const tabs = [
    { id: "all", label: "All Campaigns" },
    { id: "active", label: "Active Units" },
    { id: "planning", label: "Planning" },
    { id: "paused", label: "Paused" },
  ];

  const activeCount = campaigns.filter(c => c.status === "Active").length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fdf8f8]">
      <ModuleHeader
        title="Campaign"
        count={campaigns.length}
        leftContent={(
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
              <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-80 uppercase tracking-widest">Active:</span>
              <span className="font-display text-[14px] font-bold text-on-surface">{activeCount}</span>
            </div>
          </div>
        )}
        rightContent={(
          <>
            <div className="flex items-center p-0.5 bg-black/[0.03] border border-black/[0.05] rounded-[8px] mr-2">
              {viewModes.map(view => {
                const Icon = view.icon;
                const isActive = viewMode === view.id;
                return (
                  <button
                    key={view.id}
                    onClick={() => setViewMode(view.id)}
                    className={`p-1.5 rounded-[6px] transition-all ${isActive ? "bg-white shadow-sm text-black" : "text-on-surface-variant opacity-60 hover:opacity-100"
                      }`}
                  >
                    <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                  </button>
                );
              })}
            </div>

            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campaigns..."
              width={200}
            />

            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
              NEW CAMPAIGN
            </Button>
          </>
        )}
      />

      <ModuleTabs
        tabs={tabs}
        activeTab={filterMode}
        onTabChange={(id) => setFilterMode(id as FilterMode)}
        background="bg-[#faf5f5]"
      />

      <div className="flex-1 overflow-hidden bg-[#fdf8f8]">
        {viewMode === "list" && (
          <CampaignList searchQuery={searchQuery} filterMode={filterMode} onSelectCampaign={setSelectedCampaignId} />
        )}
        {viewMode === "board" && (
          <CampaignBoard searchQuery={searchQuery} onSelectCampaign={setSelectedCampaignId} />
        )}
        {viewMode === "timeline" && (
          <CampaignTimeline searchQuery={searchQuery} filterMode={filterMode} onSelectCampaign={setSelectedCampaignId} />
        )}
      </div>

      {selectedCampaignId && <CampaignDrawer campaignId={selectedCampaignId} onClose={() => setSelectedCampaignId(null)} />}
      {showAddModal && <AddCampaignModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <CampaignsProvider>
      <CampaignsPageContent />
    </CampaignsProvider>
  );
}
