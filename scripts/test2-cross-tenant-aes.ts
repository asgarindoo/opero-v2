// npx tsx --env-file=.env scripts/test2-cross-tenant-aes.ts
import { getTenantAesKey, decryptField } from "@/lib/server/crypto/tenant-crypto";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("=".repeat(60));
  console.log("TEST Cross-Tenant AES Key Access");
  console.log("=".repeat(60));

  const orgs = await prisma.organization.findMany({
    where: { encryptedDataKey: { not: null } },
    select: { id: true, name: true },
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

  console.log(`Tenant A: ${orgA.name} (Tenant ID: ${orgA.id})`);
  console.log(`Tenant B: ${orgB.name} (Tenant ID: ${orgB.id})`);

  console.log("\nMengambil AES key Tenant B dari Supabase Vault...");
  const aesKeyB = await getTenantAesKey(orgB.id);
  console.log(`Berhasil mendapatkan key Tenant B ${Buffer.from(aesKeyB).toString('hex')}\n`);

  console.log(`Mencoba mendekripsi ${contacts.length} kontak Tenant A dengan AES key B...`);

  let breachCount = 0;

  try {
    for (const contact of contacts) {
      console.log(`[Contact ID: ${contact.id}]`);
      const rawName = contact.name || "-";
      try {
        const result = decryptField(aesKeyB, contact.name || "");
        if (result) {
          console.log(`  Hasil Dekripsi           : ${result}`);
          console.log(`  [CRITICAL] Isolasi Gagal: Private key B berhasil membuka data Tenant A`);
          breachCount++;
        } else {
          console.log("  Hasil Dekripsi           : (kosong)");
        }
      } catch (err: unknown) {
        console.log(`  Gagal dekripsi: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.log("-".repeat(40));
    }
  } finally {
    aesKeyB.fill(0);
  }

  if (breachCount === 0) {
    console.log("\n[SUCCESS] Seluruh dekripsi lintas-tenant berhasil dicegah");
  } else {
    console.log(`\n[DANGER] Terdapat ${breachCount} kebocoran data lintas-tenant`);
  }

  console.log("=".repeat(60));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});
