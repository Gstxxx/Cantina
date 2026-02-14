import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { cuidSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  return handleApi(async () => {
    const { tenantId, id } = await params;
    requireTenantId(request);
    const idResult = cuidSchema.safeParse(id);
    if (!idResult.success) throw badRequest("Invalid customer id");
    const customer = await prisma.customer.findFirst({
      where: { id, tenantId },
    });
    if (!customer) throw notFound("Customer not found");
    const entries = await prisma.ledgerEntry.findMany({
      where: { customerId: id },
      orderBy: { occurredAt: "asc" },
    });
    let balanceCents = 0;
    for (const e of entries) {
      if (e.type === "CHARGE") balanceCents += e.amountCents;
      else if (e.type === "PAYMENT" || e.type === "ADJUST") balanceCents -= e.amountCents;
    }
    return json({ customerId: id, balanceCents });
  });
}
