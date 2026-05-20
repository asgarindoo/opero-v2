"use client";

import { createContext, useContext, ReactNode } from "react";
import type { TenantContext } from "@/lib/server/auth-utils";

const TenantContext = createContext<TenantContext | null>(null);

export function TenantProvider({ 
  children, 
  context 
}: { 
  children: ReactNode; 
  context: TenantContext;
}) {
  return (
    <TenantContext.Provider value={context}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
