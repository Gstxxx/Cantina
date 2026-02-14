import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 
      font-medium rounded-lg transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95 transition-transform
    `;

    const variants = {
      primary: `
        bg-[var(--brand-primary)] text-white
        hover:bg-[var(--brand-hover)] 
        active:bg-[var(--brand-active)]
      `,
      secondary: `
        border-2 border-[var(--border-standard)] 
        text-[var(--text-primary)] bg-transparent
        hover:bg-[var(--surface-raised)] hover:border-[var(--border-emphasis)]
      `,
      ghost: `
        text-[var(--text-secondary)] bg-transparent
        hover:bg-[var(--surface-raised)]
      `,
      danger: `
        bg-[var(--error)] text-white
        hover:bg-[#9B3A2E] active:bg-[#7D2F24]
      `,
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm min-h-[36px]",
      md: "px-4 py-2 text-base min-h-[44px]",
      lg: "px-6 py-3 text-lg min-h-[52px]",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
