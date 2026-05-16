"use client";

import React, { useState } from "react";
import { Users, Shield, Clock, Plus } from "lucide-react";
import { useMembers } from "./context/MembersContext";

// Components
import MembersDirectory from "./components/MembersDirectory";
import RolesPermissions from "./components/RolesPermissions";
import ActivityAuditLog from "./components/ActivityAuditLog";
import InviteModal from "./components/InviteModal";
import MemberDrawer from "./components/MemberDrawer";

// Shared UI
import ModuleHeader from "../components/shared/ModuleHeader";
import ModuleTabs from "../components/shared/ModuleTabs";
import SearchInput from "../components/shared/SearchInput";
import Button from "../components/ui/Button";

type Tab = "directory" | "roles" | "activity";

export default function MembersPage() {
  const { members } = useMembers();

  const [activeTab, setActiveTab] = useState<Tab>("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const tabs = [
    { id: "directory", label: "Directory", icon: Users },
    { id: "roles", label: "Roles & Permissions", icon: Shield },
    { id: "activity", label: "Audit Log", icon: Clock },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── Module Header ── */}
      <ModuleHeader 
        title="Members"
        count={members.length}
        rightContent={(
          <>
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search members..." 
              width={200}
            />
            <Button 
              variant="primary" 
              size="sm" 
              icon={Plus}
              onClick={() => setShowInviteModal(true)}
            >
              INVITE MEMBER
            </Button>
          </>
        )}
      />

      {/* ── Tabs ── */}
      <ModuleTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as Tab)}
        background="bg-black/[0.01]"
      />

      {/* ── View Area ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "directory" && <MembersDirectory searchQuery={searchQuery} onSelectMember={setSelectedMemberId} />}
        {activeTab === "roles" && <RolesPermissions />}
        {activeTab === "activity" && <ActivityAuditLog />}
      </div>


      {/* ── Modals & Drawers ── */}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
      {selectedMemberId && <MemberDrawer memberId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />}
    </div>
  );
}

