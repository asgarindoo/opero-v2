import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/server/auth-utils";
import {
  getProfileSettings,
  ProfileServiceError,
  updateProfileSettings,
} from "@/features/profile/services/profile.server";

export const dynamic = "force-dynamic";

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

async function profileInputFromRequest(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const avatar = formData.get("avatar");

    return {
      name: formData.get("name"),
      avatarFile: isUploadFile(avatar) ? avatar : null,
      removeAvatar: formData.get("removeAvatar") === "true",
    };
  }

  const body = await req.json().catch(() => null);

  return {
    name: body?.name,
    avatarFile: null,
    removeAvatar: body?.removeAvatar === true || body?.image === null || body?.image === "",
  };
}

function handleProfileError(err: unknown, route: string) {
  if (err instanceof Response) return err;

  if (err instanceof ProfileServiceError) {
    return NextResponse.json(
      { error: err.message, details: err.details },
      { status: err.status }
    );
  }

  console.error(route, err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET() {
  try {
    const [user, tenantContext] = await Promise.all([
      getProfileSettings(),
      getTenantContext(),
    ]);

    return NextResponse.json({
      user,
      tenant: tenantContext?.tenant ?? null,
      role: tenantContext?.role ?? null,
    });
  } catch (err) {
    return handleProfileError(err, "[GET /api/profile]");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const input = await profileInputFromRequest(req);
    const user = await updateProfileSettings(input);

    return NextResponse.json({ user });
  } catch (err) {
    return handleProfileError(err, "[PATCH /api/profile]");
  }
}
