"use client";

import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/format";
import { apiRequest } from "@/lib/api-client";
import { useApp } from "@/lib/context/app-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stats {
  salesToday: number;
  openOrders: number;
  creditTotal: number;
}

export default function Home() {
  const router = useRouter();
  const { tenantId, unitId, unitName } = useApp();
  const [stats, setStats] = useState<Stats>({
    salesToday: 0,
    openOrders: 0,
    creditTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to setup if no context
    if (!tenantId || !unitId) {
      router.push("/setup");
      return;
    }
    loadStats();
  }, [tenantId, unitId, router]);

  const loadStats = async () => {
    if (!tenantId || !unitId) return;
    setLoading(true);

    try {
      const orders = await apiRequest<any[]>(
        `/api/tenants/${tenantId}/units/${unitId}/orders`,
        { tenantId, unitId },
      );

      const today = new Date().toISOString().split("T")[0];
      const salesToday = orders
        .filter((o) => o.status === "CLOSED" && o.closedAt?.startsWith(today))
        .reduce((sum, o) => sum + o.totalCents, 0);

      const openOrders = orders.filter((o) => o.status === "OPEN").length;

      const creditTotal = orders
        .filter((o) => o.isOnCredit && o.status === "CLOSED")
        .reduce((sum, o) => sum + o.totalCents, 0);

      setStats({ salesToday, openOrders, creditTotal });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!tenantId || !unitId) {
    return null;
  }

  return (
    <MobileLayout>
      <Container className="py-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Resumo do Dia
        </h1>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6 animate-fadeIn">
              <Card>
                <p className="text-sm text-[var(--text-tertiary)] mb-1">
                  Vendas Hoje
                </p>
                <p className="text-3xl font-bold text-[var(--success)]">
                  {formatCurrency(stats.salesToday)}
                </p>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <p className="text-sm text-[var(--text-tertiary)] mb-1">
                    Comandas Abertas
                  </p>
                  <p className="text-3xl font-bold text-[var(--brand-primary)]">
                    {stats.openOrders}
                  </p>
                </Card>

                <Card>
                  <p className="text-sm text-[var(--text-tertiary)] mb-1">
                    Fiado Pendente
                  </p>
                  <p className="text-3xl font-bold text-[var(--warning)]">
                    {formatCurrency(stats.creditTotal)}
                  </p>
                </Card>
              </div>
            </div>

            <div className="space-y-3 animate-fadeIn gap-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Ações Rápidas
              </h2>

              <Link href="/comandas">
                <Button className="w-full" size="lg">
                  🍽️ Ver Comandas
                </Button>
              </Link>

              {/* Added spacing */}
              <div className="h-2" />

              <Link href="/vendas/nova">
                <Button className="w-full" size="lg" variant="secondary">
                  ➕ Lançar Venda Rápida
                </Button>
              </Link>

              {/* Added spacing */}
              <div className="h-2" />

              <Link href="/fiado">
                <Button className="w-full" size="lg" variant="secondary">
                  📒 Gerenciar Fiado
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </MobileLayout>
  );
}
