/**
 * Client-side tenant URL helpers.
 *
 * NEXT_PUBLIC_ROOT_URL is the single source of truth — matches the proxy's ROOT_URL.
 * This ensures port numbers are always preserved (e.g. :3000 in local dev).
 */

const ROOT_URL =
  process.env.NEXT_PUBLIC_ROOT_URL ||
  (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "http://lvh.me:3000");

function getRootParsed() {
  return new URL(ROOT_URL);
}

export function isValidTenantSlug(slug: unknown): slug is string {
  return typeof slug === "string" && /^[a-z0-9-]{2,30}$/.test(slug);
}

/**
 * Build the root app URL for a given path.
 *
 *   getRootAppUrl("/login") → "http://lvh.me:3000/login"
 */
export function getRootAppUrl(path = "/") {
  const root = getRootParsed();
  const url = new URL(path, root.href);
  return url.toString();
}

/**
 * Build the tenant dashboard URL for a given slug.
 * Port is always taken from NEXT_PUBLIC_ROOT_URL — never lost.
 *
 *   getTenantDashboardUrl("myotic")           → "http://myotic.lvh.me:3000/dashboard"
 *   getTenantDashboardUrl("myotic", "/tasks") → "http://myotic.lvh.me:3000/tasks"
 */
export function getTenantDashboardUrl(slug: string, path = "/dashboard"): string {
  if (!isValidTenantSlug(slug)) return getRootAppUrl("/tenants");

  const root = getRootParsed();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || root.hostname;
  return `${root.protocol}//${getTenantHost(slug, rootDomain)}${path}`;
}

export function getTenantHost(slug: string, rootDomain?: string): string {
  const root = getRootParsed();
  const domain = rootDomain || process.env.NEXT_PUBLIC_ROOT_DOMAIN || root.hostname;
  const portSuffix = root.port ? `:${root.port}` : "";
  return `${slug}.${domain}${portSuffix}`;
}

const LAST_TENANT_KEY = "opero:last-tenant";

export function rememberTenant(tenant: { id: string; slug: string }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_TENANT_KEY, JSON.stringify(tenant));
}

export function getRememberedTenant(): { id: string; slug: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_TENANT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: unknown; slug?: unknown };
    if (typeof parsed.id !== "string" || typeof parsed.slug !== "string") return null;
    return { id: parsed.id, slug: parsed.slug };
  } catch {
    return null;
  }
}
