/**
 * OPERO — Tenant Join Route Handler
 * POST /api/tenant/join → Accept an invitation by invitation ID
 *
 * The "invite code" in OPERO UI maps to an invitation ID from Better Auth.
 * The invite link sent by email is: /onboarding/join?invite=[invitationId]
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/server/auth-utils";
import { z } from "zod";

const JoinSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID is required"),
});

// ── POST /api/tenant/join ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const parsed = JoinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid invite code", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { invitationId } = parsed.data;
    const hdrs = await headers();

    const result = await auth.api.acceptInvitation({
      body: { invitationId },
      headers: hdrs,
    });

    return NextResponse.json({ member: result }, { status: 200 });
  } catch (err) {
    if (err instanceof Response) return err;

    // Better Auth throws for expired/invalid invitations
    const message =
      err instanceof Error ? err.message : "Invalid or expired invitation";

    if (
      message.toLowerCase().includes("not found") ||
      message.toLowerCase().includes("expired") ||
      message.toLowerCase().includes("invalid")
    ) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("[POST /api/tenant/join]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
