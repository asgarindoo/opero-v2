"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getRootAppUrl } from "@/lib/tenant-url";
import { markPresenceOffline } from "@/features/presence";

export default function LogoutPage() {
  const [message, setMessage] = useState("Signing out");

  useEffect(() => {
    let cancelled = false;

    markPresenceOffline()
      .catch(() => null)
      .then(() => authClient.signOut())
      .catch(() => {
        if (!cancelled) setMessage("Finishing sign out");
      })
      .finally(() => {
        if (!cancelled) {
          window.location.replace(getRootAppUrl("/"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="flex items-center gap-3 rounded-xl border border-outline/10 bg-surface-container-lowest px-5 py-4">
        <span className="h-4 w-4 rounded-full border-2 border-outline/30 border-t-primary animate-spin" />
        <span className="font-label-caps text-[10px] uppercase tracking-[0.08em] font-semibold text-on-surface-variant/60">
          {message}
        </span>
      </div>
    </main>
  );
}
