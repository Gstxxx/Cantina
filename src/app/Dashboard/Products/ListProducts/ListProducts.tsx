import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { submit as fetchProducts } from './fetch';
import { submit as submitDeleteProduct } from './delete';
import { submit as submitUpdateProduct } from './update';
import Pagination from '@/components/ui/Pagination'
import { ScrollArea } from "@/components/ui/scroll-area";
import CreateProductModal from '../CreateProduct/CreateProductModal';

type Product = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    price: number;
};

export async function action(formData: FormData) {
    const intent = formData.get("intent");

    if (intent === "Delete-Product") {
        const id = Number(formData.get("id")?.toString());

        const result = await submitDeleteProduct({ id });
        if (result.ok) {
            return { success: "Produto deletado com sucesso" };
        }
        return { error: "Produto não encontrado ou inválido." };
    }
    if (intent === "Update-Product") {
        const id = Number(formData.get("id")?.toString());
        const name = formData.get("name")?.toString();
        const price = Number(formData.get("price"));

        if (!name || !price) {
            return { error: "Nome e preço são obrigatórios." };
        }
        const result = await submitUpdateProduct({ id, name, price });
        if (result.ok) {
            return { success: "Produto atualizado com sucesso" };
        }
        return { error: "Produto não encontrado ou inválido." };
    }

    return { error: "Invalid intent." };
}

export default function ListProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingProduct, setEditingUser] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false); // State for modal visibility

    const fetchUsersData = async (page: number) => {
        try {
            const response = await fetchProducts(page);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.products) && data.products !== null) {
                    setProducts(data.products);
                    setTotalPages(data.totalPages);
                } else {
                    setError("Failed to load products.");
                }
            } else {
                const errorData = await response.json();
                setError('error' in errorData ? errorData.error : "Failed to fetch products from the server.");
            }
        } catch (error) {
            setError(`An error occurred while fetching the products: ${error}`);
        }
    };

    useEffect(() => {
        fetchUsersData(currentPage);
    }, [currentPage]);

    const handleEditUser = (product: Product) => {
        setEditingUser(product);
    };

    const handleDeleteUser = async (id: number) => {
        const formData = new FormData();
        formData.append("intent", "Delete-Product"); // Corrected intent
        formData.append("id", id.toString());

        const result = await action(formData);
        if ('success' in result) {
            fetchUsersData(currentPage);
        } else if ('error' in result) {
            setError(result.error);
        }
    };

    const handleUpdateUser = async (formData: FormData) => {
        const result = await action(formData);
        if ('success' in result) {
            fetchUsersData(currentPage);
            setEditingUser(null);
        } else if ('error' in result) {
            setError(result.error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatPrice = (priceInCents: number) => {
        return (priceInCents / 100).toFixed(2);
    };

    const filteredUsers = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.id.toString().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });
    }, [products, searchTerm]);

    return (

        <div>
            <Card className="w-full mx-auto bg-white shadow-md border-transparent border-0 rounded-lg">
                <CardHeader>
                    <div className="flex flex-row justify-between gap-4">
                        <CardTitle className='text-gray-500'>Administrar produtos</CardTitle>
                        <Button
                            className='bg-[#ffa500] text-white p-2 rounded-md mt-2 sm:mt-0'
                            onClick={() => setIsCreateProductModalOpen(true)} // Open modal on click
                        >
                            Criar Novo Produto
                        </Button>
                    </div>
                    <CardDescription className='text-gray-500'>Ver e atualizar produtos</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <div className="text-red-500">{error}</div>}


                    <input
                        type="text"
                        placeholder="Procurar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4 p-2 border-none bg-gray-100 rounded-lg"
                    />
                    <ScrollArea className='max-h-screen overflow-auto h-[400px]'>
                        <Table>
                            <TableHeader className='border'>
                                <TableRow>
                                    <TableHead className='w-[200px] text-gray-500'>Nome</TableHead>
                                    <TableHead className='w-[200px] text-gray-500'>Preço</TableHead>
                                    <TableHead className='w-[200px] text-gray-500'>Criado em</TableHead>
                                    <TableHead className='w-[200px] text-gray-500'>Ações</TableHead>
                                </TableRow >
                            </TableHeader >
                            <TableBody className='border'>
                                {filteredUsers.map((product) => (
                                    <TableRow className='font-medium text-gray-400 bg-gray-100 border' key={product.id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>R$ {formatPrice(product.price)}</TableCell>
                                        <TableCell>{formatDate(product.created_at)}</TableCell>
                                        <TableCell >
                                            <DropdownMenu >
                                                <DropdownMenuTrigger asChild >
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir Menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    className="bg-[#272b2f] border-transparent border-0 p-4" align="end">
                                                    <DropdownMenuItem className="text-white" onClick={() => handleEditUser(product)}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (window.confirm('Você deseja deletar o produto?')) {
                                                                handleDeleteUser(product.id);
                                                            }
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        Deletar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table >
                        {editingProduct && (
                            <div className="fixed inset-0 rounded-lg bg-[#222527]/50 border-transparent border-0 flex items-center justify-center z-50">
                                <div className="rounded-lg bg-[#272b2f] border-transparent border-0 p-6 shadow-lg w-96">
                                    <h2 className="text-xl font-bold mb-4 text-orange-500">Editando Produto</h2>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            formData.append("intent", "Update-Product");
                                            const priceInCents = Number(formData.get("price")) * 100;
                                            formData.set("price", priceInCents.toString());
                                            handleUpdateUser(formData);
                                        }}
                                        className="space-y-4"
                                    >
                                        <input type="hidden" name="id" value={editingProduct.id} />
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium mb-2">Nome</label>
                                            <input type="text" name="name" defaultValue={editingProduct.name} className="bg-[#222527] w-full p-2 border-transparent border-0 rounded-md" />
                                        </div>
                                        <div>
                                            <label htmlFor="price" className="block text-sm font-medium mb-2">Preço</label>
                                            <Input
                                                className='bg-[#222527] border-transparent border-0 p-4 active:border-orange-500 mt-4'
                                                type="number"
                                                placeholder="Preço"
                                                name="price"
                                                defaultValue={(editingProduct.price / 100).toFixed(2)}
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" className='bg-red-500 p-2 hover:bg-red-600' onClick={() => setEditingUser(null)}>Cancelar</Button>
                                            <Button type="submit" className='bg-green-500 p-2 hover:bg-green-600'>Atualizar</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                        }
                    </ScrollArea>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </CardContent >
            </Card >
            {isCreateProductModalOpen && <CreateProductModal />} {/* Render modal conditionally */}
        </div >
    );
}
