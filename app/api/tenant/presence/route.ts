import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";

export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

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
  const presenceRecords = await prisma.userPresence.findMany({
    where: {
      organizationId,
      user: {
        members: {
          some: {
            organizationId,
            status: "active",
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { lastSeenAt: "desc" },
  });
  const onlineUsers = presenceRecords.filter((presence) => presence.lastSeenAt >= since);

  console.log("[presence api] payload", {
    tenantId: organizationId,
    onlineCount: onlineUsers.length,
    threshold: since.toISOString(),
    users: presenceRecords.map((presence) => ({
      userId: presence.userId,
      lastSeenAt: presence.lastSeenAt.toISOString(),
      isOnline: presence.lastSeenAt >= since,
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
      isOnline: presence.lastSeenAt >= since,
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

    await prisma.userPresence.upsert({
      where: {
        userId_organizationId: {
          userId: context.userId,
          organizationId: context.tenantId,
        },
      },
      create: {
        userId: context.userId,
        organizationId: context.tenantId,
        lastSeenAt: now,
        currentPage,
      },
      update: {
        lastSeenAt: now,
        currentPage,
      },
    });

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
