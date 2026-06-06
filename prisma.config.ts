/**
 * OPERO — Prisma Configuration (Prisma 7+)
 *
 * In Prisma ORM v7, datasource connection URLs are configured here
 * instead of inside schema.prisma. This file is used by the Prisma CLI
 * for migrations and generate commands.
 *
 * See: https://pris.ly/d/config-datasource
 */

import "dotenv/config";
import { defineConfig } from "prisma/config";

// Local migration uses DATABASE_URL so development can work through the
// reachable Supabase pooler. Production can still use DIRECT_URL, or an
// explicit MIGRATION_DATABASE_URL when a direct database connection is available.
const migrationUrl =
  process.env.MIGRATION_DATABASE_URL ??
  (process.env.NODE_ENV === "production"
    ? process.env.DIRECT_URL ?? process.env.DATABASE_URL
    : process.env.DATABASE_URL ?? process.env.DIRECT_URL) ??
  "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
