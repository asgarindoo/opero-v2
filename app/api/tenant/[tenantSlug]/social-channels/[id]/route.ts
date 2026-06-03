import { NextRequest, NextResponse } from "next/server";
import { updateChannel, deleteChannel } from "@/features/social-channels/services/channels.server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const json = await req.json();
    const data = await updateChannel(resolvedParams.id, json);
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await deleteChannel(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
  }
}
