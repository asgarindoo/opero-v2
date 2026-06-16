/**
 * Tenant Cryptographic Isolation — Envelope Encryption per tenant.
 *
 * Arsitektur:
 *   RSA Key Pair (per tenant)
 *     ├─ Public Key  → database (plaintext, boleh publik)
 *     └─ Private Key → Supabase Vault (rahasia)
 *
 *   AES-256 Data Key (per tenant)
 *     └─ Dienkripsi oleh RSA Public Key → disimpan di database
 *
 * Format ciphertext field: "<iv_base64>:<ciphertext_base64>"
 *
 * Referensi:
 *   AES-CBC    → https://csrc.nist.gov/publications/detail/sp/800-38a/final
 *   RSA-OAEP   → https://www.rfc-editor.org/rfc/rfc8017#section-7.1
 *   Envelope   → https://cloud.google.com/kms/docs/envelope-encryption
 *   Node.js    → https://nodejs.org/api/crypto.html
 */

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

// ── Konstanta ────────────────────────────────────────────────────────────────

const DATA_ALGORITHM = "aes-256-cbc"; // Algoritma enkripsi field data
const RSA_OAEP_HASH  = "sha256";      // Hash untuk RSA-OAEP padding
const AES_KEY_SIZE   = 32;            // 256 bit = 32 byte
const IV_SIZE        = 16;            // 128 bit = 16 byte (standar CBC)

// ── Setup Kunci Tenant ───────────────────────────────────────────────────────

// Dipanggil sekali saat tenant baru dibuat. Membuat RSA key pair + AES data key.
export async function createTenantCrypto(organizationId: string) {
  // Buat RSA key pair untuk tenant ini
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 3072,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  // Buat AES-256 data key lalu bungkus dengan RSA public key
  const aesKey = randomBytes(AES_KEY_SIZE);
  const wrappedAesKey = wrapAesKey(publicKey, aesKey);

  const supabase = createSupabaseAdminClient();

  try {
    // Simpan RSA private key ke Supabase Vault
    const { error } = await supabase.rpc("insert_secret", {
      secret_name: buildPrivateKeySecretName(organizationId),
      secret_value: privateKey,
    });
    if (error) throw new Error(`Gagal menyimpan private key: ${error.message}`);

    // Simpan public key dan AES key terenkripsi ke database
    await prisma.organization.update({
      where: { id: organizationId },
      data: { publicKey, encryptedDataKey: wrappedAesKey },
    });

    return { publicKey, encryptedDataKey: wrappedAesKey };
  } finally {
    aesKey.fill(0); // Hapus AES key dari memori
  }
}

// ── RSA Key Wrapping ─────────────────────────────────────────────────────────

// Enkripsi AES key menggunakan RSA public key (key wrapping).
export function wrapAesKey(rsaPublicKey: string, aesKey: Buffer): string {
  if (aesKey.length !== AES_KEY_SIZE) {
    throw new Error(`AES key harus 32 byte, diterima: ${aesKey.length} byte`);
  }

  return publicEncrypt(
    { key: rsaPublicKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: RSA_OAEP_HASH },
    aesKey
  ).toString("base64");
}

// Dekripsi AES key menggunakan RSA private key (key unwrapping).
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

// ── Enkripsi / Dekripsi Field ────────────────────────────────────────────────

// Enkripsi nilai string dengan AES-256-CBC. Hasil: "<iv>:<ciphertext>" (base64).
export function encryptField(aesKey: Buffer, value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;

  const iv = randomBytes(IV_SIZE); // IV acak unik per enkripsi
  const cipher = createCipheriv(DATA_ALGORITHM, aesKey, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return `${iv.toString("base64")}:${ciphertext.toString("base64")}`;
}

// Dekripsi nilai hasil encryptField(). Kembalikan apa adanya jika belum terenkripsi.
export function decryptField(aesKey: Buffer, value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;

  const colonIndex = value.indexOf(":");
  if (colonIndex === -1) return value; // Belum terenkripsi

  const ivBase64         = value.slice(0, colonIndex);
  const ciphertextBase64 = value.slice(colonIndex + 1);

  if (!ivBase64 || !ciphertextBase64) throw new Error("Format ciphertext tidak valid.");

  const decipher = createDecipheriv(DATA_ALGORITHM, aesKey, Buffer.from(ivBase64, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextBase64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

// ── Ambil AES Key Tenant ─────────────────────────────────────────────────────

// Ambil AES key tenant siap pakai. Selalu panggil aesKey.fill(0) setelah selesai.
export async function getTenantAesKey(organizationId: string): Promise<Buffer> {
  // Ambil encrypted AES key dari database
  const tenant = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { encryptedDataKey: true },
  });
  if (!tenant?.encryptedDataKey) throw new Error("Kunci enkripsi tenant belum dikonfigurasi.");

  // Ambil RSA private key dari Supabase Vault
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("read_secret", {
    secret_name: buildPrivateKeySecretName(organizationId),
  });
  if (error) throw new Error(`Gagal membaca private key: ${error.message}`);

  const privateKey = extractSecretValue(data);
  if (!privateKey) throw new Error("Private key tenant tidak tersedia di Vault.");

  // Buka AES key menggunakan private key
  return unwrapAesKey(privateKey, tenant.encryptedDataKey);
}

// ── Helper Internal ──────────────────────────────────────────────────────────

export function buildPrivateKeySecretName(organizationId: string): string {
  return `tenant_${organizationId}_private_key`;
}

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Konfigurasi Supabase Vault tidak lengkap.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

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
