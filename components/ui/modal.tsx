"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
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
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className="relative bg-[var(--surface-overlay)] rounded-lg shadow-[var(--shadow-overlay)] max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b border-[var(--border-soft)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
