"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { PresenceProvider } from "@/features/presence";
import { ChatProvider } from "@/features/chat";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  return (
    <PresenceProvider>
      <ChatProvider>
        <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible print:block" style={{ background: "var(--color-background)" }}>

          {/* Mobile backdrop */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)" }}
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className="print:hidden">
            <Sidebar
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              onClose={() => setMobileOpen(false)}
            />
          </div>

          {/* Main area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:block">
            <div className="print:hidden">
              <Topbar
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((c) => !c)}
                onMobileMenuOpen={() => setMobileOpen(true)}
              />
            </div>
            <main className="flex-1 overflow-y-auto db-main print:overflow-visible print:p-0">
              {children}
            </main>
          </div>
        </div>
      </ChatProvider>
    </PresenceProvider>
  );
}
