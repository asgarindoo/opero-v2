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
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
}

export interface TenantMembership {
  tenant: CurrentTenant;
  role: OrgRole;
}

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Get the current Better Auth session from request headers.
 * Returns null if no valid session exists.
 */
async function getSession() {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    return session;
  } catch {
    return null;
  }
}

// ── Public utilities ──────────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user, or null if not authenticated.
 * Use in Server Components that need to conditionally render auth-gated UI.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };
}

/**
 * Returns the active organization (tenant) from the current session, or null.
 * The active org is set by `authClient.organization.setActive()` on the client.
 */
export async function getCurrentTenant(): Promise<CurrentTenant | null> {
  const session = await getSession();
  if (!session?.session?.activeOrganizationId) return null;

  const org = await prisma.organization.findUnique({
    where: { id: session.session.activeOrganizationId },
    select: { id: true, name: true, slug: true, logo: true },
  });

  return org ?? null;
}

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
    select: { id: true, name: true, slug: true, logo: true },
  });

  if (!org) {
    throw new Response(JSON.stringify({ error: "Tenant not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const membership = await prisma.member.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    select: { role: true },
  });

  if (!membership) {
    throw new Response(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return { tenant: org, role: membership.role as OrgRole };
}

/**
 * Asserts that the current user has one of the specified roles in the active tenant.
 * Throws 401 if not authenticated, 403 if role requirement not met.
 *
 * Role hierarchy: owner > admin > member
 *
 * @example
 * await requireRole(["owner", "admin"]) // allow owner or admin
 */
export async function requireRole(
  allowedRoles: OrgRole[]
): Promise<TenantMembership> {
  const user = await requireAuth();
  const tenant = await getCurrentTenant();

  if (!tenant) {
    throw new Response(JSON.stringify({ error: "No active tenant" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const membership = await prisma.member.findUnique({
    where: {
      organizationId_userId: { organizationId: tenant.id, userId: user.id },
    },
    select: { role: true },
  });

  if (!membership || !allowedRoles.includes(membership.role as OrgRole)) {
    throw new Response(
      JSON.stringify({ error: "Insufficient permissions" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return { tenant, role: membership.role as OrgRole };
}

/**
 * Resolves a tenant slug from the `x-tenant-slug` header injected by middleware.
 * Falls back to the active org in session if header is absent (local dev).
 */
export async function resolveTenantFromRequest(): Promise<CurrentTenant | null> {
  const hdrs = await headers();
  const slugFromHeader = hdrs.get("x-tenant-slug");

  if (slugFromHeader) {
    const org = await prisma.organization.findUnique({
      where: { slug: slugFromHeader },
      select: { id: true, name: true, slug: true, logo: true },
    });
    return org ?? null;
  }

  // Fallback: use active org from session
  return getCurrentTenant();
}
