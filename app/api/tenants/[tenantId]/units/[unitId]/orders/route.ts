import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { createOrderSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; unitId: string }> }
) {
  return handleApi(async () => {
    const { tenantId, unitId } = await params;
    requireTenantId(request);
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, tenantId },
    });
    if (!unit) throw notFound("Unit not found");
    const dateStr = request.nextUrl.searchParams.get("date");
    const status = request.nextUrl.searchParams.get("status") as "OPEN" | "CLOSED" | "CANCELED" | null;
    const where: { tenantId: string; unitId: string; status?: "OPEN" | "CLOSED" | "CANCELED" } = {
      tenantId,
      unitId,
    };
    if (status && ["OPEN", "CLOSED", "CANCELED"].includes(status)) where.status = status;
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const start = new Date(dateStr);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      (where as { openedAt?: { gte: Date; lt: Date } }).openedAt = { gte: start, lt: end };
    }
    const list = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true } }, table: true, customer: true },
      orderBy: { openedAt: "desc" },
    });
    return json(list);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; unitId: string }> }
) {
  return handleApi(async () => {
    const { tenantId, unitId } = await params;
    const tid = requireTenantId(request);
    if (tid !== tenantId) throw badRequest("Tenant mismatch");
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, tenantId },
    });
    if (!unit) throw notFound("Unit not found");
    const body = await request.json();
    const data = createOrderSchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }

    // Handle tableName - find or create table
    let tableId = data.data.tableId ?? undefined;
    if (data.data.tableName && !tableId) {
      // Try to find existing table
      let table = await prisma.table.findFirst({
        where: {
          tenantId,
          unitId,
          name: data.data.tableName,
        },
      });

      // If not found, create it
      if (!table) {
        table = await prisma.table.create({
          data: {
            tenantId,
            unitId,
            name: data.data.tableName,
          },
        });
      }

      tableId = table.id;
    }

    const order = await prisma.order.create({
      data: {
        tenantId,
        unitId,
        tableId,
        customerId: data.data.customerId ?? undefined,
        channel: data.data.channel,
        notes: data.data.notes ?? undefined,
      },
      include: { items: true, table: true, customer: true },
    });
    return json(order, 201);
  });
}
