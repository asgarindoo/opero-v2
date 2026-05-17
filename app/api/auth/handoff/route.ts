/**
 * GET /api/auth/handoff
 *
 * Issues a short-lived (30s) signed handoff token for cross-subdomain session
 * sharing in local development. Called from localhost:3000 after login to
 * obtain a token that can be passed to a tenant subdomain URL.
 *
 * Only works if the caller already has a valid session (HttpOnly cookie is
 * sent automatically by the browser since this route is on localhost:3000).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { createHandoffToken } from "@/lib/handoff";

export async function GET(request: NextRequest) {
  try {
    console.log("[HANDOFF API] GET /api/auth/handoff — checking session");
    const session = await auth.api.getSession({ headers: request.headers });
    console.log(`[HANDOFF API] session: ${session?.session?.token ? `✓ token=${session.session.token.slice(0, 8)}…` : "✗ not found"}`);

    if (!session?.session?.token) {
      console.warn("[HANDOFF API] ✗ Not authenticated — returning 401");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = await createHandoffToken(session.session.token);
    console.log(`[HANDOFF API] ✓ handoff token created (${token.length} chars)`);

    // No-cache — handoff tokens are single-use / time-bound
    return NextResponse.json(
      { token },
      {
        headers: {
          "Cache-Control": "no-store",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (err) {
    console.error("[/api/auth/handoff]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
