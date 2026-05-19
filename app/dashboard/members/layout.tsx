"use client";

import React from "react";
import { MembersProvider } from "@/features/members/context/MembersContext";

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <MembersProvider>
      {children}
    </MembersProvider>
  );
}
