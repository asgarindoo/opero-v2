export function getTenantLogoSrc(organizationId: string, logo?: string | null) {
  if (!logo) return null;
  if (logo.startsWith("data:image/") || /^https?:\/\//i.test(logo)) return logo;
  return `/api/tenant/logo/${organizationId}?v=${encodeURIComponent(logo)}`;
}
