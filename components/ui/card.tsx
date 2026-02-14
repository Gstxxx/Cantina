import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--surface-raised)]
        border border-[var(--border-soft)]
        rounded-lg p-4
        shadow-[var(--shadow-card)]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
