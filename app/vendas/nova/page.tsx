"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Container } from "@/components/layout/container";
import { ProductSelector } from "@/components/comandas/product-selector";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/format";
import { apiRequest } from "@/lib/api-client";
import { useApp } from "@/lib/context/app-context";
import { useRouter } from "next/navigation";

interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
}

export default function NovaVendaPage() {
  const router = useRouter();
  const { tenantId, unitId } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [paymentType, setPaymentType] = useState<string>("CASH");
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [saleType, setSaleType] = useState<"PAID" | "CREDIT">("PAID");
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);

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

  const loadCustomers = async () => {
    if (!tenantId) return;
    setLoadingCustomers(true);
    try {
      const data = await apiRequest<Array<{ id: string; name: string }>>(
        `/api/tenants/${tenantId}/customers`,
        { tenantId }
      );
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const finalizeSale = async () => {
    if (!tenantId || !unitId || cart.length === 0) return;
    
    // Validate if credit sale has customer selected
    if (saleType === "CREDIT" && !selectedCustomer) {
      alert("Selecione um cliente para venda fiado");
      return;
    }

    try {
      // Create order
      const orderPayload: any = { channel: "COUNTER" };
      if (saleType === "CREDIT" && selectedCustomer) {
        orderPayload.customerId = selectedCustomer;
      }

      const order = await apiRequest<any>(
        `/api/tenants/${tenantId}/units/${unitId}/orders`,
        {
          method: "POST",
          body: JSON.stringify(orderPayload),
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

      // Close order
      const closePayload: any = {
        isOnCredit: saleType === "CREDIT",
      };
      
      if (saleType === "PAID") {
        closePayload.paidType = paymentType;
        closePayload.paidCents = totalCents;
      }

      await apiRequest(
        `/api/tenants/${tenantId}/orders/${order.id}/close`,
        {
          method: "POST",
          body: JSON.stringify(closePayload),
          tenantId,
        }
      );

      router.push("/");
    } catch (error) {
      console.error("Failed to finalize sale:", error);
      alert("Erro ao finalizar venda");
    }
  };

  return (
    <MobileLayout>
      <Container className="py-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Lançar Venda Rápida
        </h1>

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
                <span className="text-2xl font-bold text-[var(--brand-primary)]">
                  {formatCurrency(totalCents)}
                </span>
              </div>
              <Button className="w-full" onClick={() => setShowCloseModal(true)}>
                Finalizar Venda
              </Button>
            </div>
          )}
        </div>
      </Container>

      <ProductSelector
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onSelect={addToCart}
      />

      <Modal
        isOpen={showCloseModal}
        onClose={() => {
          setShowCloseModal(false);
          setSaleType("PAID");
          setSelectedCustomer("");
        }}
        title="Finalizar Venda"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]">Total</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {formatCurrency(totalCents)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
              Tipo de Venda
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSaleType("PAID");
                  setSelectedCustomer("");
                }}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${saleType === "PAID"
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                    : "border-[var(--border-soft)] bg-[var(--surface-raised)] text-[var(--text-primary)]"
                  }
                `}
              >
                💰 Pago
              </button>
              <button
                onClick={() => {
                  setSaleType("CREDIT");
                  if (customers.length === 0 && !loadingCustomers) {
                    loadCustomers();
                  }
                }}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${saleType === "CREDIT"
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                    : "border-[var(--border-soft)] bg-[var(--surface-raised)] text-[var(--text-primary)]"
                  }
                `}
              >
                📒 Fiado
              </button>
            </div>
          </div>

          {saleType === "CREDIT" && (
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
                Cliente
              </label>
              {loadingCustomers ? (
                <div className="text-center py-4 text-[var(--text-secondary)]">
                  Carregando clientes...
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-4 text-[var(--text-secondary)]">
                  Nenhum cliente cadastrado
                </div>
              ) : (
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full p-3 rounded-lg border-2 border-[var(--border-soft)] bg-[var(--surface-raised)] text-[var(--text-primary)]"
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {saleType === "PAID" && (
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
                setSaleType("PAID");
                setSelectedCustomer("");
              }}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={finalizeSale}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </MobileLayout>
  );
}
