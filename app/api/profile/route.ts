import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getTenantContext, requireAuth } from "@/lib/server/auth-utils";
import {
  isExternalImageUrl,
  removePrivateObject,
  TENANT_ASSETS_BUCKET,
  uploadUserAvatarFromDataUrl,
  USER_AVATAR_FOLDER,
} from "@/lib/server/supabase-storage";

const ProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  image: z
    .union([z.string(), z.null()])
    .optional(),
});

function userAvatarUrl(userId: string, objectPath: string) {
  return `/api/profile/avatar/${userId}?v=${encodeURIComponent(objectPath)}`;
}

function storedAvatarPath(userId: string, image: string | null | undefined) {
  if (!image) return null;

  if (image.startsWith(`${USER_AVATAR_FOLDER}/${userId}/`)) {
    return image;
  }

  if (image.startsWith("/api/profile/avatar/")) {
    return new URL(image, "http://opero.local").searchParams.get("v");
  }

  return null;
}

function isSupportedAvatarValue(userId: string, image: string) {
  return (
    image === "" ||
    image.startsWith("data:image/") ||
    image.startsWith("/api/profile/avatar/") ||
    image.startsWith(`${USER_AVATAR_FOLDER}/${userId}/`) ||
    isExternalImageUrl(image)
  );
}

export async function GET() {
  try {
    const [user, tenantContext] = await Promise.all([
      getCurrentUser(),
      getTenantContext(),
    ]);

    return NextResponse.json({
      user,
      tenant: tenantContext?.tenant ?? null,
      role: tenantContext?.role ?? null,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => null);
    const parsed = ProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, image } = parsed.data;

    if (image !== undefined && image !== null && !isSupportedAvatarValue(user.id, image)) {
      return NextResponse.json(
        { error: "Avatar must be an image data URL, existing avatar route, or URL." },
        { status: 400 }
      );
    }

    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { image: true },
    });

    let normalizedImage: string | null | undefined;
    try {
      normalizedImage = image === undefined
        ? undefined
        : image === null || image === ""
          ? null
          : image.startsWith("data:image/")
            ? userAvatarUrl(user.id, await uploadUserAvatarFromDataUrl({ userId: user.id, dataUrl: image }))
            : image.startsWith(`${USER_AVATAR_FOLDER}/${user.id}/`)
              ? userAvatarUrl(user.id, image)
              : image;
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Avatar must")) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(normalizedImage !== undefined ? { image: normalizedImage } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    const previousAvatarPath = storedAvatarPath(user.id, current?.image);
    const nextAvatarPath = storedAvatarPath(user.id, updated.image);

    if (normalizedImage !== undefined && previousAvatarPath && previousAvatarPath !== nextAvatarPath) {
      removePrivateObject(TENANT_ASSETS_BUCKET, previousAvatarPath).catch((err) => {
        console.error("[PATCH /api/profile] Failed to remove old avatar:", err);
      });
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
