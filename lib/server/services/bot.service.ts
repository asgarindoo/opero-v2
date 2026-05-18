import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";
import { createPayload, getStatus, getTitle, logDomainActivity, mapDomainRecord, parsePayload } from "./domain-utils";

const MODULE = "SYSTEM";
const ENTITY = "Bot";

export async function listBots() {
  const ctx = await requireTenant();
  const bots = await prisma.bot.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return bots.map((bot) => mapDomainRecord(bot));
}

export async function getBotById(id: string) {
  const ctx = await requireTenant();
  const bot = await prisma.bot.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  return bot ? mapDomainRecord(bot) : null;
}

export async function createBot(data: Record<string, unknown>) {
  const ctx = await requireTenant();
  const title = getTitle(data);
  const bot = await prisma.bot.create({ data: { id: typeof data.id === "string" && data.id ? data.id : crypto.randomUUID(), organizationId: ctx.tenantId, title, status: getStatus(data, "Pending Setup"), payload: createPayload(data), createdById: ctx.userId, updatedById: ctx.userId } });
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Created", entityType: ENTITY, entityId: bot.id, entityName: title, description: typeof data.description === "string" ? data.description : null });
  return mapDomainRecord(bot, ctx.user);
}

export async function updateBot(id: string, patch: Record<string, unknown>) {
  const ctx = await requireTenant();
  const current = await prisma.bot.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.bot.updateMany({ where: { id, organizationId: ctx.tenantId }, data: { title: getTitle(patch, current.title ?? "Untitled"), status: typeof patch.status === "string" ? patch.status : current.status, payload: { ...parsePayload(current.payload), ...patch }, updatedById: ctx.userId } });
  if (result.count === 0) return null;
  const updated = await prisma.bot.findFirst({ where: { id, organizationId: ctx.tenantId }, include: { createdBy: { select: { id: true, name: true, image: true } } } });
  if (!updated) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Updated", entityType: ENTITY, entityId: id, entityName: updated.title, description: typeof patch.description === "string" ? patch.description : null });
  return mapDomainRecord(updated);
}

export async function deleteBot(id: string) {
  const ctx = await requireTenant();
  const current = await prisma.bot.findFirst({ where: { id, organizationId: ctx.tenantId } });
  if (!current) return null;
  const result = await prisma.bot.deleteMany({ where: { id, organizationId: ctx.tenantId } });
  if (result.count === 0) return null;
  await logDomainActivity({ tenantId: ctx.tenantId, userId: ctx.userId, module: MODULE, action: "Deleted", entityType: ENTITY, entityId: id, entityName: current.title });
  return { id };
}
