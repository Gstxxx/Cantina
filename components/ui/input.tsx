import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            px-3 py-2 rounded-lg
            bg-[#EDE7DB]
            border border-[var(--border-soft)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--border-emphasis)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-shadow
            ${error ? "border-[var(--error)] focus:ring-[var(--error)]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-sm text-[var(--error)]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
