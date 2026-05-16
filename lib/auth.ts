/**
 * OPERO — Better Auth Server Instance
 *
 * This file is SERVER-ONLY. Never import this in client components.
 * Use `lib/auth-client.ts` for client-side auth operations.
 */

import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma"; // Force TS re-evaluation

export const auth = betterAuth({
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
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
