import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth-utils";
import { downloadPrivateObject, TENANT_FILES_BUCKET, uploadTenantDocument } from "@/lib/server/supabase-storage";

export async function POST(req: NextRequest) {
  try {
    const { tenant } = await requireRole(["owner", "admin", "member"]);
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const storagePath = await uploadTenantDocument({
      organizationId: tenant.id,
      file,
      folder: typeof folder === "string" ? folder : undefined,
    });

    return NextResponse.json({
      storagePath,
      downloadUrl: `/api/tenant/files?path=${encodeURIComponent(storagePath)}`,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant/files]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: err instanceof Error && err.message.includes("Maximum upload size") ? 413 : 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { tenant } = await requireRole(["owner", "admin", "member"]);
    const path = req.nextUrl.searchParams.get("path");

    if (!path || !path.startsWith(`tenants/${tenant.id}/`)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const { data, error } = await downloadPrivateObject(TENANT_FILES_BUCKET, path);

    if (error || !data) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const isDownload = req.nextUrl.searchParams.get("download") === "true";
    const filenameParam = req.nextUrl.searchParams.get("filename") || "file";

    const headers: Record<string, string> = {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    };

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(filenameParam)}"`;
    } else {
      headers["Content-Disposition"] = "inline";
    }

    return new NextResponse(data.stream(), {
      headers,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/files]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
