import { NextRequest, NextResponse } from "next/server";
import { deleteTenantChannel } from "@/features/chat/services/chat.server";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  try {
    const { channelId } = await params;
    const deleted = await deleteTenantChannel(channelId);
    if (!deleted) return NextResponse.json({ error: "Channel not found or access denied" }, { status: 403 });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE /api/tenant/chat/channels/[channelId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
