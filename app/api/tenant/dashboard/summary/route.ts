import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/features/dashboard/services/dashboard.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await getDashboardSummary();
    return NextResponse.json(summary);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/dashboard/summary]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
