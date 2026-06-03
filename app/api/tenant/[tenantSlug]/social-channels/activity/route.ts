import { NextRequest, NextResponse } from "next/server";
import { listChannelActivities } from "@/features/social-channels/services/channels.server";

export async function GET(req: NextRequest) {
  try {
    const data = await listChannelActivities();
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
  }
}
