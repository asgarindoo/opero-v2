"use client";

import { useEffect, useState } from "react";
import {
  getUserDisplayName,
  getUserImage,
  getUserInitials,
  type UserIdentity,
} from "@/lib/user-identity";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "h-4 w-4 text-[7px]",
  sm: "h-5 w-5 text-[8px]",
  md: "h-7 w-7 text-[10px]",
  lg: "h-8 w-8 text-[11px]",
  xl: "h-16 w-16 text-[20px]",
};

interface UserAvatarProps {
  user?: UserIdentity | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatar?: string | null;
  initials?: string | null;
  size?: AvatarSize;
  className?: string;
  title?: string;
  online?: boolean;
  onlineClassName?: string;
}

export default function UserAvatar({
  user,
  name,
  email,
  image,
  avatar,
  initials,
  size = "md",
  className = "",
  title,
  online = false,
  onlineClassName = "",
}: UserAvatarProps) {
  const identity: UserIdentity = {
    ...user,
    name: name ?? user?.name,
    email: email ?? user?.email,
    image: image ?? user?.image,
    avatar: avatar ?? user?.avatar,
    initials: initials ?? user?.initials,
  };
  const src = getUserImage(identity);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const displayName = getUserDisplayName(identity);
  const showImage = Boolean(src && src !== failedSrc);

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  return (
    <span
      className={[
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/5 font-display font-bold leading-none text-on-surface",
        SIZE_CLASS[size],
        className,
      ].join(" ")}
      title={title ?? displayName}
    >
      {showImage ? (
        <img
          src={src ?? ""}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        getUserInitials(identity)
      )}
      {online && (
        <span
          className={[
            "absolute bottom-0 right-0 rounded-full border-2 bg-[#22c55e]",
            size === "xl" ? "h-3 w-3" : "h-2.5 w-2.5",
            onlineClassName || "border-{--color-background}",
          ].join(" ")}
        />
      )}
    </span>
  );
}

export function UserProfileBadge({
  user,
  name,
  email,
  image,
  avatar,
  size = "lg",
  className = "",
}: UserAvatarProps) {
  const identity: UserIdentity = {
    ...user,
    name: name ?? user?.name,
    email: email ?? user?.email,
    image: image ?? user?.image,
    avatar: avatar ?? user?.avatar,
  };

  return (
    <span className={["flex min-w-0 items-center gap-2.5", className].join(" ")}>
      <UserAvatar user={identity} size={size} />
      <span className="min-w-0">
        <span className="block truncate font-body-sm text-[13px] font-semibold text-on-surface">
          {getUserDisplayName(identity)}
        </span>
        {identity.email && (
          <span className="mt-0.5 block truncate font-body-sm text-[11px] text-on-surface-variant opacity-60">
            {identity.email}
          </span>
        )}
      </span>
    </span>
  );
}
