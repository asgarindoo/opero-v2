import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";

export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MS = 100 * 1000;

interface PresenceWithUser {
  id: string;
  userId: string;
  organizationId: string;
  lastSeenAt: Date;
  isOnline: boolean;
  currentPage: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface PresenceRow {
  id: string;
  userId: string;
  organizationId: string;
  lastSeenAt: Date;
  isOnline: boolean;
  currentPage: string | null;
  createdAt: Date;
  userName: string;
  userEmail: string;
  userImage: string | null;
}

function onlineSince() {
  return new Date(Date.now() - ONLINE_WINDOW_MS);
}

function sanitizeCurrentPage(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return null;
  return trimmed.slice(0, 255);
}

async function getPresencePayload(organizationId: string) {
  const since = onlineSince();
  const rows = await prisma.$queryRaw<PresenceRow[]>`
    SELECT
      up.id,
      up."userId",
      up."organizationId",
      up."lastSeenAt",
      up."isOnline",
      up."currentPage",
      up."createdAt",
      u.name AS "userName",
      u.email AS "userEmail",
      u.image AS "userImage"
    FROM user_presence up
    INNER JOIN "user" u ON u.id = up."userId"
    WHERE up."organizationId" = ${organizationId}
      AND EXISTS (
        SELECT 1
        FROM member m
        WHERE m."organizationId" = ${organizationId}
          AND m."userId" = up."userId"
          AND m.status = 'active'
      )
    ORDER BY up."lastSeenAt" DESC
  `;
  const presenceRecords: PresenceWithUser[] = rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    organizationId: row.organizationId,
    lastSeenAt: row.lastSeenAt,
    isOnline: row.isOnline,
    currentPage: row.currentPage,
    createdAt: row.createdAt,
    user: {
      id: row.userId,
      name: row.userName,
      email: row.userEmail,
      image: row.userImage,
    },
  }));
  const onlineUsers = presenceRecords.filter((presence) => presence.isOnline && presence.lastSeenAt >= since);

  console.log("[presence api] payload", {
    tenantId: organizationId,
    onlineCount: onlineUsers.length,
    threshold: since.toISOString(),
    users: presenceRecords.map((presence) => ({
      userId: presence.userId,
      lastSeenAt: presence.lastSeenAt.toISOString(),
      isOnline: presence.lastSeenAt >= since,
      explicitOnline: presence.isOnline,
    })),
  });

  return {
    onlineCount: onlineUsers.length,
    onlineUsers: onlineUsers.map((presence) => ({
      userId: presence.userId,
      id: presence.user.id,
      name: presence.user.name,
      email: presence.user.email,
      image: presence.user.image,
      currentPage: presence.currentPage,
      lastSeenAt: presence.lastSeenAt.toISOString(),
    })),
    presence: presenceRecords.map((presence) => ({
      userId: presence.userId,
      currentPage: presence.currentPage,
      lastSeenAt: presence.lastSeenAt.toISOString(),
      isOnline: presence.isOnline && presence.lastSeenAt >= since,
    })),
  };
}

export async function POST(req: NextRequest) {
  try {
    const context = await requireTenant();
    const body = await req.json().catch(() => ({}));
    const currentPage = sanitizeCurrentPage(body.currentPage);
    const now = new Date();

    console.log("[presence api] heartbeat", {
      tenantId: context.tenantId,
      userId: context.userId,
      currentPage,
      now: now.toISOString(),
    });

    await prisma.$executeRaw`
      INSERT INTO user_presence (
        id,
        "userId",
        "organizationId",
        "lastSeenAt",
        "isOnline",
        "currentPage",
        "createdAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${context.userId},
        ${context.tenantId},
        ${now},
        true,
        ${currentPage},
        now()
      )
      ON CONFLICT ("userId", "organizationId")
      DO UPDATE SET
        "lastSeenAt" = EXCLUDED."lastSeenAt",
        "isOnline" = true,
        "currentPage" = EXCLUDED."currentPage"
    `;

    return NextResponse.json(await getPresencePayload(context.tenantId));
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[POST /api/tenant/presence]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const context = await requireTenant();
    console.log("[presence api] get", {
      tenantId: context.tenantId,
      userId: context.userId,
    });
    return NextResponse.json(await getPresencePayload(context.tenantId));
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[GET /api/tenant/presence]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const context = await requireTenant();
    const offlineAt = new Date();

    console.log("[presence api] delete/offline", {
      tenantId: context.tenantId,
      userId: context.userId,
      offlineAt: offlineAt.toISOString(),
    });

    await prisma.$executeRaw`
      INSERT INTO user_presence (
        id,
        "userId",
        "organizationId",
        "lastSeenAt",
        "isOnline",
        "currentPage",
        "createdAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${context.userId},
        ${context.tenantId},
        ${offlineAt},
        false,
        null,
        now()
      )
      ON CONFLICT ("userId", "organizationId")
      DO UPDATE SET
        "lastSeenAt" = EXCLUDED."lastSeenAt",
        "isOnline" = false,
        "currentPage" = null
    `;

    const payload = await getPresencePayload(context.tenantId);
    console.log("[presence api] offline decision", {
      tenantId: context.tenantId,
      userId: context.userId,
      onlineCount: payload.onlineCount,
    });

    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[DELETE /api/tenant/presence]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
