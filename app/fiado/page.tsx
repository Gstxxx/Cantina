"use client";

import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";
import { FiadoBadge } from "@/components/fiado/fiado-badge";
import { apiRequest } from "@/lib/api-client";
import { useApp } from "@/lib/context/app-context";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  balance?: number;
}

export default function FiadoPage() {
  const { tenantId } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (tenantId) {
      loadCustomers();
    }
  }, [tenantId]);

  const loadCustomers = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await apiRequest<Customer[]>(
        `/api/tenants/${tenantId}/customers`,
        { tenantId }
      );

      // Load balance for each customer
      const customersWithBalance = await Promise.all(
        data.map(async (customer) => {
          try {
            const balance = await apiRequest<{ balanceCents: number }>(
              `/api/tenants/${tenantId}/customers/${customer.id}/balance`,
              { tenantId }
            );
            return { ...customer, balance: balance.balanceCents };
          } catch {
            return { ...customer, balance: 0 };
          }
        })
      );

      // Sort by balance (highest first)
      customersWithBalance.sort((a, b) => (b.balance || 0) - (a.balance || 0));
      setCustomers(customersWithBalance);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
    if (!tenantId || !formData.name) {
      alert("Preencha o nome do cliente");
      return;
    }

    try {
      await apiRequest(
        `/api/tenants/${tenantId}/customers`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          tenantId,
        }
      );
      setShowDrawer(false);
      setFormData({ name: "", phone: "" });
      loadCustomers();
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("Erro ao criar cliente");
    }
  };

  return (
    <MobileLayout>
      <Container className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Fiado
          </h1>
          <Button onClick={() => setShowDrawer(true)}>+ Cliente</Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Carregando...
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Nenhum cliente cadastrado
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <Link key={customer.id} href={`/fiado/${customer.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-[var(--text-primary)]">
                        {customer.name}
                      </h3>
                      {customer.phone && (
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {customer.phone}
                        </p>
                      )}
                    </div>
                    <FiadoBadge balanceCents={customer.balance || 0} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>

      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title="Novo Cliente"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do cliente"
          />

          <Input
            label="Telefone (opcional)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(00) 00000-0000"
          />

          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowDrawer(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={createCustomer}>
              Criar
            </Button>
          </div>
        </div>
      </Drawer>
    </MobileLayout>
  );
}
