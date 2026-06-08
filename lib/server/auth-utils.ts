/**
 * OPERO — Server Auth Utilities
 *
 * These functions run on the server only (Server Components, Route Handlers,
 * Server Actions). Never import from client components.
 *
 * Available utilities:
 *   getCurrentUser()         — Get authenticated user or null
 *   getCurrentTenant()       — Get active organization or null
 *   requireAuth()            — Throw if not authenticated
 *   requireTenantAccess()    — Throw if user is not a member of the tenant
 *   requireRole()            — Throw if user does not have one of the required roles
 */

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeUserAvatarImage } from "@/lib/server/supabase-storage";
import { getUserDisplayName } from "@/lib/user-identity";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrgRole = "owner" | "admin" | "member";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface CurrentTenant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  status: string;
}

export interface TenantMembership {
  tenant: CurrentTenant;
  user: CurrentUser;
  role: OrgRole;
}

export interface TenantContext extends TenantMembership {
  tenantId: string;
  tenantSlug: string;
  userId: string;
}

export interface TenantContextFailure {
  status: 401 | 403 | 404 | 423;
  error: string;
  tenantSlug?: string | null;
}

export interface TenantContextResolution {
  context: TenantContext | null;
  failure: TenantContextFailure | null;
}

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Get the current Better Auth session from request headers.
 * Returns null if no valid session exists.
 * Wrapped in cache() to avoid multiple DB lookups per request.
 */
export const getSession = cache(async function getSession() {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    return session;
  } catch {
    return null;
  }
});

// ── Public utilities ──────────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user, or null if not authenticated.
 * Use in Server Components that need to conditionally render auth-gated UI.
 */
export const getCurrentUser = cache(async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  return userFromSession(session);
});

type TenantOrganization = Pick<CurrentTenant, "id" | "name" | "slug" | "logo" | "status">;
type CurrentSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;

function userFromSession(session: CurrentSession): CurrentUser {
  return {
    id: session.user.id,
    name: getUserDisplayName(session.user),
    email: session.user.email,
    image: normalizeUserAvatarImage(session.user.id, session.user.image ?? null),
  };
}

function createTenantContext(session: CurrentSession, tenant: TenantOrganization, role: string): TenantContext {
  return {
    tenant,
    user: userFromSession(session),
    role: role as OrgRole,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    userId: session.user.id,
  };
}

function failedTenantContext(
  status: TenantContextFailure["status"],
  error: string,
  tenantSlug?: string | null
): TenantContextResolution {
  return {
    context: null,
    failure: { status, error, tenantSlug },
  };
}

/**
 * Returns the active organization (tenant) from the current session, or null.
 * The active org is set by `authClient.organization.setActive()` on the client.
 */
export const getCurrentTenant = cache(async function getCurrentTenant(): Promise<CurrentTenant | null> {
  const session = await getSession();
  if (!session?.session?.activeOrganizationId) return null;

  const org = await prisma.organization.findUnique({
    where: { id: session.session.activeOrganizationId },
    select: { id: true, name: true, slug: true, logo: true, status: true },
  });

  return org ?? null;
});

/**
 * Asserts that the current request is authenticated.
 * Throws a Response with 401 status if not.
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

/**
 * Asserts that the current user is a member of the given tenant (by slug).
 * Returns { tenant, role } if valid.
 * Throws 401 if not authenticated, 403 if not a member.
 */
export async function requireTenantAccess(
  slug: string
): Promise<TenantMembership> {
  const user = await requireAuth();

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, logo: true, status: true },
  });

  if (!org) {
    throw new Response(JSON.stringify({ error: "Tenant not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (org.status !== "active") {
    throw new Response(JSON.stringify({ error: "Tenant inactive" }), {
      status: 423,
      headers: { "Content-Type": "application/json" },
    });
  }

  const membership = await prisma.member.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    select: { role: true, status: true },
  });

  if (!membership || membership.status !== "active") {
    throw new Response(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { tenant: org, user, role: membership.role as OrgRole };
}

/**
 * Asserts that the current user has one of the specified roles in the active tenant.
 * Throws 401 if not authenticated, 403 if role requirement not met.
 *
 * This is an explicit allow-list. Include every role that should pass.
 *
 * @example
 * await requireRole(["owner", "admin"]) // allow owner or admin
 */
export async function requireRole(
  allowedRoles: OrgRole[]
): Promise<TenantContext> {
  const context = await requireTenantMember();

  if (!allowedRoles.includes(context.role)) {
    throw new Response(
      JSON.stringify({ error: "Insufficient permissions" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return context;
}

/**
 * Resolves a tenant slug from the `x-tenant-slug` header injected by middleware.
 * Falls back to the active org in session if header is absent (local dev).
 */
export const resolveTenantFromRequest = cache(async function resolveTenantFromRequest(): Promise<CurrentTenant | null> {
  const hdrs = await headers();
  const slugFromHeader = hdrs.get("x-tenant-slug");

  if (slugFromHeader) {
    const org = await prisma.organization.findUnique({
      where: { slug: slugFromHeader },
      select: { id: true, name: true, slug: true, logo: true, status: true },
    });
    return org ?? null;
  }

  // Fallback: use active org from session
  return getCurrentTenant();
});

/**
 * Resolves the tenant context from trusted server state only.
 *
 * Shared database/shared schema rule: every tenant-owned query must use
 * `tenantId` from this helper, never a client-provided tenant_id.
 * Proxy injects x-tenant-slug as routing context; server handlers validate
 * authentication, tenant status, and membership here before touching data.
 */
export const resolveTenantContext = cache(async function resolveTenantContext(): Promise<TenantContextResolution> {
  const session = await getSession();
  if (!session?.user) return failedTenantContext(401, "Unauthorized");

  const hdrs = await headers();
  const headerTenantSlug = hdrs.get("x-tenant-slug");

  if (headerTenantSlug) {
    const tenant = await prisma.organization.findUnique({
      where: { slug: headerTenantSlug },
      select: { id: true, name: true, slug: true, logo: true, status: true },
    });

    if (!tenant) {
      return failedTenantContext(404, "Tenant not found", headerTenantSlug);
    }

    if (tenant.status !== "active") {
      return failedTenantContext(423, "Tenant inactive", headerTenantSlug);
    }

    const membership = await prisma.member.findUnique({
      where: {
        organizationId_userId: { organizationId: tenant.id, userId: session.user.id },
      },
      select: { role: true, status: true },
    });

    if (!membership || membership.status !== "active") {
      return failedTenantContext(403, "Access denied", headerTenantSlug);
    }

    return {
      context: createTenantContext(session, tenant, membership.role),
      failure: null,
    };
  }

  if (!session.session?.activeOrganizationId) {
    return failedTenantContext(401, "Unauthorized");
  }

  const membership = await prisma.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.session.activeOrganizationId,
        userId: session.user.id,
      },
    },
    select: {
      role: true,
      status: true,
      organization: {
        select: { id: true, name: true, slug: true, logo: true, status: true },
      },
    },
  });

  if (!membership?.organization) {
    return failedTenantContext(403, "Access denied");
  }

  if (membership.organization.status !== "active") {
    return failedTenantContext(423, "Tenant inactive", membership.organization.slug);
  }

  if (membership.status !== "active") {
    return failedTenantContext(403, "Access denied", membership.organization.slug);
  }

  return {
    context: createTenantContext(session, membership.organization, membership.role),
    failure: null,
  };
});

export const getTenantContext = cache(async function getTenantContext(): Promise<TenantContext | null> {
  const result = await resolveTenantContext();
  return result.context;
});

export async function requireTenant(): Promise<TenantContext> {
  const result = await resolveTenantContext();
  if (!result.context) {
    const failure = result.failure ?? { status: 401, error: "Unauthorized" };
    throw new Response(JSON.stringify({ error: failure.error }), {
      status: failure.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  return result.context;
}

export async function requireTenantMember(): Promise<TenantContext> {
  return requireTenant();
}
