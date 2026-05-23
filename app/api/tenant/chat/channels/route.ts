import { NextRequest, NextResponse } from "next/server";
import { createTenantChannel, listTenantChannels } from "@/features/chat/services/chat.server";
import { CreateChannelSchema } from "@/features/chat/validators/chat";

export async function GET() {
  try {
    return NextResponse.json(await listTenantChannels());
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/chat/channels]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = CreateChannelSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid channel data" }, { status: 400 });
    }
    return NextResponse.json({ channel: await createTenantChannel(parsed.data) }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant/chat/channels]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
