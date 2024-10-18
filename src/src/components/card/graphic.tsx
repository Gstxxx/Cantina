import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, Tooltip, ReferenceLine, Label } from "recharts"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
interface GraphicProps {
    name: string;
    quantity: number;
}

interface GraphicComponentProps {
    title: string;
    values: GraphicProps[];
    size?: 'small' | 'medium' | 'large';
}

export function Graphic({ title, values, size = 'medium' }: GraphicComponentProps) {
    const sortedValues = values.sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const totalQuantity = values.reduce((acc, curr) => acc + curr.quantity, 0);
    const height = size === 'small' ? 200 : size === 'large' ? 400 : 300;

    const medianIndex = Math.floor(sortedValues.length / 2);
    const medianValue = sortedValues[medianIndex].quantity;

    return (
        <Card className="bg-white rounded-lg shadow-md lg:max-w-md">
            <CardHeader className="space-y-0 pb-2">
                <CardDescription className="text-gray-400">{title}</CardDescription>
                <CardTitle className="text-gray-500 text-4xl tabular-nums">
                    {totalQuantity}{" "}
                    <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                        total
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={sortedValues}
                        margin={{
                            left: -50,
                            right: 0,
                        }}
                    >
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={4}
                        />
                        <YAxis axisLine={false} tick={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgb(243, 244, 246)', color: 'rgb(75, 85, 99)', border: 'none', borderRadius: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: 'rgb(75, 85, 99)' }}
                            label={{ value: 'Quantidade' }}
                        />
                        <Bar
                            dataKey="quantity"
                            fill="rgb(255, 165, 0)"
                            radius={5}
                        />
                        
                        <ReferenceLine
                            y={medianValue}
                            stroke="rgb(180, 140, 0)"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                        >
                            <Label
                                position="insideBottomLeft"
                                value="Média"
                                offset={10}
                                fill="hsl(var(--foreground))"
                                className='text-sm font-bold'
                            />
                            <Label
                                position="insideTopLeft"
                                value={medianValue.toString()}
                                className="text-lg"
                                fill="hsl(var(--foreground))"
                                offset={10}
                                startOffset={100}
                            />
                        </ReferenceLine>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
