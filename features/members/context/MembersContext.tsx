"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Member, ActivityLog, RoleType, InviteLink } from "@/features/members";
import { listActivities } from "@/features/activity";
import { getUserInitials } from "@/lib/user-identity";

interface ApiMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  department: string | null;
  position: string | null;
  status: "active" | "suspended";
  joinedAt: string;
  lastActive: string | null;
}

interface ApiActivity {
  id: string;
  user?: { id?: string | null } | null;
  action: string;
  description?: string | null;
  entityType?: string | null;
  entityName?: string | null;
  timestamp: string;
}

const roleMap: Record<string, RoleType> = {
  owner: "Owner",
  admin: "Admin",
  member: "Staff",
  staff: "Staff",
};

const revRoleMap: Record<RoleType, string> = {
  Owner: "owner",
  Admin: "admin",
  Staff: "member",
};

function toRoleType(value: unknown): RoleType | null {
  if (typeof value !== "string") return null;
  return roleMap[value.trim().toLowerCase()] ?? null;
}

interface MembersContextType {
  members: Member[];
  loading: boolean;
  activityLogs: ActivityLog[];
  inviteLinks: InviteLink[];
  tenantCode: string;
  currentUserRole: RoleType | null;

  // Member actions
  fetchMembers: () => Promise<void>;
  inviteMember: (email: string, role: RoleType, department?: string) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  updateMemberRole: (id: string, newRole: RoleType) => Promise<void>;
  updateMemberOrg: (id: string, department: string, jobTitle: string) => Promise<void>;

  // Invite Link actions
  generateInviteLink: (expireDays: number | null) => Promise<InviteLink>;
  revokeInviteLink: (id: string) => Promise<void>;

  logActivity: (action: string) => void;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

export function MembersProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [tenantCode, setTenantCode] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<RoleType | null>(null);

  const refreshActivity = useCallback(async () => {
    try {
      const logs = await listActivities("TEAM") as ApiActivity[];
      setActivityLogs(
        logs.map((log) => ({
          id: log.id,
          userId: log.user?.id ?? "system",
          action: log.description || `${log.action} ${log.entityType ?? "Record"}`,
          target: log.entityName ?? undefined,
          timestamp: log.timestamp,
        }))
      );
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const membersRes = await fetch("/api/tenant/members");
      const membersData = await membersRes.json();

      if (membersData.members) {
        setMembers((membersData.members as ApiMember[]).map((m) => ({
          ...m,
          role: toRoleType(m.role) ?? "Staff",
          department: m.department ?? undefined,
          jobTitle: m.position ?? undefined,
          lastActive: m.lastActive ?? undefined,
          initials: getUserInitials(m)
        })));
      }
      if (membersData.currentRole) {
        setCurrentUserRole(toRoleType(membersData.currentRole) ?? "Staff");
      }

      const inviteRes = await fetch("/api/tenant/invite");

      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        if (inviteData.inviteCode) {
          setTenantCode(inviteData.inviteCode);
        }
        if (inviteData.inviteLinks) {
          setInviteLinks(inviteData.inviteLinks);
        }
      }

      await refreshActivity();
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshActivity]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) void fetchMembers();
    });

    return () => {
      cancelled = true;
    };
  }, [fetchMembers]);

  const inviteMember = useCallback(async (email: string, role: RoleType) => {
    try {
      const res = await fetch("/api/tenant/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: revRoleMap[role] }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to invite member");
      }
      await fetchMembers();
    } catch (err) {
      console.error("Failed to invite member:", err);
    }
  }, [fetchMembers]);

  const removeMember = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tenant/members/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
        await refreshActivity();
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  }, [refreshActivity]);

  const updateMemberRole = useCallback(async (id: string, newRole: RoleType) => {
    try {
      const res = await fetch(`/api/tenant/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: revRoleMap[newRole] })
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
        await refreshActivity();
      }
    } catch (err) {
      console.error("Failed to update member role:", err);
    }
  }, [refreshActivity]);

  const updateMemberOrg = useCallback(async (id: string, department: string, jobTitle: string) => {
    try {
      const res = await fetch(`/api/tenant/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department, position: jobTitle })
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, department, jobTitle } : m));
        await refreshActivity();
      }
    } catch (err) {
      console.error("Failed to update member org:", err);
    }
  }, [refreshActivity]);

  // Invite Links
  const generateInviteLink = useCallback(async (expireDays: number | null) => {
    const res = await fetch("/api/tenant/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expireDays })
    });
    const payload = await res.json();

    if (!res.ok) {
      throw new Error(payload.error ?? "Failed to generate invite link");
    }

    setInviteLinks(prev => [payload.inviteLink, ...prev]);
    return payload.inviteLink as InviteLink;
  }, []);

  const revokeInviteLink = useCallback(async (id: string) => {
    const res = await fetch(`/api/tenant/invite/links/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInviteLinks(prev => prev.filter(l => l.id !== id));
    }
  }, []);

  const value = useMemo(() => ({
    members,
    loading,
    activityLogs,
    inviteLinks,
    tenantCode,
    currentUserRole,
    fetchMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
    updateMemberOrg,
    generateInviteLink,
    revokeInviteLink,
    logActivity: () => refreshActivity()
  }), [
    members, loading, activityLogs, inviteLinks, tenantCode, currentUserRole,
    fetchMembers, inviteMember, removeMember, updateMemberRole, updateMemberOrg,
    generateInviteLink, revokeInviteLink, refreshActivity
  ]);

  return (
    <MembersContext.Provider value={value}>
      {children}
    </MembersContext.Provider>
  );
}


export function useMembers() {
  const context = useContext(MembersContext);
  if (context === undefined) {
    throw new Error("useMembers must be used within a MembersProvider");
  }
  return context;
}
