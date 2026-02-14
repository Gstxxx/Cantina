import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest } from "@/lib/errors";
import { createCategorySchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  return handleApi(async () => {
    const { tenantId } = await params;
    requireTenantId(request);
    const list = await prisma.productCategory.findMany({
      where: { tenantId, isActive: true },
      orderBy: { sort: "asc" },
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
    const data = createCategorySchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const category = await prisma.productCategory.create({
      data: {
        tenantId,
        name: data.data.name,
        sort: data.data.sort,
      },
    });
    return json(category, 201);
  });
}
