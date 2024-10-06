import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseRecord } from 'app/types';

export function ListClients({ title, purchases }: { title: string, purchases: PurchaseRecord[] }) {
    return (

        <Card className='rounded-lg bg-[#272b2f] border-transparent border-0 w-full'>
            <CardHeader>
                <CardTitle className="text-orange-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="min-w-full divide-y divide-gray-200 ">
                    <thead >
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Produtos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-272b2f divide-y divide-gray-200">
                        {purchases.map((purchase) => (
                            <tr key={purchase.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-orange-500">{purchase.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-orange-500">{new Date(purchase.purchaseDate).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-orange-500">{purchase.client.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-orange-500">
                                    {purchase.products.map((product) => (
                                        <div key={product.id} className="text-orange-500">{product.product.name} (x{product.quantity})</div>
                                    ))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-orange-500">
                                    R${(purchase.products.reduce((sum, product) => sum + (product.quantity * product.product.price), 0) / 100).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
}
