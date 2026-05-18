import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteTenantRecord, updateTenantRecord } from "@/lib/server/tenant-records";

const PatchSchema = z.object({
  data: z.record(z.any()),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const item = await updateTenantRecord(type, id, parsed.data.data);
    if (!item) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH /api/tenant/records/:type/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const item = await deleteTenantRecord(type, id);
    if (!item) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE /api/tenant/records/:type/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
