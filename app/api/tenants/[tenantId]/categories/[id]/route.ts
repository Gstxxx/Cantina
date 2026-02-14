import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { updateCategorySchema, cuidSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  return handleApi(async () => {
    const { tenantId, id } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const idResult = cuidSchema.safeParse(id);
    if (!idResult.success) throw badRequest("Invalid category id");
    const body = await request.json();
    const data = updateCategorySchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const existing = await prisma.productCategory.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw notFound("Category not found");
    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        ...(data.data.name !== undefined && { name: data.data.name }),
        ...(data.data.sort !== undefined && { sort: data.data.sort }),
        ...(data.data.isActive !== undefined && { isActive: data.data.isActive }),
      },
    });
    return json(category);
  });
}
