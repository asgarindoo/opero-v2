import { parsePayload } from "@/lib/api/domain-utils";
import type { Prisma } from "@prisma/client";

export type FeatureInput = Record<string, unknown>;

const COMMON_NON_METADATA_KEYS = new Set([
  "id",
  "recordId",
  "recordCreatedAt",
  "recordUpdatedAt",
  "createdAt",
  "updatedAt",
  "created",
  "updated",
  "createdBy",
  "updatedBy",
  "owner",
  "organizationId",
  "createdById",
  "updatedById",
]);

export function textValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function nullableText(value: unknown): string | null | undefined {
  if (value === null) return null;
  return textValue(value);
}

export function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const normalized = Number(value.replace(/,/g, ""));
    return Number.isFinite(normalized) ? normalized : undefined;
  }
  return undefined;
}

export function intValue(value: unknown): number | undefined {
  const parsed = numberValue(value);
  return parsed === undefined ? undefined : Math.trunc(parsed);
}

export function dateValue(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}

function inputJsonValue(value: unknown): Prisma.InputJsonValue | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => inputJsonValue(item) ?? null) as Prisma.InputJsonArray;
  if (typeof value === "object") {
    const jsonObject: Record<string, Prisma.InputJsonValue | null> = {};
    for (const [key, item] of Object.entries(value)) {
      const jsonValue = inputJsonValue(item);
      if (jsonValue !== undefined) jsonObject[key] = jsonValue;
    }
    return jsonObject as Prisma.InputJsonObject;
  }
  return undefined;
}

export function jsonArray(value: unknown): Prisma.InputJsonArray {
  return Array.isArray(value) ? (inputJsonValue(value) as Prisma.InputJsonArray) : [];
}

export function jsonArrayOrUndefined(value: unknown): Prisma.InputJsonArray | undefined {
  return Array.isArray(value) ? jsonArray(value) : undefined;
}

export function jsonObjectOrUndefined(value: unknown): Prisma.InputJsonObject | undefined {
  const jsonValue = inputJsonValue(value);
  return jsonValue && typeof jsonValue === "object" && !Array.isArray(jsonValue) ? (jsonValue as Prisma.InputJsonObject) : undefined;
}

export function jsonInputOrDefault(value: unknown, fallback: Prisma.InputJsonValue): Prisma.InputJsonValue {
  return inputJsonValue(value) ?? fallback;
}

export function firstStringFromArray(value: unknown, key = "id"): string | undefined {
  if (!Array.isArray(value)) return undefined;
  const first = value.find((item) => item && typeof item === "object");
  if (!first || typeof first !== "object") return undefined;
  return textValue((first as Record<string, unknown>)[key]);
}

export function payloadMetadata(data: FeatureInput, explicitKeys: Iterable<string>) {
  const explicit = new Set(explicitKeys);
  const metadata: Record<string, Prisma.InputJsonValue | null> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (COMMON_NON_METADATA_KEYS.has(key) || explicit.has(key)) continue;
    const jsonValue = inputJsonValue(value);
    if (jsonValue !== undefined) metadata[key] = jsonValue;
  }

  return Object.keys(metadata).length > 0 ? (metadata as Prisma.InputJsonObject) : undefined;
}

export function mergePayloadMetadata(currentPayload: unknown, patch: FeatureInput, explicitKeys: Iterable<string>) {
  const currentJson = inputJsonValue(parsePayload(currentPayload));
  const currentObject = currentJson && typeof currentJson === "object" && !Array.isArray(currentJson) ? currentJson : {};

  return {
    ...currentObject,
    ...(payloadMetadata(patch, explicitKeys) ?? {}),
  } as Prisma.InputJsonObject;
}

export function jsonValueOrDefault(value: unknown, fallback: Prisma.InputJsonValue) {
  return jsonInputOrDefault(value, fallback);
}
