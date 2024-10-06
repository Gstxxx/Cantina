import React from 'react'
import { Tooltip, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


interface GraphicProps {
    name: string;
    quantity: number;
}

export function PizzaGrafic({ title, values }: { title: string, values: GraphicProps[] }) {

    const COLORS = ['#bb86fc', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']
    return (
        <Card className='rounded-lg bg-[#272b2f] border-transparent border-0'>
            <CardHeader>
                <CardTitle className="text-orange-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <PieChart width={500} height={300}>
                    <Pie
                        data={values}
                        cx={250}
                        cy={150}
                        labelLine={false}
                        outerRadius={80}
                        fill="#FFFFFF"
                        dataKey="quantity"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {values.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </CardContent>
        </Card>
    )
}
