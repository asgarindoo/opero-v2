import { createClient } from "@supabase/supabase-js";

export const TENANT_ASSETS_BUCKET = "tenant-assets";
export const TENANT_FILES_BUCKET = "tenant-files";
export const TENANT_LOGO_FOLDER = "AvatarTenant";
export const USER_AVATAR_FOLDER = "AvatarUser";

const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("Supabase storage is not configured.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function extensionFromMime(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

export function isDataImage(value: string | null | undefined) {
  return !!value && DATA_URL_PATTERN.test(value);
}

export function isExternalImageUrl(value: string | null | undefined) {
  return !!value && /^https?:\/\//i.test(value);
}

export async function uploadTenantLogoFromDataUrl(params: {
  organizationId: string;
  dataUrl: string;
}) {
  const match = params.dataUrl.match(DATA_URL_PATTERN);
  if (!match) {
    throw new Error("Logo must be a valid image data URL.");
  }

  const [, contentType, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  const maxBytes = 2 * 1024 * 1024;

  if (buffer.byteLength > maxBytes) {
    throw new Error("Logo must be smaller than 2MB.");
  }

  const supabase = getSupabaseAdmin();
  const ext = extensionFromMime(contentType);
  const objectPath = `${TENANT_LOGO_FOLDER}/${params.organizationId}/logo-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(TENANT_ASSETS_BUCKET)
    .upload(objectPath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return objectPath;
}

export async function removePrivateObject(bucket: string, path: string | null | undefined) {
  if (!path || path.startsWith("data:image/") || /^https?:\/\//i.test(path)) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw error;
  }
}

function safeFileName(name: string) {
  const cleaned = name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return cleaned || "file";
}

export async function uploadTenantPrivateFile(params: {
  organizationId: string;
  file: File;
  folder?: string;
}) {
  const maxBytes = 30 * 1024 * 1024;

  if (params.file.size > maxBytes) {
    throw new Error("File must be smaller than 30MB.");
  }

  const supabase = getSupabaseAdmin();
  const folder = params.folder ? safeFileName(params.folder) : "files";
  const objectPath = `tenants/${params.organizationId}/${folder}/${Date.now()}-${safeFileName(params.file.name)}`;
  const buffer = Buffer.from(await params.file.arrayBuffer());

  const { error } = await supabase.storage
    .from(TENANT_FILES_BUCKET)
    .upload(objectPath, buffer, {
      contentType: params.file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return objectPath;
}

const ALLOWED_DOCUMENT_EXTENSIONS = new Set([
  "pdf", "docx", "xlsx", "pptx", "txt", "csv", // Documents
  "png", "jpg", "jpeg", "webp", "svg",         // Images
  "zip", "rar"                                 // Archives
]);

const BLOCKED_EXTENSIONS = new Set([
  "exe", "apk", "dmg", "bat", "sh", "js", "msi", "app", "cmd", "com"
]);

export async function uploadTenantDocument(params: {
  organizationId: string;
  file: File;
  folder?: string;
}) {
  const maxBytes = 30 * 1024 * 1024;

  if (params.file.size > maxBytes) {
    throw new Error("Maximum upload size is 30MB.");
  }

  // Validate extension
  const fileNameParts = params.file.name.split(".");
  const ext = fileNameParts.length > 1 ? fileNameParts.pop()?.toLowerCase() || "" : "";

  if (!ext || BLOCKED_EXTENSIONS.has(ext) || !ALLOWED_DOCUMENT_EXTENSIONS.has(ext)) {
    throw new Error("Unsupported file type.");
  }

  const supabase = getSupabaseAdmin();
  const folder = params.folder ? safeFileName(params.folder) : "uncategorized";
  
  const cleanBaseName = safeFileName(fileNameParts.join("."));
  const objectPath = `tenants/${params.organizationId}/${folder}/${cleanBaseName}_${Date.now()}.${ext}`;
  const buffer = Buffer.from(await params.file.arrayBuffer());

  const { error } = await supabase.storage
    .from(TENANT_FILES_BUCKET)
    .upload(objectPath, buffer, {
      contentType: params.file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return objectPath;
}

export async function downloadPrivateObject(bucket: string, path: string) {
  const supabase = getSupabaseAdmin();
  return supabase.storage.from(bucket).download(path);
}

export async function deletePrivateObject(bucket: string, path: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw error;
  }
}
