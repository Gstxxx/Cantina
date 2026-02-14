"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-end"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className={`
          relative bg-[var(--surface-overlay)] 
          rounded-t-2xl shadow-[var(--shadow-overlay)]
          w-full max-h-[90vh] overflow-y-auto
          transform transition-transform duration-300
          ${isOpen ? "translate-y-0" : "translate-y-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--surface-overlay)] border-b border-[var(--border-soft)] z-10">
          <div className="flex items-center justify-center py-3">
            <div className="w-12 h-1 bg-[var(--border-standard)] rounded-full" />
          </div>
          {title && (
            <div className="px-6 pb-4">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {title}
              </h2>
            </div>
          )}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
