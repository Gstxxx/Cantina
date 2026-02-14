"use client";

import Image from "next/image";
import { useApp } from "@/lib/context/app-context";
import { formatDate } from "@/lib/format";

export function Header() {
  const { unitName } = useApp();
  const today = new Date();

  return (
    <header className="bg-[var(--brand-primary)] text-white px-4 py-3 sticky top-0 z-[var(--z-sticky)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Sandra Café & Cozinha"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h1 className="font-semibold text-base leading-tight">
              Sandra Café & Cozinha
            </h1>
            {unitName && (
              <p className="text-xs opacity-90">{unitName}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-90">{formatDate(today)}</p>
        </div>
      </div>
    </header>
  );
}
