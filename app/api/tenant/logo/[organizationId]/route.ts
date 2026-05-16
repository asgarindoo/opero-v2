import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server/auth-utils";
import { downloadPrivateObject, isExternalImageUrl, TENANT_ASSETS_BUCKET } from "@/lib/server/supabase-storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const user = await requireAuth();
    const { organizationId } = await params;

    const membership = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
      select: {
        organization: {
          select: {
            logo: true,
            tenantSettings: { select: { logoUrl: true } },
          },
        },
      },
    });

    const logoPath = membership?.organization.logo ?? membership?.organization.tenantSettings?.logoUrl;

    if (!membership || !logoPath) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 });
    }

    if (logoPath.startsWith("data:image/")) {
      const [meta, base64] = logoPath.split(",");
      const contentType = meta.match(/^data:(.*);base64$/)?.[1] ?? "image/png";
      return new NextResponse(Buffer.from(base64, "base64"), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
        },
      });
    }

    if (isExternalImageUrl(logoPath)) {
      return NextResponse.redirect(logoPath);
    }

    const { data, error } = await downloadPrivateObject(TENANT_ASSETS_BUCKET, logoPath);

    if (error || !data) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 });
    }

    return new NextResponse(data.stream(), {
      headers: {
        "Content-Type": data.type || "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/logo/[organizationId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
