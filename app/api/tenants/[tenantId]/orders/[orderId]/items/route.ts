import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { addOrderItemSchema, cuidSchema } from "@/lib/validations";
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
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw notFound("Order not found");
    if (order.status !== "OPEN") throw badRequest("Cannot add items to closed or canceled order");
    const body = await request.json();
    const data = addOrderItemSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const product = await prisma.product.findFirst({
      where: { id: data.data.productId, tenantId },
    });
    if (!product) throw notFound("Product not found");
    const priceCents = product.priceCents;
    const totalCents = priceCents * data.data.qty;
    const item = await prisma.orderItem.create({
      data: {
        orderId,
        productId: product.id,
        qty: data.data.qty,
        priceCents,
        totalCents,
        notes: data.data.notes ?? undefined,
      },
      include: { product: true },
    });
    await recalcOrderTotals(orderId);
    return json(item, 201);
  });
}
