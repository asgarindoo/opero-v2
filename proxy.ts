/**
 * OPERO — Next.js 16 Proxy
 *
 * Multi-tenant subdomain routing.
 * Auth/RBAC logic is untouched — only routing and tenant resolution live here.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Local:       localhost:3000        → root app                      │
 * │               myotic.localhost:3000 → tenant "myotic"               │
 * │  Production:  opero.my.id           → root app                      │
 * │               myotic.opero.my.id    → tenant "myotic"               │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Cross-subdomain auth:
 *   Browser cookies cannot reliably cross localhost ↔ *.localhost.
 *   We use a signed handoff token (?__handoff) instead.
 *   Flow:
 *     1. Login on localhost:3000
 *     2. GET /api/auth/handoff → signed 30s token
 *     3. Navigate to myotic.localhost:3000/dashboard?__handoff=<token>
 *     4. Proxy verifies token → sets session cookie → clean redirect
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  extractTenantSlugFromHost,
  buildRootUrl,
  buildTenantUrl,
  getRootUrl,
} from "@/lib/routing";
import { verifyHandoffToken, createHandoffToken } from "@/lib/handoff";

// ─── Route classification ─────────────────────────────────────────────────────

const SESSION_COOKIE = "better-auth.session_token";
const SESSION_DATA_COOKIE = "better-auth.session_data";
const SESSION_DATA_COOKIE_CLEAR_LIMIT = 32;

// ─── Cookie signing ───────────────────────────────────────────────────────────

/**
 * Sign a session token the same way Better Auth does internally.
 * Better Auth's setSignedCookie stores: `rawToken.base64(HMAC-SHA256(rawToken, secret))`
 * and verifySignedCookie strips the signature back to rawToken before DB lookup.
 *
 * We must replicate this so `auth.api.getSession()` can read the cookie we set.
 */
async function signSessionToken(rawToken: string): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET ?? "fallback-secret-change-me";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawToken));
  // Better Auth uses plain btoa (not URL-safe) for the signature
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${rawToken}.${b64}`;
}

/**
 * Routes that belong to the root domain only.
 * Tenant subdomains must redirect these to root.
 */
const ROOT_ONLY_ROUTES = [
  "/",
  "/login",
  "/register",
  "/logout",
  "/forgot-password",
  "/onboarding",
  "/join",
  "/create-tenant",
  "/tenants",
  "/unauthorized",
  "/tenant-not-found",
  "/tenant-inactive",
];

/** Auth routes — login/register only exist on root domain. Authenticated users are redirected away from these. */
const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password"]);

/** Short dashboard paths that map to /dashboard/<path>. */
const TENANT_SHORTPATHS = new Set([
  "/activity", "/assets", "/campaigns", "/chat",
  "/contacts", "/content-planner", "/documents", "/finance",
  "/flows", "/goals", "/invoices",
  "/members", "/sales", "/settings",
  "/social-channels", "/tasks",
]);

// ─── Route helpers ────────────────────────────────────────────────────────────

function isStaticOrInternal(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||   // Better Auth + handoff endpoint
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  );
}

/**
 * "/" matches ONLY the exact root.
 * Other routes match exact or with a "/" prefix.
 * This prevents "/" from accidentally matching every path.
 */
function isRootOnlyRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return ROOT_ONLY_ROUTES
    .filter((r) => r !== "/")
    .some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname);
}

/** /logout must always reach the logout page — never be intercepted by auth checks. */
function isLogoutRoute(pathname: string): boolean {
  return pathname === "/logout" || pathname.startsWith("/logout/");
}

function isTenantRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/tenant") ||
    TENANT_SHORTPATHS.has(pathname) ||
    Array.from(TENANT_SHORTPATHS).some((p) => pathname.startsWith(`${p}/`))
  );
}

function isTenantAwareApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/profile");
}

/** Rewrite short tenant paths to /dashboard/<path>. */
function normalizeToTenantPath(pathname: string): string {
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/tenant") || pathname.startsWith("/api/profile"))
    return pathname;
  const match = Array.from(TENANT_SHORTPATHS).find(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  return match ? `/dashboard${pathname}` : pathname;
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

/**
 * Cookie domain strategy:
 *   localhost → omit domain (host-only cookie, RFC 6265 compliant).
 *               Domain=localhost and Domain=.localhost are browser-rejected.
 *   production → use root domain (e.g. ".opero.my.id") for subdomain sharing.
 *
 * In local dev, cross-subdomain auth is handled by the handoff token.
 */
function isLocalDev(): boolean {
  const url = new URL(getRootUrl());
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

function pendingSlugCookieOpts() {
  const local = isLocalDev();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  return {
    path: "/",
    httpOnly: false,        // login page reads this with getCookieValue()
    sameSite: "lax" as const,
    secure: !local,
    maxAge: 600,          // 10 minutes
    ...(!local && rootDomain ? { domain: `.${rootDomain}` } : {}),
  };
}

function authCookieExpireOpts() {
  const local = isLocalDev();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: !local,
    maxAge: 0,
    ...(!local && rootDomain ? { domain: `.${rootDomain}` } : {}),
  };
}

function expireAuthCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", authCookieExpireOpts());
}

function isSessionDataCookieName(name: string) {
  return (
    name === SESSION_DATA_COOKIE ||
    name.startsWith(`${SESSION_DATA_COOKIE}.`) ||
    name === `__Secure-${SESSION_DATA_COOKIE}` ||
    name.startsWith(`__Secure-${SESSION_DATA_COOKIE}.`)
  );
}

function sessionDataCookieSortKey(name: string) {
  const normalized = name.startsWith("__Secure-") ? name.slice("__Secure-".length) : name;
  if (normalized === SESSION_DATA_COOKIE) return -1;
  const index = Number(normalized.slice(`${SESSION_DATA_COOKIE}.`.length));
  return Number.isFinite(index) ? index : Number.MAX_SAFE_INTEGER;
}

function cleanupSessionDataCookies(request: NextRequest, response: NextResponse) {
  const cookieNames = Array.from(
    new Set(
      request.cookies
        .getAll()
        .map((cookie) => cookie.name)
        .filter(isSessionDataCookieName)
    )
  )
    .sort((a, b) => sessionDataCookieSortKey(a) - sessionDataCookieSortKey(b) || a.localeCompare(b))
    .slice(0, SESSION_DATA_COOKIE_CLEAR_LIMIT);

  for (const cookieName of cookieNames) {
    expireAuthCookie(response, cookieName);
  }

  return response;
}

// ─── Request helpers ──────────────────────────────────────────────────────────

function stripSessionDataCookies(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .filter((cookie) => {
      const [name] = cookie.split("=");
      return name ? !isSessionDataCookieName(name.trim()) : false;
    });

  return cookies.length > 0 ? cookies.join("; ") : null;
}

function getHost(request: NextRequest): string {
  return request.headers.get("host") ?? request.nextUrl.host;
}

function sanitizeHeaders(headers: Headers): Headers {
  const h = new Headers(headers);
  ["x-tenant-id", "x-tenant-slug", "x-user-id", "x-user-role"].forEach((k) =>
    h.delete(k)
  );
  const cookieHeader = stripSessionDataCookies(h.get("cookie"));
  if (cookieHeader) h.set("cookie", cookieHeader);
  else h.delete("cookie");
  return h;
}

function passThrough(request: NextRequest): NextResponse {
  const response = NextResponse.next({
    request: { headers: sanitizeHeaders(request.headers) },
  });
  return cleanupSessionDataCookies(request, response);
}

// ─── Session ──────────────────────────────────────────────────────────────────

async function getSession(request: NextRequest) {
  return auth.api.getSession({ headers: sanitizeHeaders(request.headers) }).catch(() => null);
}

// ─── Tenant resolution ────────────────────────────────────────────────────────

async function resolveTenant(
  request: NextRequest,
  tenantSlug: string,
  userId: string
): Promise<NextResponse> {
  // Inject trusted tenant context headers — read in Server Components via headers()
  // Note: We no longer run heavy Prisma queries here. Next.js Server Components
  // (via requireTenant/getTenantContext) will validate tenant existence and membership.
  const requestHeaders = sanitizeHeaders(request.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);
  requestHeaders.set("x-user-id", userId);

  // Rewrite short paths to /dashboard/<path>
  const normalPath = normalizeToTenantPath(request.nextUrl.pathname);
  if (normalPath !== request.nextUrl.pathname) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = normalPath;
    return cleanupSessionDataCookies(
      request,
      NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } })
    );
  }

  return cleanupSessionDataCookies(
    request,
    NextResponse.next({ request: { headers: requestHeaders } })
  );
}

// ─── Main proxy ───────────────────────────────────────────────────────────────

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const host = getHost(request);
  const tenantSlug = extractTenantSlugFromHost(host);
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const handoff = request.nextUrl.searchParams.get("__handoff");

  // ── Debug ─────────────────────────────────────────────────────────────────
  // We only log handoffs or important redirects to keep the terminal clean
  // console.log(`\n[PROXY] ${request.method} ${pathname}`);
  // console.log(`[PROXY] host=${host}  tenant=${tenantSlug ?? "(root)"}  session=${hasSession}`);

  // ── 1. Static / internal — always pass through ────────────────────────────
  if (isStaticOrInternal(pathname)) return passThrough(request);

  // ── 2. Session handoff — cross-subdomain cookie injection ─────────────────
  //    myotic.localhost:3000/dashboard?__handoff=<token>
  //    Verify HMAC token → sign session token → set cookie → redirect to clean URL
  if (tenantSlug && handoff) {
    console.log(`[PROXY] ▶ handoff received for tenant="${tenantSlug}" on ${pathname}`);
    const rawSessionToken = await verifyHandoffToken(handoff);
    console.log(`[PROXY]   handoff verify result: ${rawSessionToken ? "✓ valid" : "✗ invalid/expired"}`);
    if (rawSessionToken) {
      const signedToken = await signSessionToken(rawSessionToken);
      const cleanSearch = new URLSearchParams(request.nextUrl.searchParams);
      cleanSearch.delete("__handoff");
      const cleanUrl = buildTenantUrl(tenantSlug, pathname);
      cleanUrl.search = cleanSearch.toString();
      const response = NextResponse.redirect(cleanUrl);

      // Set the new session token (properly signed so Better Auth can verify it)
      response.cookies.set(SESSION_COOKIE, signedToken, {
        httpOnly: true,
        secure: false,   // localhost is HTTP
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });

      // CRITICAL: Bust the session_data cache cookie.
      // Better Auth caches the full session (user + org) in `better-auth.session_data`
      // for up to 5 minutes. If a different user was previously logged in on this
      // subdomain, that stale cache will be returned by getSession() even though
      // we just set a new session_token — causing the wrong account to appear.
      // Expiring it forces a fresh DB lookup on the next request.
      expireAuthCookie(response, SESSION_DATA_COOKIE);
      // Also bust any chunked variants (better-auth.session_data.0, .1, .2 …)
      for (let i = 0; i < 5; i++) {
        expireAuthCookie(response, `${SESSION_DATA_COOKIE}.${i}`);
      }
      cleanupSessionDataCookies(request, response);

      console.log(`[PROXY]   ✓ handoff → signed cookie set + session_data cache busted, redirect → ${cleanUrl.href}`);
      return response;
    }
    console.log(`[PROXY]   ✗ handoff invalid/expired — falling through to auth check`);
    // Fall through to normal auth check
  }

  // ── 3. Tenant subdomain + auth/logout route → redirect to root ────────────
  //    myotic.localhost:3000/login   → http://localhost:3000/login  (ABSOLUTE)
  //    myotic.localhost:3000/logout  → http://localhost:3000/logout (ABSOLUTE)
  //    CRITICAL: buildRootUrl(), never relative — relative inherits subdomain host.
  if (tenantSlug && (isAuthRoute(pathname) || isLogoutRoute(pathname))) {
    const target = buildRootUrl(pathname);
    console.log(`[PROXY] tenant auth route → ${target.href}`);
    return NextResponse.redirect(target);
  }

  // ── 4. Tenant subdomain + root-only route → redirect to root ─────────────
  if (tenantSlug && isRootOnlyRoute(pathname)) {
    const target = buildRootUrl(pathname, request.nextUrl.search);
    console.log(`[PROXY] tenant root-only → ${target.href}`);
    return NextResponse.redirect(target);
  }

  // ── 5. Tenant subdomain + unknown route → redirect to root ───────────────
  if (tenantSlug && !isTenantRoute(pathname) && !isTenantAwareApiRoute(pathname)) {
    const target = buildRootUrl(pathname, request.nextUrl.search);
    console.log(`[PROXY] tenant unknown → ${target.href}`);
    return NextResponse.redirect(target);
  }

  // ── 6. Root domain + public routes ───────────────────────────────────────
  if (!tenantSlug && isRootOnlyRoute(pathname)) {
    // /logout always passes through — never redirect authenticated users away from it
    if (isLogoutRoute(pathname)) {
      console.log(`[PROXY] /logout → pass through (clears session)`);
      const res = passThrough(request);
      return res;
    }

    // /login and /register: redirect already-authenticated users
    if (hasSession && isAuthRoute(pathname)) {
      const session = await getSession(request);
      if (session?.user?.id) {
        const pending = request.cookies.get("pendingTenantSlug")?.value;
        if (pending && session.session?.token) {
          // Pending tenant: skip /tenants, go directly with handoff
          const token = await createHandoffToken(session.session.token);
          const target = buildTenantUrl(pending, "/dashboard");
          target.searchParams.set("__handoff", token);
          console.log(`[PROXY] auth + pending="${pending}" → handoff ${target.href}`);
          const res = NextResponse.redirect(target);
          res.cookies.set("pendingTenantSlug", "", { ...pendingSlugCookieOpts(), maxAge: 0 });
          return res;
        }
        const target = buildRootUrl("/tenants");
        console.log(`[PROXY] auth on /login → /tenants`);
        return NextResponse.redirect(target);
      }
    }
    return passThrough(request);
  }

  // ── 7. Unauthenticated ────────────────────────────────────────────────────
  if (!hasSession) {
    const loginUrl = buildRootUrl("/login");
    console.log(`[PROXY] ✗ unauthenticated (no session cookie) → ${loginUrl.href}`);
    const res = NextResponse.redirect(loginUrl);
    const slug = tenantSlug;
    if (slug) {
      res.cookies.set("pendingTenantSlug", slug, pendingSlugCookieOpts());
      console.log(`[PROXY]   saved pendingTenantSlug="${slug}"`);
    }
    return res;
  }

  // ── 8. Load full session ──────────────────────────────────────────────────
  const session = await getSession(request);
  if (!session?.user?.id) {
    const res = NextResponse.redirect(buildRootUrl("/login"));
    if (tenantSlug) res.cookies.set("pendingTenantSlug", tenantSlug, pendingSlugCookieOpts());
    return res;
  }

  const userId = session.user.id;

  // ── 9. Tenant subdomain — resolve tenant + check membership ──────────────
  if (tenantSlug) {
    return resolveTenant(request, tenantSlug, userId);
  }

  // ── 10. Root domain + tenant route (e.g. /dashboard) ─────────────────────
  //    Look up the active org and redirect to its subdomain with handoff
  if (isTenantRoute(pathname)) {
    const activeOrgId = session.session?.activeOrganizationId;
    if (pathname.startsWith("/dashboard") && activeOrgId) {
      const org = await prisma.organization.findUnique({
        where: { id: activeOrgId },
        select: { slug: true },
      });
      if (org) {
        if (session.session?.token) {
          const token = await createHandoffToken(session.session.token);
          const target = buildTenantUrl(org.slug, pathname);
          target.searchParams.set("__handoff", token);
          console.log(`[PROXY] /dashboard → handoff ${target.href}`);
          return NextResponse.redirect(target);
        }
        const target = buildTenantUrl(org.slug, pathname);
        console.log(`[PROXY] /dashboard → tenant ${target.href}`);
        return NextResponse.redirect(target);
      }
    }
    console.log(`[PROXY] tenant route, no active org → /tenants`);
    return NextResponse.redirect(buildRootUrl("/tenants"));
  }

  return passThrough(request);
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
