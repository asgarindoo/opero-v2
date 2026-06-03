import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/server/rbac";
import { downloadPrivateObject, deletePrivateObject, TENANT_FILES_BUCKET, uploadTenantDocument } from "@/lib/server/supabase-storage";

export async function POST(req: NextRequest) {
  try {
    const { tenant } = await requirePermission("files.upload");
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
    const { tenant } = await requirePermission("files.read");
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

export async function DELETE(req: NextRequest) {
  try {
    const { tenant } = await requirePermission("files.delete");
    const path = req.nextUrl.searchParams.get("path");

    if (!path || !path.startsWith(`tenants/${tenant.id}/`)) {
      return NextResponse.json({ error: "Invalid path or not authorized" }, { status: 400 });
    }

    await deletePrivateObject(TENANT_FILES_BUCKET, path);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE /api/tenant/files]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
