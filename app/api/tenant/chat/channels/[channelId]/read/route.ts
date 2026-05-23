import { NextResponse } from "next/server";
import { markTenantChannelRead } from "@/features/chat/services/chat.server";

type Ctx = { params: Promise<{ channelId: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const { channelId } = await ctx.params;
    const read = await markTenantChannelRead(channelId);
    if (!read) return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    return NextResponse.json({
      channelId: read.channelId,
      lastReadMessageId: read.lastReadMessageId,
      lastReadAt: read.lastReadAt.toISOString(),
      unreadCount: 0,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant/chat/channels/[channelId]/read]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
