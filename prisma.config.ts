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
import { defineConfig, env } from "prisma/config";

// Use DIRECT_URL for migrations (bypasses connection pooler).
// Fall back to DATABASE_URL if DIRECT_URL is not set.
const migrationUrl =
  process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
