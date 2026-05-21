import { prisma } from "@/lib/prisma";
import { requireTenant, type TenantContext } from "@/lib/server/auth-utils";
import type { ChatChannel, ChatMessage } from "../types";

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
  return rows[0] ? mapChannel(rows[0]) : null;
}

export async function listTenantChannels() {
  const ctx = await requireTenant();

  const rows = await prisma.$queryRaw<ChannelRow[]>`
    SELECT id, "organizationId", name, description, type, "createdById", "createdAt", "updatedAt"
    FROM chat_channel
    WHERE "organizationId" = ${ctx.tenantId}
      AND name IS NOT NULL
      AND name <> 'general'
    ORDER BY "createdAt" ASC
  `;

  return rows.map(mapChannel);
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
      left(${content}, 80), 'Active', '{}'::jsonb, ${ctx.userId}, ${ctx.userId}, now(), now()
    )
    RETURNING
      id, "organizationId", "channelId", "senderId", content, type, "createdAt", "updatedAt",
      (SELECT name FROM "user" WHERE id = ${ctx.userId}) AS "senderName",
      (SELECT email FROM "user" WHERE id = ${ctx.userId}) AS "senderEmail",
      (SELECT image FROM "user" WHERE id = ${ctx.userId}) AS "senderImage"
  `;

  return mapMessage(rows[0]);
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
