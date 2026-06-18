// npx tsx --env-file=.env scripts/test1-valid-decryption.ts

import { getTenantAesKey, decryptField } from "@/lib/server/crypto/tenant-crypto";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("=".repeat(60));
  console.log("Test Valid Decryption (Tenant A dekripsi datanya sendiri)");
  console.log("=".repeat(60));

  const org = await prisma.organization.findFirst({
    where: { encryptedDataKey: { not: null } },
    select: { id: true, name: true },
  });

  if (!org) {
    console.error("Tidak menemukan tenant yang memiliki kunci enkripsi.");
    process.exit(1);
  }

  const contacts = await prisma.contact.findMany({
    where: { organizationId: org.id },
    select: { id: true, name: true, persons: true },
  });

  if (contacts.length === 0) {
    console.error("Belum ada data contact di tenant ini.");
    process.exit(1);
  }

  console.log(`\nMenemukan ${contacts.length} contact untuk tenant ${org.name} (${org.id})`);
  console.log("Mengambil AES key dari Supabase Vault...");

  const aesKey = await getTenantAesKey(org.id);
  console.log(`Berhasil mendapatkan key ${Buffer.from(aesKey).toString('hex')}\n`);

  try {
    for (const contact of contacts) {
      console.log(`[Contact ID: ${contact.id}]`);

      try {
        const rawName = contact.name || "-";
        const rawPersons = contact.persons ? (contact.persons as string) : "-";

        const decryptedName = contact.name ? (decryptField(aesKey, contact.name) || "-") : "-";
        const decryptedPersons = contact.persons ? (decryptField(aesKey, contact.persons as string) || "-") : "-";

        console.log(`  Contact.Name: `);
        console.log(`  Data Asli (Encrypted) : ${rawName !== "-" ? rawName.slice(0, 40) + "..." : "-"}`);
        console.log(`  Hasil Dekripsi        : ${decryptedName}`);

        console.log(`  Contact.persons: `);
        console.log(`  Data Asli (Encrypted) : ${rawPersons !== "-" ? rawPersons.slice(0, 40) + "..." : "-"}`);
        console.log(`  Hasil Dekripsi        : ${decryptedPersons}`);

      } catch (err: unknown) {
        console.log(`  Gagal dekripsi: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.log("-".repeat(40));
    }
  } finally {
    aesKey.fill(0);
  }

  console.log("=".repeat(60));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});
