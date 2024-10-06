import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


interface GraphicProps {
    name: string;
    quantity: number;
}

export function Graphic({ title, values }: { title: string, values: GraphicProps[] }) {
    return (
        <Card className='rounded-lg bg-[#272b2f] border-transparent border-0'>
            <CardHeader>
                <CardTitle className="text-orange-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <BarChart width={500} height={300} data={values}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#f97316" />
                </BarChart>
            </CardContent>
        </Card>
    )
}
