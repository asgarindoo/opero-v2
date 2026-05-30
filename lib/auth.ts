/**
 * OPERO — Better Auth Server Instance
 *
 * This file is SERVER-ONLY. Never import this in client components.
 * Use `lib/auth-client.ts` for client-side auth operations.
 */

import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma"; // Force TS re-evaluation
import { generateInviteCode } from "@/lib/utils/invite-code";

const rootAuthUrl =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_ROOT_URL ??
  "http://lvh.me:3000";
const rootHostname = new URL(rootAuthUrl).hostname;
const rootDomain  = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? rootHostname;
const isLoopbackHost = rootHostname === "localhost" || rootHostname === "127.0.0.1";

// Cookie domain strategy:
//   lvh.me/prod: set a shared root domain so subdomains share the cookie.
//   localhost:   omit domain entirely; localhost cannot reliably share cookies
//                with *.localhost in browsers.
const cookieDomain = !isLoopbackHost
  ? (process.env.BETTER_AUTH_COOKIE_DOMAIN ?? rootDomain)
  : undefined;

async function assignUniqueInviteCode(organizationId: string) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      await prisma.organization.update({
        where: { id: organizationId },
        data: { inviteCode: generateInviteCode() },
      });
      return;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        continue;
      }
      throw err;
    }
  }

  throw new Error("Unable to generate a unique tenant invite code");
}

export const auth = betterAuth({
  baseURL: rootAuthUrl,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ── Email + Password ────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // enable in production
    minPasswordLength: 8,
  },

  // ── Session ─────────────────────────────────────────────────────────
  session: {
    // Session expiry: 30 days
    expiresIn: 60 * 60 * 24 * 30,
    // Extend session on activity
    updateAge: 60 * 60 * 24, // re-validate once per day
    // Keep Better Auth from storing full session/user data in cookies.
    // That cache can be chunked into many Set-Cookie headers and break
    // organization.setActive() with ERR_RESPONSE_HEADERS_TOO_BIG.
    cookieCache: {
      enabled: false,
    },
  },

  // ── Organization Plugin (= Tenant in OPERO) ─────────────────────────
  plugins: [
    organization({
      // Allow any authenticated user to create an organization
      allowUserToCreateOrganization: true,

      // Supported roles: owner > admin > member (staff in OPERO)
      // "owner" and "admin" are built-in; "member" maps to "staff" role in OPERO UI
      membershipLimit: 200,

      // Set up invitation email (no-op stub — add email provider later)
      async sendInvitationEmail(data) {
        // TODO: Replace with real email send (e.g., Resend)
        console.log(
          `[OPERO] Invitation created for ${data.email} to join "${data.organization.name}"`,
          `\n  Invite ID: ${data.id}`,
          `\n  Invited by: ${data.inviter.user.email}`
        );
      },

      // Auto-create TenantSettings + seed free plan after org creation
      organizationHooks: {
        afterCreateOrganization: async ({ organization: org }) => {
          try {
            await assignUniqueInviteCode(org.id);

            // Seed free plan if not already in DB
            const freePlan = await prisma.subscriptionPlan.upsert({
              where: { name: "free" },
              create: {
                name: "free",
                displayName: "Free",
                maxMembers: 1,
                maxBots: 1,
                features: { tasks: true, flows: false, goals: false },
              },
              update: {},
            });

            // Create tenant settings record
            await prisma.tenantSettings.create({
              data: { organizationId: org.id },
            });

            // Create tenant plan record (free by default)
            await prisma.tenantPlan.create({
              data: {
                organizationId: org.id,
                planId: freePlan.id,
                status: "active",
              },
            });
          } catch (err) {
            // Non-fatal: settings/plan creation failure shouldn't block org creation
            console.error("[OPERO] Failed to seed tenant settings:", err);
          }
        },
      },
    }),
  ],

  // ── Trusted Origins ─────────────────────────────────────────────────
  trustedOrigins: [
    rootAuthUrl,
    "http://*.localhost:3000",
    "http://lvh.me:3000",
    "http://*.lvh.me:3000",
    ...(rootDomain ? [`https://*.${rootDomain}`, `http://*.${rootDomain}`] : []),
  ],

  ...(cookieDomain
    ? {
        advanced: {
          crossSubDomainCookies: {
            enabled: true,
            domain: cookieDomain,
          },
        },
      }
    : {}),
});

export type Auth = typeof auth;
