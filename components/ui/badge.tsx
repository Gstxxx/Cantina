import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "neutral";
}

export function Badge({ variant = "neutral", className = "", children, ...props }: BadgeProps) {
  const variants = {
    success: "bg-[var(--success)] text-white",
    warning: "bg-[var(--warning)] text-[var(--text-primary)]",
    error: "bg-[var(--error)] text-white",
    info: "bg-[var(--info)] text-white",
    neutral: "bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--border-standard)]",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1
        rounded-md text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
