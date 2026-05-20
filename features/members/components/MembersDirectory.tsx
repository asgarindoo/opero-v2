import React, { useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import { useMembers } from "../context/MembersContext";
import { EmptyState } from "@/components/common/DataState";

const roleColors: Record<string, string> = {
  Owner: "rgba(0,0,0,0.85)",
  Admin: "rgba(0,0,0,0.7)",
  Staff: "rgba(0,0,0,0.6)",
  Guest: "rgba(0,0,0,0.6)"
};

export default function MembersDirectory({ searchQuery, onSelectMember }: { searchQuery: string, onSelectMember: (id: string) => void }) {
  const { members, loading } = useMembers();

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.department && m.department.toLowerCase().includes(q))
    );
  }, [members, searchQuery]);

  if (loading) {
    return (
      <div className="p-6 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 border border-transparent">
            <div className="w-10 h-10 rounded-full bg-black/[0.04] animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 bg-black/[0.05] rounded animate-pulse" />
              <div className="h-2 w-1/2 bg-black/[0.03] rounded animate-pulse" />
            </div>
            <div className="w-24 h-4 bg-black/[0.04] rounded animate-pulse hidden md:block" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-1">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => onSelectMember(member.id)}
            className="group flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer border border-transparent hover:border-black/[0.04] hover:bg-black/[0.01]"
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-[12px] shrink-0"
              style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
            >
              {member.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-display font-semibold text-[13px] text-on-surface truncate group-hover:text-primary transition-colors">
                  {member.name || "Unnamed User"}
                </span>
                {member.status === "invited" && (
                  <span className="font-label-caps text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/[0.05] text-on-surface-variant opacity-70">
                    PENDING INVITE
                  </span>
                )}
                {member.status === "suspended" && (
                  <span className="font-label-caps text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 opacity-80">
                    SUSPENDED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body-sm text-[12px] text-on-surface-variant opacity-60 truncate">
                  {member.email}
                </span>
                {member.jobTitle && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-black/10" />
                    <span className="font-body-sm text-[12px] text-on-surface-variant opacity-60 truncate italic">
                      {member.jobTitle}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Metadata (Right side) */}
            <div className="flex items-center gap-8 shrink-0 pr-2">
              {/* Role */}
              <div className="w-24 flex items-center">
                <span className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-70">
                  {member.role.toUpperCase()}
                </span>
              </div>

              {/* Status/Activity */}
              <div className="w-24 hidden md:flex flex-col items-end">
                <span className="font-body-sm text-[11px] text-on-surface-variant opacity-60">
                  Joined
                </span>
                <span className="font-body-sm text-[12px] font-medium text-on-surface-variant opacity-80">
                  {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "Unknown"}
                </span>
              </div>

              {/* Actions */}
              <button
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-on-surface-variant hover:bg-black/[0.04] transition-all"
                onClick={(e) => { e.stopPropagation(); onSelectMember(member.id); }}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && !loading && (
          <EmptyState
            icon="person_search"
            title="No members found"
            description={searchQuery ? `No members found matching "${searchQuery}".` : "This workspace has no members yet."}
          />
        )}
      </div>
    </div>
  );
}

