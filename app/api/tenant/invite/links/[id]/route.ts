import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/server/rbac";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenant } = await requirePermission("members.invite");
    const { id } = await params;

    const link = await prisma.tenantInviteLink.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!link || link.organizationId !== tenant.id) {
      return NextResponse.json({ error: "Invite link not found" }, { status: 404 });
    }

    await prisma.tenantInviteLink.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE /api/tenant/invite/links/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
