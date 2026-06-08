import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  resolveTenantContext,
  type TenantContextFailure,
} from "@/lib/server/auth-utils";
import { buildRootUrl } from "@/lib/routing";
import DashboardShell from "@/components/layout/DashboardShell";
import { TenantProvider } from "@/components/providers/TenantProvider";
import { SocialChannelsProvider } from "@/features/social-channels";

export const metadata: Metadata = {
  title: "Dashboard — OPERO",
  description: "Business Operating System — centralize your operations.",
};

function redirectForTenantFailure(failure: TenantContextFailure | null): never {
  const status = failure?.status ?? 401;
  const pathname =
    status === 404
      ? "/tenant-not-found"
      : status === 423
        ? "/tenant-inactive"
        : status === 401
          ? "/login"
          : "/unauthorized";
  const target = buildRootUrl(pathname);

  if (failure?.tenantSlug) {
    target.searchParams.set("tenant", failure.tenantSlug);
  }

  redirect(target.toString());
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { context, failure } = await resolveTenantContext();
  
  if (!context) {
    redirectForTenantFailure(failure);
  }

  return (
    <TenantProvider context={context}>
      <SocialChannelsProvider>
        <DashboardShell>{children}</DashboardShell>
      </SocialChannelsProvider>
    </TenantProvider>
  );
}
