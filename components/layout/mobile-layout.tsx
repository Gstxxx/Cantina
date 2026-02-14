"use client";

import { ReactNode } from "react";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--surface-base)] pb-20">
      <Header />
      <main>{children}</main>
      <MobileNav />
    </div>
  );
}
