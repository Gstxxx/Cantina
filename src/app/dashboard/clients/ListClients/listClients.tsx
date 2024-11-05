import React, { useEffect, useState, useMemo } from 'react';
import { Client } from 'app/types';
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
import { submit as fetchUsers } from './fetch';
import { submit as submitDeleteUser } from './delete';
import { submit as submitUpdateUser } from './update';
import { submit as submitGeneratePDF } from './generatePdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { submit as searchUsers } from './search';
import { ScrollArea } from "@/components/ui/scroll-area";
import Pagination from '@/components/ui/Pagination'
import CreateClientModal from '../CreateClient/CreateClient';


export async function action(formData: FormData) {
    const intent = formData.get("intent");

    if (intent === "Delete-User") {
        const id = Number(formData.get("id")?.toString());

        const result = await submitDeleteUser({ id });
        if (result.ok) {
            return { success: "Cliente deletado com sucesso" };
        }
        return { error: "Cliente não encontrado ou inválido." };
    }
    if (intent === "Update-User") {
        const id = Number(formData.get("id")?.toString());
        const name = formData.get("name")?.toString();
        const phone = formData.get("phone")?.toString();

        if (!name || !phone) {
            return { error: "Nome e telefone são obrigatórios." };
        }

        const result = await submitUpdateUser({ id, name, phone });
        if (result.ok) {
            return { success: "Cliente atualizado com sucesso" };
        }
        return { error: "Cliente não encontrado ou inválido." };
    }
    if (intent === "Generate-PDF") {
        const clientId = Number(formData.get("clientId")?.toString());
        const currentDate = new Date();
        const start = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1).toString().padStart(2, '0') + '-01';
        const end = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1).toString().padStart(2, '0') + '-' + currentDate.getDate().toString().padStart(2, '0');
        const result = await submitGeneratePDF({ clientId, start, end });
        if (result.ok) {
            return { success: "PDF gerado com sucesso" };
        }
        return { error: "PDF não encontrado ou inválido." };
    }
    return { error: "Invalid intent." };
}

export default function ListUsers() {
    const [users, setUsers] = useState<Client[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<Client | null>(null);
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const [startDate, setStartDate] = React.useState<Date | undefined>(firstDayOfMonth);
    const [endDate, setEndDate] = React.useState<Date | undefined>(lastDayOfMonth);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);

    const fetchPDF = async (id: number) => {
        try {
            if (!startDate?.toISOString().split('T')[0] || !endDate?.toISOString().split('T')[0]) {
                setError('No purchases found for the selected period.');
                return;
            }
            const response = await submitGeneratePDF({
                clientId: id,
                start: startDate?.toISOString().split('T')[0],
                end: endDate?.toISOString().split('T')[0]
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            console.log(data);

            if (data === null) {
                setError('No purchases found for the selected period.');
            } else {
                const pdfDoc = await PDFDocument.create();
                const page = pdfDoc.addPage([600, 400]);
                const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

                // Draw header
                page.drawText(data.client.name, {
                    x: 50,
                    y: 370,
                    size: 12,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });
                const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                page.drawText(`${months[startDate.getMonth()]} ${startDate.getFullYear()}`, {
                    x: 450,
                    y: 370,
                    size: 12,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });

                // Draw table header
                page.drawText('Produto', { x: 50, y: 340, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });
                page.drawText('Data', { x: 150, y: 340, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });
                page.drawText('Quantidade', { x: 250, y: 340, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });
                page.drawText('Valor', { x: 350, y: 340, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });
                page.drawText('Total', { x: 450, y: 340, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });

                let yPosition = 320;
                let totalAmount = 0;

                data.purchases.forEach(purchase => {
                    purchase.products.forEach(product => {
                        const total = product.quantity * product.price;
                        totalAmount += total;

                        page.drawText(product.name, { x: 50, y: yPosition, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });
                        page.drawText(new Date(purchase.date).toLocaleDateString(), { x: 150, y: yPosition, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });
                        page.drawText(product.quantity.toString(), { x: 250, y: yPosition, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });
                        page.drawText(`R$${(product.price / 100).toFixed(2)}`, { x: 350, y: yPosition, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });
                        page.drawText(`R$${(purchase.products.reduce((sum, product) => sum + (product.quantity * product.price), 0) / 100).toFixed(2)}`, { x: 450, y: yPosition, size: 10, font: timesRomanFont, color: rgb(0, 0, 0) });

                        yPosition -= 20;
                    });
                });

                // Draw total amount
                page.drawText(`Valor total a pagar: R$${(totalAmount / 100).toFixed(2)}`, {
                    x: 50,
                    y: yPosition - 20,
                    size: 12,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                // Format the client's name for the filename
                const formattedName = data.client.name.toLowerCase().replace(/\s+/g, '_');
                const a = document.createElement('a');
                a.href = url;
                a.download = `${formattedName}_purchases.pdf`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.log(err);
            setError('Failed to fetch purchase data');
        }
    };
    const fetchUsersData = async (page: number) => {
        try {
            const response = await fetchUsers(page);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.clients) && data.clients !== null) {
                    const clientsWithPurchases = data.clients.map(client => ({
                        ...client,
                        purchases: client.purchases || []
                    }));
                    setUsers(clientsWithPurchases as Client[]);
                    setTotalPages(data.totalPages);
                    setTotalCount(data.totalCount);
                } else {
                    setError("Failed to load users.");
                }
            } else {
                const errorData = await response.json();
                setError('error' in errorData ? errorData.error : "Failed to fetch users from the server.");
            }
        } catch (error) {
            setError(`An error occurred while fetching the users: ${error}`);
        }
    };

    useEffect(() => {
        if (searchTerm) {
            fetchSearchedUsersData(searchTerm);
        } else {
            fetchUsersData(currentPage);
        }
    }, [currentPage, searchTerm]);

    const handleEditUser = (user: Client) => {
        setEditingUser(user);
    };

    const handleDeleteUser = async (id: number) => {
        const formData = new FormData();
        formData.append("intent", "Delete-User");
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

    const handleGeneratePDF = async (id: number) => {
        const formData = new FormData();
        formData.append("intent", "Generate-PDF");
        formData.append("clientId", id.toString());

        fetchPDF(id);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });
    }, [users, searchTerm]);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        fetchUsersData(pageNumber);
        window.scrollTo(0, 0);
    };

    const fetchSearchedUsersData = async (search: string) => {
        try {
            const response = await searchUsers(search);

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.clients) && data.clients !== null) {
                    const clientsWithPurchases = data.clients.map(client => ({
                        ...client,
                        purchases: client.purchases || []
                    }));
                    setUsers(clientsWithPurchases as Client[]);
                    setTotalPages(1);
                    setTotalCount(clientsWithPurchases.length);
                } else {
                    setError("No clients found.");
                }
            } else {
                const errorData = await response.json();
                setError('error' in errorData ? errorData.error : "Failed to fetch users from the server.");
            }
        } catch (error) {
            setError(`An error occurred while fetching the users: ${error}`);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div>
            <Card className="w-full mx-auto bg-white shadow-md border-transparent border-0 rounded-lg">
                <CardHeader>
                    <div className="flex flex-row justify-between gap-4">
                        <CardTitle className='text-gray-500'>Administrar Clientes</CardTitle>
                        <Button
                            className='bg-[#ffa500] text-white p-2 rounded-md mt-2 sm:mt-0'
                            onClick={() => setIsCreateClientModalOpen(true)}
                        >
                            Criar Novo Cliente
                        </Button>
                    </div>
                    <CardDescription className='text-gray-500'>Ver e atualizar clientes</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <div className="text-red-500">{error}</div>}
                    <input
                        type="text"
                        placeholder="Procurar clientes..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="mb-4 p-2 border-none bg-gray-100 rounded-lg"
                    />
                    <ScrollArea className='max-h-screen overflow-auto h-[400px]'>
                        <Table>
                            <TableHeader className='border'>
                                <TableRow>
                                    <TableHead className='w-[200px] text-gray-500'>Nome</TableHead>
                                    <TableHead className='w-[200px] text-gray-500'>Celular</TableHead>
                                    <TableHead className='w-[200px] text-gray-500'>Criado em</TableHead>
                                    <TableHead className='w-[200px] text-gray-500'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className='border'>
                                {filteredUsers.map((user) => (
                                    <TableRow className='font-medium text-gray-400 bg-gray-100 border' key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>{formatDate(user.created_at)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir Menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    className="bg-[#272b2f] border-transparent border-0 p-4" align="end">
                                                    <DropdownMenuItem className="text-white" onClick={() => handleEditUser(user)}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (window.confirm('Você deseja deletar o produto?')) {
                                                                handleDeleteUser(user.id);
                                                            }
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        Deletar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleGeneratePDF(user.id)}
                                                        className="text-blue-600"
                                                    >
                                                        Gerar PDF
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {editingUser && (
                            <div className="fixed inset-0 rounded-lg bg-[#222527]/50 border-transparent border-0 flex items-center justify-center z-50">
                                <div className="rounded-lg bg-[#272b2f] border-transparent border-0 p-6 shadow-lg w-96">
                                    <h2 className="text-xl font-bold mb-4 text-orange-500">Editando Cliente</h2>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            formData.append("intent", "Update-User");
                                            handleUpdateUser(formData);
                                        }}
                                        className="space-y-4"
                                    >
                                        <input type="hidden" name="id" value={editingUser.id} />
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium mb-2">Nome</label>
                                            <input type="text" name="name" defaultValue={editingUser.name} className="bg-[#222527] w-full p-2 border-transparent border-0 rounded-md" />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium mb-2">Celular</label>
                                            <input type="text" name="phone" defaultValue={editingUser.phone} className="bg-[#222527] w-full p-2 border-transparent border-0 rounded-md" />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" className='bg-red-500 p-2 hover:bg-red-600' onClick={() => setEditingUser(null)}>Cancelar</Button>
                                            <Button type="submit" className='bg-green-500 p-2 hover:bg-green-600'>Atualizar</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </CardContent>
            </Card>
            {isCreateClientModalOpen && <CreateClientModal />}
        </div>
    );
}
