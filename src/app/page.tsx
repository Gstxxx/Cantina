import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Package, ShoppingCart } from "lucide-react"
import PurchaseAnalysis from "./pages/orders/index"

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Purchases', href: '/orders/PurchaseAnalysis', icon: ShoppingCart },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <nav className="mt-5 px-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href} passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {children}
        <PurchaseAnalysis />
      </main>
    </div>
  )
}