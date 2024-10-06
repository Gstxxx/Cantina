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

    return { error: "Invalid intent." };
}

export default function ListUsers() {
    const [users, setUsers] = useState<Client[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

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
        fetchUsersData(currentPage);
    }, [currentPage]);

    const handleEditUser = (user: Client) => {
        setEditingUser(user);
    };

    const handleDeleteUser = async (id: number) => {
        const formData = new FormData();
        formData.append("intent", "Delete-User");
        formData.append("id", id.toString());

        const result = await action(formData);
        if ('success' in result) {
            fetchUsersData(currentPage); // Refresh user list
        } else if ('error' in result) {
            setError(result.error);
        }
    };

    const handleUpdateUser = async (formData: FormData) => {
        const result = await action(formData);
        if ('success' in result) {
            fetchUsersData(currentPage); // Refresh user list
            setEditingUser(null); // Close modal
        } else if ('error' in result) {
            setError(result.error);
        }
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

    return (
        <div className='rounded-lg bg-[#272b2f] border-transparent border-0 max-h-[80vh] overflow-auto'>
            <Card className='rounded-lg bg-[#272b2f] border-transparent border-0'>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-orange-500">Administrar Clientes</CardTitle>
                    <CardDescription>Ver e atualizar clientes</CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto">
                    {error && <div className="text-red-500">{error}</div>}

                    <div className="flex space-x-2 mb-4">
                        <Input
                            placeholder="Procurar clientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm bg-[#222527] border-transparent border-0 p-4 active:border-orange-500"
                        />
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='text-orange-500'>Nome</TableHead>
                                <TableHead className='text-orange-500'>Celular</TableHead>
                                <TableHead className='text-orange-500'>Criado em</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className='bg-[#222527] border-transparent border-0 p-4 rounded-lg'>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>{formatDate(user.created_at)}</TableCell>
                                    <TableCell >
                                        <DropdownMenu >

                                            <DropdownMenuTrigger asChild >
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir Menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="bg-[#222527] border-transparent border-0 p-4" align="end">
                                                <DropdownMenuItem className="text-white" onClick={() => handleEditUser(user)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (window.confirm('Você deseja deletar o cliente?')) {
                                                            handleDeleteUser(user.id);
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

                </CardContent>
                <div className="mt-4 flex justify-center items-center space-x-2">
                    <Button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className=' p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500/50 text-white/50'
                    >
                        Anterior
                    </Button>
                    <span>Pagina {currentPage} de {totalPages}</span>
                    <Button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className=' p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500/50 text-white/50'
                    >
                        Próxima
                    </Button>
                </div>
                <div className="mt-2 text-center text-sm text-gray-500">
                    Total de Clientes: {totalCount}
                </div>
            </Card>
        </div >
    );
}