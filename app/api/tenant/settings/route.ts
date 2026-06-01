import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/server/auth-utils";
import {
  removePrivateObject,
  TENANT_ASSETS_BUCKET,
  uploadTenantLogoFromDataUrl,
} from "@/lib/server/supabase-storage";

const SettingsSchema = z.object({
  name: z.string().min(2).max(60),
  logo: z
    .string()
    .refine((value) => value === "" || value.startsWith("data:image/") || z.url().safeParse(value).success, {
      message: "Logo must be an image data URL or a valid URL",
    })
    .optional(),
  websiteUrl: z.union([z.literal(""), z.url()]).optional(),
  brandColor: z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/)]).optional(),
  timezone: z.string().min(1).max(80).optional(),
  locale: z.string().min(2).max(20).optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    const { tenant, role } = await requireRole(["owner", "admin", "member"]);

    const [organization, membersCount] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: tenant.id },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          createdAt: true,
          tenantSettings: {
            select: {
              timezone: true,
              locale: true,
              brandColor: true,
              logoUrl: true,
              websiteUrl: true,
              industryType: true,
            },
          },
          tenantPlan: {
            select: {
              status: true,
              currentPeriodEnd: true,
              plan: {
                select: {
                  name: true,
                  displayName: true,
                  maxMembers: true,
                },
              },
            },
          },
        },
      }),
      prisma.member.count({ where: { organizationId: tenant.id } }),
    ]);

    if (!organization) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({
      tenant: organization,
      membership: { role },
      user,
      usage: { membersCount },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/settings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { tenant } = await requireRole(["owner", "admin"]);
    const body = await req.json();
    const parsed = SettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, logo, websiteUrl, brandColor, timezone, locale } = parsed.data;
    const current = await prisma.organization.findUnique({
      where: { id: tenant.id },
      select: {
        logo: true,
        tenantSettings: { select: { logoUrl: true } },
      },
    });
    const currentLogo = current?.logo ?? current?.tenantSettings?.logoUrl ?? null;
    const normalizedLogo = logo === ""
      ? null
      : logo?.startsWith("data:image/")
        ? await uploadTenantLogoFromDataUrl({ organizationId: tenant.id, dataUrl: logo })
        : logo;

    const organization = await prisma.organization.update({
      where: { id: tenant.id },
      data: {
        name,
        ...(logo !== undefined ? { logo: normalizedLogo } : {}),
        tenantSettings: {
          upsert: {
            create: {
              logoUrl: normalizedLogo,
              websiteUrl: websiteUrl || null,
              brandColor: brandColor || null,
              timezone: timezone || "UTC",
              locale: locale || "en",
            },
            update: {
              ...(logo !== undefined ? { logoUrl: normalizedLogo } : {}),
              websiteUrl: websiteUrl || null,
              brandColor: brandColor || null,
              ...(timezone ? { timezone } : {}),
              ...(locale ? { locale } : {}),
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        tenantSettings: true,
      },
    });

    if (logo !== undefined && currentLogo && currentLogo !== normalizedLogo) {
      try {
        await removePrivateObject(TENANT_ASSETS_BUCKET, currentLogo);
      } catch (err) {
        console.error("[PATCH /api/tenant/settings] Failed to remove old logo:", err);
      }
    }

    return NextResponse.json({ tenant: organization });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH /api/tenant/settings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
