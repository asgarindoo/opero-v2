"use client";

import React, { useState } from "react";
import { Search, Plus, LayoutGrid, LayoutList, Bot as BotIcon, MessageCircle, Phone, Globe } from "lucide-react";
import { BotProvider, useBots } from "./context/BotContext";
import BotGrid from "./components/BotGrid";
import BotList from "./components/BotList";
import AddBotModal from "./components/AddBotModal";
import BotDetailsDrawer from "./components/BotDetailsDrawer";

type FilterMode = "all" | "telegram" | "whatsapp" | "web";
type ViewMode = "grid" | "list";

function BotsPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const tabs = [
    { id: "all", label: "All Bots", icon: BotIcon },
    { id: "telegram", label: "Telegram", icon: MessageCircle },
    { id: "whatsapp", label: "WhatsApp", icon: Phone },
    { id: "web", label: "Web / Custom", icon: Globe },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface-container-low">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-6 py-3.5 shrink-0 border-b border-black/[0.04]">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[14.5px] font-semibold tracking-tight text-on-surface">
            Bot Manager
          </h1>
          <div className="h-4 w-px bg-black/[0.06]" />
          <div className="font-body-sm text-[11px] text-on-surface-variant opacity-40">
            Workspaces / Connect
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 rounded-lg bg-black/[0.03] gap-0.5">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-40 hover:opacity-100"}`}
            >
              <LayoutGrid size={12} strokeWidth={2} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-40 hover:opacity-100"}`}
            >
              <LayoutList size={12} strokeWidth={2} />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/[0.03] transition-all focus-within:shadow-[0_2px_8_rgba(0,0,0,0.02)]">
            <Search size={12} className="text-on-surface-variant opacity-40 shrink-0" />
            <input
              placeholder="Search bots..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="font-body-sm text-[12.5px] bg-transparent border-none outline-none placeholder:opacity-40 text-on-surface w-[200px]"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all ml-1"
          >
            <Plus size={12} strokeWidth={2.5} /> Connect Bot
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="px-6 shrink-0 bg-surface-container-low">
        <div className="flex gap-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = filterMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id as FilterMode)}
                className="relative flex items-center gap-2 py-3 transition-colors group"
              >
                <Icon size={12} className={isActive ? "text-primary" : "text-on-surface-variant opacity-40 group-hover:opacity-100"} />
                <span className={`font-display text-[12px] font-medium ${isActive ? "text-primary" : "text-on-surface-variant opacity-60"}`}>
                  {tab.label}
                </span>
                {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-md bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── View Area ── */}
      <div className="flex-1 overflow-hidden bg-surface-container-lowest">
        {viewMode === "grid" ? (
          <BotGrid filterMode={filterMode} searchQuery={searchQuery} onSelect={setSelectedBotId} onAddNew={() => setShowAddModal(true)} />
        ) : (
          <BotList filterMode={filterMode} searchQuery={searchQuery} onSelect={setSelectedBotId} />
        )}
      </div>

      {/* ── Modals & Drawers ── */}
      {selectedBotId && <BotDetailsDrawer botId={selectedBotId} onClose={() => setSelectedBotId(null)} />}
      {showAddModal && <AddBotModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export default function BotsPage() {
  return (
    <BotProvider>
      <BotsPageContent />
    </BotProvider>
  );
}
