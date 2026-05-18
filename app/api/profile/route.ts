import { NextResponse } from "next/server";
import { getCurrentUser, getTenantContext } from "@/lib/server/auth-utils";

export async function GET() {
  try {
    const [user, tenantContext] = await Promise.all([
      getCurrentUser(),
      getTenantContext(),
    ]);

    return NextResponse.json({
      user,
      tenant: tenantContext?.tenant ?? null,
      role: tenantContext?.role ?? null,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
