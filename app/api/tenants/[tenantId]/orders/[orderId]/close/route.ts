import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { closeOrderSchema, cuidSchema } from "@/lib/validations";
import { recalcOrderTotals } from "@/lib/order-totals";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; orderId: string }> }
) {
  return handleApi(async () => {
    const { tenantId, orderId } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const idResult = cuidSchema.safeParse(orderId);
    if (!idResult.success) throw badRequest("Invalid order id");
    const body = await request.json();
    const data = closeOrderSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true },
    });
    if (!order) throw notFound("Order not found");
    if (order.status !== "OPEN") throw badRequest("Order is not open");
    await recalcOrderTotals(orderId);
    const refreshed = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!refreshed) throw notFound("Order not found");
    const totalCents = refreshed.totalCents;
    const closedAt = new Date();
    if (data.data.isOnCredit) {
      if (!refreshed.customerId) throw badRequest("Customer required for credit (fiado)");
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "CLOSED",
            closedAt,
            isOnCredit: true,
            paidType: null,
            paidCents: null,
          },
        });
        await tx.ledgerEntry.create({
          data: {
            tenantId,
            customerId: refreshed.customerId!,
            unitId: refreshed.unitId,
            orderId,
            type: "CHARGE",
            amountCents: totalCents,
            description: `Comanda #${orderId.slice(-6)}`,
            occurredAt: closedAt,
          },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CLOSED",
          closedAt,
          isOnCredit: false,
          paidType: data.data.paidType ?? undefined,
          paidCents: data.data.paidCents ?? totalCents,
        },
      });
    }
    const result = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, table: true, customer: true },
    });
    return json(result!, 200);
  });
}
