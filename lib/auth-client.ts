/**
 * OPERO — Better Auth Client Instance
 *
 * Safe to import in "use client" components.
 * Provides typed hooks and methods for auth + organization operations.
 */

import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    organizationClient(),
  ],
});

// ── Re-export typed hooks for convenience ─────────────────────────────
export const {
  useSession,
  useListOrganizations,
  useActiveOrganization,
} = authClient;

// ── Type exports ─────────────────────────────────────────────────────
export type Session = typeof authClient.$Infer.Session;
