import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

interface FiadoBadgeProps {
  balanceCents: number;
}

export function FiadoBadge({ balanceCents }: FiadoBadgeProps) {
  const variant =
    balanceCents <= 0 ? "success" :
    balanceCents <= 5000 ? "warning" :
    "error";

  return (
    <Badge variant={variant}>
      {formatCurrency(balanceCents)}
    </Badge>
  );
}
