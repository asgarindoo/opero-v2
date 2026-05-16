import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — OPERO",
  description: "Sign in to your OPERO account and continue managing your business operations.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
