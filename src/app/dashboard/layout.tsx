'use client'
import { ReactNode, useState, useEffect } from 'react'
import { Users, Package, ShoppingCart, CoffeeIcon,LogOut } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from 'next/navigation'
import { getCookie, setCookie } from 'cookies-next'
import { Toaster } from '@/components/ui/toaster';

const navItems = [
    { name: 'Compras', href: '/Dashboard/Purchases', icon: ShoppingCart },
    { name: 'Clientes', href: '/Dashboard/Clients', icon: Users },
    { name: 'Produtos', href: '/Dashboard/Products', icon: Package },
]

const AuthLayout = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();

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

    const handleLogout = () => {
        setCookie('token', '', { maxAge: -1 });
        setCookie('refreshToken', '', { maxAge: -1 });
        router.push('/'); 
    };

    return (
        <div className="flex h-screen bg-[#272b2f] text-white relative">
            <aside className={`w-64 bg-white shadow-md ${isMobile ? 'hidden' : 'block'}`}>
                <nav className="mt-8">
                    <ul className="space-y-2 mx-4">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href}>
                                    <Button
                                        variant="ghost"
                                        className={`w-full justify-start text-gray-600 font-bold hover:bg-gray-100 hover:text-gray-900 flex flex-row gap-8 ${pathname === item.href ? 'bg-orange-100 text-orange-500' : ''}`}
                                    >
                                        <item.icon className="my-2" />
                                        {item.name}
                                    </Button>
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="w-full justify-start text-gray-600 font-bold hover:bg-gray-100 hover:text-red-500 flex flex-row gap-8"
                            >
                                <LogOut className="my-2" />
                                Logout
                            </Button>
                        </li>
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
                                            className={`w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${pathname === item.href ? 'bg-orange-100 text-orange-500' : ''}`}
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
                    <div className="flex flex-row">
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex flex-row gap-2 items-center">
                        <CoffeeIcon className="w-10 h-10 text-orange-500" />
                        <h1 className="text-3xl font-bold text-black">Parada dos sabores</h1>
                            </div>
                        <p className="text-gray-600 mt-1">Bem-vindo ao seu painel de controle</p>
                        </div>
                    </div>
                    {children}
                </div>
            </main>
            <Toaster />
            </div>
        </div>
    )
};

export default AuthLayout;
