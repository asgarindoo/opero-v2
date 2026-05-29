import { NextRequest, NextResponse } from "next/server";
import { listCampaignTasks } from "@/features/tasks/services/tasks.server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const items = await listCampaignTasks(id);
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error(`[GET /api/tenant/campaigns/[id]/tasks]`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
