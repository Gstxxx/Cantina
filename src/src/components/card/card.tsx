import React from 'react'
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Card({ title, value }: { title: string, value: string | number }) {
    return (
        <UiCard className='rounded-md bg-[#fdfcfa]'>
            <CardHeader>
                <CardTitle className="text-[#2c2c2c] text-3xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-[#d96037] text-3xl font-bold">{value}</p>
            </CardContent>
        </UiCard>
    )
}
