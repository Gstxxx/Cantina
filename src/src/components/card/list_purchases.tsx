'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseRecord } from 'app/types';
import { getCookie } from 'cookies-next';
import React, { useState } from 'react';

export function ListPurchases({ title, purchases }: { title: string, purchases: PurchaseRecord[] }) {
    const [error, setError] = useState<string | null>(null);

    async function handleUpdate(id: number) {
        try {
            const token = getCookie('token')?.toString();
            const response = await fetch(`/api/purchases/edit/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update purchase');
            }
            const data = await response.json();
            console.log('Purchase updated successfully:', data);
            setError(null);
        } catch (error) {
            console.error('Error updating purchase:', error);
            setError('Failed to update purchase');
        }
    }
    async function handleDelete(id: number) {
        try {
            const token = getCookie('token')?.toString();
            const response = await fetch(`/api/purchases/delete/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!response.ok) {
                throw new Error('Failed to delete purchase');
            }
            const data = await response.json();
            console.log('Purchase deleted successfully:', data);
            setError(null); // Clear error state on success
        } catch (error) {
            console.error('Error deleting purchase:', error);
            setError('Failed to delete purchase'); // Update error state on failure
        }
    }
    return (
        <Card className='rounded-lg bg-[#272b2f] border-transparent border-0 w-full'>
            <CardHeader>
                <CardTitle className="text-orange-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <table className='w-full'>
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Produtos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-272b2f">
                        {purchases.map((purchase) => (
                            <tr key={purchase.id}>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-white-500">{purchase.id}</td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-white-500">{new Date(purchase.purchaseDate).toLocaleString()}</td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-white-500">{purchase.client.name}</td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-white-500">
                                    {purchase.products.map((product) => (
                                        <div key={product.id} className="text-white-500">{product.product.name} (x{product.quantity})</div>
                                    ))}
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-green-500">
                                    R${(purchase.products.reduce((sum, product) => sum + (product.quantity * product.product.price), 0) / 100).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-white-500">
                                    <button onClick={() => handleUpdate(purchase.id)} className="text-blue-500 hover:underline">Update</button>
                                    <button onClick={() => handleDelete(purchase.id)} className="text-red-500 hover:underline ml-2">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {error && <div className="text-red-500">{error}</div>}
            </CardContent>
        </Card>
    )
}
