import React from 'react'
import { Tooltip, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


interface GraphicProps {
    name: string;
    quantity: number;
}

export function PizzaGrafic({ title, values }: { title: string, values: GraphicProps[] }) {

    const COLORS = ['#bb86fc', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

    const sortedValues = values.sort((a, b) => b.quantity - a.quantity).slice(0, 10);
    return (
        <Card className='rounded-lg bg-[#272b2f] border-transparent border-0'>
            <CardHeader>
                <CardTitle className="text-orange-500">{title}</CardTitle>
            </CardHeader>
            <CardContent className='flex items-center justify-center h-[250px]'>
                <PieChart width={400} height={250}  >
                    <Pie
                        data={sortedValues}
                        cx={200}
                        cy={125}
                        labelLine={false}
                        outerRadius={70}
                        fill="#FFFFFF"
                        dataKey="quantity"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {sortedValues.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </CardContent>
        </Card >
    )
}
