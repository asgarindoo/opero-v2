import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireTenant, type TenantContext } from "@/lib/server/auth-utils";

type TenantModel = "member" | "tenantInviteLink";

const tenantFieldByModel: Record<TenantModel, "organizationId"> = {
  member: "organizationId",
  tenantInviteLink: "organizationId",
};

export function scopedWhere<TWhere extends Record<string, unknown>>(
  context: TenantContext,
  model: TenantModel,
  where?: TWhere
) {
  return {
    ...(where ?? {}),
    [tenantFieldByModel[model]]: context.tenantId,
  };
}

export async function getTenantPrisma() {
  const context = await requireTenant();

  return {
    context,
    member: {
      findMany(args?: Omit<Prisma.MemberFindManyArgs, "where"> & { where?: Prisma.MemberWhereInput }) {
        return prisma.member.findMany({
          ...args,
          where: scopedWhere(context, "member", args?.where),
        });
      },
      count(args?: Omit<Prisma.MemberCountArgs, "where"> & { where?: Prisma.MemberWhereInput }) {
        return prisma.member.count({
          ...args,
          where: scopedWhere(context, "member", args?.where),
        });
      },
    },
    inviteLink: {
      findMany(args?: Omit<Prisma.TenantInviteLinkFindManyArgs, "where"> & { where?: Prisma.TenantInviteLinkWhereInput }) {
        return prisma.tenantInviteLink.findMany({
          ...args,
          where: scopedWhere(context, "tenantInviteLink", args?.where),
        });
      },
    },
  };
}
