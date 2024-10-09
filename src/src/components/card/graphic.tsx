import React from 'react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"


interface GraphicProps {
    name: string;
    quantity: number;
}

export function Graphic({ title, values }: { title: string, values: GraphicProps[] }) {
    const sortedValues = values.sort((a, b) => b.quantity - a.quantity);
    return (
        <Card className='rounded-lg bg-[#272b2f] border-transparent border-0'>
            <CardHeader>
                <CardTitle className="text-orange-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={{
                        quantity: {
                            label: "Vendidos: ",
                            color: "hsl(var(--chart-1))",
                        },
                    }}
                    className="h-[200px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortedValues}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent className='bg-[#272b2f] p-4' />} />
                            <Bar dataKey="quantity" fill="var(--color-quantity)" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
