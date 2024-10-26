import React from 'react'
import {
    Card as CardUI,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ShoppingCart, Package, DollarSign, TrendingUp } from 'lucide-react'

type ColorKey = keyof typeof colorClasses;

const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/50',
    green: 'text-green-500 bg-green-500/50',
    yellow: 'text-yellow-500 bg-yellow-500/50',
    purple: 'text-purple-500 bg-purple-500/50',
};

export function Card({ title, value, color, icon }: { title: string, value: string | number, color: ColorKey, icon: string }) {
    const IconComponent = () => {
        const iconClass = colorClasses[color]?.split(' ')[0] || 'text-gray-500';

        switch (icon) {
            case 'ShoppingCart':
                return <ShoppingCart className={iconClass} />;
            case 'Package':
                return <Package className={iconClass} />;
            case 'DollarSign':
                return <DollarSign className={iconClass} />;
            case 'TrendingUp':
                return <TrendingUp className={iconClass} />;
            default:
                return null;
        }
    };

    return (
        <CardUI
            className="bg-white shadow-md rounded-lg lg:max-w-md" x-chunk="charts-01-chunk-0">
            <CardHeader className="space-y-0 pb-2 grid grid-cols-1">
                <div className='flex gap-2 mb-2'>
                    <div className={`p-4 rounded-lg ${colorClasses[color]?.split(' ')[1] || 'bg-gray-500/50'}`}>
                        <IconComponent />
                    </div>
                    <CardTitle className="text-3xl tabular-nums text-gray-500 mt-2 ml-2">
                        {value}
                    </CardTitle>
                </div>
                <CardDescription className='text-gray-500'>{title}</CardDescription>
            </CardHeader>
        </CardUI>
    )
}
