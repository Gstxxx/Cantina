import { prisma } from "@/lib/db";

export async function recalcOrderTotals(orderId: string): Promise<void> {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
  });
  const subtotalCents = items.reduce((sum, i) => sum + i.totalCents, 0);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { discountCents: true },
  });
  if (!order) return;
  const totalCents = Math.max(0, subtotalCents - order.discountCents);
  await prisma.order.update({
    where: { id: orderId },
    data: { subtotalCents, totalCents },
  });
}
