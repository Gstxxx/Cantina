import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest } from "@/lib/errors";
import {
  createProductSchema,
  listProductsQuerySchema,
  type ListProductsQuery,
} from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  return handleApi(async () => {
    const { tenantId } = await params;
    requireTenantId(request);
    const query = listProductsQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    const filters: Partial<ListProductsQuery> = query.success ? query.data : {};
    const where: { tenantId: string; categoryId?: string; isActive?: boolean } = {
      tenantId,
    };
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    const list = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
    });
    return json(list);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  return handleApi(async () => {
    const { tenantId } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const body = await request.json();
    const data = createProductSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const product = await prisma.product.create({
      data: {
        tenantId,
        name: data.data.name,
        priceCents: data.data.priceCents,
        categoryId: data.data.categoryId ?? undefined,
        costCents: data.data.costCents ?? undefined,
        sku: data.data.sku ?? undefined,
      },
      include: { category: true },
    });
    return json(product, 201);
  });
}
