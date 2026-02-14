import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { closeCashDaySchema } from "@/lib/validations";

function parseDay(dateStr: string): Date {
  const d = new Date(dateStr + "T00:00:00.000Z");
  if (isNaN(d.getTime())) throw badRequest("Invalid date");
  return d;
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
    const data = closeCashDaySchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const day = parseDay(data.data.date);
    const cashDay = await prisma.cashDay.findUnique({
      where: {
        unitId_day: { unitId, day },
      },
    });
    if (!cashDay) throw notFound("Cash day not found");
    if (cashDay.closedAt) throw badRequest("Cash day already closed");
    const updated = await prisma.cashDay.update({
      where: { id: cashDay.id },
      data: { closedAt: new Date() },
    });
    return json(updated);
  });
}
