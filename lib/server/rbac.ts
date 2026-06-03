import { requireTenant, type OrgRole, type TenantContext } from "@/lib/server/auth-utils";

const ALL_ROLES = ["owner", "admin", "member"] as const satisfies readonly OrgRole[];
const MANAGER_ROLES = ["owner", "admin"] as const satisfies readonly OrgRole[];
const OWNER_ROLE = ["owner"] as const satisfies readonly OrgRole[];

const RBAC_POLICY = {
  "activity.read": ALL_ROLES,
  "dashboard.read": ALL_ROLES,

  "tasks.read": ALL_ROLES,
  "tasks.create": ALL_ROLES,
  "tasks.update": ALL_ROLES,
  "tasks.delete": MANAGER_ROLES,

  "documents.read": ALL_ROLES,
  "documents.create": ALL_ROLES,
  "documents.update": ALL_ROLES,
  "documents.delete": MANAGER_ROLES,

  "documentFolders.read": ALL_ROLES,
  "documentFolders.create": ALL_ROLES,
  "documentFolders.update": ALL_ROLES,
  "documentFolders.delete": MANAGER_ROLES,

  "chat.read": ALL_ROLES,
  "chat.create": ALL_ROLES,
  "chat.update": ALL_ROLES,
  "chat.manage": MANAGER_ROLES,

  "contacts.read": ALL_ROLES,
  "contacts.create": ALL_ROLES,
  "contacts.update": ALL_ROLES,
  "contacts.delete": MANAGER_ROLES,

  "finance.read": ALL_ROLES,
  "finance.create": MANAGER_ROLES,
  "finance.update": MANAGER_ROLES,
  "finance.delete": MANAGER_ROLES,

  "invoices.read": ALL_ROLES,
  "invoices.create": MANAGER_ROLES,
  "invoices.update": MANAGER_ROLES,
  "invoices.delete": MANAGER_ROLES,

  "products.read": ALL_ROLES,
  "products.create": ALL_ROLES,
  "products.update": ALL_ROLES,
  "products.delete": MANAGER_ROLES,

  "sales.read": ALL_ROLES,
  "sales.create": ALL_ROLES,
  "sales.update": ALL_ROLES,
  "sales.delete": MANAGER_ROLES,

  "assets.read": ALL_ROLES,
  "assets.create": ALL_ROLES,
  "assets.update": ALL_ROLES,
  "assets.delete": MANAGER_ROLES,

  "campaigns.read": ALL_ROLES,
  "campaigns.create": ALL_ROLES,
  "campaigns.update": ALL_ROLES,
  "campaigns.delete": MANAGER_ROLES,

  "contentPlanner.read": ALL_ROLES,
  "contentPlanner.create": ALL_ROLES,
  "contentPlanner.update": ALL_ROLES,
  "contentPlanner.delete": MANAGER_ROLES,

  "socialChannels.read": ALL_ROLES,
  "socialChannels.create": MANAGER_ROLES,
  "socialChannels.update": MANAGER_ROLES,
  "socialChannels.delete": MANAGER_ROLES,

  "goals.read": ALL_ROLES,
  "goals.create": ALL_ROLES,
  "goals.update": ALL_ROLES,
  "goals.delete": MANAGER_ROLES,

  "flows.read": ALL_ROLES,
  "flows.create": ALL_ROLES,
  "flows.update": ALL_ROLES,
  "flows.delete": MANAGER_ROLES,

  "members.read": ALL_ROLES,
  "members.invite": MANAGER_ROLES,
  "members.manage": MANAGER_ROLES,

  "settings.read": ALL_ROLES,
  "settings.update": MANAGER_ROLES,

  "files.read": ALL_ROLES,
  "files.upload": ALL_ROLES,
  "files.delete": MANAGER_ROLES,

  "tenant.delete": OWNER_ROLE,
} as const satisfies Record<string, readonly OrgRole[]>;

export type RbacPermission = keyof typeof RBAC_POLICY;

function forbidden(message = "Insufficient permissions"): never {
  throw new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeRole(role: unknown): OrgRole | null {
  return role === "owner" || role === "admin" || role === "member" ? role : null;
}

export function canUsePermission(role: OrgRole, permission: RbacPermission) {
  const allowedRoles: readonly OrgRole[] = RBAC_POLICY[permission];
  return allowedRoles.includes(role);
}

export async function requirePermission(permission: RbacPermission): Promise<TenantContext> {
  const context = await requireTenant();
  if (!canUsePermission(context.role, permission)) forbidden();
  return context;
}

export function canDeleteTenant(role: OrgRole) {
  return canUsePermission(role, "tenant.delete");
}

export function canManageMembers(actorRole: OrgRole, targetRole?: unknown, nextRole?: unknown) {
  if (!canUsePermission(actorRole, "members.manage")) return false;
  if (actorRole === "owner") return true;

  const currentTargetRole = normalizeRole(targetRole);
  const requestedRole = normalizeRole(nextRole);
  return (
    (currentTargetRole === null || currentTargetRole === "member") &&
    (requestedRole === null || requestedRole === "member")
  );
}
