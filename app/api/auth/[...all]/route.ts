/**
 * OPERO — Better Auth API Catch-All Route Handler
 *
 * All /api/auth/* requests are handled here by Better Auth.
 * Next.js 16 App Router convention: route.ts exporting GET/POST handlers.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
