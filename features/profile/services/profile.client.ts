import type { ProfileUser } from "./profile.server";

async function readJson(response: Response) {
  return response.json().catch(() => ({}));
}

export async function getProfileSettingsClient() {
  const response = await fetch("/api/profile", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load profile.");
  }

  return payload.user as ProfileUser;
}

export async function updateProfileSettingsClient(input: {
  name: string;
  avatarFile?: File | null;
  removeAvatar?: boolean;
}) {
  const formData = new FormData();
  formData.set("name", input.name);

  if (input.avatarFile) {
    formData.set("avatar", input.avatarFile);
  }

  if (input.removeAvatar) {
    formData.set("removeAvatar", "true");
  }

  const response = await fetch("/api/profile", {
    method: "PATCH",
    body: formData,
    cache: "no-store",
    credentials: "include",
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to save profile.");
  }

  return payload.user as ProfileUser;
}
