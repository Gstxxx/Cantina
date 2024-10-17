'use client'
import { useState, useEffect } from 'react'
import { Graphic } from '@/components/card/graphic'
import { TopBuyersChart } from '@/components/chart/top-buyers-chart'
import { useRouter } from 'next/navigation'
import { PurchaseRecord } from 'app/types'
import { Card } from '@/components/card/card'
import { ListPurchases } from "./ListPurchase/ListPurchase"
import * as React from "react"
import { Button } from "@/components/ui/button"
import PurchaseModal from './CreatePurchase/page'
import { submit } from './ListPurchase/fetchPaginate';
import { submit as fetchData } from './ListPurchase/fetch'
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

type DateRange = {
    selection: {
        startDate: Date;
        endDate: Date;
    };
};

const PurchaseAnalysis = () => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const [startDate, setStartDate] = React.useState<Date | undefined>(firstDayOfMonth);
    const [endDate, setEndDate] = React.useState<Date | undefined>(lastDayOfMonth);

    const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
    const [purchasesPaginated, setPurchasesPaginated] = useState<PurchaseRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const fetchPaginatedData = async (page: number) => {
        try {
            if (!startDate?.toISOString().split('T')[0] || !endDate?.toISOString().split('T')[0]) {
                setError('No purchases found for the selected period.');
                return;
            }
            const response = await submit({
                page,
                start: startDate?.toISOString().split('T')[0],
                end: endDate?.toISOString().split('T')[0]
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            if (data === null) {
                setError('No purchases found for the selected period.');
            } else {
                setPurchasesPaginated(data.PurchaseRecord);
                setTotalPages(data.totalPages);
            }
        } catch (err) {
            console.log(err);
            setError('Failed to fetch purchase data');
        } finally {
            setLoading(false);
        }
    };

    const fetchDataUnpaginated = async () => {
        try {
            if (!startDate?.toISOString().split('T')[0] || !endDate?.toISOString().split('T')[0]) {
                setError('No purchases found for the selected period.');
                return;
            }
            const response = await fetchData({
                start: startDate?.toISOString().split('T')[0],
                end: endDate?.toISOString().split('T')[0]
            });

            if (!response.ok) {
                router.push('/auth/login');
                return;
            }

            const data = await response.json();
            if (data === null) {
                setError('No purchases found for the selected period.');
            } else {
                setPurchases(data);
            }
        } catch (err) {
            console.log(err);
            setError('Failed to fetch purchase data');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPaginatedData(currentPage);
        fetchDataUnpaginated();
    }, [currentPage, startDate, endDate]);

    if (loading) return <div className='text-orange-500'>Loading...</div>
    if (error) return <div>Error: {error}</div>

    const totalPurchases = purchases.length
    const totalQuantity = purchases.reduce((sum, purchase) =>
        sum + purchase.products.reduce((pSum, product) => pSum + product.quantity, 0), 0)
    const totalRevenue = purchases.reduce((sum, purchase) =>
        sum + purchase.products.reduce((pSum, product) => pSum + (product.quantity * product.product.price), 0), 0)
    const averageOrderValue = totalRevenue / totalPurchases
    const odervalstring = 'R$' + (averageOrderValue / 100).toFixed(2);
    const totalRevenueFormatted = 'R$' + (totalRevenue / 100).toFixed(2);
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
        const buyerName = purchase.client.name;
        if (acc[buyerName]) {
            acc[buyerName] += 1;
        } else {
            acc[buyerName] = 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const topBuyersData = Object.entries(buyerData)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Get top 10 buyers

    const handleSelect = (ranges: DateRange) => {
        setStartDate(ranges.selection.startDate);
        setEndDate(ranges.selection.endDate);
    };

    const selectionRange = {
        startDate: startDate,
        endDate: endDate,
        key: 'selection',
    };

    return (
        <div className="p-4 space-y-4 text-white ">
            <h1 className="text-3xl font-bold mb-4 text-white">Análise de Compras de <span className='text-orange-500 font-bold text-xl'>{startDate?.toISOString().split('T')[0]}</span> a <span className='text-orange-500 font-bold text-xl'>{endDate?.toISOString().split('T')[0]}</span></h1>

            {isModalOpen && <PurchaseModal />}
            {totalPurchases > 0 && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <Card title="Total de Compras" value={totalPurchases} />
                        <Card title="Total de Quantidade Vendida" value={totalQuantity} />
                        <Card title="Total de Receita" value={totalRevenueFormatted} />
                        <Card title="Valor Médio do Pedido" value={odervalstring} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
                        <div className='flex flex-col gap-4'>

                            <Button className='bg-orange-500 text-white p-4 rounded-md' onClick={toggleModal}>Criar Nova Compra</Button>
                            <DateRangePicker
                                ranges={[selectionRange]}
                                onChange={handleSelect}
                                className="rounded-md border-transparent border-0 bg-[#272b2f] mt-4 p-4 text-black"
                            />
                            <Graphic title="Top 5 produtos vendidos" values={productSalesData} />
                            <TopBuyersChart title="Top 10 compradores" values={topBuyersData} />
                        </div>
                        <UICard className='rounded-lg bg-[#272b2f] border-transparent border-0 w-full max-h-[750px]'>
                            <CardHeader>
                                <CardTitle className="text-orange-500">Lista de Vendas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ListPurchases purchasesData={purchasesPaginated} />
                                <div className="flex justify-between mt-4">
                                    <Button
                                        className='p-4 bg-orange-500 text-white rounded-md disabled:bg-gray-500'
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    >
                                        Anterior
                                    </Button>
                                    <span className='text-orange-500 font-bold text-medium pt-4'>Pagina {currentPage} de {totalPages}</span>
                                    <Button
                                        className='p-4 bg-orange-500 text-white rounded-md disabled:bg-gray-500'
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    >
                                        Próxima
                                    </Button>
                                </div>

                            </CardContent>
                        </UICard>
                    </div>
                </div>
            )
            } {totalPurchases === 0 && (
                <h1 className="text-bold text-3xl text-orange-500">Sem registros nesse periodo</h1>)}
        </div >
    )
}
export default PurchaseAnalysis;
