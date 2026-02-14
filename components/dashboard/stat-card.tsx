import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  trend?: string;
}

export function StatCard({ title, value, icon, variant = "neutral", trend }: StatCardProps) {
  const colorMap = {
    success: "text-[var(--success)]",
    warning: "text-[var(--warning)]",
    error: "text-[var(--error)]",
    info: "text-[var(--info)]",
    neutral: "text-[var(--text-primary)]",
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-[var(--text-tertiary)]">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${colorMap[variant]}`}>
        {value}
      </p>
      {trend && (
        <p className="text-xs text-[var(--text-muted)] mt-1">{trend}</p>
      )}
    </Card>
  );
}
