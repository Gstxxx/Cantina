"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { apiRequest } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface Tenant {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
}

export default function SetupPage() {
  const router = useRouter();
  const { setTenant, setUnit } = useApp();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadUnits(selectedTenant);
    }
  }, [selectedTenant]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      // For demo, create a default tenant if none exists
      const response = await fetch("/api/tenants");
      const data = await response.json();
      
      if (data.length === 0) {
        // Auto-create demo tenant
        const tenant = { id: "demo-tenant", name: "Sandra Café & Cozinha" };
        setTenants([tenant]);
        setSelectedTenant(tenant.id);
      } else {
        setTenants(data);
      }
    } catch (error) {
      // For demo purposes, use hardcoded tenant
      const tenant = { id: "demo-tenant", name: "Sandra Café & Cozinha" };
      setTenants([tenant]);
      setSelectedTenant(tenant.id);
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async (tenantId: string) => {
    try {
      const data = await apiRequest<Unit[]>(
        `/api/tenants/${tenantId}/units`,
        { tenantId }
      );
      setUnits(data);
    } catch (error) {
      console.error("Failed to load units:", error);
      setUnits([]);
    }
  };

  const selectUnit = (unitId: string, unitName: string) => {
    if (selectedTenant) {
      setTenant(selectedTenant);
      setUnit(unitId, unitName);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-base)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="Sandra Café & Cozinha"
            width={80}
            height={80}
            className="rounded-full mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Bem-vinda!
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Selecione a unidade para começar
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Carregando...
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[var(--text-muted)] mb-4">
              Nenhuma unidade cadastrada
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Configure as unidades através do painel administrativo
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {units.map((unit) => (
              <Button
                key={unit.id}
                className="w-full"
                size="lg"
                onClick={() => selectUnit(unit.id, unit.name)}
              >
                {unit.name}
              </Button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
