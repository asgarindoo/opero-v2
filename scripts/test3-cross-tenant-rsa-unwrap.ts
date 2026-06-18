// npx tsx --env-file=.env scripts/test3-cross-tenant-rsa-unwrap.ts
import { createClient } from "@supabase/supabase-js";
import {
  unwrapAesKey,
  decryptField,
  getVaultSecretName,
} from "@/lib/server/crypto/tenant-crypto";
import { prisma } from "@/lib/prisma";

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  
  if (!url || !key) {
    console.error("Konfigurasi Supabase Vault tidak lengkap.");
    process.exit(1);
  }
  
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const supabase = createSupabaseAdminClient();

async function main() {
  console.log("=".repeat(60));
  console.log("TEST Cross-Tenant RSA Unwrap Access");
  console.log("=".repeat(60));

  const orgs = await prisma.organization.findMany({
    where: { encryptedDataKey: { not: null } },
    select: { id: true, name: true, encryptedDataKey: true },
    take: 2,
  });

  if (orgs.length < 2) {
    console.error(`Dibutuhkan minimal 2 tenant dengan kunci enkripsi. Ditemukan: ${orgs.length}`);
    process.exit(1);
  }

  const [orgA, orgB] = orgs;

  const contacts = await prisma.contact.findMany({
    where: { organizationId: orgA.id, title: { not: null } },
    select: { id: true, title: true, name: true, persons: true },
  });

  if (contacts.length === 0) {
    console.error(`Tenant A (${orgA.name}) belum punya contact. Buat contact via aplikasi.`);
    process.exit(1);
  }

  console.log(`Tenant A: ${orgA.name} (${orgA.id})`);
  console.log(`Tenant B: ${orgB.name} (${orgB.id})`);

  console.log("\n[INFO] Mengambil RSA private key Tenant B dari Supabase Vault...");
  const { data: vaultData, error: vaultError } = await supabase.rpc("read_secret", {
    secret_name: getVaultSecretName(orgB.id),
  });

  if (vaultError || !vaultData) {
    console.error(`[ERROR] Gagal mengambil private key Tenant B: ${vaultError?.message}`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const record = Array.isArray(vaultData) ? vaultData[0] : vaultData;
  const privKeyBString = typeof record === "string"
    ? record
    : (record as Record<string, unknown>).decrypted_secret as string
    ?? (record as Record<string, unknown>).secret as string;

  const privKeyB = privKeyBString;
  const shortPrivKey = privKeyB.length > 100
    ? `${privKeyB.substring(0, 60)}\n.......\n${privKeyB.substring(privKeyB.length - 80)}`
    : privKeyB;
  console.log(`Berhasil mendapatkan private key B:\n${shortPrivKey}\n`);
  console.log("Mencoba melakukan unwrap AES key A dengan private key B...");
  let breachCount = 0;
  try {
    const stolenAesKey = unwrapAesKey(privKeyB, orgA.encryptedDataKey!);
    console.log("  [WARNING] RSA unwrap berhasil tanpa error (ini tidak wajar)!");

    console.log(`\nMencoba mendekripsi ${contacts.length} kontak Tenant A dengan stolen AES key...`);

    try {
      for (const contact of contacts) {
        console.log(`[Contact ID: ${contact.id}]`);
        const rawName = contact.name || "-";
        console.log(`  Contact.Name (Encrypted) : ${rawName.slice(0, 40)}...`);

        try {
          const result = decryptField(stolenAesKey, contact.name || "");
          if (result) {
            console.log(`  Hasil Dekripsi           : ${result}`);
            console.log(`  [CRITICAL] Isolasi Gagal: Private key B berhasil membuka data Tenant A!`);
            breachCount++;
          } else {
            console.log("  Hasil Dekripsi           : (kosong)");
          }
        } catch (err: unknown) {
          console.log(`  [ERROR] Gagal dekripsi: ${err instanceof Error ? err.message : String(err)}`);
        }
        console.log("-".repeat(40));
      }
    } finally {
      stolenAesKey.fill(0);
    }
  } catch (err: unknown) {
    console.log(`  [ERROR] Gagal unwrap: ${err instanceof Error ? err.message : String(err)}`);
    console.log("\n[SUCCESS] Key wrapping lintas-tenant berhasil dicegah oleh RSA-OAEP.");
    console.log("=".repeat(60));
    await prisma.$disconnect();
    return;
  }

  if (breachCount === 0) {
    console.log("\n[SUCCESS] Meskipun unwrap lolos, dekripsi gagal. Data aman.");
  } else {
    console.log(`\n[CRITICAL] Terdapat ${breachCount} kebocoran data lintas-tenant dari celah RSA!`);
  }

  console.log("=".repeat(60));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});
