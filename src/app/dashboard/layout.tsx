'use client'
import { ReactNode, useEffect } from 'react';
import { Users, Package, ShoppingCart } from "lucide-react"
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
            <aside className={`w-[180px]`}>
                <nav className="mt-5 px-2">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href}>
                                    <Button
                                        variant="ghost"
                                        className="justify-start text-[#9a9f9e] hover:bg-[#212529] w-full"
                                    >
                                        <div className="flex flex-row gap-4 m-2 mx-4 text-[#66707b] hover:text-[#fdfcfa]">
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

            <main className="flex-1 overflow-y-auto p-8 bg-[#222527]">
                {children}
            </main>
            <Toaster />
        </div>
    )
};

export default AuthLayout;