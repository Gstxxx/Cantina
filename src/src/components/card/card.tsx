import React from 'react'
import { Card as UiCard, CardContent, CardTitle } from "@/components/ui/card"

export function Card({ title, value }: { title: string, value: string | number }) {
    return (
        <UiCard className='rounded-lg bg-[#272b2f] border-transparent border-0 h-max-[350px]'>
            <CardContent>
                <CardTitle className="text-[#2c2c2c] text-xl font-bold">{title}</CardTitle>
                <h2 className="text-orange-500 text-m font-bold">{value}</h2>
            </CardContent>
        </UiCard>
    )
}
