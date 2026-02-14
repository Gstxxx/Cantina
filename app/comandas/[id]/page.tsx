"use client";

import { useState, useEffect, use } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Container } from "@/components/layout/container";
import { OrderItemList } from "@/components/comandas/order-item-list";
import { ProductSelector } from "@/components/comandas/product-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { apiRequest } from "@/lib/api-client";
import { useApp } from "@/lib/context/app-context";
import { formatCurrency } from "@/lib/format";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
  };
  qty: number;
  priceCents: number;
  totalCents: number;
  notes?: string | null;
}

interface Order {
  id: string;
  status: "OPEN" | "CLOSED" | "CANCELED";
  table?: { name: string };
  customer?: { name: string };
  totalCents: number;
  subtotalCents: number;
  discountCents: number;
  items: OrderItem[];
}

export default function ComandaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { tenantId } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeType, setCloseType] = useState<"PAID" | "CREDIT" | null>(null);
  const [paymentType, setPaymentType] = useState<string>("CASH");

  useEffect(() => {
    if (tenantId && id) {
      loadOrder();
    }
  }, [tenantId, id]);

  const loadOrder = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await apiRequest<Order>(
        `/api/tenants/${tenantId}/orders/${id}`,
        { tenantId }
      );
      setOrder(data);
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId: string, priceCents: number) => {
    if (!tenantId) return;
    try {
      await apiRequest(
        `/api/tenants/${tenantId}/orders/${id}/items`,
        {
          method: "POST",
          body: JSON.stringify({ productId, qty: 1, priceCents }),
          tenantId,
        }
      );
      loadOrder();
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Erro ao adicionar item");
    }
  };

  const updateItemQty = async (itemId: string, newQty: number) => {
    if (!tenantId) return;
    try {
      await apiRequest(
        `/api/tenants/${tenantId}/orders/${id}/items/${itemId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ qty: newQty }),
          tenantId,
        }
      );
      loadOrder();
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!tenantId) return;
    if (!confirm("Remover este item?")) return;
    
    try {
      await apiRequest(
        `/api/tenants/${tenantId}/orders/${id}/items/${itemId}`,
        {
          method: "DELETE",
          tenantId,
        }
      );
      loadOrder();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const closeOrder = async () => {
    if (!tenantId || !closeType) return;

    try {
      const payload: any = {};
      
      if (closeType === "PAID") {
        payload.paidType = paymentType;
        payload.paidCents = order?.totalCents;
      } else {
        payload.isOnCredit = true;
      }

      await apiRequest(
        `/api/tenants/${tenantId}/orders/${id}/close`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          tenantId,
        }
      );

      router.push("/comandas");
    } catch (error) {
      console.error("Failed to close order:", error);
      alert("Erro ao fechar comanda");
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

  if (!order) {
    return (
      <MobileLayout>
        <Container className="py-8 text-center text-[var(--text-muted)]">
          Comanda não encontrada
        </Container>
      </MobileLayout>
    );
  }

  const displayName = order.table?.name || order.customer?.name || "Balcão";
  const canEdit = order.status === "OPEN";

  return (
    <MobileLayout>
      <Container className="py-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {displayName}
            </h1>
            <Badge variant={order.status === "OPEN" ? "success" : "neutral"}>
              {order.status === "OPEN" ? "ABERTA" : "FECHADA"}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--text-tertiary)]">Total</p>
            <p className="text-3xl font-bold text-[var(--brand-primary)]">
              {formatCurrency(order.totalCents)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <OrderItemList
            items={order.items}
            editable={canEdit}
            onUpdateQty={updateItemQty}
            onRemove={removeItem}
          />

          {canEdit && (
            <>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => setShowProductSelector(true)}
              >
                + Adicionar Produto
              </Button>

              {order.items.length > 0 && (
                <div className="flex gap-2 pt-4 border-t border-[var(--border-soft)]">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setCloseType("PAID");
                      setShowCloseModal(true);
                    }}
                  >
                    Fechar - Pago
                  </Button>
                  <Button
                    className="flex-1"
                    variant="secondary"
                    onClick={() => {
                      setCloseType("CREDIT");
                      setShowCloseModal(true);
                    }}
                  >
                    Fechar - Fiado
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Container>

      <ProductSelector
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onSelect={addItem}
      />

      <Modal
        isOpen={showCloseModal}
        onClose={() => {
          setShowCloseModal(false);
          setCloseType(null);
        }}
        title={closeType === "PAID" ? "Fechar Comanda - Pago" : "Fechar Comanda - Fiado"}
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]">Total</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {formatCurrency(order.totalCents)}
            </p>
          </div>

          {closeType === "PAID" && (
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
          )}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCloseModal(false);
                setCloseType(null);
              }}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={closeOrder}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </MobileLayout>
  );
}
