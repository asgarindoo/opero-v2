import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantMember } from "@/lib/server/auth-utils";

/**
 * POST /api/tenant/leave
 * Remove the current user from the active tenant.
 *
 * Owners can leave only when another owner remains. This keeps every tenant
 * recoverable unless it is explicitly deleted by an owner.
 */
export async function POST() {
  try {
    const { tenant, user, role } = await requireTenantMember();

    if (role === "owner") {
      const ownerCount = await prisma.member.count({
        where: { organizationId: tenant.id, role: "owner", status: "active" },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "You are the last owner. Transfer ownership or delete the tenant instead." },
          { status: 400 }
        );
      }
    }

    await prisma.member.delete({
      where: {
        organizationId_userId: {
          organizationId: tenant.id,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant/leave]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
