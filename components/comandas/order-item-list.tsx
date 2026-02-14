"use client";

import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

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

interface OrderItemListProps {
  items: OrderItem[];
  onUpdateQty?: (itemId: string, newQty: number) => void;
  onRemove?: (itemId: string) => void;
  editable?: boolean;
}

export function OrderItemList({ items, onUpdateQty, onRemove, editable = false }: OrderItemListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="🍽️"
        title="Nenhum item adicionado"
        description="Adicione produtos para começar"
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 bg-[var(--surface-raised)] rounded-lg border border-[var(--border-soft)] animate-stamp"
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-[var(--text-primary)]">
              {item.product.name}
            </h4>
            {item.notes && (
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                {item.notes}
              </p>
            )}
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {formatCurrency(item.priceCents)} × {item.qty}
            </p>
          </div>

          {editable && onUpdateQty ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                disabled={item.qty <= 1}
              >
                −
              </Button>
              <span className="font-semibold text-[var(--text-primary)] w-8 text-center">
                {item.qty}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onUpdateQty(item.id, item.qty + 1)}
              >
                +
              </Button>
            </div>
          ) : (
            <div className="text-right">
              <p className="font-semibold text-[var(--text-primary)]">
                {formatCurrency(item.totalCents)}
              </p>
            </div>
          )}

          {editable && onRemove && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onRemove(item.id)}
            >
              🗑️
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
