/**
 * OPERO — Server-Side Tenant Resolver
 *
 * SERVER ONLY — do not import in "use client" components.
 *
 * Provides:
 *   resolveTenantBySlug(slug)   — DB lookup
 *   getTenantContext(request)   — full tenant + user + role from request
 *   requireTenant(request)      — throws 403 Response if context is missing
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { extractTenantSlugFromHost } from "@/lib/routing";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TenantInfo {
  id:     string;
  slug:   string;
  name:   string;
  logo:   string | null;
  status: string;
}

export interface TenantContext {
  tenant: TenantInfo;
  userId: string;
  role:   string;
}

// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Look up an organization by slug.
 * Returns null if not found.
 */
export async function resolveTenantBySlug(slug: string): Promise<TenantInfo | null> {
  return prisma.organization.findUnique({
    where:  { slug },
    select: { id: true, slug: true, name: true, logo: true, status: true },
  });
}

/**
 * Get the full tenant context (tenant + user + role) from a request.
 *
 * Returns null when:
 *   - Request is not from a tenant subdomain
 *   - User is not authenticated
 *   - Tenant not found or not active
 *   - User is not an active member of the tenant
 */
export async function getTenantContext(request: NextRequest): Promise<TenantContext | null> {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const slug = extractTenantSlugFromHost(host);
  if (!slug) return null;

  const session = await auth.api
    .getSession({ headers: request.headers })
    .catch(() => null);
  if (!session?.user?.id) return null;

  const tenant = await resolveTenantBySlug(slug);
  if (!tenant || tenant.status !== "active") return null;

  const membership = await prisma.member.findUnique({
    where: {
      organizationId_userId: { organizationId: tenant.id, userId: session.user.id },
    },
    select: { role: true, status: true },
  });
  if (!membership || membership.status !== "active") return null;

  return { tenant, userId: session.user.id, role: membership.role };
}

/**
 * Like getTenantContext but throws a 403 Response if context cannot be resolved.
 * Use in Route Handlers and Server Actions that require tenant access.
 *
 * Usage:
 *   const ctx = await requireTenant(request);
 *   // ctx.tenant, ctx.userId, ctx.role are guaranteed
 */
export async function requireTenant(request: NextRequest): Promise<TenantContext> {
  const ctx = await getTenantContext(request);
  if (!ctx) {
    throw new Response(
      JSON.stringify({ error: "Tenant access required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return ctx;
}
