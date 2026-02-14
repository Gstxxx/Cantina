import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { updateOrderSchema, cuidSchema } from "@/lib/validations";
import { recalcOrderTotals } from "@/lib/order-totals";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; orderId: string }> }
) {
  return handleApi(async () => {
    const { tenantId, orderId } = await params;
    requireTenantId(request);
    const idResult = cuidSchema.safeParse(orderId);
    if (!idResult.success) throw badRequest("Invalid order id");
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        items: { include: { product: true } },
        table: true,
        customer: true,
      },
    });
    if (!order) throw notFound("Order not found");
    return json(order);
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; orderId: string }> }
) {
  return handleApi(async () => {
    const { tenantId, orderId } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const idResult = cuidSchema.safeParse(orderId);
    if (!idResult.success) throw badRequest("Invalid order id");
    const existing = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!existing) throw notFound("Order not found");
    if (existing.status !== "OPEN") throw badRequest("Only open orders can be updated");
    const body = await request.json();
    const data = updateOrderSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(data.data.tableId !== undefined && { tableId: data.data.tableId }),
        ...(data.data.customerId !== undefined && { customerId: data.data.customerId }),
        ...(data.data.channel !== undefined && { channel: data.data.channel }),
        ...(data.data.notes !== undefined && { notes: data.data.notes }),
        ...(data.data.discountCents !== undefined && { discountCents: data.data.discountCents }),
      },
      include: { items: { include: { product: true } }, table: true, customer: true },
    });
    await recalcOrderTotals(orderId);
    const updated = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, table: true, customer: true },
    });
    return json(updated ?? order);
  });
}
