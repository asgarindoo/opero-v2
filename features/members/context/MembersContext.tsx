"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Member, Role, Permission, ActivityLog, RoleType, InviteLink } from "@/features/members";
import { listActivities } from "@/features/activity";
import { listRoles, updateRole } from "@/features/members/services/members.client";
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

export const PERMISSIONS: Permission[] = [
  // Dashboard
  { id: "dash_view", category: "Dashboard", name: "View Dashboard", description: "Can view the main dashboard overview." },
  // Tasks
  { id: "tasks_view", category: "Tasks", name: "View Tasks", description: "Can view tasks assigned to the team." },
  { id: "tasks_create", category: "Tasks", name: "Create Tasks", description: "Can create new tasks." },
  { id: "tasks_edit", category: "Tasks", name: "Edit Tasks", description: "Can edit any task details." },
  { id: "tasks_delete", category: "Tasks", name: "Delete Tasks", description: "Can permanently delete tasks." },
  // Goals
  { id: "goals_view", category: "Goals", name: "View Goals", description: "Can view team goals and key results." },
  { id: "goals_manage", category: "Goals", name: "Manage Goals", description: "Can create, edit, and update goals progress." },
  // Flows
  { id: "flows_view", category: "Flows", name: "View Flows", description: "Can view automation flows." },
  { id: "flows_build", category: "Flows", name: "Build Flows", description: "Can create and edit flow pipelines." },
  // Chat
  { id: "chat_access", category: "Chat", name: "Access Team Chat", description: "Can participate in team chat channels." },
  { id: "chat_manage", category: "Chat", name: "Manage Channels", description: "Can create, rename, and delete chat channels." },
  // Analytics
  { id: "analytics_view", category: "Analytics", name: "View Analytics", description: "Can view reports and usage analytics." },
  // Members
  { id: "members_view", category: "Members", name: "View Directory", description: "Can view the members directory." },
  { id: "members_invite", category: "Members", name: "Invite Members", description: "Can invite new members to the workspace." },
  { id: "members_manage", category: "Members", name: "Manage Roles & Access", description: "Can change roles and configure access control." },
  // Settings
  { id: "settings_manage", category: "Settings", name: "Workspace Settings", description: "Can manage billing, domains, and global settings." },
];

const defaultRoles: Role[] = [
  {
    id: "owner",
    name: "Owner",
    description: "Full workspace access and billing ownership.",
    permissions: PERMISSIONS.map((permission) => permission.id),
  },
  {
    id: "admin",
    name: "Admin",
    description: "Manage workspace operations, members, and most settings.",
    permissions: PERMISSIONS
      .filter((permission) => permission.id !== "settings_manage")
      .map((permission) => permission.id),
  },
  {
    id: "member",
    name: "Staff",
    description: "Access daily workspace tools and assigned work.",
    permissions: PERMISSIONS
      .filter((permission) => (
        permission.id.endsWith("_view") ||
        permission.id === "chat_access" ||
        permission.id === "tasks_create" ||
        permission.id === "goals_view"
      ))
      .map((permission) => permission.id),
  },
];

const roleMap: Record<string, RoleType> = {
  owner: "Owner",
  admin: "Admin",
  member: "Staff",
};

const revRoleMap: Record<RoleType, string> = {
  Owner: "owner",
  Admin: "admin",
  Staff: "member",
};

interface MembersContextType {
  members: Member[];
  loading: boolean;
  activityLogs: ActivityLog[];
  roles: Role[];
  permissions: Permission[];
  inviteLinks: InviteLink[];
  tenantCode: string;
  currentUserRole: RoleType | null;

  // Member actions
  fetchMembers: () => Promise<void>;
  inviteMember: (email: string, role: RoleType, department?: string) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  updateMemberRole: (id: string, newRole: RoleType) => Promise<void>;
  updateMemberOrg: (id: string, department: string, jobTitle: string) => Promise<void>;

  // Access Control actions
  toggleRolePermission: (roleId: string, permissionId: string) => Promise<void>;

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
  const [roles, setRoles] = useState<Role[]>([]);
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
          role: roleMap[m.role] || "Staff",
          department: m.department ?? undefined,
          jobTitle: m.position ?? undefined,
          lastActive: m.lastActive ?? undefined,
          initials: getUserInitials(m)
        })));
      }
      if (membersData.currentRole) {
        setCurrentUserRole(roleMap[membersData.currentRole] || "Staff");
      }

      const [rolesData, inviteRes] = await Promise.all([
        listRoles<Role>(),
        fetch("/api/tenant/invite"),
      ]);

      setRoles(rolesData.length > 0 ? rolesData : defaultRoles);

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

  // Access Control
  const toggleRolePermission = useCallback(async (roleId: string, permissionId: string) => {
    if (roleId === "r1" || roleId === "owner") return; // Owner role is locked

    const current = roles.find(r => r.id === roleId);
    if (!current) return;

    const hasPerm = current.permissions.includes(permissionId);
    const newPerms = hasPerm
      ? current.permissions.filter(p => p !== permissionId)
      : [...current.permissions, permissionId];

    const recordId = (current as { recordId?: string }).recordId;
    if (!recordId) {
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: newPerms } : r));
      return;
    }

    try {
      const updated = await updateRole<Role>(recordId, { permissions: newPerms });
      setRoles(prev => prev.map(r => r.id === roleId ? updated : r));
    } catch (err) {
      console.error("Failed to update role permissions:", err);
    }
  }, [roles]);

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
    roles,
    permissions: PERMISSIONS,
    inviteLinks,
    tenantCode,
    currentUserRole,
    fetchMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
    updateMemberOrg,
    toggleRolePermission,
    generateInviteLink,
    revokeInviteLink,
    logActivity: () => refreshActivity()
  }), [
    members, loading, activityLogs, roles, inviteLinks, tenantCode, currentUserRole,
    fetchMembers, inviteMember, removeMember, updateMemberRole, updateMemberOrg,
    toggleRolePermission, generateInviteLink, revokeInviteLink, refreshActivity
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
