"use client";

import React, { useState } from "react";
import { LayoutList, LayoutGrid, Plus } from "lucide-react";
import { ContactsProvider, useContacts } from "./context/ContactsContext";
import ContactList from "./components/ContactList";
import KanbanView from "./components/KanbanView";
import ContactDrawer from "./components/ContactDrawer";
import AddContactModal from "./components/AddContactModal";

import ModuleHeader from "../components/shared/ModuleHeader";
import ModuleTabs from "../components/shared/ModuleTabs";
import SearchInput from "../components/shared/SearchInput";
import Button from "../components/ui/Button";

type ViewMode = "kanban" | "list";
type FilterMode = "all" | "customers" | "partners" | "suppliers";

function ContactsPageContent() {
  const { contacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Removed icons from tabs for a cleaner, unified look
  const tabs = [
    { id: "all", label: "All Contacts" },
    { id: "customers", label: "Customers" },
    { id: "partners", label: "Partners & Investors" },
    { id: "suppliers", label: "Suppliers & Vendors" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <ModuleHeader 
        title="Contacts"
        count={contacts.length}
        rightContent={(
          <>
            <div className="flex items-center p-0.5 bg-black/[0.03] rounded-lg mr-1.5">
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-1 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
               >
                  <LayoutList size={13} strokeWidth={2} />
               </button>
               <button 
                 onClick={() => setViewMode("kanban")}
                 className={`p-1 rounded-md transition-all ${viewMode === "kanban" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
               >
                  <LayoutGrid size={13} strokeWidth={2} />
               </button>
            </div>

            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search contacts..." 
              width={180}
            />

            <Button 
              variant="primary" 
              size="sm" 
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              NEW CONTACT
            </Button>
          </>
        )}
      />

      <ModuleTabs 
        tabs={tabs}
        activeTab={filterMode}
        onTabChange={(id) => setFilterMode(id as FilterMode)}
        background="bg-[#fbf5f5]" // Applied the standard secondary surface color
      />

      <div className="flex-1 overflow-hidden bg-[#fef8f8]">
        {viewMode === "kanban" ? (
          <KanbanView filterMode={filterMode} searchQuery={searchQuery} onSelectContact={setSelectedContactId} onAddNew={() => setShowAddModal(true)} />
        ) : (
          <ContactList filterMode={filterMode} searchQuery={searchQuery} onSelectContact={setSelectedContactId} />
        )}
      </div>

      {selectedContactId && <ContactDrawer contactId={selectedContactId} onClose={() => setSelectedContactId(null)} />}
      {showAddModal && <AddContactModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export default function ContactsPage() {
  return (
    <ContactsProvider>
      <ContactsPageContent />
    </ContactsProvider>
  );
}
