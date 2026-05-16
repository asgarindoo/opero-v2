/**
 * OPERO — Tenant Route Handler
 * GET  /api/tenant  → List all organizations the current user belongs to
 * POST /api/tenant  → Create a new organization (tenant)
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server/auth-utils";
import { z } from "zod";

const CreateTenantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  logo: z.string().url().optional().or(z.literal("")),
});

// ── GET /api/tenant ───────────────────────────────────────────────────────────
export async function GET() {
  try {
    await requireAuth();

    const hdrs = await headers();
    const orgs = await auth.api.listOrganizations({ headers: hdrs });

    return NextResponse.json({ organizations: orgs });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST /api/tenant ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const parsed = CreateTenantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, logo } = parsed.data;

    // Check slug availability
    const existing = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This subdomain is already taken. Please choose another." },
        { status: 409 }
      );
    }

    const hdrs = await headers();
    const org = await auth.api.createOrganization({
      body: { name, slug, logo: logo || undefined },
      headers: hdrs,
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
