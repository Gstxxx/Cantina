import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { updateTableSchema, cuidSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; unitId: string; id: string }> }
) {
  return handleApi(async () => {
    const { tenantId, unitId, id } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const idResult = cuidSchema.safeParse(id);
    if (!idResult.success) throw badRequest("Invalid table id");
    const body = await request.json();
    const data = updateTableSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const existing = await prisma.table.findFirst({
      where: { id, unitId, tenantId },
    });
    if (!existing) throw notFound("Table not found");
    const table = await prisma.table.update({
      where: { id },
      data: {
        ...(data.data.name !== undefined && { name: data.data.name }),
        ...(data.data.isActive !== undefined && { isActive: data.data.isActive }),
      },
    });
    return json(table);
  });
}
