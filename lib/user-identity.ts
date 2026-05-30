export interface UserIdentity {
  id?: string | null;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatar?: string | null;
  initials?: string | null;
}

export function getUserDisplayName(user: UserIdentity | null | undefined, fallback = "User") {
  const name = user?.name?.trim();
  if (name) return name;

  const email = user?.email?.trim();
  if (email) return email;

  return fallback;
}

export function getUserImage(user: UserIdentity | null | undefined) {
  return user?.image ?? user?.avatar ?? null;
}

export function getUserInitials(user: UserIdentity | null | undefined, fallback = "U") {
  const explicitInitials = user?.initials?.trim();
  if (explicitInitials) return explicitInitials.slice(0, 2).toUpperCase();

  const displayName = getUserDisplayName(user, fallback);
  const nameParts = displayName
    .replace(/@.*/, "")
    .split(/\s+/)
    .filter(Boolean);

  if (nameParts.length === 0) return fallback.slice(0, 2).toUpperCase();
  if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase();

  return `${nameParts[0][0] ?? ""}${nameParts[nameParts.length - 1][0] ?? ""}`.toUpperCase();
}

export function normalizeUserIdentity<T extends UserIdentity>(user: T): T & {
  name: string;
  image: string | null;
  initials: string;
} {
  const normalized = {
    ...user,
    name: getUserDisplayName(user),
    image: getUserImage(user),
    initials: getUserInitials(user),
  };

  return normalized;
}
