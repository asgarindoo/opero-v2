import { NextRequest, NextResponse } from "next/server";
import { createChannel, listChannels } from "@/features/social-channels/services/channels.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listChannels());
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("[GET /api/tenant/social-channels]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await createChannel(await req.json());
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("[POST /api/tenant/social-channels]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
  }
}
