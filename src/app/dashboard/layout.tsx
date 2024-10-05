'use client'
import { ReactNode, useEffect } from 'react';
import { LayoutDashboard, Users, Package, ShoppingCart } from "lucide-react"
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
        <div className="flex h-screen bg-[#f3eee1] text-white relative">
            <aside className={`w-[180px]`}>
                <nav className="mt-5 px-2">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href}>
                                    <Button
                                        variant="ghost"
                                        className="justify-start text-[#fdfcfa] hover:bg-[#D96037] w-full"
                                    >
                                        <div className="flex flex-row gap-4 m-2 mx-4 text-[#D96037] hover:text-[#fdfcfa]">
                                            <item.icon className="my-2" />
                                            <p className='mt-2 text-lg'>{item.name}</p>
                                        </div>
                                    </Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 bg-[#f3eee1]">
                {children}
            </main>
        </div>
    )
};

export default AuthLayout;