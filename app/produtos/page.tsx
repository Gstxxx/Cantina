"use client";

import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { apiRequest } from "@/lib/api-client";
import { useApp } from "@/lib/context/app-context";

interface Product {
  id: string;
  name: string;
  priceCents: number;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function ProdutosPage() {
  const { tenantId } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    priceCents: "",
    categoryId: "",
  });

  useEffect(() => {
    if (tenantId) {
      loadData();
    }
  }, [tenantId]);

  const loadData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiRequest<Product[]>(`/api/tenants/${tenantId}/products`, { tenantId }),
        apiRequest<Category[]>(`/api/tenants/${tenantId}/categories`, { tenantId }),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        priceCents: String(product.priceCents),
        categoryId: product.category?.id || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", priceCents: "", categoryId: "" });
    }
    setShowDrawer(true);
  };

  const saveProduct = async () => {
    if (!tenantId || !formData.name || !formData.priceCents) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        priceCents: parseInt(formData.priceCents),
        categoryId: formData.categoryId || undefined,
      };

      if (editingProduct) {
        await apiRequest(
          `/api/tenants/${tenantId}/products/${editingProduct.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
            tenantId,
          }
        );
      } else {
        await apiRequest(
          `/api/tenants/${tenantId}/products`,
          {
            method: "POST",
            body: JSON.stringify(payload),
            tenantId,
          }
        );
      }

      setShowDrawer(false);
      loadData();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Erro ao salvar produto");
    }
  };

  const toggleActive = async (product: Product) => {
    if (!tenantId) return;
    try {
      await apiRequest(
        `/api/tenants/${tenantId}/products/${product.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: !product.isActive }),
          tenantId,
        }
      );
      loadData();
    } catch (error) {
      console.error("Failed to toggle product:", error);
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category?.name || "Sem Categoria";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <MobileLayout>
      <Container className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Produtos
          </h1>
          <Button onClick={() => openDrawer()}>+ Novo</Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            Carregando...
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedProducts).map(([categoryName, items]) => (
              <div key={categoryName}>
                <h2 className="text-lg font-semibold text-[var(--text-secondary)] mb-3">
                  {categoryName}
                </h2>
                <div className="space-y-2">
                  {items.map((product) => (
                    <Card
                      key={product.id}
                      className="flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openDrawer(product)}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {product.name}
                        </h3>
                        <p className="text-sm font-semibold text-[var(--brand-primary)]">
                          {formatCurrency(product.priceCents)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.isActive ? "success" : "neutral"}>
                          {product.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActive(product);
                          }}
                          className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        >
                          {product.isActive ? "👁️" : "🚫"}
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={editingProduct ? "Editar Produto" : "Novo Produto"}
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Café com Leite"
          />

          <Input
            label="Preço (em centavos)"
            type="number"
            value={formData.priceCents}
            onChange={(e) => setFormData({ ...formData, priceCents: e.target.value })}
            placeholder="Ex: 500 (R$ 5,00)"
          />

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
              Categoria
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#EDE7DB] border border-[var(--border-soft)] text-[var(--text-primary)]"
            >
              <option value="">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowDrawer(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={saveProduct}>
              Salvar
            </Button>
          </div>
        </div>
      </Drawer>
    </MobileLayout>
  );
}
