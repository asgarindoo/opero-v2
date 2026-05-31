import { NextRequest, NextResponse } from "next/server";
import { createTenantMessage, listTenantMessages } from "@/features/chat/services/chat.server";
import { CreateMessageSchema } from "@/features/chat/validators/chat";

type Ctx = { params: Promise<{ channelId: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { channelId } = await ctx.params;
    console.log("[chat-route] GET messages channelId:", channelId);
    const messages = await listTenantMessages(channelId);
    console.log("[chat-route] listTenantMessages result:", messages === null ? "null (404)" : `${messages.length} messages`);
    if (!messages) return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    return NextResponse.json({ messages });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/chat/channels/[channelId]/messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { channelId } = await ctx.params;
    const parsed = CreateMessageSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const msg = issue?.code === "too_big"
        ? `Message is too long (max 4000 characters)`
        : "Message cannot be empty";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const message = await createTenantMessage(channelId, parsed.data.content, parsed.data.replyToId);
    if (!message) return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant/chat/channels/[channelId]/messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
