'use client'
import { useState, useEffect } from 'react'
import { Graphic } from '@/components/card/graphic'
import { PizzaGrafic } from '@/components/card/pizza_grafic'
import { useRouter } from 'next/navigation'
import { PurchaseRecord } from 'app/types'
import { Card } from '@/components/card/card'
import { getCookie } from 'cookies-next'
import { ListPurchases } from "./ListPurchase/ListPurchase"
import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import PurchaseModal from './CreatePurchase/page'

const PurchaseAnalysis = () => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();
    const [startDate, setStartDate] = React.useState<Date | undefined>(firstDayOfMonth);
    const [endDate, setEndDate] = React.useState<Date | undefined>(lastDayOfMonth);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

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
                        start: startDate?.toISOString().split('T')[0],
                        end: endDate?.toISOString().split('T')[0]
                    }),
                })
                if (!response.ok) {
                    router.push('/auth/login')
                }
                const data = await response.json()
                if (data === null) {
                    setError('No purchases found for the selected period.')
                } else {
                    setPurchases(data)
                }
            } catch (err) {
                console.log(err)
                setError('Failed to fetch purchase data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router, startDate, endDate])

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


    return (
        <div className="p-4 space-y-4 text-white ">
            <h1 className="text-3xl font-bold mb-4 text-white">Análise de Compras de <span className='text-orange-500 font-bold text-xl'>{startDate?.toISOString().split('T')[0]}</span> a <span className='text-orange-500 font-bold text-xl'>{endDate?.toISOString().split('T')[0]}</span></h1>
            <div className="flex space-x-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className="rounded-md bg-[#272b2f] text-white p-2 border-transparent border-0">
                            <p className='text-orange-500 font-bold text-medium'>Data Inicio</p>
                            {startDate ? format(startDate, "PPP") : "Data Inicio"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 justify-center bg-[#1f2225] border-transparent border-0" align="start">
                        <p className='text-orange-500 font-bold text-medium'>Data Inicio</p>
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            className="rounded-md border-transparent border-0 bg-[#272b2f] mt-4 p-4 text-white"
                        />
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className="rounded-md bg-[#272b2f] text-white p-2 border-transparent border-0">
                            <p className='text-orange-500 font-bold text-medium'>Data Fim</p>
                            {endDate ? format(endDate, "PPP") : "Data Fim"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 justify-center bg-[#1f2225] border-transparent border-0" align="start">
                        <p className='text-orange-500 font-bold text-medium'>Data Fim</p>
                        <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            className="rounded-md border-transparent border-0 bg-[#272b2f] mt-4 p-4 text-white"
                        />
                    </PopoverContent>
                </Popover>
                <Button className='bg-orange-500 text-white p-4 rounded-md' onClick={toggleModal}>Criar Nova Compra</Button>
            </div>
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
                            <Graphic title="Distribuição de Vendas de Produtos" values={productSalesData} />
                            <PizzaGrafic title="Gráfico de Pizza de Vendas de Produtos" values={productSalesData} />
                        </div>
                        <ListPurchases title="Lista de Vendas" purchases={purchases as PurchaseRecord[]} />
                    </div>
                </div>
            )} {totalPurchases === 0 && (
                <h1 className="text-bold text-3xl text-orange-500">Sem registros nesse periodo</h1>)}
        </div>
    )
}
export default PurchaseAnalysis;