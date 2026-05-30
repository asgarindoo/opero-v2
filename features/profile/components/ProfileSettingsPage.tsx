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
    <div className="flex h-full flex-col overflow-hidden bg-background text-on-surface">
      <ModuleHeader title="Profile Settings" />

      <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-10">
        <div className="mx-auto max-w-[800px] pb-20">
          
          {loading ? (
             <div className="space-y-12 animate-pulse">
               <div className="space-y-6">
                 <div className="h-5 w-32 rounded bg-black/[0.04]" />
                 <div className="flex gap-6 items-center">
                   <div className="h-24 w-24 rounded-full bg-black/[0.05]" />
                   <div className="space-y-3">
                     <div className="h-8 w-32 rounded-[6px] bg-black/[0.04]" />
                     <div className="h-4 w-48 rounded-[4px] bg-black/[0.03]" />
                   </div>
                 </div>
               </div>
               <div className="space-y-6">
                 <div className="h-5 w-40 rounded bg-black/[0.04]" />
                 <div className="grid gap-6 sm:grid-cols-2">
                   <div className="h-10 w-full rounded-[6px] bg-black/[0.03]" />
                   <div className="h-10 w-full rounded-[6px] bg-black/[0.03]" />
                 </div>
               </div>
             </div>
          ) : (
            <div className="space-y-12">
              {(message || error) && (
                <div
                  className="rounded-[8px] border px-4 py-3 text-[13px] font-medium"
                  style={{
                    borderColor: error ? "rgba(220,38,38,0.18)" : "rgba(22,163,74,0.2)",
                    background: error ? "rgba(220,38,38,0.035)" : "rgba(22,163,74,0.04)",
                    color: error ? "#dc2626" : "#15803d",
                  }}
                >
                  {error ?? message}
                </div>
              )}

              {/* Profile Photo Section */}
              <section>
                <div className="border-b border-black/[0.06] pb-4 mb-6">
                  <h2 className="text-[14px] font-semibold text-on-surface">Profile Photo</h2>
                </div>
                <div className="flex items-center gap-6">
                  <UserAvatar
                    user={{ name: initialUser?.name || name, email: initialUser?.email || email, image: avatarPreview }}
                    size="xl"
                    className="h-24 w-24 flex-shrink-0 rounded-full text-[24px] shadow-sm ring-1 ring-black/5"
                    title={name ? `${name} profile photo` : "Profile photo"}
                  />
                  <div className="space-y-3">
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
                        {avatarPreview ? "Replace" : "Upload"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        disabled={!avatarPreview && !avatarFile}
                        onClick={handleRemovePhoto}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                    <p className="text-[12px] text-on-surface-variant opacity-80">
                      PNG, JPG, JPEG, or WEBP up to 2MB.
                    </p>
                  </div>
                </div>
              </section>

              {/* Personal Information Section */}
              <section>
                <div className="border-b border-black/[0.06] pb-4 mb-6">
                  <h2 className="text-[14px] font-semibold text-on-surface">Personal Information</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-medium text-[13px] text-on-surface">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      maxLength={80}
                      onChange={(event) => {
                        setName(event.target.value);
                        setMessage(null);
                      }}
                      className="h-10 w-full rounded-[6px] border border-black/[0.12] bg-white px-3 text-[13px] outline-none transition-colors focus:border-black/30 focus:ring-2 focus:ring-black/5"
                    />
                    {nameError && (
                      <span className="mt-1.5 block font-medium text-[12px] text-red-600">{nameError}</span>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-[13px] text-on-surface">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="h-10 w-full cursor-not-allowed rounded-[6px] border border-black/[0.06] bg-black/[0.02] px-3 text-[13px] text-on-surface-variant outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-medium text-[13px] text-on-surface">
                      Phone Number <span className="font-normal text-on-surface-variant opacity-70">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="h-10 w-full sm:max-w-xs rounded-[6px] border border-black/[0.12] bg-white px-3 text-[13px] outline-none transition-colors focus:border-black/30 focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Bottom Action Bar */}
          {!loading && (
            <div className="mt-12 flex items-center justify-end gap-3 border-t border-black/[0.06] pt-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={() => {
                  if (initialUser) {
                    setName(initialUser.name);
                    setEmail(initialUser.email);
                    setAvatarPreview(initialUser.image);
                    setAvatarFile(null);
                    setRemoveAvatar(false);
                    setMessage(null);
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={Save}
                isLoading={saving}
                disabled={!canSave}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
