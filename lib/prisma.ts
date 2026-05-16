/**
 * OPERO — Prisma Client Singleton
 *
 * Prevents multiple Prisma Client instances during Next.js hot reload in development.
 * See: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from "@prisma/client"; // Force TS re-evaluation
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Setup connection pool with SSL — required for Supabase
const connectionString = process.env.DATABASE_URL ?? "";
const pool = new Pool({
  connectionString,
  ssl: {
    // Supabase uses self-signed certs behind the pooler in some regions
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
