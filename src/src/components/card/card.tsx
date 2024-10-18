import React from 'react'

import {
    Card as CardUI,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


export function Card({ title, value }: { title: string, value: string | number }) {
    return (
        <CardUI 
          className="bg-white shadow-md rounded-lg lg:max-w-md" x-chunk="charts-01-chunk-0">
            <CardHeader className="space-y-0 pb-2">
                <CardDescription className='text-gray-500'>{title}</CardDescription>
                <CardTitle className="text-4xl tabular-nums text-gray-500">
                    {value}
                </CardTitle>
            </CardHeader>
        </CardUI>
    )
}