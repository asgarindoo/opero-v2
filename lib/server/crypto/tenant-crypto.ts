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

const DATA_ALGORITHM = "aes-256-cbc";
const RSA_OAEP_HASH  = "sha256";
const AES_KEY_SIZE   = 32;
const IV_SIZE        = 16;

// Dipanggil sekali saat tenant baru dibuat
export async function createTenantCrypto(organizationId: string) {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 3072,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const aesKey = randomBytes(AES_KEY_SIZE);
  const wrappedAesKey = wrapAesKey(publicKey, aesKey);
  const supabase = createSupabaseAdminClient();

  try {
    const { error } = await supabase.rpc("insert_secret", {
      secret_name: getVaultSecretName(organizationId),
      secret_value: privateKey,
    });
    if (error) throw new Error(`Gagal menyimpan private key: ${error.message}`);

    await prisma.organization.update({
      where: { id: organizationId },
      data: { publicKey, encryptedDataKey: wrappedAesKey },
    });

    return { publicKey, encryptedDataKey: wrappedAesKey };
  } finally {
    aesKey.fill(0); // hapus dari memori
  }
}

export function wrapAesKey(rsaPublicKey: string, aesKey: Buffer): string {
  if (aesKey.length !== AES_KEY_SIZE) {
    throw new Error(`AES key harus 32 byte, diterima: ${aesKey.length} byte`);
  }
  return publicEncrypt(
    { key: rsaPublicKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: RSA_OAEP_HASH },
    aesKey
  ).toString("base64");
}

export function unwrapAesKey(rsaPrivateKey: string, wrappedAesKey: string): Buffer {
  const aesKey = privateDecrypt(
    { key: rsaPrivateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: RSA_OAEP_HASH },
    Buffer.from(wrappedAesKey, "base64")
  );

  if (aesKey.length !== AES_KEY_SIZE) {
    aesKey.fill(0);
    throw new Error("AES key yang dibuka memiliki ukuran tidak valid.");
  }

  return aesKey;
}

// Format: "<iv_base64>:<ciphertext_base64>"
export function encryptField(aesKey: Buffer, value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;

  const iv = randomBytes(IV_SIZE); // IV baru tiap enkripsi
  const cipher = createCipheriv(DATA_ALGORITHM, aesKey, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return `${iv.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decryptField(aesKey: Buffer, value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;

  const colonIndex = value.indexOf(":");
  if (colonIndex === -1) return value; // data lama, belum terenkripsi

  const ivBase64         = value.slice(0, colonIndex);
  const ciphertextBase64 = value.slice(colonIndex + 1);

  if (!ivBase64 || !ciphertextBase64) throw new Error("Format ciphertext tidak valid.");

  const decipher = createDecipheriv(DATA_ALGORITHM, aesKey, Buffer.from(ivBase64, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextBase64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

// Panggil aesKey.fill(0) setelah selesai
export async function getTenantAesKey(organizationId: string): Promise<Buffer> {
  const tenant = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { encryptedDataKey: true },
  });
  if (!tenant?.encryptedDataKey) throw new Error("Kunci enkripsi tenant belum dikonfigurasi.");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("read_secret", {
    secret_name: getVaultSecretName(organizationId),
  });
  if (error) throw new Error(`Gagal membaca private key: ${error.message}`);

  const privateKey = extractSecretValue(data);
  if (!privateKey) throw new Error("Private key tenant tidak tersedia di Vault.");

  return unwrapAesKey(privateKey, tenant.encryptedDataKey);
}

export function getVaultSecretName(organizationId: string): string {
  return `tenant_${organizationId}_private_key`;
}

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Konfigurasi Supabase Vault tidak lengkap.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Struktur respons read_secret beda-beda tergantung versi pgsodium
function extractSecretValue(data: unknown): string | null {
  const record = Array.isArray(data) ? data[0] : data;
  if (typeof record === "string") return record;
  if (record && typeof record === "object") {
    const obj = record as Record<string, unknown>;
    const value = obj.secret ?? obj.secret_value ?? obj.value ?? obj.decrypted_secret ?? obj.read_secret;
    return typeof value === "string" ? value : null;
  }
  return null;
}
