import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest } from "@/lib/errors";
import {
  createCustomerSchema,
  listCustomersQuerySchema,
  type ListCustomersQuery,
} from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  return handleApi(async () => {
    const { tenantId } = await params;
    requireTenantId(request);
    const query = listCustomersQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    const filters: Partial<ListCustomersQuery> = query.success ? query.data : {};
    const where: {
      tenantId: string;
      isActive?: boolean;
      OR?: Array<{ name?: { contains: string; mode: "insensitive" }; phone?: { contains: string; mode: "insensitive" } }>;
    } = { tenantId };
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search?.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
      ];
    }
    const list = await prisma.customer.findMany({
      where,
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
    const data = createCustomerSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const customer = await prisma.customer.create({
      data: {
        tenantId,
        name: data.data.name,
        phone: data.data.phone ?? undefined,
        notes: data.data.notes ?? undefined,
      },
    });
    return json(customer, 201);
  });
}
