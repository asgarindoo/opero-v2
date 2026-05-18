import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/server/auth-utils";

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { tenant, user } = await requireRole(["owner", "admin", "member"]);
    const body = await req.json();
    const parsed = InviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: tenant.id,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role ?? "member",
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        inviterId: user.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        inviterId: true,
      },
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant/members/invite]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
