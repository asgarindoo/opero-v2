import { NextRequest, NextResponse } from "next/server";
import { listChannels, createChannel } from "@/features/social-channels/services/channels.server";

export async function GET(req: NextRequest) {
  try {
    const data = await listChannels();
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = await createChannel(json);
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
  }
}
