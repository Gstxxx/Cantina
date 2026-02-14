import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { updateCustomerSchema, cuidSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  return handleApi(async () => {
    const { tenantId, id } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const idResult = cuidSchema.safeParse(id);
    if (!idResult.success) throw badRequest("Invalid customer id");
    
    const customer = await prisma.customer.findFirst({
      where: { id, tenantId },
    });
    
    if (!customer) throw notFound("Customer not found");
    return json(customer);
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
    if (!idResult.success) throw badRequest("Invalid customer id");
    const body = await request.json();
    const data = updateCustomerSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const existing = await prisma.customer.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw notFound("Customer not found");
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.data.name !== undefined && { name: data.data.name }),
        ...(data.data.phone !== undefined && { phone: data.data.phone }),
        ...(data.data.notes !== undefined && { notes: data.data.notes }),
        ...(data.data.isActive !== undefined && { isActive: data.data.isActive }),
      },
    });
    return json(customer);
  });
}
