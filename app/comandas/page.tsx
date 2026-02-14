"use client";

import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Container } from "@/components/layout/container";
import { ComandaCard } from "@/components/comandas/comanda-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api-client";
import { useApp } from "@/lib/context/app-context";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  status: "OPEN" | "CLOSED" | "CANCELED";
  table?: { name: string };
  customer?: { name: string };
  channel: string;
  totalCents: number;
  openedAt: string;
  isOnCredit: boolean;
}

export default function ComandasPage() {
  const router = useRouter();
  const { tenantId, unitId } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newOrderType, setNewOrderType] = useState<"TABLE" | "COUNTER" | null>(null);
  const [tableName, setTableName] = useState("");
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "CLOSED">("OPEN");

  useEffect(() => {
    if (tenantId && unitId) {
      loadOrders();
    }
  }, [tenantId, unitId, filter]);

  const loadOrders = async () => {
    if (!tenantId || !unitId) return;
    setLoading(true);
    try {
      const data = await apiRequest<Order[]>(
        `/api/tenants/${tenantId}/units/${unitId}/orders`,
        { tenantId, unitId }
      );
      const filtered = filter === "ALL" ? data : data.filter(o => o.status === filter);
      setOrders(filtered);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!tenantId || !unitId || !newOrderType) return;

    try {
      const payload: any = {
        channel: newOrderType,
      };

      if (newOrderType === "TABLE" && tableName) {
        payload.tableName = tableName;
      }

      const order = await apiRequest<Order>(
        `/api/tenants/${tenantId}/units/${unitId}/orders`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          tenantId,
          unitId,
        }
      );

      router.push(`/comandas/${order.id}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Erro ao criar comanda");
    }
  };

  return (
    <MobileLayout>
      <Container className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Comandas
          </h1>
          <Button onClick={() => setShowNewModal(true)}>
            + Nova
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={filter === "OPEN" ? "primary" : "secondary"}
            onClick={() => setFilter("OPEN")}
          >
            Abertas
          </Button>
          <Button
            size="sm"
            variant={filter === "CLOSED" ? "primary" : "secondary"}
            onClick={() => setFilter("CLOSED")}
          >
            Fechadas
          </Button>
          <Button
            size="sm"
            variant={filter === "ALL" ? "primary" : "secondary"}
            onClick={() => setFilter("ALL")}
          >
            Todas
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Carregando...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Nenhuma comanda encontrada
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {orders.map((order) => (
              <ComandaCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </Container>

      <Modal
        isOpen={showNewModal}
        onClose={() => {
          setShowNewModal(false);
          setNewOrderType(null);
          setTableName("");
        }}
        title="Nova Comanda"
      >
        {!newOrderType ? (
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => setNewOrderType("TABLE")}
            >
              🍽️ Mesa
            </Button>
            <Button
              className="w-full"
              onClick={() => setNewOrderType("COUNTER")}
            >
              🏪 Balcão
            </Button>
          </div>
        ) : newOrderType === "TABLE" ? (
          <div className="space-y-4">
            <Input
              label="Número/Nome da Mesa"
              placeholder="Ex: Mesa 1"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setNewOrderType(null)}
              >
                Voltar
              </Button>
              <Button
                className="flex-1"
                onClick={createOrder}
                disabled={!tableName}
              >
                Criar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">
              Comanda de balcão criada automaticamente
            </p>
            <Button className="w-full" onClick={createOrder}>
              Criar Comanda
            </Button>
          </div>
        )}
      </Modal>
    </MobileLayout>
  );
}
