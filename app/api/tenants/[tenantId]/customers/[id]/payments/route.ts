import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { createPaymentSchema, cuidSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  return handleApi(async () => {
    const { tenantId, id: customerId } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const idResult = cuidSchema.safeParse(customerId);
    if (!idResult.success) throw badRequest("Invalid customer id");
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) throw notFound("Customer not found");
    const body = await request.json();
    const data = createPaymentSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    if (data.data.unitId) {
      const unit = await prisma.unit.findFirst({
        where: { id: data.data.unitId, tenantId },
      });
      if (!unit) throw badRequest("Unit not found");
    }
    const entry = await prisma.ledgerEntry.create({
      data: {
        tenantId,
        customerId,
        unitId: data.data.unitId ?? undefined,
        type: "PAYMENT",
        amountCents: data.data.amountCents,
        description: data.data.description ?? undefined,
      },
    });
    return json(entry, 201);
  });
}
