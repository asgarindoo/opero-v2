import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/server/auth-utils";
import DashboardShell from "@/components/layout/DashboardShell";
import { TenantProvider } from "@/components/providers/TenantProvider";
import { SocialChannelsProvider } from "@/features/social-channels";

export const metadata: Metadata = {
  title: "Dashboard — OPERO",
  description: "Business Operating System — centralize your operations.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await getTenantContext();
  
  if (!context) {
    redirect("/unauthorized");
  }

  return (
    <TenantProvider context={context}>
      <SocialChannelsProvider>
        <DashboardShell>{children}</DashboardShell>
      </SocialChannelsProvider>
    </TenantProvider>
  );
}
