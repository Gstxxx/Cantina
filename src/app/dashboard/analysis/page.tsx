import { useState, useEffect } from 'react'
import { Graphic } from '@/components/card/graphic'
import { PizzaGrafic } from '@/components/card/pizza_grafic'
import { useRouter } from 'next/navigation'
import { PurchaseRecord } from 'app/types'
import { Card } from '@/components/card/card'
import { getCookie } from 'cookies-next'
import { ListClients } from '@/components/card/list_clients'

const PurchaseAnalysis = () => {
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getCookie('token')?.toString();
                const response = await fetch('/api/purchases/report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        start: "2024-09-30",
                        end: "2024-10-30"
                    }),
                })
                if (!response.ok) {
                    router.push('/auth/login')
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

    if (loading) return <div className='text-orange-500'>Loading...</div>
    if (error) return <div>Error: {error}</div>

    const totalPurchases = purchases.length
    const totalQuantity = purchases.reduce((sum, purchase) =>
        sum + purchase.products.reduce((pSum, product) => pSum + product.quantity, 0), 0)
    const totalRevenue = purchases.reduce((sum, purchase) =>
        sum + purchase.products.reduce((pSum, product) => pSum + (product.quantity * product.product.price), 0), 0)
    const averageOrderValue = totalRevenue / totalPurchases
    const odervalstring = 'R$' + (averageOrderValue / 100).toFixed(2);
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


    return (
        <div className="p-4 space-y-4 text-white ">

            <h1 className="text-3xl font-bold mb-4 text-white">Análise de Compras (2024-09-30 a 2024-10-30)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card title="Total de Compras" value={totalPurchases} />
                <Card title="Total de Quantidade Vendida" value={totalQuantity} />
                <Card title="Total de Receita" value={totalRevenue} />
                <Card title="Valor Médio do Pedido" value={odervalstring} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Graphic title="Distribuição de Vendas de Produtos" values={productSalesData} />
                <PizzaGrafic title="Gráfico de Pizza de Vendas de Produtos" values={productSalesData} />
            </div>

            <ListClients title="Lista de Vendas" purchases={purchases as PurchaseRecord[]} />
        </div>
    )
}
export default PurchaseAnalysis;