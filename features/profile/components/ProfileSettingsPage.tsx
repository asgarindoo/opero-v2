"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Save, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import ModuleHeader from "@/components/common/ModuleHeader";
import UserAvatar from "@/components/common/UserAvatar";
import Button from "@/components/ui/Button";
import {
  getProfileSettingsClient,
  updateProfileSettingsClient,
} from "@/features/profile/services/profile.client";
import type { ProfileUser } from "@/features/profile/services/profile.server";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const FILE_ACCEPT = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { refetch } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [initialUser, setInitialUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const user = await getProfileSettingsClient();
        if (cancelled) return;

        setInitialUser(user);
        setName(user.name);
        setEmail(user.email);
        setAvatarPreview(user.image);
        setAvatarFile(null);
        setRemoveAvatar(false);
        void refetch();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const trimmedName = name.trim();
  const nameError = useMemo(() => {
    if (!trimmedName) return "Full name is required.";
    if (trimmedName.length > 80) return "Full name must be 80 characters or fewer.";
    return null;
  }, [trimmedName]);

  const hasChanges = Boolean(
    initialUser &&
    (
      trimmedName !== initialUser.name ||
      avatarFile ||
      removeAvatar
    )
  );

  const canSave = hasChanges && !nameError && !saving;
  function clearObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function handleFile(file: File) {
    setMessage(null);

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setError("Profile photo must be a PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setError("Profile photo must be smaller than 2MB.");
      return;
    }

    clearObjectUrl();
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;

    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setRemoveAvatar(false);
    setError(null);
  }

  function handleRemovePhoto() {
    if (!avatarPreview && !avatarFile) return;

    clearObjectUrl();
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(Boolean(initialUser?.image));
    setMessage(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updatedUser = await updateProfileSettingsClient({
        name: trimmedName,
        avatarFile,
        removeAvatar: removeAvatar && !avatarFile,
      });

      clearObjectUrl();
      setInitialUser(updatedUser);
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setAvatarPreview(updatedUser.image);
      setAvatarFile(null);
      setRemoveAvatar(false);
      setMessage("Profile saved.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await refetch();
      window.dispatchEvent(new CustomEvent("opero:profile-updated", { detail: updatedUser }));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-on-surface font-aspekta">
      <ModuleHeader
        title="Profile Settings"
        rightContent={hasChanges ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Save}
            isLoading={saving}
            disabled={!canSave}
            onClick={handleSave}
          >
            SAVE CHANGES
          </Button>
        ) : null}
      />

      <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto max-w-[720px]">
          {loading ? (
            <div className="rounded-[8px] border border-black/[0.06] bg-[#fef8f8] p-6 sm:p-8">
              <div className="flex items-center gap-5 animate-pulse">
                <div className="h-24 w-24 rounded-full bg-black/[0.05]" />
                <div className="space-y-3">
                  <div className="h-8 w-28 rounded-[6px] bg-black/[0.04]" />
                  <div className="h-8 w-24 rounded-[6px] bg-black/[0.03]" />
                </div>
              </div>
              <div className="mt-8 space-y-5 animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-black/[0.04]" />
                  <div className="h-11 w-full rounded-[6px] bg-black/[0.03]" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-black/[0.04]" />
                  <div className="h-11 w-full rounded-[6px] bg-black/[0.03]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {(message || error) && (
                <div
                  className="rounded-[6px] border px-4 py-3 text-[12px]"
                  style={{
                    borderColor: error ? "rgba(220,38,38,0.18)" : "rgba(22,163,74,0.2)",
                    background: error ? "rgba(220,38,38,0.035)" : "rgba(22,163,74,0.04)",
                    color: error ? "#dc2626" : "#15803d",
                  }}
                >
                  {error ?? message}
                </div>
              )}

              <div className="rounded-[8px] border border-black/[0.06] bg-[#fef8f8] p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <UserAvatar
                    user={{ name, email, image: avatarPreview }}
                    size="xl"
                    className="h-24 w-24 bg-white text-[26px]"
                    title={name ? `${name} profile photo` : "Profile photo"}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={FILE_ACCEPT}
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={Upload}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarPreview ? "REPLACE" : "UPLOAD"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      disabled={!avatarPreview && !avatarFile}
                      onClick={handleRemovePhoto}
                    >
                      REMOVE PHOTO
                    </Button>
                  </div>
                </div>

                <div className="mt-8 grid gap-5">
                  <label className="block space-y-2">
                    <span className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                      Full Name
                    </span>
                    <input
                      type="text"
                      value={name}
                      maxLength={80}
                      onChange={(event) => {
                        setName(event.target.value);
                        setMessage(null);
                      }}
                      className="w-full rounded-[6px] border border-black/[0.08] bg-white px-3.5 py-3 font-aspekta text-[13px] text-on-surface outline-none transition-colors focus:border-black/30"
                    />
                    {nameError && (
                      <span className="block text-[11px] text-red-600">{nameError}</span>
                    )}
                  </label>

                  <label className="block space-y-2">
                    <span className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                      Email
                    </span>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full cursor-default rounded-[6px] border border-black/[0.06] bg-black/[0.025] px-3.5 py-3 font-aspekta text-[13px] text-on-surface-variant outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
