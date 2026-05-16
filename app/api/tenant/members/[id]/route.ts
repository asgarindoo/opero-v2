import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server/auth-utils";

const UpdateMemberSchema = z.object({
  role: z.enum(["owner", "admin", "member"]).optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

/**
 * PATCH /api/tenant/members/[id]
 * Update member role, department, or position.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenant, role: currentUserRole } = await requireRole(["owner", "admin"]);
    const { id: memberId } = await params;
    
    const body = await req.json();
    const parsed = UpdateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify member belongs to this tenant
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== tenant.id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Role hierarchy & permission checks:
    // 1. Only 'owner' can change roles to/from 'owner'
    // 2. 'admin' cannot change an 'owner's role or details
    if (member.role === "owner" && currentUserRole !== "owner") {
      return NextResponse.json({ error: "Insufficient permissions to modify an owner" }, { status: 403 });
    }
    
    if (parsed.data.role === "owner" && currentUserRole !== "owner") {
      return NextResponse.json({ error: "Only owners can promote others to owner" }, { status: 403 });
    }

    if (member.role === "owner" && parsed.data.role && parsed.data.role !== "owner") {
      const ownerCount = await prisma.member.count({
        where: { organizationId: tenant.id, role: "owner" },
      });
      if (ownerCount <= 1) {
        return NextResponse.json({ error: "Cannot remove the last owner of the workspace" }, { status: 400 });
      }
    }

    const updated = await prisma.member.update({
      where: { id: memberId },
      data: parsed.data,
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({ 
      member: {
        id: updated.id,
        userId: updated.userId,
        name: updated.user.name,
        email: updated.user.email,
        image: updated.user.image,
        role: updated.role,
        department: updated.department,
        position: updated.position,
        status: updated.status,
        joinedAt: updated.createdAt,
        lastActive: updated.lastActive,
      } 
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH /api/tenant/members/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/tenant/members/[id]
 * Remove/Suspending a member from the tenant.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenant, role: currentUserRole } = await requireRole(["owner", "admin"]);
    const { id: memberId } = await params;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== tenant.id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Protection logic:
    // 1. Only owner can delete other admins/owners
    if ((member.role === "admin" || member.role === "owner") && currentUserRole !== "owner") {
      return NextResponse.json({ error: "Only owners can remove admins or other owners" }, { status: 403 });
    }

    // 2. Prevent removing the last owner
    if (member.role === "owner") {
      const ownerCount = await prisma.member.count({
        where: { organizationId: tenant.id, role: "owner" },
      });
      if (ownerCount <= 1) {
        return NextResponse.json({ error: "Cannot remove the last owner of the workspace" }, { status: 400 });
      }
    }

    await prisma.member.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE /api/tenant/members/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
