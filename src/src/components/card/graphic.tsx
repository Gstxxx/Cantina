import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, Tooltip } from "recharts"


interface GraphicProps {
    name: string;
    quantity: number;
}

export function Graphic({ title, values }: { title: string, values: GraphicProps[] }) {
    const sortedValues = values.sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    return (
        <Card className='rounded-lg bg-[#272b2f] border-transparent border-0'>
            <CardHeader>
                <CardTitle className="text-orange-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={sortedValues}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 25,
                            bottom: 5,
                        }}
                    >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: '#272b2f', color: '#eb7316', border: 'none' }} />
                        <Bar dataKey="quantity" fill="#eb7316" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
