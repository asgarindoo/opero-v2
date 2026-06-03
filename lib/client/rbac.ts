"use client";

import type { OrgRole } from "@/lib/server/auth-utils";

const ALL_ROLES = ["owner", "admin", "member"] as const satisfies readonly OrgRole[];
const MANAGER_ROLES = ["owner", "admin"] as const satisfies readonly OrgRole[];
const OWNER_ROLE = ["owner"] as const satisfies readonly OrgRole[];

const UI_RBAC_POLICY = {
  "tasks.delete": MANAGER_ROLES,
  "documents.delete": MANAGER_ROLES,
  "documentFolders.delete": MANAGER_ROLES,
  "finance.create": MANAGER_ROLES,
  "finance.update": MANAGER_ROLES,
  "finance.delete": MANAGER_ROLES,
  "invoices.create": MANAGER_ROLES,
  "invoices.update": MANAGER_ROLES,
  "invoices.delete": MANAGER_ROLES,
  "contacts.delete": MANAGER_ROLES,
  "products.delete": MANAGER_ROLES,
  "sales.delete": MANAGER_ROLES,
  "assets.delete": MANAGER_ROLES,
  "campaigns.delete": MANAGER_ROLES,
  "contentPlanner.delete": MANAGER_ROLES,
  "socialChannels.create": MANAGER_ROLES,
  "socialChannels.update": MANAGER_ROLES,
  "socialChannels.delete": MANAGER_ROLES,
  "goals.delete": MANAGER_ROLES,
  "flows.delete": MANAGER_ROLES,
  "members.invite": MANAGER_ROLES,
  "members.manage": MANAGER_ROLES,
  "settings.update": MANAGER_ROLES,
  "tenant.delete": OWNER_ROLE,
} as const satisfies Record<string, readonly OrgRole[]>;

export type ClientPermission = keyof typeof UI_RBAC_POLICY;

export function canUse(role: OrgRole | null | undefined, permission: ClientPermission) {
  if (!role) return false;
  return (UI_RBAC_POLICY[permission] as readonly OrgRole[]).includes(role);
}

export function isManagerRole(role: OrgRole | null | undefined) {
  return role ? (ALL_ROLES as readonly OrgRole[]).includes(role) && (MANAGER_ROLES as readonly OrgRole[]).includes(role) : false;
}
