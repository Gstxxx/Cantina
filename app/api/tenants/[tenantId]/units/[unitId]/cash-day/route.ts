import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { cashDayQuerySchema, upsertCashDaySchema } from "@/lib/validations";

function parseDay(dateStr: string): Date {
  const d = new Date(dateStr + "T00:00:00.000Z");
  if (isNaN(d.getTime())) throw badRequest("Invalid date");
  return d;
}

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
    const query = cashDayQuerySchema.safeParse({
      date: request.nextUrl.searchParams.get("date"),
    });
    if (!query.success) {
      const msg = query.error.issues.map((e) => e.message).join("; ") || "date (YYYY-MM-DD) required";
      throw badRequest(msg);
    }
    const day = parseDay(query.data.date);
    const cashDay = await prisma.cashDay.findUnique({
      where: {
        unitId_day: { unitId, day },
      },
    });
    return json(cashDay ?? null);
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
    const data = upsertCashDaySchema.safeParse(body);
    if (!data.success) {
      const msg = data.error.issues.map((e) => e.message).join("; ") || "Validation failed";
      throw badRequest(msg);
    }
    const day = parseDay(data.data.date);
    const cashDay = await prisma.cashDay.upsert({
      where: {
        unitId_day: { unitId, day },
      },
      create: {
        tenantId,
        unitId,
        day,
        incomeCents: data.data.incomeCents ?? 0,
        expenseCents: data.data.expenseCents ?? 0,
        notes: data.data.notes ?? undefined,
      },
      update: {
        ...(data.data.incomeCents !== undefined && { incomeCents: data.data.incomeCents }),
        ...(data.data.expenseCents !== undefined && { expenseCents: data.data.expenseCents }),
        ...(data.data.notes !== undefined && { notes: data.data.notes }),
      },
    });
    return json(cashDay, 200);
  });
}
