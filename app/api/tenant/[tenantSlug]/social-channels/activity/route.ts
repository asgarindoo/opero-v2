import { NextRequest, NextResponse } from "next/server";
import { listChannelActivities } from "@/features/social-channels/services/channels.server";

export async function GET(req: NextRequest) {
  try {
    const data = await listChannelActivities();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
