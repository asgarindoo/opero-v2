"use client";

import { useState } from "react";
import { getRootAppUrl } from "@/lib/tenant-url";
import { markPresenceOffline } from "@/features/presence";

export default function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);

    try {
      await markPresenceOffline().catch(() => null);
      window.location.assign(getRootAppUrl("/logout"));
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="flex items-center gap-1.5 font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold text-on-surface-variant/55 hover:text-primary disabled:opacity-45 disabled:cursor-wait transition-colors duration-200"
    >
      <span className="material-symbols-outlined text-[13px]">
        {signingOut ? "progress_activity" : "logout"}
      </span>
      {signingOut ? "Signing out" : "Sign out"}
    </button>
  );
}
