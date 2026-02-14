"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import { useApp } from "@/lib/context/app-context";
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/format";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  priceCents: number;
  category?: {
    name: string;
  } | null;
}

interface ProductSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (productId: string, priceCents: number) => void;
}

export function ProductSelector({ isOpen, onClose, onSelect }: ProductSelectorProps) {
  const { tenantId } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tenantId) {
      loadProducts();
    }
  }, [isOpen, tenantId]);

  const loadProducts = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await apiRequest<Product[]>(
        `/api/tenants/${tenantId}/products`,
        { tenantId }
      );
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (product: Product) => {
    onSelect(product.id, product.priceCents);
    setSearch("");
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Adicionar Produto">
      <div className="space-y-4">
        <Input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="py-8">
            <LoadingSpinner />
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Nenhum produto encontrado"
            description="Tente buscar por outro nome"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="
                  p-4 rounded-lg text-left
                  bg-[var(--surface-raised)]
                  border-2 border-[var(--border-soft)]
                  hover:border-[var(--brand-primary)]
                  transition-all active:scale-95
                  animate-fadeIn
                "
              >
                <h4 className="font-medium text-[var(--text-primary)] mb-1">
                  {product.name}
                </h4>
                {product.category && (
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">
                    {product.category.name}
                  </p>
                )}
                <p className="text-lg font-semibold text-[var(--brand-primary)]">
                  {formatCurrency(product.priceCents)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
