"use client";

import React, { useState } from "react";
import { Users, Clock, Plus } from "lucide-react";
import { useMembers } from "@/features/members";

// Components
import MembersDirectory from "@/features/members/components/MembersDirectory";
import ActivityAuditLog from "@/features/members/components/ActivityAuditLog";
import InviteModal from "@/features/members/components/InviteModal";
import MemberDrawer from "@/features/members/components/MemberDrawer";

// Shared UI
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";

type Tab = "directory" | "activity";

export default function MembersPage() {
  const { members, currentUserRole, loading } = useMembers();
  const canManageMembers = currentUserRole === "Owner" || currentUserRole === "Admin";
  const canInvite = canManageMembers;

  const [activeTab, setActiveTab] = useState<Tab>("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const tabs = [
    { id: "directory", label: "Directory", icon: Users },
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
            {canInvite && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setShowInviteModal(true)}
                  disabled={loading && !currentUserRole}
                >
                  INVITE MEMBER
                </Button>
              </>
            )}
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
        {activeTab === "activity" && <ActivityAuditLog />}
      </div>


      {/* ── Modals & Drawers ── */}
      {showInviteModal && canInvite && <InviteModal onClose={() => setShowInviteModal(false)} />}
      {selectedMemberId && <MemberDrawer memberId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />}
    </div>
  );
}
