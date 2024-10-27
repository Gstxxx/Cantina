import React from 'react'
import {
    Card as CardUI,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ShoppingCart, Package, DollarSign, TrendingUp } from 'lucide-react'


export function Card({ title, value, colorIcon, colorBg, icon }: { title: string, value: string | number, colorIcon: string, colorBg: string, icon: string }) {
    const IconComponent = () => {
        switch (icon) {
            case 'ShoppingCart':
                return <ShoppingCart className={`${colorIcon} rounded-lg ${colorBg} size-32`} />;
            case 'Package':
                return <Package className={`${colorIcon} rounded-lg ${colorBg} size-32`} />;
            case 'DollarSign':
                return <DollarSign className={`${colorIcon} rounded-lg ${colorBg} size-32`} />;
            case 'TrendingUp':
                return <TrendingUp className={`${colorIcon} rounded-lg ${colorBg} size-32`} />;
            default:
                return null;
        }
    };

    return (
        <CardUI
            className="bg-white shadow-md rounded-lg lg:max-w-md" x-chunk="charts-01-chunk-0">
            <CardHeader className="space-y-0 pb-2 grid grid-cols-1">
                <div className='flex flex-row gap-4'>
                    <div>
                        <IconComponent />
                    </div>
                    <div className='flex flex-col'>
                        <CardDescription className='text-gray-500'>{title}</CardDescription>
                        <CardTitle className="text-3xl tabular-nums text-gray-500 mt-2 ml-2">
                            {value}
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>
        </CardUI>
    )
}
