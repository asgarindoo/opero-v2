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

  return {
    id: session.user.id,
    name: getUserDisplayName(session.user),
    email: session.user.email,
    image: normalizeUserAvatarImage(session.user.id, session.user.image ?? null),
  };
});

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
 * Proxy may inject x-tenant-* headers after validation; server handlers still
 * re-check session, tenant status, and membership here before touching data.
 */
export const getTenantContext = cache(async function getTenantContext(): Promise<TenantContext | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const hdrs = await headers();
  const headerTenantSlug = hdrs.get("x-tenant-slug");
  
  let membership;

  if (headerTenantSlug) {
    membership = await prisma.member.findFirst({
      where: { 
        userId: session.user.id,
        organization: { slug: headerTenantSlug, status: "active" },
        status: "active"
      },
      select: { 
        role: true, 
        organization: {
          select: { id: true, name: true, slug: true, logo: true, status: true }
        } 
      }
    });
  } else if (session.session?.activeOrganizationId) {
    membership = await prisma.member.findUnique({
      where: {
        organizationId_userId: { organizationId: session.session.activeOrganizationId, userId: session.user.id },
      },
      select: {
        role: true,
        status: true,
        organization: {
          select: { id: true, name: true, slug: true, logo: true, status: true }
        }
      }
    });
    
    if (membership && (membership.status !== "active" || membership.organization.status !== "active")) {
      membership = null;
    }
  }

  if (!membership || !membership.organization) return null;

  return {
    tenant: membership.organization,
    user: {
      id: session.user.id,
      name: getUserDisplayName(session.user),
      email: session.user.email,
      image: normalizeUserAvatarImage(session.user.id, session.user.image ?? null),
    },
    role: membership.role as OrgRole,
    tenantId: membership.organization.id,
    tenantSlug: membership.organization.slug,
    userId: session.user.id,
  };
});

export async function requireTenant(): Promise<TenantContext> {
  const context = await getTenantContext();
  if (!context) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return context;
}

export async function requireTenantMember(): Promise<TenantContext> {
  return requireTenant();
}
