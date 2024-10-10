import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, Tooltip } from "recharts";

interface TopBuyersChartProps {
    title: string;
    values: { name: string; count: number }[];
}

export function TopBuyersChart({ title, values }: TopBuyersChartProps) {
    const sortedValues = values.sort((a, b) => b.count - a.count).slice(0, 10);
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
                        <Tooltip contentStyle={{ backgroundColor: '#272b2f', color: '#eb7316', border: 'none' }} label={{ position: 'insideRightRight' }} />
                        <Bar dataKey="count" fill="#eb7316" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
