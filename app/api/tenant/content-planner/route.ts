import { NextResponse } from "next/server";
import { listContentPosts, createContentPost } from "@/features/content-planner/services/content.server";

export async function GET() {
  console.log("GET /api/content-planner called");
  try {
    const data = await listContentPosts();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await createContentPost(body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
