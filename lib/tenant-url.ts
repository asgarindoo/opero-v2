export function getTenantDashboardUrl(slug: string, path = "/dashboard") {
  if (typeof window === "undefined") return path;

  const { protocol, hostname, port } = window.location;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const enableLocalhostSubdomains = process.env.NEXT_PUBLIC_ENABLE_LOCALHOST_SUBDOMAINS === "true";

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    if (!enableLocalhostSubdomains) {
      const url = new URL(normalizedPath, `${protocol}//localhost${port ? `:${port}` : ""}`);
      url.searchParams.set("tenant", slug);
      return url.toString();
    }

    return `${protocol}//${slug}.localhost${port ? `:${port}` : ""}${normalizedPath}`;
  }

  if (rootDomain) {
    return `${protocol}//${slug}.${rootDomain}${port ? `:${port}` : ""}${normalizedPath}`;
  }

  const parts = hostname.split(".");
  const baseHost = parts.length >= 3 ? parts.slice(1).join(".") : hostname;
  return `${protocol}//${slug}.${baseHost}${port ? `:${port}` : ""}${normalizedPath}`;
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
