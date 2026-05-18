import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createTenantRecord, listTenantRecords } from "@/lib/server/tenant-records";

const PayloadSchema = z.object({
  data: z.record(z.any()),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const items = await listTenantRecords(type);
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/records/:type]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body = await req.json();
    const parsed = PayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const item = await createTenantRecord(type, parsed.data.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant/records/:type]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
