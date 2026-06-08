import { NextResponse } from "next/server";
import { listChannelActivities } from "@/features/social-channels/services/channels.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listChannelActivities());
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("[GET /api/tenant/social-channels/activity]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
