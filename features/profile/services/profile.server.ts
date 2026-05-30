import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server/auth-utils";
import {
  normalizeUserAvatarImage,
  removeUserAvatarFiles,
  storedUserAvatarPath,
  userAvatarRouteUrl,
  uploadUserAvatarFile,
} from "@/lib/server/supabase-storage";

const ProfileNameSchema = z.string().trim().min(1, "Full name is required.").max(80, "Full name must be 80 characters or fewer.");

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export class ProfileServiceError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "ProfileServiceError";
    this.status = status;
    this.details = details;
  }
}

async function normalizeProfileUserAvatar(user: ProfileUser): Promise<ProfileUser> {
  const image = normalizeUserAvatarImage(user.id, user.image);

  if (image === user.image) {
    return user;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { image },
    select: { id: true },
  });

  return { ...user, image };
}

export async function getProfileSettings(): Promise<ProfileUser> {
  const sessionUser = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true, email: true, image: true },
  });

  if (!user) {
    throw new ProfileServiceError("User profile not found.", 404);
  }

  return normalizeProfileUserAvatar(user);
}

export async function updateProfileSettings(input: {
  name: unknown;
  avatarFile?: File | null;
  removeAvatar?: boolean;
}): Promise<ProfileUser> {
  const sessionUser = await requireAuth();
  const parsedName = ProfileNameSchema.safeParse(input.name);

  if (!parsedName.success) {
    throw new ProfileServiceError("Validation failed.", 400, parsedName.error.flatten().formErrors);
  }

  const current = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { image: true },
  });

  if (!current) {
    throw new ProfileServiceError("User profile not found.", 404);
  }

  const previousAvatarPath = storedUserAvatarPath(sessionUser.id, current.image);
  let nextImage: string | null | undefined;
  let uploadedAvatarPath: string | null = null;

  if (input.avatarFile) {
    try {
      const uploaded = await uploadUserAvatarFile({
        userId: sessionUser.id,
        file: input.avatarFile,
      });
      uploadedAvatarPath = uploaded.objectPath;
      nextImage = userAvatarRouteUrl(sessionUser.id, uploaded.objectPath);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Profile photo")) {
        throw new ProfileServiceError(err.message, 400);
      }
      throw err;
    }

    await removeUserAvatarFiles({
      userId: sessionUser.id,
      excludePath: uploadedAvatarPath,
      extraPaths: [previousAvatarPath],
    });
  } else if (input.removeAvatar) {
    await removeUserAvatarFiles({
      userId: sessionUser.id,
      extraPaths: [previousAvatarPath],
    });
    nextImage = null;
  }

  const updatedUser = await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      name: parsedName.data,
      ...(nextImage !== undefined ? { image: nextImage } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return normalizeProfileUserAvatar(updatedUser);
}
