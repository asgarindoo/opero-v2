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

const rootAuthUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const rootDomain  = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
const isLocalhost = rootAuthUrl.includes("localhost") || rootAuthUrl.includes("127.0.0.1");

// Cookie domain strategy:
//   localhost:  omit domain entirely (host-only cookie).
//               Domain=localhost and Domain=.localhost are REJECTED by browsers per RFC 6265.
//               Cross-subdomain auth in local dev uses the handoff token mechanism.
//   production: set domain to ".rootDomain" so subdomains share the cookie.
const cookieDomain = !isLocalhost
  ? (process.env.BETTER_AUTH_COOKIE_DOMAIN ?? rootDomain ?? undefined)
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
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min client-side cache
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
