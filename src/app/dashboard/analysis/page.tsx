'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { refreshToken, submit as submitRefresh } from "../refresh"
import { useRouter } from 'next/navigation'
import { PurchaseRecord } from 'app/types'

const PurchaseAnalysis = () => {
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/purchases/report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        start: "2024-09-30",
                        end: "2024-10-30"
                    }),
                })
                if (!response.ok) {
                    const isLogged = await refreshToken();
                    if (!isLogged) {
                        router.push('/auth/login')
                    }
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
    }, [router])

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

    const COLORS = ['#bb86fc', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

    return (
        <div className="p-4 space-y-4 text-white ">

            <h1 className="text-2xl font-bold mb-4 text-[#bb86fc]">Análise de Compras (2024-09-30 a 2024-10-30)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className='p-4 rounded-md bg-[#332e3d]'>
                    <CardHeader>
                        <CardTitle className="text-[#bb86fc]">Total de Compras</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-[#bb86fc]">{totalPurchases}</p>
                    </CardContent>
                </Card>
                <Card className='p-4 rounded-md bg-[#332e3d]'>
                    <CardHeader>
                        <CardTitle className="text-[#bb86fc]">Total de Quantidade Vendida</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-[#bb86fc]">{totalQuantity}</p>
                    </CardContent>
                </Card>
                <Card className='p-4 rounded-md bg-[#332e3d]'>
                    <CardHeader>
                        <CardTitle className="text-[#bb86fc]">Total de Receita</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-[#bb86fc]">R${(totalRevenue / 100).toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card className='p-4 rounded-md bg-[#332e3d]'>
                    <CardHeader>
                        <CardTitle className="text-[#bb86fc]">Valor Médio do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-[#bb86fc]">R${(averageOrderValue / 100).toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className='p-4 rounded-md bg-[#332e3d]'>
                    <CardHeader>
                        <CardTitle className="text-[#bb86fc]">Distribuição de Vendas de Produtos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart width={500} height={300} data={productSalesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="quantity" fill="#bb86fc" />
                        </BarChart>
                    </CardContent>
                </Card>
                <Card className='p-4 rounded-md bg-[#332e3d]'>
                    <CardHeader>
                        <CardTitle className="text-[#bb86fc]">Gráfico de Pizza de Vendas de Produtos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChart width={500} height={300}>
                            <Pie
                                data={productSalesData}
                                cx={250}
                                cy={150}
                                labelLine={false}
                                outerRadius={80}
                                fill="#FFFFFF"
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

            <Card className='p-4 rounded-md bg-[#332e3d]'>
                <CardHeader>
                    <CardTitle className="text-[#bb86fc]">Detalhes da Compra</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="min-w-full divide-y divide-gray-200 bg-[#332e3d]">
                        <thead className="bg-[#332e3d]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#bb86fc] uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#bb86fc] uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#bb86fc] uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#bb86fc] uppercase tracking-wider">Produtos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#bb86fc] uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#332e3d] divide-y divide-gray-200">
                            {purchases.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-[#bb86fc]">{purchase.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[#bb86fc]">{new Date(purchase.purchaseDate).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[#bb86fc]">{purchase.client.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[#bb86fc]">
                                        {purchase.products.map((product) => (
                                            <div key={product.id} className="text-[#bb86fc]">{product.product.name} (x{product.quantity})</div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[#bb86fc]">
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