import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { updateProductSchema, cuidSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  return handleApi(async () => {
    const { tenantId, id } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const idResult = cuidSchema.safeParse(id);
    if (!idResult.success) throw badRequest("Invalid product id");
    
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
      include: { category: true },
    });
    
    if (!product) throw notFound("Product not found");
    return json(product);
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  return handleApi(async () => {
    const { tenantId, id } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const idResult = cuidSchema.safeParse(id);
    if (!idResult.success) throw badRequest("Invalid product id");
    const body = await request.json();
    const data = updateProductSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const existing = await prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw notFound("Product not found");
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.data.name !== undefined && { name: data.data.name }),
        ...(data.data.priceCents !== undefined && { priceCents: data.data.priceCents }),
        ...(data.data.categoryId !== undefined && { categoryId: data.data.categoryId }),
        ...(data.data.costCents !== undefined && { costCents: data.data.costCents }),
        ...(data.data.sku !== undefined && { sku: data.data.sku }),
        ...(data.data.isActive !== undefined && { isActive: data.data.isActive }),
      },
      include: { category: true },
    });
    return json(product);
  });
}
