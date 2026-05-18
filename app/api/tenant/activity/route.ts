import { NextRequest, NextResponse } from "next/server";
import { listTenantActivity } from "@/lib/server/tenant-records";

export async function GET(req: NextRequest) {
  try {
    const moduleFilter = req.nextUrl.searchParams.get("module") ?? undefined;
    const activities = await listTenantActivity(moduleFilter);
    return NextResponse.json({ activities });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/activity]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
