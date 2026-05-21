import { NextRequest, NextResponse } from "next/server";
import { deleteTenantMessage, updateTenantMessage } from "@/features/chat/services/chat.server";
import { UpdateMessageSchema } from "@/features/chat/validators/chat";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/tenant/chat/messages/[messageId]">) {
  try {
    const { messageId } = await ctx.params;
    const parsed = UpdateMessageSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    const message = await updateTenantMessage(messageId, parsed.data.content);
    if (!message) return NextResponse.json({ error: "Message not found or access denied" }, { status: 404 });
    return NextResponse.json({ message });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH /api/tenant/chat/messages/[messageId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/tenant/chat/messages/[messageId]">) {
  try {
    const { messageId } = await ctx.params;
    const deleted = await deleteTenantMessage(messageId);
    if (!deleted) return NextResponse.json({ error: "Message not found or access denied" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE /api/tenant/chat/messages/[messageId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
