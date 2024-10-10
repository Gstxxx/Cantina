'use client'
import { PurchaseRecord } from 'app/types';
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { submit as submitDeletePurchase } from './delete'
import { submit as submitUpdatePurchase } from './update'
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
    if (intent === "Update-User") {
        const id = Number(formData.get("id")?.toString());
        const clientId = Number(formData.get("clientId")?.toString());
        const products = JSON.parse(formData.get("products")?.toString() || 'null');

        if (!clientId || !products) {
            return { error: "Cliente e produtos são obrigatórios." };
        }

        const result = await submitUpdatePurchase({ id, clientId, products });
        if (result.ok) {
            return { success: "Cliente atualizado com sucesso" };
        }
        return { error: "Cliente não encontrado ou inválido." };
    }

    return { error: "Invalid intent." };
}
export function ListPurchases({ purchasesData }: { purchasesData: PurchaseRecord[] }) {
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<PurchaseRecord | null>(null);

    const handleEdit = (user: PurchaseRecord) => {
        setEditingUser(user);
    };

    const handleDeletePurchase = async (id: number) => {
        const formData = new FormData();
        formData.append("intent", "Delete-User");
        formData.append("id", id.toString());

        const result = await action(formData);
        if ('success' in result) {
            //dale
        } else if ('error' in result) {
            setError(result.error);
        }
    };

    const handleUpdatePurchase = async (formData: FormData) => {
        const result = await action(formData);
        if ('success' in result) {
            //dale
            setEditingUser(null); // Close modal
        } else if ('error' in result) {
            setError(result.error);
        }
    };

    return (

        <div>
            <Table className='max-h-screen overflow-auto h-[500px]' >
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
                <TableBody className='bg-[#222527] border-transparent border-0 p-4 rounded-lg' >
                    {purchasesData.map((purchase) => (
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
                            <TableCell >
                                <DropdownMenu >

                                    <DropdownMenuTrigger asChild >
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
            {
                editingUser && (
                    <div className="fixed inset-0 rounded-lg bg-[#222527]/50 border-transparent border-0 flex items-center justify-center z-50">
                        <div className="rounded-lg bg-[#272b2f] border-transparent border-0 p-6 shadow-lg w-96">
                            <h2 className="text-xl font-bold mb-4 text-orange-500">Editando Compra</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    formData.append("intent", "Update-User");
                                    handleUpdatePurchase(formData);
                                }}
                                className="space-y-4"
                            >
                                <input type="hidden" name="id" value={editingUser.id} />
                                <div>
                                    <label htmlFor="clientId" className="block text-sm font-medium mb-2">ID do Cliente</label>
                                    <input type="text" name="clientId" defaultValue={editingUser.clientId.toString()} className="bg-[#222527] w-full p-2 border-transparent border-0 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="products" className="block text-sm font-medium mb-2">Produtos</label>
                                    <textarea name="products" defaultValue={JSON.stringify(editingUser.products)} className="bg-[#222527] w-full p-2 border-transparent border-0 rounded-md" />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" className='bg-red-500 p-2 hover:bg-red-600' onClick={() => setEditingUser(null)}>Cancelar</Button>
                                    <Button type="submit" className='bg-green-500 p-2 hover:bg-green-600'>Atualizar</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }</div>
    )
}