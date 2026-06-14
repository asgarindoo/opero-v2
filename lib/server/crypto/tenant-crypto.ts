import {
  constants,
  createCipheriv,
  createDecipheriv,
  generateKeyPairSync,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
} from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const FIELD_ALGORITHM = "aes-256-gcm";
const KEY_WRAP_HASH = "sha256";
const VERSION = "v1";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const AES_KEY_LENGTH = 32;

export async function createTenantCrypto(organizationId: string) {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 3072,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const aesKey = randomBytes(AES_KEY_LENGTH);
  const encryptedDataKey = wrapDataKey(publicKey, aesKey);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    aesKey.fill(0);
    throw new Error("Supabase Vault RPC is not configured.");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { error } = await supabase.rpc("insert_secret", {
      secret_name: getPrivateKeySecretName(organizationId),
      secret_value: privateKey,
    });

    if (error) {
      throw new Error(`Failed to store tenant private key: ${error.message}`);
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { publicKey, encryptedDataKey },
    });

    return { publicKey, encryptedDataKey };
  } finally {
    aesKey.fill(0);
  }
}

export function getPrivateKeySecretName(organizationId: string) {
  return `tenant_${organizationId}_private_key`;
}

export function wrapDataKey(publicKey: string, aesKey: Buffer) {
  if (aesKey.length !== AES_KEY_LENGTH) {
    throw new Error("Tenant AES key must be 32 bytes.");
  }

  return publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: KEY_WRAP_HASH,
    },
    aesKey
  ).toString("base64");
}

export function unwrapDataKey(privateKey: string, encryptedDataKey: string) {
  const aesKey = privateDecrypt(
    {
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: KEY_WRAP_HASH,
    },
    Buffer.from(encryptedDataKey, "base64")
  );

  if (aesKey.length !== AES_KEY_LENGTH) {
    aesKey.fill(0);
    throw new Error("Tenant AES key has an invalid length.");
  }

  return aesKey;
}

export function encryptField(aesKey: Buffer, value: string | null | undefined) {
  if (value === null || value === undefined) return null;

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(FIELD_ALGORITHM, aesKey, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptField(aesKey: Buffer, value: string | null | undefined) {
  if (value === null || value === undefined) return null;
  if (!value.startsWith(`${VERSION}:`)) return value;

  const [version, ivBase64, tagBase64, encryptedBase64] = value.split(":");
  if (version !== VERSION || !ivBase64 || !tagBase64 || !encryptedBase64) {
    throw new Error("Invalid encrypted field format.");
  }

  const decipher = createDecipheriv(FIELD_ALGORITHM, aesKey, Buffer.from(ivBase64, "base64"), {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(Buffer.from(tagBase64, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export async function getTenantAesKey(organizationId: string) {
  const tenant = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { encryptedDataKey: true },
  });

  if (!tenant?.encryptedDataKey) {
    throw new Error("Tenant encryption keys are not configured.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("Supabase Vault RPC is not configured.");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.rpc("read_secret", {
    secret_name: getPrivateKeySecretName(organizationId),
  });

  if (error) {
    throw new Error(`Failed to read tenant private key: ${error.message}`);
  }

  const secret = Array.isArray(data) ? data[0] : data;
  const privateKey = typeof secret === "string"
    ? secret
    : secret && typeof secret === "object"
      ? (secret as Record<string, unknown>).secret
        ?? (secret as Record<string, unknown>).secret_value
        ?? (secret as Record<string, unknown>).value
        ?? (secret as Record<string, unknown>).decrypted_secret
        ?? (secret as Record<string, unknown>).read_secret
      : null;

  if (typeof privateKey !== "string" || !privateKey) {
    throw new Error("Tenant private key is not available.");
  }

  return unwrapDataKey(privateKey, tenant.encryptedDataKey);
}
