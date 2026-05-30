/**
 * OPERO — Multi-tenant Routing Helpers
 *
 * Pure utility functions for subdomain detection and URL building.
 * Works in both Edge and Node.js runtimes (no server-only imports).
 *
 * Single source of truth: NEXT_PUBLIC_ROOT_URL / ROOT_URL env var.
 *
 * Local:
 *   ROOT_URL = "http://lvh.me:3000"
 *   Tenant   = "http://myotic.lvh.me:3000"
 *
 * Production:
 *   ROOT_URL = "https://opero.my.id"
 *   Tenant   = "https://myotic.opero.my.id"
 */

// ─── Root URL ─────────────────────────────────────────────────────────────────

/**
 * Returns the root app URL from env — single source of truth.
 *   getRootUrl() → "http://lvh.me:3000"
 */
export function getRootUrl(): string {
  return (
    process.env.NEXT_PUBLIC_ROOT_URL ||
    process.env.ROOT_URL ||
    "http://lvh.me:3000"
  );
}

/**
 * Returns the root domain hostname only (no protocol, no port).
 *   getAppDomain() → "lvh.me"       (dev)
 *   getAppDomain() → "opero.my.id"  (prod)
 */
export function getAppDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || new URL(getRootUrl()).hostname;
}

// ─── Host parsing ─────────────────────────────────────────────────────────────

/**
 * Split a host string into hostname and port.
 *
 *   splitHostPort("myotic.lvh.me:3000") → { hostname: "myotic.lvh.me", port: "3000" }
 *   splitHostPort("lvh.me")             → { hostname: "lvh.me",            port: "" }
 *   splitHostPort("opero.my.id")           → { hostname: "opero.my.id",       port: "" }
 */
export function splitHostPort(host: string): { hostname: string; port: string } {
  const lower = host.toLowerCase();
  const idx   = lower.lastIndexOf(":");
  if (idx === -1) return { hostname: lower, port: "" };
  const after = lower.slice(idx + 1);
  if (/^\d+$/.test(after)) {
    return { hostname: lower.slice(0, idx), port: after };
  }
  return { hostname: lower, port: "" };
}

// ─── Subdomain detection ──────────────────────────────────────────────────────

const RESERVED_SUBDOMAINS = new Set([
  "www", "app", "api", "auth", "admin", "mail",
  "smtp", "ftp", "cdn", "static", "assets", "opero",
]);

/**
 * Returns true if slug is a reserved system subdomain.
 */
export function isReservedSubdomain(slug: string): boolean {
  return RESERVED_SUBDOMAINS.has(slug.toLowerCase());
}

/**
 * Extract the tenant slug from a host string.
 * Returns null for root hosts (no tenant subdomain).
 *
 * Local dev (appDomain = "lvh.me"):
 *   "lvh.me:3000"        → null
 *   "myotic.lvh.me:3000" → "myotic"
 *   "www.lvh.me:3000"    → null  (reserved)
 *
 * Production (appDomain = "opero.my.id"):
 *   "opero.my.id"           → null
 *   "myotic.opero.my.id"    → "myotic"
 */
export function extractTenantSlugFromHost(host: string): string | null {
  const { hostname } = splitHostPort(host);
  const appDomain    = getAppDomain();

  // Exact root host match
  if (hostname === appDomain) return null;

  // Tenant subdomain: *.appDomain
  if (hostname.endsWith(`.${appDomain}`)) {
    const slug = hostname.slice(0, -(`.${appDomain}`.length));
    if (!slug || slug.includes(".") || isReservedSubdomain(slug)) return null;
    return slug;
  }

  return null;
}

/**
 * Returns true if the host belongs to the root domain (no tenant subdomain).
 */
export function isRootHost(host: string): boolean {
  return extractTenantSlugFromHost(host) === null;
}

// ─── URL builders ─────────────────────────────────────────────────────────────

/**
 * Build an absolute URL on the root domain.
 * NEVER uses request.url — always uses ROOT_URL from env.
 *
 *   buildRootUrl("/login")           → URL { href: "http://lvh.me:3000/login" }
 *   buildRootUrl("/404", "?x=1")     → URL { href: "http://lvh.me:3000/404?x=1" }
 */
export function buildRootUrl(path: string, search?: string): URL {
  const url = new URL(path, getRootUrl());
  if (search !== undefined) url.search = search;
  return url;
}

/**
 * Build an absolute URL on a tenant subdomain.
 * Port is always taken from ROOT_URL — never lost in local dev.
 *
 *   buildTenantUrl("myotic", "/dashboard")  → URL { href: "http://myotic.lvh.me:3000/dashboard" }
 *   buildTenantUrl("myotic", "/tasks")      → URL { href: "http://myotic.lvh.me:3000/tasks" }
 */
export function buildTenantUrl(slug: string, path: string, search?: string): URL {
  const root   = new URL(getRootUrl());
  const port   = root.port ? `:${root.port}` : "";
  const appDomain = getAppDomain();
  const url    = new URL(`${root.protocol}//${slug}.${appDomain}${port}${path}`);
  if (search !== undefined) url.search = search;
  return url;
}

