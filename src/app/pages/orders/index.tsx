'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Product = {
    id: number
    name: string
    price: number
}

type PurchaseProduct = {
    id: number
    productId: number
    purchaseRecordId: number
    quantity: number
    product: Product
}

type Purchase = {
    id: number
    purchaseDate: string
    clientId: number
    client: {
        id: number
        name: string
        phone: string
    }
    products: PurchaseProduct[]
}

const PurchaseAnalysis = () => {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/purchases/report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        start: "2024-09-30",
                        end: "2024-10-30"
                    }),
                })
                if (!response.ok) {
                    throw new Error('Failed to fetch data')
                }
                const data = await response.json()
                setPurchases(data)
            } catch (err) {
                console.log(err)
                setError('Failed to fetch purchase data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    // Data processing
    const totalPurchases = purchases.length
    const totalQuantity = purchases.reduce((sum, purchase) =>
        sum + purchase.products.reduce((pSum, product) => pSum + product.quantity, 0), 0)
    const totalRevenue = purchases.reduce((sum, purchase) =>
        sum + purchase.products.reduce((pSum, product) => pSum + (product.quantity * product.product.price), 0), 0)
    const averageOrderValue = totalRevenue / totalPurchases

    const productSales = purchases.reduce((acc, purchase) => {
        purchase.products.forEach(product => {
            if (acc[product.product.name]) {
                acc[product.product.name] += product.quantity
            } else {
                acc[product.product.name] = product.quantity
            }
        })
        return acc
    }, {} as Record<string, number>)

    const productSalesData = Object.entries(productSales).map(([name, quantity]) => ({ name, quantity }))

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Análise de Compras (2024-09-30 a 2024-10-30)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className='p-4 rounded-md'>
                    <CardHeader>
                        <CardTitle>Total de Compras</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalPurchases}</p>
                    </CardContent>
                </Card>
                <Card className='p-4 rounded-md'>
                    <CardHeader>
                        <CardTitle>Total de Quantidade Vendida</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalQuantity}</p>
                    </CardContent>
                </Card>
                <Card className='p-4 rounded-md'>
                    <CardHeader>
                        <CardTitle>Total de Receita</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">R${(totalRevenue / 100).toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card className='p-4 rounded-md'>
                    <CardHeader>
                        <CardTitle>Valor Médio do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold  text-green-600">R${(averageOrderValue / 100).toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className='p-4 rounded-md'>
                    <CardHeader>
                        <CardTitle>Distribuição de Vendas de Produtos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart width={500} height={300} data={productSalesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="quantity" fill="#8884d8" />
                        </BarChart>
                    </CardContent>
                </Card>
                <Card className='p-4 rounded-md'>
                    <CardHeader>
                        <CardTitle>Gráfico de Pizza de Vendas de Produtos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChart width={500} height={300}>
                            <Pie
                                data={productSalesData}
                                cx={250}
                                cy={150}
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="quantity"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {productSalesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </CardContent>
                </Card>
            </div>

            <Card className='p-4 rounded-md'>
                <CardHeader>
                    <CardTitle>Detalhes da Compra</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {purchases.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{purchase.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(purchase.purchaseDate).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{purchase.client.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {purchase.products.map((product) => (
                                            <div key={product.id}>{product.product.name} (x{product.quantity})</div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        R${(purchase.products.reduce((sum, product) => sum + (product.quantity * product.product.price), 0) / 100).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
export default PurchaseAnalysis;