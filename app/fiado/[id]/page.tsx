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
import { ProductSelector } from "@/components/comandas/product-selector";
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
  orderId?: string | null;
}

interface Statement {
  customerId: string;
  customerName: string;
  month: number;
  year: number;
  totalChargesCents: number;
  totalPaymentsCents: number;
  balanceCents: number;
  entries: LedgerEntry[];
  messageForWhatsApp: string;
}

interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
}

export default function ClienteFiadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { tenantId, unitId } = useApp();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("CASH");
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [entryFilter, setEntryFilter] = useState<"ALL" | "CHARGE" | "PAYMENT">("ALL");

  useEffect(() => {
    if (tenantId && id) {
      loadCustomerAndStatement();
    }
  }, [tenantId, id]);

  const loadCustomerAndStatement = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      // Load customer data
      const customerData = await apiRequest<Customer>(
        `/api/tenants/${tenantId}/customers/${id}`,
        { tenantId }
      );
      setCustomer(customerData);

      // Load statement
      const now = new Date();
      const month = now.getMonth() + 1; // getMonth() returns 0-11
      const year = now.getFullYear();
      
      const statementData = await apiRequest<Statement>(
        `/api/tenants/${tenantId}/customers/${id}/statement?month=${month}&year=${year}`,
        { tenantId }
      );
      setStatement(statementData);
    } catch (error) {
      console.error("Failed to load customer/statement:", error);
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
      loadCustomerAndStatement();
    } catch (error) {
      console.error("Failed to register payment:", error);
      alert("Erro ao registrar pagamento");
    }
  };

  const sendWhatsApp = () => {
    if (!customer || !statement) return;

    const message = statement.messageForWhatsApp;
    const phone = customer.phone?.replace(/\D/g, "") || "";
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const addToCart = async (productId: string, priceCents: number) => {
    // Fetch product name if we don't have it
    if (!productNames[productId]) {
      try {
        const product = await apiRequest<any>(
          `/api/tenants/${tenantId}/products/${productId}`,
          { tenantId }
        );
        setProductNames((prev) => ({ ...prev, [productId]: product.name }));
        
        const existing = cart.find((item) => item.productId === productId);
        if (existing) {
          setCart(cart.map((item) =>
            item.productId === productId
              ? { ...item, qty: item.qty + 1 }
              : item
          ));
        } else {
          setCart([...cart, { productId, name: product.name, priceCents, qty: 1 }]);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      }
    } else {
      const existing = cart.find((item) => item.productId === productId);
      if (existing) {
        setCart(cart.map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty + 1 }
            : item
        ));
      } else {
        setCart([...cart, { productId, name: productNames[productId], priceCents, qty: 1 }]);
      }
    }
  };

  const updateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((item) => item.productId !== productId));
    } else {
      setCart(cart.map((item) =>
        item.productId === productId ? { ...item, qty: newQty } : item
      ));
    }
  };

  const totalCents = cart.reduce((sum, item) => sum + item.priceCents * item.qty, 0);

  const finalizeSale = async () => {
    if (!tenantId || !unitId || cart.length === 0) return;

    try {
      // Create order with customer
      const order = await apiRequest<any>(
        `/api/tenants/${tenantId}/units/${unitId}/orders`,
        {
          method: "POST",
          body: JSON.stringify({
            channel: "COUNTER",
            customerId: id,
          }),
          tenantId,
          unitId,
        }
      );

      // Add items
      for (const item of cart) {
        await apiRequest(
          `/api/tenants/${tenantId}/orders/${order.id}/items`,
          {
            method: "POST",
            body: JSON.stringify({
              productId: item.productId,
              qty: item.qty,
              priceCents: item.priceCents,
            }),
            tenantId,
          }
        );
      }

      // Close order as credit
      await apiRequest(
        `/api/tenants/${tenantId}/orders/${order.id}/close`,
        {
          method: "POST",
          body: JSON.stringify({
            isOnCredit: true,
          }),
          tenantId,
        }
      );

      // Reset and reload
      setCart([]);
      setShowSaleModal(false);
      loadCustomerAndStatement();
    } catch (error) {
      console.error("Failed to finalize sale:", error);
      alert("Erro ao finalizar venda");
    }
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

  if (!customer || !statement) {
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
            {customer.name}
          </h1>
          {customer.phone && (
            <p className="text-sm text-[var(--text-tertiary)]">
              {customer.phone}
            </p>
          )}
        </div>

        <Card className="mb-4">
          <div className="text-center">
            <p className="text-sm text-[var(--text-tertiary)] mb-1">
              Saldo Atual
            </p>
            <p className="text-4xl font-bold mb-4">
              <FiadoBadge balanceCents={statement.balanceCents} />
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-tertiary)]">Consumo</p>
                <p className="font-semibold text-[var(--error)]">
                  {formatCurrency(statement.totalChargesCents)}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-tertiary)]">Pagamentos</p>
                <p className="font-semibold text-[var(--success)]">
                  {formatCurrency(statement.totalPaymentsCents)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 mb-6">
          <Button className="flex-1" onClick={() => setShowSaleModal(true)}>
            🍽️ Adicionar Venda
          </Button>
          <Button className="flex-1" onClick={() => setShowPaymentModal(true)}>
            💰 Pagamento
          </Button>
          {customer.phone && (
            <Button variant="secondary" onClick={sendWhatsApp}>
              📱
            </Button>
          )}
        </div>

        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          Histórico
        </h2>

        {/* Entry Filters */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={entryFilter === "ALL" ? "primary" : "secondary"}
            onClick={() => setEntryFilter("ALL")}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={entryFilter === "CHARGE" ? "primary" : "secondary"}
            onClick={() => setEntryFilter("CHARGE")}
          >
            Consumos
          </Button>
          <Button
            size="sm"
            variant={entryFilter === "PAYMENT" ? "primary" : "secondary"}
            onClick={() => setEntryFilter("PAYMENT")}
          >
            Pagamentos
          </Button>
        </div>

        {(() => {
          const filteredEntries = statement.entries.filter(
            (entry) => entryFilter === "ALL" || entry.type === entryFilter
          );

          return filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              {entryFilter !== "ALL" 
                ? "Nenhuma movimentação deste tipo"
                : "Nenhuma movimentação"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map((entry) => (
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
          );
        })()}
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

      <Modal
        isOpen={showSaleModal}
        onClose={() => {
          setShowSaleModal(false);
          setCart([]);
        }}
        title="Adicionar Venda Fiado"
      >
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              Nenhum item adicionado
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 bg-[var(--surface-raised)] rounded-lg border border-[var(--border-soft)]"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {item.name}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {formatCurrency(item.priceCents)} × {item.qty}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                    >
                      −
                    </Button>
                    <span className="font-semibold text-[var(--text-primary)] w-8 text-center">
                      {item.qty}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                    >
                      +
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-[var(--text-primary)]">
                      {formatCurrency(item.priceCents * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            className="w-full"
            variant="secondary"
            onClick={() => setShowProductSelector(true)}
          >
            + Adicionar Produto
          </Button>

          {cart.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-soft)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  Total
                </span>
                <span className="text-2xl font-bold text-[var(--error)]">
                  {formatCurrency(totalCents)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowSaleModal(false);
                    setCart([]);
                  }}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={finalizeSale}>
                  Confirmar Venda Fiado
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ProductSelector
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onSelect={addToCart}
      />
    </MobileLayout>
  );
}
