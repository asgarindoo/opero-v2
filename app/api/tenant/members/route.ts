/**
 * OPERO — Tenant Members Route Handler
 * GET    /api/tenant/members      → List members of active tenant
 * POST   /api/tenant/members      → Invite a new member (admin/owner only)
 * DELETE /api/tenant/members      → Remove a member (admin/owner only)
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  requireRole,
  getCurrentTenant,
  requireAuth,
} from "@/lib/server/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const InviteSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["admin", "member"]).default("member"),
});

const RemoveMemberSchema = z.object({
  memberId: z.string().min(1),
});

// ── GET /api/tenant/members ───────────────────────────────────────────────────
export async function GET() {
  try {
    await requireAuth();
    const tenant = await getCurrentTenant();

    if (!tenant) {
      return NextResponse.json({ error: "No active tenant" }, { status: 403 });
    }

    const members = await prisma.member.findMany({
      where: { organizationId: tenant.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ members });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/members]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST /api/tenant/members (invite) ────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Only owner or admin can invite
    const { tenant } = await requireRole(["owner", "admin"]);

    const body = await req.json();
    const parsed = InviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, role } = parsed.data;
    const hdrs = await headers();

    const invitation = await auth.api.createInvitation({
      body: {
        email,
        role,
        organizationId: tenant.id,
      },
      headers: hdrs,
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant/members]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE /api/tenant/members ────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { tenant, role: callerRole } = await requireRole(["owner", "admin"]);

    const body = await req.json();
    const parsed = RemoveMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    const { memberId } = parsed.data;

    // Fetch the target member to check their role
    const targetMember = await prisma.member.findUnique({
      where: { id: memberId },
      select: { organizationId: true, role: true, userId: true },
    });

    if (!targetMember || targetMember.organizationId !== tenant.id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Admins cannot remove owners
    if (targetMember.role === "owner" && callerRole !== "owner") {
      return NextResponse.json(
        { error: "Only owners can remove other owners" },
        { status: 403 }
      );
    }

    const hdrs = await headers();
    await auth.api.removeMember({
      body: {
        memberIdOrEmail: targetMember.userId,
        organizationId: tenant.id,
      },
      headers: hdrs,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE /api/tenant/members]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
