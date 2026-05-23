import { prisma } from "@/lib/prisma";
import { requireTenant, type TenantContext } from "@/lib/server/auth-utils";
import type { ChatBootstrap, ChatChannel, ChatMessage } from "../types";

type ChannelRow = {
  id: string;
  organizationId: string;
  name: string | null;
  description: string | null;
  type: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ChannelWithUnreadRow = ChannelRow & {
  unreadCount: number;
};

type MessageRow = {
  id: string;
  organizationId: string;
  channelId: string | null;
  senderId: string | null;
  content: string | null;
  type: string | null;
  createdAt: Date;
  updatedAt: Date;
  senderName: string | null;
  senderEmail: string | null;
  senderImage: string | null;
};

type ChatReadRow = {
  channelId: string;
  lastReadMessageId: string | null;
  lastReadAt: Date;
};

function mapChannel(row: ChannelRow): ChatChannel {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name ?? "general",
    description: row.description,
    type: "public",
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    organizationId: row.organizationId,
    channelId: row.channelId ?? "",
    senderId: row.senderId,
    content: row.content ?? "",
    type: row.type === "system" ? "system" : "text",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    sender: row.senderId
      ? {
        id: row.senderId,
        name: row.senderName ?? "Unknown user",
        email: row.senderEmail ?? undefined,
        image: row.senderImage,
      }
      : null,
  };
}

function slugChannelName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "channel";
}

async function getTenantChannel(ctx: TenantContext, channelId: string) {
  const rows = await prisma.$queryRaw<ChannelRow[]>`
    SELECT id, "organizationId", name, description, type, "createdById", "createdAt", "updatedAt"
    FROM chat_channel
    WHERE id = ${channelId}
      AND "organizationId" = ${ctx.tenantId}
    LIMIT 1
  `;

  if (!rows[0]) {
    // Debug: check if channel exists at all (without org filter)
    const anyRows = await prisma.$queryRaw<{ id: string; organizationId: string }[]>`
      SELECT id, "organizationId" FROM chat_channel WHERE id = ${channelId} LIMIT 1
    `;
    if (anyRows[0]) {
      console.error(
        `[chat] getTenantChannel: channel ${channelId} exists but org mismatch — ` +
        `channel.organizationId="${anyRows[0].organizationId}" vs ctx.tenantId="${ctx.tenantId}"`
      );
    } else {
      console.error(
        `[chat] getTenantChannel: channel ${channelId} does NOT exist in DB. ctx.tenantId="${ctx.tenantId}"`
      );
    }
  }

  return rows[0] ? mapChannel(rows[0]) : null;
}

export async function listTenantChannels(): Promise<ChatBootstrap> {
  const ctx = await requireTenant();

  const rows = await prisma.$queryRaw<ChannelWithUnreadRow[]>`
    SELECT
      cc.id, cc."organizationId", cc.name, cc.description, cc.type, cc."createdById", cc."createdAt", cc."updatedAt",
      COALESCE(unread.count, 0)::int AS "unreadCount"
    FROM chat_channel
      cc
    LEFT JOIN "chat_reads" cr
      ON cr."organizationId" = cc."organizationId"
      AND cr."channelId" = cc.id
      AND cr."userId" = ${ctx.userId}
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS count
      FROM chat_message cm
      WHERE cm."organizationId" = cc."organizationId"
        AND cm."channelId" = cc.id
        AND (cm."senderId" IS NULL OR cm."senderId" <> ${ctx.userId})
        AND cm."createdAt" > COALESCE(cr."lastReadAt", 'epoch'::timestamp)
    ) unread ON true
    WHERE cc."organizationId" = ${ctx.tenantId}
      AND cc.name IS NOT NULL
    ORDER BY cc."createdAt" ASC
  `;

  return {
    channels: rows.map(mapChannel),
    unreadCounts: Object.fromEntries(rows.map((row) => [row.id, row.unreadCount])),
    organizationId: ctx.tenantId,
    currentUserId: ctx.userId,
  };
}

export async function createTenantChannel(input: { name: string; description?: string }) {
  const ctx = await requireTenant();
  const name = slugChannelName(input.name);
  const description = input.description?.trim() || null;

  const rows = await prisma.$queryRaw<ChannelRow[]>`
    INSERT INTO chat_channel (
      id, "organizationId", name, title, description, type, status, payload,
      "createdById", "updatedById", "createdAt", "updatedAt"
    )
    VALUES (
      gen_random_uuid()::text, ${ctx.tenantId}, ${name}, ${name}, ${description},
      'public', 'Active', '{}'::jsonb, ${ctx.userId}, ${ctx.userId}, now(), now()
    )
    RETURNING id, "organizationId", name, description, type, "createdById", "createdAt", "updatedAt"
  `;

  return mapChannel(rows[0]);
}

export async function listTenantMessages(channelId: string) {
  const ctx = await requireTenant();
  console.log(`[chat] listTenantMessages tenantId="${ctx.tenantId}" channelId="${channelId}"`);
  const channel = await getTenantChannel(ctx, channelId);
  if (!channel) return null;

  const rows = await prisma.$queryRaw<MessageRow[]>`
    SELECT
      cm.id, cm."organizationId", cm."channelId", cm."senderId", cm.content, cm.type,
      cm."createdAt", cm."updatedAt",
      u.name AS "senderName", u.email AS "senderEmail", u.image AS "senderImage"
    FROM chat_message cm
    LEFT JOIN "user" u ON u.id = cm."senderId"
    WHERE cm."organizationId" = ${ctx.tenantId}
      AND cm."channelId" = ${channelId}
    ORDER BY cm."createdAt" ASC
    LIMIT 200
  `;

  return rows.map(mapMessage);
}

export async function createTenantMessage(channelId: string, content: string) {
  const ctx = await requireTenant();
  const channel = await getTenantChannel(ctx, channelId);
  if (!channel) return null;

  const rows = await prisma.$queryRaw<MessageRow[]>`
    INSERT INTO chat_message (
      id, "organizationId", "channelId", "senderId", content, type,
      title, status, payload, "createdById", "updatedById", "createdAt", "updatedAt"
    )
    VALUES (
      gen_random_uuid()::text, ${ctx.tenantId}, ${channelId}, ${ctx.userId}, ${content}, 'text',
      left(${content}, 80), 'Active',
      jsonb_build_object(
        'senderName', ${ctx.user.name}::text,
        'senderEmail', ${ctx.user.email}::text,
        'senderImage', ${ctx.user.image}::text
      ),
      ${ctx.userId}, ${ctx.userId}, now(), now()
    )
    RETURNING
      id, "organizationId", "channelId", "senderId", content, type, "createdAt", "updatedAt",
      (SELECT name FROM "user" WHERE id = ${ctx.userId}) AS "senderName",
      (SELECT email FROM "user" WHERE id = ${ctx.userId}) AS "senderEmail",
      (SELECT image FROM "user" WHERE id = ${ctx.userId}) AS "senderImage"
  `;

  return mapMessage(rows[0]);
}

export async function markTenantChannelRead(channelId: string) {
  const ctx = await requireTenant();
  const channel = await getTenantChannel(ctx, channelId);
  if (!channel) return null;

  const rows = await prisma.$queryRaw<ChatReadRow[]>`
    WITH latest AS (
      SELECT id, "createdAt"
      FROM chat_message
      WHERE "organizationId" = ${ctx.tenantId}
        AND "channelId" = ${channelId}
      ORDER BY "createdAt" DESC, id DESC
      LIMIT 1
    )
    INSERT INTO "chat_reads" (
      id, "organizationId", "userId", "channelId", "lastReadMessageId", "lastReadAt", "createdAt", "updatedAt"
    )
    VALUES (
      gen_random_uuid()::text,
      ${ctx.tenantId},
      ${ctx.userId},
      ${channelId},
      (SELECT id FROM latest),
      COALESCE((SELECT "createdAt" FROM latest), now()),
      now(),
      now()
    )
    ON CONFLICT ("organizationId", "userId", "channelId")
    DO UPDATE SET
      "lastReadMessageId" = EXCLUDED."lastReadMessageId",
      "lastReadAt" = EXCLUDED."lastReadAt",
      "updatedAt" = now()
    RETURNING "channelId", "lastReadMessageId", "lastReadAt"
  `;

  return rows[0] ?? null;
}

export async function updateTenantMessage(messageId: string, content: string) {
  const ctx = await requireTenant();
  const allowed = ctx.role === "owner" || ctx.role === "admin";

  const rows = await prisma.$queryRaw<MessageRow[]>`
    UPDATE chat_message cm
    SET content = ${content}, title = left(${content}, 80), "updatedAt" = now(), "updatedById" = ${ctx.userId}
    WHERE cm.id = ${messageId}
      AND cm."organizationId" = ${ctx.tenantId}
      AND (${allowed} OR cm."senderId" = ${ctx.userId})
    RETURNING
      cm.id, cm."organizationId", cm."channelId", cm."senderId", cm.content, cm.type, cm."createdAt", cm."updatedAt",
      (SELECT name FROM "user" WHERE id = cm."senderId") AS "senderName",
      (SELECT email FROM "user" WHERE id = cm."senderId") AS "senderEmail",
      (SELECT image FROM "user" WHERE id = cm."senderId") AS "senderImage"
  `;

  return rows[0] ? mapMessage(rows[0]) : null;
}

export async function deleteTenantMessage(messageId: string) {
  const ctx = await requireTenant();
  const allowed = ctx.role === "owner" || ctx.role === "admin";

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    DELETE FROM chat_message
    WHERE id = ${messageId}
      AND "organizationId" = ${ctx.tenantId}
      AND (${allowed} OR "senderId" = ${ctx.userId})
    RETURNING id
  `;

  return rows[0] ?? null;
}

export async function deleteTenantChannel(channelId: string) {
  const ctx = await requireTenant();
  const allowed = ctx.role === "owner" || ctx.role === "admin";

  if (!allowed) return null;

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    DELETE FROM chat_channel
    WHERE id = ${channelId}
      AND "organizationId" = ${ctx.tenantId}
    RETURNING id
  `;

  return rows[0] ?? null;
}
