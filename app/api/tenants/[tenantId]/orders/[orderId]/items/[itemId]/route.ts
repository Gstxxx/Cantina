import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { updateOrderItemSchema, cuidSchema } from "@/lib/validations";
import { recalcOrderTotals } from "@/lib/order-totals";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; orderId: string; itemId: string }> }
) {
  return handleApi(async () => {
    const { tenantId, orderId, itemId } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw notFound("Order not found");
    if (order.status !== "OPEN") throw badRequest("Cannot update items on closed or canceled order");
    const existingItem = await prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
      include: { product: true },
    });
    if (!existingItem) throw notFound("Order item not found");
    const body = await request.json();
    const data = updateOrderItemSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const qty = data.data.qty ?? existingItem.qty;
    const priceCents = existingItem.priceCents;
    const totalCents = priceCents * qty;
    const item = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        qty,
        totalCents,
        ...(data.data.notes !== undefined && { notes: data.data.notes }),
      },
      include: { product: true },
    });
    await recalcOrderTotals(orderId);
    return json(item);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; orderId: string; itemId: string }> }
) {
  return handleApi(async () => {
    const { tenantId, orderId, itemId } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw notFound("Order not found");
    if (order.status !== "OPEN") throw badRequest("Cannot remove items from closed or canceled order");
    const existingItem = await prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });
    if (!existingItem) throw notFound("Order item not found");
    await prisma.orderItem.delete({
      where: { id: itemId },
    });
    await recalcOrderTotals(orderId);
    return json(null, 204);
  });
}
