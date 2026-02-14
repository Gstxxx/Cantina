import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApi, json, requireTenantId } from "@/lib/api";
import { badRequest, notFound } from "@/lib/errors";
import { statementQuerySchema, cuidSchema } from "@/lib/validations";

function lastDayOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
}

function firstDayOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  return handleApi(async () => {
    const { tenantId, id: customerId } = await params;
    requireTenantId(request);
    const idResult = cuidSchema.safeParse(customerId);
    if (!idResult.success) throw badRequest("Invalid customer id");
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) throw notFound("Customer not found");
    const query = statementQuerySchema.safeParse({
      month: request.nextUrl.searchParams.get("month"),
      year: request.nextUrl.searchParams.get("year"),
    });
    if (!query.success) {
      const msg = query.error.issues.map((e) => e.message).join("; ") || "month and year required";
      throw badRequest(msg);
    }
    const { month, year } = query.data;
    const start = firstDayOfMonth(year, month);
    const end = lastDayOfMonth(year, month);
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        customerId,
        occurredAt: { gte: start, lte: end },
      },
      orderBy: { occurredAt: "asc" },
    });
    let totalChargesCents = 0;
    let totalPaymentsCents = 0;
    for (const e of entries) {
      if (e.type === "CHARGE") totalChargesCents += e.amountCents;
      else if (e.type === "PAYMENT" || e.type === "ADJUST") totalPaymentsCents += e.amountCents;
    }
    const balanceCents = totalChargesCents - totalPaymentsCents;
    const monthNames = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    ];
    const monthLabel = `${monthNames[month - 1]} de ${year}`;
    const messageForWhatsApp = [
      `*Extrato - ${customer.name}*`,
      `Período: ${monthLabel}`,
      ``,
      `Consumo: R$ ${formatCents(totalChargesCents)}`,
      `Pagamentos: R$ ${formatCents(totalPaymentsCents)}`,
      `Saldo do período: R$ ${formatCents(balanceCents)}`,
      ``,
      `Cantina Sandra Café & Cozinha`,
    ].join("\n");
    return json({
      customerId,
      customerName: customer.name,
      month,
      year,
      totalChargesCents,
      totalPaymentsCents,
      balanceCents,
      entries,
      messageForWhatsApp,
    });
  });
}
