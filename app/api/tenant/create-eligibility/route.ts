import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server/auth-utils";

export async function GET() {
  try {
    const user = await requireAuth();

    const ownedTenant = await prisma.organization.findFirst({
      where: {
        OR: [
          { createdById: user.id },
          {
            members: {
              some: {
                userId: user.id,
                role: "owner",
              },
            },
          },
        ],
      },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({
      canCreate: !ownedTenant,
      ownedTenant,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/create-eligibility]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
