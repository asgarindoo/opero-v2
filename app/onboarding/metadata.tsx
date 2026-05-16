import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — OPERO",
  description: "Create or join a workspace to start managing your operations with OPERO.",
};

export default function OnboardingRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
