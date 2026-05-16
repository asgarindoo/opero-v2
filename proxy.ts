/**
 * OPERO — Middleware (Next.js 16 App Router)
 *
 * Handles:
 *   1. Authentication guard — redirect to /login if no session
 *   2. Tenant routing — subdomain extraction in production,
 *      session-based active org in local dev
 *   3. Onboarding flow — redirect based on org membership state
 *
 * Cookie contract (set by Better Auth + organization.setActive):
 *   better-auth.session_token  — Better Auth session cookie
 *   better-auth.session_data   — Cached session data (optional)
 *
 * In production, subdomains like acme.opero.app are resolved here.
 * In local dev (localhost:3000), path-based routing is used with
 * the active organization tracked in the Better Auth session.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Better Auth session cookie name */
const SESSION_COOKIE = "better-auth.session_token";

/** Routes that don't require any auth check */
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"];

/** Known non-tenant subdomains */
const SYSTEM_SUBDOMAINS = new Set(["www", "app", "api", "opero"]);

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") || // Better Auth routes are always public
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // ── Subdomain extraction (production only) ─────────────────────────
  // In production: acme.opero.app → tenantSlug = "acme"
  // In local dev: localhost:3000 → no subdomain, use session
  let tenantSlugFromSubdomain: string | null = null;
  if (process.env.NODE_ENV === "production") {
    const parts = hostname.split(".");
    if (parts.length >= 3) {
      const sub = parts[0];
      if (!SYSTEM_SUBDOMAINS.has(sub)) {
        tenantSlugFromSubdomain = sub;
      }
    }
  }

  // ── Session check (lightweight — just look at cookie presence) ─────
  // Full session validation happens in server utilities (auth-utils.ts)
  // Middleware keeps DB queries to zero for performance.
  const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value;

  // ── Public routes — always pass through ───────────────────────────
  if (isPublicRoute(pathname)) {
    // If user is authenticated and visits /login or /register, redirect to dashboard
    if (hasSession && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // ── Protected routes ──────────────────────────────────────────────

  // 1. Not authenticated → /login
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated but visiting /tenants or /onboarding — allowed
  if (
    pathname.startsWith("/tenants") ||
    pathname.startsWith("/onboarding")
  ) {
    return NextResponse.next();
  }

  // 3. Dashboard routes — inject tenant slug header for server components
  if (pathname.startsWith("/dashboard")) {
    const response = NextResponse.next();

    // Pass subdomain slug to server via header (production)
    if (tenantSlugFromSubdomain) {
      response.headers.set("x-tenant-slug", tenantSlugFromSubdomain);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT Next.js internals and static files.
     * This is the recommended pattern for Next.js 16 middleware.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
