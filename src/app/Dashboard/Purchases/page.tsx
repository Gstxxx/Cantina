'use client'
import { useState, useEffect } from 'react'
import { Graphic } from '@/components/card/graphic'
import { TopBuyersChart } from '@/components/chart/top-buyers-chart'
import { useRouter } from 'next/navigation'
import { PurchaseRecord } from 'app/types'
import { Card } from '@/components/card/card'
import { ListPurchases } from "./ListPurchase/ListPurchase"
import { submit } from './ListPurchase/fetchPaginate'
import { submit as fetchData } from './ListPurchase/fetch'
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DateRangePicker } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import './range-date.css'
import Pagination from '@/components/ui/Pagination'
import { ptBR } from 'date-fns/locale'
import { ScrollArea } from '@/components/ui/scroll-area'
import Loading from '@/components/ui/loading'
import { ErrorAlert } from '@/components/ui/notify' // Import the ErrorAlert component

type DateRange = {
    selection: {
        startDate: Date
        endDate: Date
    }
}

const PurchaseAnalysis = () => {
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const [startDate, setStartDate] = useState<Date | undefined>(firstDayOfMonth)
    const [endDate, setEndDate] = useState<Date | undefined>(lastDayOfMonth)

    const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
    const [purchasesPaginated, setPurchasesPaginated] = useState<PurchaseRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const fetchPaginatedData = async (page: number) => {
        try {
            if (!startDate || !endDate) {
                setError('No purchases found for the selected period.')
                return
            }
            const response = await submit({
                page,
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            })

            if (!response.ok) return

            const data = await response.json()
            if (!data) {
                setError('No purchases found for the selected period.')
            } else {
                setPurchasesPaginated(data.PurchaseRecord)
                setTotalPages(data.totalPages)
            }
        } catch (err) {
            console.error(err)
            setError('Failed to fetch purchase data')
        } finally {
            setLoading(false)
        }
    }

    const fetchDataUnpaginated = async () => {
        try {
            if (!startDate || !endDate) {
                setError('No purchases found for the selected period.')
                return
            }
            const response = await fetchData({
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            })

            if (!response.ok) {
                router.push('/auth/login')
                return
            }

            const data = await response.json()
            if (!data) {
                setError('No purchases found for the selected period.')
            } else {
                setPurchases(data)
            }
        } catch (err) {
            console.error(err)
            setError('Failed to fetch purchase data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchDataWithDelay = async () => {
            setLoading(true)
            await new Promise(resolve => setTimeout(resolve, 500))
            await fetchPaginatedData(currentPage)
            await fetchDataUnpaginated()
        }
        fetchDataWithDelay()
    }, [currentPage, startDate, endDate])

    if (loading) return <Loading />

    if (error) return <div>Error: {error}</div>

    const totalPurchases = purchases.length
    const totalQuantity = purchases.reduce((sum, purchase) =>
        sum + purchase.products.reduce((pSum, product) => pSum + product.quantity, 0), 0)
    const totalRevenue = purchases.reduce((sum, purchase) =>
        sum + purchase.products.reduce((pSum, product) => pSum + (product.quantity * product.product.price), 0), 0)
    const averageOrderValue = totalRevenue / totalPurchases || 0
    const odervalstring = 'R$' + (averageOrderValue / 100).toFixed(2)
    const totalRevenueFormatted = 'R$' + (totalRevenue / 100).toFixed(2)
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
    const buyerData = purchases.reduce((acc, purchase) => {
        const buyerName = purchase.client.name
        if (acc[buyerName]) {
            acc[buyerName] += 1
        } else {
            acc[buyerName] = 1
        }
        return acc
    }, {} as Record<string, number>)

    const topBuyersData = Object.entries(buyerData)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    const handleSelect = (ranges: DateRange) => {
        setStartDate(ranges.selection.startDate)
        setEndDate(ranges.selection.endDate)
    }

    const selectionRange = {
        startDate,
        endDate,
        key: 'selection',
    }

    return (
        <div className="chart-wrapper mx-auto flex max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
            {error && <ErrorAlert message={error} duration={5000} />}
            <div className="grid w-full gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mb-4">
                <Card title="Total de Compras" value={totalPurchases < 0 ? "nenhuma venda" : totalPurchases} colorIcon="text-blue-500" colorBg="bg-blue-500/50" icon="ShoppingCart" />
                <Card title="Total de Quantidade Vendida" value={totalPurchases < 0 ? "nenhuma venda" : totalQuantity} colorIcon="text-green-500" colorBg="bg-green-500/50" icon="Package" />
                <Card title="Total de Receita" value={totalPurchases < 0 ? "nenhuma venda" : totalRevenueFormatted} colorIcon='text-yellow-500' colorBg='bg-yellow-500/50' icon="DollarSign" />
                <Card title="Valor Médio do Pedido" value={totalPurchases < 0 ? "nenhuma venda" : odervalstring} colorIcon='text-purple-500' colorBg='bg-purple-500/50' icon="TrendingUp" />
            </div>
            <div className="grid w-full gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mb-4">
                <DateRangePicker
                    className='rounded-lg bg-white shadow-md border-transparent border-0 w-full max-h-[650px] overflow-auto justify-center p-2 text-sm'
                    ranges={[selectionRange]}
                    onChange={handleSelect}
                    rangeColors={['#eb7316']}
                    locale={ptBR}
                />
                {totalPurchases > 0 && (
                    <>
                        <Graphic title="Top 5 produtos vendidos" values={productSalesData} size="small" />
                        <TopBuyersChart title="Top 5 compradores" values={topBuyersData} size="small" />
                    </>
                )}
            </div>
            {totalPurchases > 0 ? (
                <UICard className="w-full mx-auto bg-white shadow-md border-transparent border-0 rounded-lg">
                    <CardHeader>
                        <div className="flex flex-row justify-between gap-4">
                            <CardTitle className='text-gray-500'>Compras Recentes</CardTitle>
                        </div>
                        <CardDescription className='text-gray-500'>Abaixo estão listadas as compras realizadas no período selecionado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ListPurchases purchasesData={purchasesPaginated} />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </CardContent>
                </UICard>
            ) : (
                <div className='text-orange-500'>Nenhuma venda encontrada para o período selecionado.</div>
            )}
        </div>
    )
}

export default PurchaseAnalysis
