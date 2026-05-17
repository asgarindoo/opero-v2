/**
 * OPERO - Next.js 16 Proxy
 *
 * Tenant subdomains are resolved here, then passed upstream as trusted request
 * headers. Server helpers still re-check session, tenant status, and membership
 * before any database query.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "better-auth.session_token";
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/unauthorized", "/tenant-inactive"];
const SYSTEM_SUBDOMAINS = new Set(["www", "app", "api", "opero", "main"]);

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  );
}

function getTenantSlug(hostname: string): string | null {
  const host = hostname.split(":")[0].toLowerCase();

  if (host.endsWith(".localhost")) {
    const subdomain = host.replace(".localhost", "");
    return subdomain && !SYSTEM_SUBDOMAINS.has(subdomain) ? subdomain : null;
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (rootDomain && host.endsWith(`.${rootDomain}`)) {
    const subdomain = host.slice(0, -1 * `.${rootDomain}`.length);
    return subdomain && !subdomain.includes(".") && !SYSTEM_SUBDOMAINS.has(subdomain) ? subdomain : null;
  }

  const parts = host.split(".");
  if (parts.length >= 3 && !SYSTEM_SUBDOMAINS.has(parts[0])) {
    return parts[0];
  }

  return null;
}

async function getSessionInfo(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return {
      userId: session?.user?.id ?? null,
      activeOrganizationId: session?.session?.activeOrganizationId ?? null,
    };
  } catch {
    return { userId: null, activeOrganizationId: null };
  }
}

function getTenantUrl(request: NextRequest, slug: string) {
  const url = request.nextUrl.clone();
  const host = request.nextUrl.hostname;
  const port = request.nextUrl.port;
  const enableLocalhostSubdomains = process.env.NEXT_PUBLIC_ENABLE_LOCALHOST_SUBDOMAINS === "true";

  if (host === "localhost" || host.endsWith(".localhost")) {
    if (!enableLocalhostSubdomains) {
      url.hostname = "localhost";
      url.searchParams.set("tenant", slug);
      if (port) url.port = port;
      return url;
    }

    url.hostname = `${slug}.localhost`;
  } else if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    url.hostname = `${slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  } else {
    const parts = host.split(".");
    url.hostname = `${slug}.${parts.length >= 3 ? parts.slice(1).join(".") : host}`;
  }

  if (port) url.port = port;
  return url;
}

function getRootUrl(request: NextRequest, path = request.nextUrl.pathname) {
  const url = new URL(request.url);
  const host = request.nextUrl.hostname;
  const port = request.nextUrl.port;

  url.pathname = path;

  if (host.endsWith(".localhost")) {
    url.hostname = "localhost";
  } else if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    url.hostname = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  } else {
    const parts = host.split(".");
    if (parts.length >= 3) url.hostname = parts.slice(1).join(".");
  }

  if (port) url.port = port;
  return url;
}

function getRootLoginUrl(request: NextRequest) {
  const loginUrl = getRootUrl(request, "/login");
  loginUrl.search = "";
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return loginUrl;
}

async function resolveTenantRequest(request: NextRequest, tenantSlug: string, userId: string) {
  const tenant = await prisma.organization.findUnique({
    where: { slug: tenantSlug },
    select: { id: true, slug: true, status: true },
  });

  if (!tenant) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (tenant.status !== "active") {
    return NextResponse.redirect(new URL("/tenant-inactive", request.url));
  }

  const membership = await prisma.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: tenant.id,
        userId,
      },
    },
    select: { role: true, status: true },
  });

  if (!membership || membership.status !== "active") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  const requestHeaders = sanitizeTenantHeaders(request.headers);
  requestHeaders.set("x-tenant-id", tenant.id);
  requestHeaders.set("x-tenant-slug", tenant.slug);
  requestHeaders.set("x-user-id", userId);
  requestHeaders.set("x-user-role", membership.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

function sanitizeTenantHeaders(headers: Headers) {
  const requestHeaders = new Headers(headers);
  requestHeaders.delete("x-tenant-id");
  requestHeaders.delete("x-tenant-slug");
  requestHeaders.delete("x-user-id");
  requestHeaders.delete("x-user-role");
  return requestHeaders;
}

function nextWithoutClientTenantHeaders(request: NextRequest) {
  return NextResponse.next({ request: { headers: sanitizeTenantHeaders(request.headers) } });
}

export default async function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const tenantSlug = getTenantSlug(hostname);
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const tenantQuerySlug = request.nextUrl.searchParams.get("tenant");

  if (tenantSlug && !pathname.startsWith("/dashboard") && !pathname.startsWith("/api/tenant")) {
    return NextResponse.redirect(getRootUrl(request));
  }

  if (isPublicRoute(pathname)) {
    if (hasSession && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return nextWithoutClientTenantHeaders(request);
  }

  if (!hasSession) {
    return NextResponse.redirect(getRootLoginUrl(request));
  }

  if (pathname.startsWith("/tenants") || pathname.startsWith("/onboarding")) {
    return nextWithoutClientTenantHeaders(request);
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/tenant")) {
    const { userId, activeOrganizationId } = await getSessionInfo(request);
    if (!userId) {
      return NextResponse.redirect(getRootLoginUrl(request));
    }

    if (tenantSlug || tenantQuerySlug) {
      return resolveTenantRequest(request, tenantSlug ?? tenantQuerySlug!, userId);
    }

    if (pathname.startsWith("/dashboard") && activeOrganizationId) {
      const tenant = await prisma.organization.findUnique({
        where: { id: activeOrganizationId },
        select: { slug: true },
      });

      if (tenant) {
        return NextResponse.redirect(getTenantUrl(request, tenant.slug));
      }
    }

    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/tenants", request.url));
    }
  }

  return nextWithoutClientTenantHeaders(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
