import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * OPERO Route Guard — Proxy (Next.js 16 file convention)
 *
 * Cookie contract (set by login/register client pages):
 *   opero_session        = "1"           → user is authenticated
 *   opero_tenants        = "slug1,slug2" → comma-separated tenant slugs (empty = no tenants)
 *   opero_active_tenant  = "slug1"       → currently active tenant (empty = none selected)
 *
 * Subdomain note:
 *   Production would detect `request.nextUrl.hostname` (e.g. "acme.opero.app")
 *   and resolve the tenant from the subdomain. For local dev we keep path-based routing.
 *   Plug-in point marked with  // [SUBDOMAIN] comment below.
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session       = request.cookies.get("opero_session")?.value;
  const tenantsRaw    = request.cookies.get("opero_tenants")?.value ?? "";
  const activeTenant  = request.cookies.get("opero_active_tenant")?.value ?? "";

  const isAuthed   = !!session;
  const hasTenants = tenantsRaw.trim().length > 0;

  // ── [SUBDOMAIN] ──────────────────────────────────────────────────────────
  // const host = request.nextUrl.hostname;           // e.g. "acme.opero.app"
  // const subdomain = host.split(".")[0];            // e.g. "acme"
  // const isTenantSubdomain = subdomain !== "www" && subdomain !== "opero";
  // if (isTenantSubdomain) { /* validate tenant membership here */ }
  // ─────────────────────────────────────────────────────────────────────────

  // Protected: /dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthed)     return NextResponse.redirect(new URL("/login",    request.url));
    if (!activeTenant) return NextResponse.redirect(new URL(hasTenants ? "/tenants" : "/onboarding", request.url));
  }

  // Protected: /tenants
  if (pathname.startsWith("/tenants")) {
    if (!isAuthed) return NextResponse.redirect(new URL("/login", request.url));
    // If user already has an active tenant, go straight to dashboard
    if (activeTenant) return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected: /onboarding
  if (pathname.startsWith("/onboarding")) {
    if (!isAuthed) return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tenants/:path*", "/onboarding/:path*"],
};
