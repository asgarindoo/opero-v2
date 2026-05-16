"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Member, Role, Permission, ActivityLog, RoleType, InviteLink } from "../types";

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

const MOCK_MEMBERS: Member[] = [
  { id: "m1", name: "You (Owner)", email: "you@example.com", role: "Owner", status: "active", department: "Management", jobTitle: "CEO", initials: "Y", joinedAt: "2024-01-10", lastActive: "Just now" },
  { id: "m2", name: "Sarah Connor", email: "sarah@example.com", role: "Admin", status: "active", department: "Operations", jobTitle: "Head of Operations", initials: "SC", joinedAt: "2024-02-15", lastActive: "2 hours ago" },
  { id: "m3", name: "John Doe", email: "john@example.com", role: "Staff", status: "active", department: "Engineering", jobTitle: "Software Engineer", initials: "JD", joinedAt: "2024-03-01", lastActive: "1 day ago" },
];

const MOCK_LOGS: ActivityLog[] = [];
const MOCK_LINKS: InviteLink[] = [
  { id: "link1", url: "https://opero.app/join/OP-MAIN-2024", createdBy: "You (Owner)", createdAt: "2024-05-10T10:00:00Z", expiresAt: null, uses: 12 }
];

interface MembersContextType {
  members: Member[];
  activityLogs: ActivityLog[];
  roles: Role[];
  permissions: Permission[];
  inviteLinks: InviteLink[];
  tenantCode: string;
  
  // Member actions
  inviteMember: (email: string, role: RoleType, department?: string) => void;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, newRole: RoleType) => void;
  updateMemberOrg: (id: string, department: string, jobTitle: string) => void;
  
  // Access Control actions
  toggleRolePermission: (roleId: string, permissionId: string) => void;
  
  // Invite Link actions
  generateInviteLink: (expireDays: number | null) => InviteLink;
  revokeInviteLink: (id: string) => void;

  logActivity: (action: string) => void;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

export function MembersProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(MOCK_LOGS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>(MOCK_LINKS);
  const [tenantCode] = useState("OP-MAIN-2024");

  const logActivity = useCallback((action: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(7),
      userId: "m1",
      action,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, []);

  const inviteMember = useCallback((email: string, role: RoleType, department?: string) => {
    const newMember: Member = {
      id: Math.random().toString(36).substring(7),
      name: email.split("@")[0],
      email,
      role,
      status: "invited",
      department,
      initials: email.substring(0, 2).toUpperCase(),
      joinedAt: new Date().toISOString()
    };
    setMembers(prev => [...prev, newMember]);
    logActivity(`Invited ${email} as ${role}`);
  }, [logActivity]);

  const removeMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    logActivity(`Removed member ${id}`);
  }, [logActivity]);

  const updateMemberRole = useCallback((id: string, newRole: RoleType) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    logActivity(`Updated role for member ${id} to ${newRole}`);
  }, [logActivity]);

  const updateMemberOrg = useCallback((id: string, department: string, jobTitle: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, department, jobTitle } : m));
    logActivity(`Updated organization structure for member ${id}`);
  }, [logActivity]);

  // Access Control
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
    
    const roleName = roles.find(r => r.id === roleId)?.name;
    const permName = PERMISSIONS.find(p => p.id === permissionId)?.name;
    logActivity(`Toggled permission '${permName}' for role '${roleName}'`);
  }, [roles, logActivity]);

  // Invite Links
  const generateInviteLink = useCallback((expireDays: number | null) => {
    const expiresAt = expireDays ? new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000).toISOString() : null;
    
    const newLink: InviteLink = {
      id: Math.random().toString(36).substring(7),
      url: `https://opero.app/join/${tenantCode}`,
      createdBy: "You (Owner)",
      createdAt: new Date().toISOString(),
      expiresAt,
      uses: 0
    };
    
    setInviteLinks(prev => [newLink, ...prev]);
    logActivity(`Generated new invite link (Direct Access)`);
    return newLink;
  }, [tenantCode, logActivity]);

  const revokeInviteLink = useCallback((id: string) => {
    setInviteLinks(prev => prev.filter(l => l.id !== id));
    logActivity(`Revoked an invite link`);
  }, [logActivity]);

  const value = useMemo(() => ({
    members,
    activityLogs,
    roles,
    permissions: PERMISSIONS,
    inviteLinks,
    tenantCode,
    inviteMember,
    removeMember,
    updateMemberRole,
    updateMemberOrg,
    toggleRolePermission,
    generateInviteLink,
    revokeInviteLink,
    logActivity
  }), [
    members, activityLogs, roles, inviteLinks, tenantCode,
    inviteMember, removeMember, updateMemberRole, updateMemberOrg,
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

