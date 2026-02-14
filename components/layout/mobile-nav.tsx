"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", icon: "📊", label: "Resumo" },
  { href: "/comandas", icon: "🍽️", label: "Comandas" },
  { href: "/vendas/nova", icon: "➕", label: "Lançar" },
  { href: "/fiado", icon: "📒", label: "Fiado" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface-overlay)] border-t border-[var(--border-standard)] z-[var(--z-sticky)] safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-colors
                ${
                  isActive
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
