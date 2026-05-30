import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server/auth-utils";
import {
  downloadPrivateObject,
  isExternalImageUrl,
  TENANT_ASSETS_BUCKET,
  USER_AVATAR_FOLDER,
} from "@/lib/server/supabase-storage";

const USER_AVATAR_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

function imagePathFromRequest(req: NextRequest, storedImage: string | null) {
  const queryPath = req.nextUrl.searchParams.get("v");
  if (queryPath) return queryPath;
  if (!storedImage) return null;

  if (storedImage.startsWith("/api/profile/avatar/")) {
    return new URL(storedImage, req.nextUrl.origin).searchParams.get("v");
  }

  return storedImage;
}

async function canViewAvatar(currentUserId: string, avatarUserId: string) {
  if (currentUserId === avatarUserId) return true;

  const sharedMembership = await prisma.member.findFirst({
    where: {
      userId: currentUserId,
      status: "active",
      organization: {
        status: "active",
        members: {
          some: {
            userId: avatarUserId,
            status: "active",
          },
        },
      },
    },
    select: { id: true },
  });

  return Boolean(sharedMembership);
}

function dataImageResponse(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const contentType = meta.match(/^data:(.*);base64$/)?.[1] ?? "image/png";

  return new NextResponse(Buffer.from(base64, "base64"), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

function isAllowedAvatarPath(userId: string, avatarPath: string) {
  const legacyPathPattern = new RegExp(`^${USER_AVATAR_FOLDER}/${userId}\\.(?:${USER_AVATAR_EXTENSIONS.join("|")})$`);
  return legacyPathPattern.test(avatarPath) || avatarPath.startsWith(`${USER_AVATAR_FOLDER}/${userId}/`);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { userId } = await params;

    const [allowed, avatarUser] = await Promise.all([
      canViewAvatar(currentUser.id, userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { image: true },
      }),
    ]);

    if (!avatarUser?.image) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const avatarPath = imagePathFromRequest(req, avatarUser.image);
    if (!avatarPath) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    if (avatarPath.startsWith("data:image/")) {
      return dataImageResponse(avatarPath);
    }

    if (isExternalImageUrl(avatarPath)) {
      return NextResponse.redirect(avatarPath);
    }

    if (
      avatarPath.includes("..") ||
      avatarPath.includes("\\") ||
      !isAllowedAvatarPath(userId, avatarPath)
    ) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    const { data, error } = await downloadPrivateObject(TENANT_ASSETS_BUCKET, avatarPath);

    if (error || !data) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    return new NextResponse(data.stream(), {
      headers: {
        "Content-Type": data.type || "application/octet-stream",
        "Cache-Control": "private, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/profile/avatar/[userId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
