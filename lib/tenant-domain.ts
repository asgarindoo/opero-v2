/**
 * @deprecated Use lib/routing.ts instead.
 * This file re-exports from lib/routing.ts for backward compatibility.
 */
export {
  extractTenantSlugFromHost,
  isRootHost,
  isReservedSubdomain,
  splitHostPort,
  getAppDomain,
  getRootUrl,
  buildRootUrl as buildRootUrlFromHost,
  buildTenantUrl as buildTenantUrlFromHost,
} from "@/lib/routing";

/** @deprecated Use buildTenantUrl from lib/routing.ts */
export function getTenantHost(host: string, slug: string): string {
  const { port } = (() => {
    const idx  = host.lastIndexOf(":");
    const after = host.slice(idx + 1);
    return /^\d+$/.test(after) ? { port: after } : { port: "" };
  })();
  const appDomain = new URL(
    process.env.NEXT_PUBLIC_ROOT_URL || process.env.ROOT_URL || "http://lvh.me:3000"
  ).hostname;
  return port ? `${slug}.${appDomain}:${port}` : `${slug}.${appDomain}`;
}

/** @deprecated Use buildRootUrl from lib/routing.ts */
export function getRootHost(host: string): string {
  const idx   = host.lastIndexOf(":");
  const after = host.slice(idx + 1);
  if (/^\d+$/.test(after)) {
    const appDomain = new URL(
      process.env.NEXT_PUBLIC_ROOT_URL || process.env.ROOT_URL || "http://lvh.me:3000"
    ).hostname;
    return `${appDomain}:${after}`;
  }
  return new URL(
    process.env.NEXT_PUBLIC_ROOT_URL || process.env.ROOT_URL || "http://lvh.me:3000"
  ).hostname;
}
