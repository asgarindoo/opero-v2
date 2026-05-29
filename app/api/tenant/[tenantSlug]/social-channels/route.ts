import { NextRequest, NextResponse } from "next/server";
import { listChannels, createChannel } from "@/features/social-channels/services/channels.server";

export async function GET(req: NextRequest) {
  try {
    const data = await listChannels();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = await createChannel(json);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
