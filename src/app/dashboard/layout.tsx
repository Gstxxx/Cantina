'use client'
import { ReactNode, useEffect } from 'react';
import { LayoutDashboard, Users, Package, ShoppingCart, BarChart } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/dashboard/clients', icon: Users },
    { name: 'Produtos', href: '/dashboard/products', icon: Package },
    { name: 'Vendas', href: '/dashboard/purchases', icon: ShoppingCart },
]
const AuthLayout = ({ children }: { children: ReactNode }) => {
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
        }
    }, [router])

    return (
        <div className="flex h-screen bg-[#111111] text-white relative">
            <aside className={`w-64 bg-[#111111] shadow-md`}>
                <nav className="mt-5 px-2">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-gray-400 hover:bg-[#bb86fc]"
                                    >
                                        <item.icon className="mr-2 h-4 w-4 text-gray-500" />
                                        {item.name}
                                    </Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 bg-[#111111]">
                {children}
            </main>
        </div>
    )
};

export default AuthLayout;