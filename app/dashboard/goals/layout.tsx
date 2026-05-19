import type { Metadata } from "next";
import { GoalsProvider } from "@/features/goals/context/GoalsContext";

export const metadata: Metadata = {
  title: "Goals — OPERO",
  description: "Strategic objectives and operational outcomes.",
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return <GoalsProvider>{children}</GoalsProvider>;
}
