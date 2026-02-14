import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  return handleApi(async () => {
    const { tenantId } = await params;
    requireTenantId(request);
    const list = await prisma.unit.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: "asc" },
    });
    return json(list);
  });
}
