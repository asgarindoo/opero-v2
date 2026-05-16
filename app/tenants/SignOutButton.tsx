"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);

    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
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
