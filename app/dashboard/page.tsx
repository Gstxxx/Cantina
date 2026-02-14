"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/layout/container";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { apiRequest } from "@/lib/api-client";
import { useApp } from "@/lib/context/app-context";
import Image from "next/image";

interface DashboardStats {
  salesMonth: number;
  ordersMonth: number;
  avgTicket: number;
  creditTotal: number;
  topProducts: Array<{
    name: string;
    qty: number;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const { tenantId, unitId } = useApp();
  const [stats, setStats] = useState<DashboardStats>({
    salesMonth: 0,
    ordersMonth: 0,
    avgTicket: 0,
    creditTotal: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId && unitId) {
      loadStats();
    }
  }, [tenantId, unitId]);

  const loadStats = async () => {
    if (!tenantId || !unitId) return;
    setLoading(true);
    
    try {
      const orders = await apiRequest<any[]>(
        `/api/tenants/${tenantId}/units/${unitId}/orders`,
        { tenantId, unitId }
      );

      const currentMonth = new Date().getMonth();
      const monthOrders = orders.filter((o) => {
        const orderMonth = new Date(o.closedAt || o.openedAt).getMonth();
        return orderMonth === currentMonth;
      });

      const closedOrders = monthOrders.filter((o) => o.status === "CLOSED");
      
      const salesMonth = closedOrders.reduce((sum, o) => sum + o.totalCents, 0);
      const ordersMonth = closedOrders.length;
      const avgTicket = ordersMonth > 0 ? salesMonth / ordersMonth : 0;

      const creditOrders = orders.filter((o) => o.isOnCredit && o.status === "CLOSED");
      const creditTotal = creditOrders.reduce((sum, o) => sum + o.totalCents, 0);

      // Calculate top products
      const productStats: Record<string, { name: string; qty: number; revenue: number }> = {};
      
      for (const order of closedOrders) {
        if (order.items) {
          for (const item of order.items) {
            if (!productStats[item.productId]) {
              productStats[item.productId] = {
                name: item.product?.name || "Produto",
                qty: 0,
                revenue: 0,
              };
            }
            productStats[item.productId].qty += item.qty;
            productStats[item.productId].revenue += item.totalCents;
          }
        }
      }

      const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        salesMonth,
        ordersMonth,
        avgTicket,
        creditTotal,
        topProducts,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-base)]">
      <header className="bg-[var(--brand-primary)] text-white px-6 py-4 sticky top-0 z-[var(--z-sticky)]">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Sandra Café & Cozinha"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h1 className="font-semibold text-lg">Dashboard Analítico</h1>
            <p className="text-xs opacity-90">Sandra Café & Cozinha</p>
          </div>
        </div>
      </header>

      <Container className="py-6">
        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Carregando...
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              Resumo do Mês
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Vendas do Mês"
                value={formatCurrency(stats.salesMonth)}
                icon="💰"
                variant="success"
              />
              <StatCard
                title="Comandas Fechadas"
                value={stats.ordersMonth}
                icon="🍽️"
                variant="info"
              />
              <StatCard
                title="Ticket Médio"
                value={formatCurrency(stats.avgTicket)}
                icon="📊"
                variant="neutral"
              />
              <StatCard
                title="Fiado Total"
                value={formatCurrency(stats.creditTotal)}
                icon="📒"
                variant="warning"
              />
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Produtos Mais Vendidos
            </h2>

            {stats.topProducts.length === 0 ? (
              <Card>
                <p className="text-center py-4 text-[var(--text-muted)]">
                  Nenhuma venda registrada este mês
                </p>
              </Card>
            ) : (
              <Card>
                <div className="space-y-4">
                  {stats.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between pb-4 border-b border-[var(--border-soft)] last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--text-primary)]">
                          {product.name}
                        </h3>
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {product.qty} unidades vendidas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--brand-primary)]">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
