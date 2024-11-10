'use client'
import { PurchaseRecord } from 'app/types';
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2Icon,Edit2Icon } from "lucide-react";
import { submit as submitDeletePurchase } from './delete';
import { submit as submitSearchPurchase } from './search';
import  PurchaseModal from '../UpdatePurchase/page';
import { ScrollArea } from "@/components/ui/scroll-area";

export async function action(formData: FormData) {
    const intent = formData.get("intent");

    if (intent === "Delete-User") {
        const id = Number(formData.get("id")?.toString());

        const result = await submitDeletePurchase({ purchaseId: id });
        if (result.ok) {
            return { success: "Cliente deletado com sucesso" };
        }
        return { error: "Cliente não encontrado ou inválido." };
    }

    return { error: "Invalid intent." };
}

export function ListPurchases({ purchasesData }: { purchasesData: PurchaseRecord[] }) {
    const [, setError] = useState<string | null>(null);
    const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredPurchases, setFilteredPurchases] = useState<PurchaseRecord[]>(purchasesData);

    useEffect(() => {
        setFilteredPurchases(purchasesData);
    }, [purchasesData]);

    const handleEdit = (purchase: PurchaseRecord) => {
        setEditingPurchase(purchase);
    };

    const handleDeletePurchase = async (id: number) => {
        const formData = new FormData();
        formData.append("intent", "Delete-User");
        formData.append("id", id.toString());

        const result = await action(formData);
        if ('success' in result) {
        } else if ('error' in result) {
            setError(result.error);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        try {
            const result = await submitSearchPurchase(query);
            if (result.ok) {
                const purchases = await result.json();
                setFilteredPurchases(purchases);
            } else {
                setError('Failed to fetch search results.');
            }
        } catch {
            setError('An error occurred while searching.');
        }
    };

    return (
        <div >
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Pesquisar compras..."
                className="mb-4 p-2 border-none bg-gray-100 rounded-lg"
            />
            <ScrollArea className='max-h-screen overflow-auto h-[400px]'>
                <Table>
                    <TableHeader className='border'>
                        <TableRow>
                            <TableHead className="w-[200px] text-gray-500">ID</TableHead>
                            <TableHead className="w-[200px] text-gray-500">Data</TableHead>
                            <TableHead className="w-[200px] text-gray-500">Cliente</TableHead>
                            <TableHead className="w-[200px] text-gray-500">Produtos</TableHead>
                            <TableHead className="w-[200px] text-gray-500">Total</TableHead>
                            <TableHead className="w-[200px] text-gray-500">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='border'>
                        {filteredPurchases.map((purchase) => (
                            <TableRow className='font-medium text-gray-400 bg-gray-100 border' key={purchase.id}>
                                <TableCell>{purchase.id}</TableCell>
                                <TableCell>{new Date(purchase.purchaseDate).toLocaleString()}</TableCell>
                                <TableCell>{purchase.client.name}</TableCell>
                                <TableCell>
                                    {purchase.products.map((product) => (
                                        <div key={product.id} >{product.product.name} (x{product.quantity})</div>
                                    ))}
                                </TableCell>
                                <TableCell>
                                    R${(purchase.products.reduce((sum, product) => sum + (product.quantity * product.product.price), 0) / 100).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <div className='flex flex-row gap-2'>
                                        <a className='cursor-pointer p-1 bg-green-500 hover:bg-green-700 rounded-md border-none text-white' onClick={() => handleEdit(purchase)}><Edit2Icon size={20} /></a>
                                        <a className='cursor-pointer p-1 bg-red-500 hover:bg-red-700 rounded-md border-none' onClick={() => {
                                        if (window.confirm('Você deseja deletar a compra?')) {
                                            handleDeletePurchase(purchase.id);
                                        }
                                        }}><Trash2Icon className='text-white'size={20}/></a>      
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
            {editingPurchase && (
                <PurchaseModal 
                    purchaseId={editingPurchase.id}
                    onClose={() => setEditingPurchase(null)}
                />
            )}
        </div>
    );
}
