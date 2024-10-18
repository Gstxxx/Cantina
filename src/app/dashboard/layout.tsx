'use client'
import { ReactNode, useState, useEffect } from 'react'
import { Users, Package, ShoppingCart, Menu } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { getCookie, setCookie } from 'cookies-next'
import { Toaster } from '@/components/ui/toaster';

const navItems = [
    { name: 'Compras', href: '/dashboard/purchases', icon: ShoppingCart },
    { name: 'Clientes', href: '/dashboard/clients', icon: Users },
    { name: 'Produtos', href: '/dashboard/products', icon: Package },
]

const AuthLayout = ({ children }: { children: ReactNode }) => {
    const router = useRouter();

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    const refreshToken = async () => {
        const refreshToken = getCookie('refreshToken')?.toString();
        if (!refreshToken) {
            return false;
        }

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.token) {
                    setCookie('token', data.token);
                    return true;
                }
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
        }
        return false;
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = getCookie('token')?.toString();
            if (!token) {
                const isLogged = await refreshToken();
                if (!isLogged) {
                    router.push('/auth/login');
                }
            }
        };

        checkAuth();
    }, [router]);

    return (
        <div className="flex h-screen bg-[#272b2f] text-white relative">
            <aside className={`w-44 bg-white shadow-md ${isMobile ? 'hidden' : 'block'}`}>
                <nav className="mt-8">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 flex flex-row gap-8" 
                                    >
                                        <item.icon className="my-2" />
                                        {item.name}
                                    </Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className={`bg-white shadow-sm ${isMobile ? '' : 'hidden'}`}>
                    <nav>
                        <ul className="flex flex-row gap-8 items-center justify-center">
                            {navItems.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <item.icon className="my-2" />
                                        </Button>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                <div className="container mx-auto px-6 py-8">
                    {children}
                </div>
            </main>
            <Toaster />
            </div>
        </div>
    )
};

export default AuthLayout;
