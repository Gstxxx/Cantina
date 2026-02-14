import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTime } from "@/lib/format";
import Link from "next/link";

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

interface ComandaCardProps {
  order: Order;
}

export function ComandaCard({ order }: ComandaCardProps) {
  const displayName = order.table?.name || order.customer?.name || "Balcão";
  
  const statusVariant = 
    order.status === "OPEN" ? "success" : 
    order.status === "CLOSED" ? "neutral" : 
    "error";
  
  const statusLabel = 
    order.status === "OPEN" ? "ABERTA" :
    order.status === "CLOSED" ? "FECHADA" :
    "CANCELADA";

  return (
    <Link href={`/comandas/${order.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg text-[var(--text-primary)]">
              {displayName}
            </h3>
            <p className="text-sm text-[var(--text-tertiary)]">
              {formatTime(order.openedAt)}
            </p>
          </div>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
        
        <div className="flex items-end justify-between mt-3">
          <div className="text-2xl font-bold text-[var(--brand-primary)]">
            {formatCurrency(order.totalCents)}
          </div>
          {order.isOnCredit && (
            <Badge variant="warning">FIADO</Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
