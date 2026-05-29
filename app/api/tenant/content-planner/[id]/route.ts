import { NextResponse } from "next/server";
import { updateContentPost, deleteContentPost } from "@/features/content-planner/services/content.server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await updateContentPost(id, body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await deleteContentPost(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("DELETE API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
