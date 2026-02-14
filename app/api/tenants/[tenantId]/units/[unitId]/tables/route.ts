import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { createTableSchema, cuidSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; unitId: string }> }
) {
  return handleApi(async () => {
    const { tenantId, unitId } = await params;
    requireTenantId(request);
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, tenantId },
    });
    if (!unit) throw notFound("Unit not found");
    const list = await prisma.table.findMany({
      where: { unitId, tenantId },
      orderBy: { name: "asc" },
    });
    return json(list);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; unitId: string }> }
) {
  return handleApi(async () => {
    const { tenantId, unitId } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, tenantId },
    });
    if (!unit) throw notFound("Unit not found");
    const body = await request.json();
    const data = createTableSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const table = await prisma.table.create({
      data: {
        tenantId,
        unitId,
        name: data.data.name,
      },
    });
    return json(table, 201);
  });
}
