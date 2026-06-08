import { NextRequest, NextResponse } from "next/server";
import { deleteChannel, updateChannel } from "@/features/social-channels/services/channels.server";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await updateChannel(id, await req.json());
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("[PATCH /api/tenant/social-channels/[id]]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteChannel(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("[DELETE /api/tenant/social-channels/[id]]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
  }
}
