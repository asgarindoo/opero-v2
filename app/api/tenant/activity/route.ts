import { NextRequest, NextResponse } from "next/server";
import { listActivities } from "@/lib/server/services/activity.service";

export async function GET(req: NextRequest) {
  try {
    const moduleFilter = req.nextUrl.searchParams.get("module") ?? undefined;
    const activities = await listActivities(moduleFilter);
    return NextResponse.json({ activities });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/activity]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
