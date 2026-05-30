import React, { useEffect, useState } from "react";
import { X, UserMinus, Shield, Building, Briefcase, Crown, User, Check, Edit2 } from "lucide-react";
import { useMembers } from "../context/MembersContext";
import { RoleType } from "@/features/members";
import { usePresence } from "@/features/presence";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName } from "@/lib/user-identity";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function MemberDrawer({ memberId, onClose }: { memberId: string, onClose: () => void }) {
  const { members, removeMember, updateMemberRole, updateMemberOrg, roles, permissions } = useMembers();
  const { presence } = usePresence();
  const member = members.find(m => m.id === memberId);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [editDept, setEditDept] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(intervalId);
  }, []);

  if (!member) return null;
  const memberName = getUserDisplayName(member, "Unnamed User");

  const handleRemove = () => {
    removeMember(member.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleEditOrgClick = () => {
    setEditDept(member.department || "");
    setEditTitle(member.jobTitle || "");
    setIsEditingOrg(true);
  };

  const handleSaveOrg = () => {
    updateMemberOrg(member.id, editDept, editTitle);
    setIsEditingOrg(false);
  };

  const roleObj = roles.find(r => r.name === member.role);
  const memberPresence = presence.find((record) => record.userId === member.userId);
  const isOnline = memberPresence?.isOnline ?? false;
  const lastSeenAt = memberPresence?.lastSeenAt ?? member.lastActive;

  function formatDateTime(value?: string) {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return `${date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })} at ${date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  function formatLastActive(value?: string) {
    if (isOnline) return "Online";
    if (!value) return "Never active";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Never active";

    const diffMs = now - date.getTime();
    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;

    if (diffMs < minuteMs) return "Last active just now";
    if (diffMs < hourMs) {
      const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
      return `Last active ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }
    if (diffMs < dayMs) {
      const hours = Math.max(1, Math.floor(diffMs / hourMs));
      return `Last active ${hours} hour${hours === 1 ? "" : "s"} ago`;
    }
    if (diffMs < 2 * dayMs) return "Last active yesterday";

    const days = Math.floor(diffMs / dayMs);
    return `Last active ${days} days ago`;
  }

  const permissionById = new Map(permissions.map((permission) => [permission.id, permission]));
  // Get permissions for this role to display
  const grantedPerms = roleObj?.permissions || [];
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="relative w-full max-w-[420px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right"
        style={{ borderLeft: "1px solid rgba(0,0,0,0.05)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <h2 className="font-display font-semibold text-[15px] text-on-surface">Member Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Identity (Soft, compact) */}
          <div className="flex items-center gap-4 mb-8">
            <UserAvatar
              user={member}
              size="xl"
              className="shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              online={isOnline}
              onlineClassName="border-[var(--color-surface-container-lowest)]"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-bold text-[18px] text-on-surface truncate mb-0.5">{memberName}</h3>
              <p className="font-body-md text-[13px] text-on-surface-variant opacity-80 truncate mb-1">{member.email}</p>
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-on-surface-variant opacity-70 flex items-center gap-1">
                  {member.role === "Owner" ? <Crown size={10} /> : member.role === "Admin" ? <Shield size={10} /> : <User size={10} />}
                  {member.role.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Activity Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-black/[0.01] border border-black/[0.03]">
                <div className="font-label-caps text-[8px] text-on-surface-variant opacity-70 uppercase tracking-widest mb-1">Joined Date</div>
                <div className="font-body-sm text-[11px] font-medium text-on-surface opacity-80">
                  {formatDateTime(member.joinedAt)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/[0.01] border border-black/[0.03]">
                <div className="font-label-caps text-[8px] text-on-surface-variant opacity-70 uppercase tracking-widest mb-1">Last Active</div>
                <div
                  className="font-body-sm text-[11px] font-medium text-on-surface opacity-80"                >
                  {formatLastActive(lastSeenAt)}
                </div>
              </div>
            </div>

            {/* Organization Info */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-label-caps text-[10px] text-on-surface-variant opacity-60 uppercase tracking-wider">Organization</h4>
                {!isEditingOrg && (
                  <button
                    onClick={handleEditOrgClick}
                    className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                    title="Edit Organization Info"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>

              {isEditingOrg ? (
                <div className="space-y-3 p-3 bg-surface-container-low rounded-xl border border-black/5 animate-fade-in">
                  <div>
                    <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1">Job Title / Position</label>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder="e.g. Product Manager"
                      className="w-full px-3 py-2 rounded-lg font-body-sm text-[13px] border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1">Department</label>
                    <input
                      value={editDept}
                      onChange={e => setEditDept(e.target.value)}
                      placeholder="e.g. Engineering"
                      className="w-full px-3 py-2 rounded-lg font-body-sm text-[13px] border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setIsEditingOrg(false)} className="flex-1 py-1.5 rounded-lg font-body-sm font-medium text-[12px] text-on-surface-variant hover:bg-black/5 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSaveOrg} className="flex-1 py-1.5 rounded-lg font-body-sm font-medium text-[12px] bg-primary text-on-primary hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Briefcase size={14} className="opacity-60" />
                    <span className="font-body-sm text-[13px] font-medium opacity-90">{member.jobTitle || "No position set"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Building size={14} className="opacity-60" />
                    <span className="font-body-sm text-[13px] font-medium opacity-90">{member.department || "No department set"}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full h-px bg-black/5" />

            {/* Role & Permissions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-label-caps text-[10px] text-on-surface-variant opacity-60 uppercase tracking-wider">Access Level</h4>
                {member.role !== "Owner" && (
                  <button
                    onClick={() => setIsEditingRole(!isEditingRole)}
                    className="font-label-caps text-[9px] text-primary hover:underline"
                  >
                    {isEditingRole ? "CANCEL" : "CHANGE"}
                  </button>
                )}
              </div>

              {isEditingRole ? (
                <div className="flex flex-col gap-2 animate-fade-in-up">
                  {roles.filter(r => r.name !== "Owner").map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        updateMemberRole(member.id, r.name as RoleType);
                        setIsEditingRole(false);
                      }}
                      className={`flex items-start p-3 rounded-xl border transition-all text-left ${member.role === r.name ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-black/20'}`}
                    >
                      <div className="flex-1 mr-2">
                        <div className="font-display font-semibold text-[13px] text-on-surface mb-0.5">{r.name}</div>
                        <div className="font-body-sm text-[11px] text-on-surface-variant opacity-70 line-clamp-2">{r.description}</div>
                      </div>
                      {member.role === r.name && <Check size={14} className="text-primary shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-black/5">
                    {member.role === "Owner" ? <Crown size={16} className="text-on-surface-variant opacity-60 mt-0.5" /> :
                      member.role === "Admin" ? <Shield size={16} className="text-on-surface-variant opacity-60 mt-0.5" /> :
                        <User size={16} className="text-on-surface-variant opacity-60 mt-0.5" />}
                    <div>
                      <div className="font-display font-semibold text-[13px] text-on-surface mb-0.5">{member.role}</div>
                      <div className="font-body-sm text-[11px] text-on-surface-variant opacity-70">
                        {roleObj?.description}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Permissions view (soft chips) */}
                  <div className="pt-2">
                    <h5 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-2">Granted Permissions</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {grantedPerms.map(permId => (
                        <span key={permId} className="px-2 py-1 rounded-md bg-black/[0.03] text-on-surface-variant font-body-sm text-[10px] border border-black/[0.03]">
                          {permissionById.get(permId)?.name ?? permId.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {member.role !== "Owner" && (
          <div className="px-6 py-4 shrink-0 bg-surface-container-lowest border-t" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-body-sm font-semibold text-[13px]"
            >
              <UserMinus size={14} /> Remove Member
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleRemove}
        title="Remove Member"
        description={`Are you sure you want to remove ${memberName} from the workspace? They will lose access to all projects and data.`}
        confirmLabel="Remove Member"
        variant="danger"
      />
    </div>
  );
}
