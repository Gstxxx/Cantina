"use client";

import { useState, useEffect, use } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { FiadoBadge } from "@/components/fiado/fiado-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { apiRequest } from "@/lib/api-client";
import { useApp } from "@/lib/context/app-context";

interface Customer {
  id: string;
  name: string;
  phone?: string | null;
}

interface LedgerEntry {
  id: string;
  type: "CHARGE" | "PAYMENT" | "ADJUST";
  amountCents: number;
  description?: string | null;
  occurredAt: string;
  order?: {
    id: string;
  } | null;
}

interface Statement {
  customer: Customer;
  entries: LedgerEntry[];
  summary: {
    totalCharges: number;
    totalPayments: number;
    balance: number;
  };
}

export default function ClienteFiadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { tenantId } = useApp();
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("CASH");

  useEffect(() => {
    if (tenantId && id) {
      loadStatement();
    }
  }, [tenantId, id]);

  const loadStatement = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await apiRequest<Statement>(
        `/api/tenants/${tenantId}/customers/${id}/statement`,
        { tenantId }
      );
      setStatement(data);
    } catch (error) {
      console.error("Failed to load statement:", error);
    } finally {
      setLoading(false);
    }
  };

  const registerPayment = async () => {
    if (!tenantId || !paymentAmount) {
      alert("Preencha o valor do pagamento");
      return;
    }

    try {
      await apiRequest(
        `/api/tenants/${tenantId}/customers/${id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            amountCents: parseInt(paymentAmount),
            paymentType,
          }),
          tenantId,
        }
      );
      setShowPaymentModal(false);
      setPaymentAmount("");
      loadStatement();
    } catch (error) {
      console.error("Failed to register payment:", error);
      alert("Erro ao registrar pagamento");
    }
  };

  const sendWhatsApp = () => {
    if (!statement) return;

    const message = `Olá ${statement.customer.name}! 
    
Segue o extrato do mês:

📊 Consumo Total: ${formatCurrency(statement.summary.totalCharges)}
💰 Pagamentos: ${formatCurrency(statement.summary.totalPayments)}
💳 Saldo: ${formatCurrency(statement.summary.balance)}

Qualquer dúvida, estamos à disposição!

Sandra Café & Cozinha`;

    const phone = statement.customer.phone?.replace(/\D/g, "") || "";
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <MobileLayout>
        <Container className="py-8 text-center text-[var(--text-muted)]">
          Carregando...
        </Container>
      </MobileLayout>
    );
  }

  if (!statement) {
    return (
      <MobileLayout>
        <Container className="py-8 text-center text-[var(--text-muted)]">
          Cliente não encontrado
        </Container>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <Container className="py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {statement.customer.name}
          </h1>
          {statement.customer.phone && (
            <p className="text-sm text-[var(--text-tertiary)]">
              {statement.customer.phone}
            </p>
          )}
        </div>

        <Card className="mb-4">
          <div className="text-center">
            <p className="text-sm text-[var(--text-tertiary)] mb-1">
              Saldo Atual
            </p>
            <p className="text-4xl font-bold mb-4">
              <FiadoBadge balanceCents={statement.summary.balance} />
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-tertiary)]">Consumo</p>
                <p className="font-semibold text-[var(--error)]">
                  {formatCurrency(statement.summary.totalCharges)}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Pagamentos</p>
                <p className="font-semibold text-[var(--success)]">
                  {formatCurrency(statement.summary.totalPayments)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 mb-6">
          <Button className="flex-1" onClick={() => setShowPaymentModal(true)}>
            💰 Registrar Pagamento
          </Button>
          {statement.customer.phone && (
            <Button variant="secondary" onClick={sendWhatsApp}>
              📱
            </Button>
          )}
        </div>

        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          Histórico
        </h2>

        {statement.entries.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Nenhuma movimentação
          </div>
        ) : (
          <div className="space-y-2">
            {statement.entries.map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          entry.type === "CHARGE" ? "error" :
                          entry.type === "PAYMENT" ? "success" :
                          "info"
                        }
                      >
                        {entry.type === "CHARGE" ? "CONSUMO" :
                         entry.type === "PAYMENT" ? "PAGAMENTO" :
                         "AJUSTE"}
                      </Badge>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {formatDate(entry.occurredAt)}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-[var(--text-secondary)]">
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      entry.type === "CHARGE" ? "text-[var(--error)]" : "text-[var(--success)]"
                    }`}>
                      {entry.type === "CHARGE" ? "+" : "-"}
                      {formatCurrency(entry.amountCents)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Registrar Pagamento"
      >
        <div className="space-y-4">
          <Input
            label="Valor (em centavos)"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Ex: 5000 (R$ 50,00)"
          />

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["CASH", "PIX", "DEBIT", "CREDIT"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPaymentType(type)}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${paymentType === type
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                      : "border-[var(--border-soft)] bg-[var(--surface-raised)] text-[var(--text-primary)]"
                    }
                  `}
                >
                  {type === "CASH" ? "Dinheiro" : type === "PIX" ? "PIX" : type === "DEBIT" ? "Débito" : "Crédito"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={registerPayment}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </MobileLayout>
  );
}
