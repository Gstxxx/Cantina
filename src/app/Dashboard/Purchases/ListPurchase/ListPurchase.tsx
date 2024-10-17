'use client'
import { PurchaseRecord } from 'app/types';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { submit as submitDeletePurchase } from './delete';
import UpdatePurchaseModal from '../UpdatePurchase/page';

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
    const [error, setError] = useState<string | null>(null);
    const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredPurchases, setFilteredPurchases] = useState<PurchaseRecord[]>(purchasesData);

    const handleEdit = (purchase: PurchaseRecord) => {
        setEditingPurchase(purchase);
    };

    const handleDeletePurchase = async (id: number) => {
        const formData = new FormData();
        formData.append("intent", "Delete-User");
        formData.append("id", id.toString());

        const result = await action(formData);
        if ('success' in result) {
            // Handle success
        } else if ('error' in result) {
            setError(result.error);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        try {
            const response = await fetch(`/api/purchases/search?query=${query}`);
            if (response.ok) {
                const data: PurchaseRecord[] = await response.json();
                setFilteredPurchases(data);
            } else {
                setError('Failed to fetch search results.');
            }
        } catch (error) {
            setError('An error occurred while searching.');
        }
    };

    return (
        <div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search purchases..."
                className="mb-4 p-2 border rounded"
            />
            <Table className='max-h-screen overflow-auto h-[500px]'>
                <TableHeader>
                    <TableRow className='bg-[#222527]/50 border-transparent border-0 p-4 rounded-lg py-8'>
                        <TableHead className='text-orange-500'>ID</TableHead>
                        <TableHead className='text-orange-500'>Data</TableHead>
                        <TableHead className='text-orange-500'>Cliente</TableHead>
                        <TableHead className='text-orange-500'>Produtos</TableHead>
                        <TableHead className='text-orange-500'>Total</TableHead>
                        <TableHead className='text-orange-500'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className='bg-[#222527] border-transparent border-0 p-4 rounded-lg'>
                    {filteredPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                            <TableCell>{purchase.id}</TableCell>
                            <TableCell>{new Date(purchase.purchaseDate).toLocaleString()}</TableCell>
                            <TableCell>{purchase.client.name}</TableCell>
                            <TableCell>
                                {purchase.products.map((product) => (
                                    <div key={product.id} className="text-white-500">{product.product.name} (x{product.quantity})</div>
                                ))}
                            </TableCell>
                            <TableCell>
                                R${(purchase.products.reduce((sum, product) => sum + (product.quantity * product.product.price), 0) / 100).toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir Menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="bg-[#272b2f] border-transparent border-0 py-4 px-2 flex flex-col" align="end">
                                        <DropdownMenuItem className="text-white" onClick={() => handleEdit(purchase)}>
                                            <button className="text-white p-2 bg-green-500 hover:bg-green-700 rounded-md mb-2 w-full">Editar</button>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (window.confirm('Você deseja deletar a compra?')) {
                                                    handleDeletePurchase(purchase.id);
                                                }
                                            }}
                                            className="text-red-600"
                                        >
                                            <button className="text-white p-2 bg-red-500 hover:bg-red-700 rounded-md w-full">Deletar</button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {editingPurchase && (
                <UpdatePurchaseModal purchase={editingPurchase} />
            )}
        </div>
    );
}
