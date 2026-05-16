"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Member, Role, Permission, ActivityLog, RoleType, InviteLink } from "../types";

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

const ALL_PERMS = PERMISSIONS.map(p => p.id);
const ADMIN_PERMS = ALL_PERMS.filter(p => p !== "settings_manage");
const STAFF_PERMS = ["dash_view", "tasks_view", "tasks_create", "goals_view", "flows_view", "chat_access", "members_view"];

const INITIAL_ROLES: Role[] = [
  { id: "r1", name: "Owner", description: "Full administrative access to the entire workspace. Cannot be restricted.", permissions: ALL_PERMS },
  { id: "r2", name: "Admin", description: "Can manage members and operations, but cannot access global settings.", permissions: ADMIN_PERMS },
  { id: "r3", name: "Staff", description: "Standard user access. Can collaborate on work but cannot manage system settings.", permissions: STAFF_PERMS },
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
  toggleRolePermission: (roleId: string, permissionId: string) => void;

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
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [tenantCode, setTenantCode] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<RoleType | null>(null);

  const logActivity = useCallback((action: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(7),
      userId: "system",
      action,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
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
          initials: (m.name || m.email).charAt(0).toUpperCase()
        })));
      }
      if (membersData.currentRole) {
        setCurrentUserRole(roleMap[membersData.currentRole] || "Staff");
      }

      const canInvite = membersData.currentRole === "owner" || membersData.currentRole === "admin";
      if (!canInvite) {
        setTenantCode("");
        setInviteLinks([]);
        return;
      }

      const inviteRes = await fetch("/api/tenant/invite");
      const inviteData = await inviteRes.json();

      if (inviteData.inviteCode) {
        setTenantCode(inviteData.inviteCode);
      }
      if (inviteData.inviteLinks) {
        setInviteLinks(inviteData.inviteLinks);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMembers();
  }, [fetchMembers]);

  const inviteMember = useCallback(async (email: string, role: RoleType) => {
    // This currently just mocks the "invited" status in the list 
    // real invitations would go through an invite table / email flow
    logActivity(`Invite requested for ${email} as ${role}`);
    await fetchMembers();
  }, [logActivity, fetchMembers]);

  const removeMember = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tenant/members/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
        logActivity(`Removed member ${id}`);
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  }, [logActivity]);

  const updateMemberRole = useCallback(async (id: string, newRole: RoleType) => {
    try {
      const res = await fetch(`/api/tenant/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: revRoleMap[newRole] })
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
        logActivity(`Updated role for member ${id} to ${newRole}`);
      }
    } catch (err) {
      console.error("Failed to update member role:", err);
    }
  }, [logActivity]);

  const updateMemberOrg = useCallback(async (id: string, department: string, jobTitle: string) => {
    try {
      const res = await fetch(`/api/tenant/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department, position: jobTitle })
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, department, jobTitle } : m));
        logActivity(`Updated organization structure for member ${id}`);
      }
    } catch (err) {
      console.error("Failed to update member org:", err);
    }
  }, [logActivity]);

  // Access Control (Local for now, could be persisted later)
  const toggleRolePermission = useCallback((roleId: string, permissionId: string) => {
    if (roleId === "r1") return; // Owner role is locked

    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r;
      const hasPerm = r.permissions.includes(permissionId);
      const newPerms = hasPerm
        ? r.permissions.filter(p => p !== permissionId)
        : [...r.permissions, permissionId];
      return { ...r, permissions: newPerms };
    }));
  }, []);

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
    logActivity
  }), [
    members, loading, activityLogs, roles, inviteLinks, tenantCode, currentUserRole,
    fetchMembers, inviteMember, removeMember, updateMemberRole, updateMemberOrg,
    toggleRolePermission, generateInviteLink, revokeInviteLink, logActivity
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
