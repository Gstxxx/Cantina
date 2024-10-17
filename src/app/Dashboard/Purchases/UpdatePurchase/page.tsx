'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { submit as updatePurchase } from './update';
import { submit as fetchProducts } from '../../products/ListProducts/fetch';
import { submit as fetchUsers } from '../../clients/ListClients/fetch';
import { submit as searchUsers } from '../../clients/ListClients/search';
import { submit as searchProducts } from '../../products/ListProducts/search';
import { PurchaseRecord, Client } from 'app/types';
import { TrashIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import debounce from 'lodash.debounce';

type Product = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    price: number;
};

const UpdatePurchaseModal = ({ purchase }: { purchase: PurchaseRecord }) => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedClient, setSelectedClient] = useState<number | null>(purchase.clientId);
    const [cart, setCart] = useState<{ productId: number; quantity: number }[]>(purchase.products.map(p => ({ productId: p.id, quantity: p.quantity })));
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');

    useEffect(() => {
        async function loadInitialData() {
            await loadClients();
            await loadProducts();
        }

        loadInitialData();
    }, []);

    const loadClients = async () => {
        const response = await fetchUsers();
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.clients) && data.clients !== null) {
                setClients(data.clients as Client[]);
                setFilteredClients(data.clients as Client[]);
            }
        } else {
            console.error('Error fetching clients:', response);
        }
    };

    const loadProducts = async () => {
        const response = await fetchProducts();
        if (response.status === 200) {
            const { products } = await response.json();
            setProducts(products);
            setFilteredProducts(products);
        } else {
            console.error('Error fetching products:', response);
        }
    };

    const addToCart = (productId: number, quantity: number) => {
        setCart([...cart, { productId, quantity }]);
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateCartQuantity = (productId: number, quantity: number) => {
        setCart(cart.map(item => item.productId === productId ? { ...item, quantity } : item));
    };

    const handleSubmit = async () => {
        if (selectedClient && cart.length > 0) {
            const purchaseData = {
                id: purchase.id,
                clientId: selectedClient,
                products: cart,
            };

            try {
                await updatePurchase(purchaseData);
                alert('Compra atualizada com sucesso!');
                setIsModalOpen(false);
            } catch (error) {
                console.error('Erro ao atualizar compra', error);
            }
        } else {
            alert('Selecione um cliente e adicione produtos ao carrinho.');
        }
    };

    // Declare the search handlers before using them
    const handleClientSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setClientSearchTerm(searchTerm);
        if (searchTerm) {
            const response = await searchUsers(searchTerm);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.clients)) {
                    setFilteredClients(data.clients as Client[]);
                } else {
                    console.error('Unexpected data format for clients:', data);
                    setFilteredClients([]);
                }
            } else {
                console.error('Error searching clients:', response);
                setFilteredClients([]);
            }
        } else {
            setFilteredClients(clients);
        }
    };

    const handleProductSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setProductSearchTerm(searchTerm);
        if (searchTerm) {
            const response = await searchProducts(searchTerm);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setFilteredProducts(data as Product[]);
                } else {
                    console.error('Unexpected data format for products:', data);
                    setFilteredProducts([]);
                }
            } else {
                console.error('Error searching products:', response);
                setFilteredProducts([]);
            }
        } else {
            setFilteredProducts(products);
        }
    };

    // Debounce the search functions
    const debouncedClientSearch = useDebouncedSearch(handleClientSearch, 300);
    const debouncedProductSearch = useDebouncedSearch(handleProductSearch, 300);

    const Combobox = ({ items, selectedValue, onSelect, placeholder, onSearch }: { items: any[], selectedValue: any, onSelect: (value: any) => void, placeholder: string, onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState(selectedValue);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {value
                            ? items.find(item => item.id === value)?.name
                            : placeholder}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput
                            placeholder={`Search ${placeholder.toLowerCase()}...`}
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
                            <CommandGroup>
                                {items.map(item => (
                                    <CommandItem
                                        key={item.id}
                                        value={item.id}
                                        onSelect={(currentValue) => {
                                            const newValue = currentValue === value ? null : currentValue;
                                            setValue(newValue);
                                            onSelect(newValue);
                                            setOpen(false);
                                        }}
                                    >
                                        {item.name}
                                        <CheckIcon
                                            className={
                                                "ml-auto h-4 w-4"
                                            }
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    };

    if (!isModalOpen) return null;

    return (
        <div className="modal fixed inset-0 rounded-lg bg-[#222527]/50 border-transparent border-0 flex items-center justify-center z-50">
            <div className="rounded-lg bg-[#272b2f] border-transparent border-0 p-6 shadow-lg w-[1000px]">
                <h2 className="text-xl font-bold mb-4 text-orange-500">Atualizar Compra</h2>
                <div className='grid grid-cols-2 gap-8'>
                    <div>
                        <div className='flex flex-col gap-2'>
                            <h3 className='text-gray-400 font-bold text-xl'>Cliente</h3>
                            <Combobox
                                items={filteredClients}
                                selectedValue={selectedClient}
                                onSelect={setSelectedClient}
                                placeholder="Select client"
                                onSearch={debouncedClientSearch}
                            />
                        </div>

                        <div className='mt-4 flex flex-col gap-2 mb-4'>
                            <h3 className='text-gray-400 font-bold text-xl'>Pesquisar produto</h3>
                            <Combobox
                                items={filteredProducts}
                                selectedValue={null}
                                onSelect={(productId) => productId && addToCart(productId, 1)}
                                placeholder="Select product"
                                onSearch={debouncedProductSearch}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className='text-gray-400 font-bold text-xl'>Carrinho</h3>
                        <div className='h-[700px] overflow-y-auto bg-[#222527] rounded-md p-4 flex flex-col gap-4'>
                            {cart.map((item, index) => {
                                const product = products.find((p) => p.id === item.productId);
                                return (
                                    <div key={index} className='flex justify-between items-center bg-orange-500/20 rounded-md p-2'>
                                        <span>{product?.name}</span>
                                        <div className='flex items-center gap-2'>
                                            <input
                                                type="number"
                                                min="1"
                                                max="99"
                                                value={item.quantity}
                                                onChange={(e) => updateCartQuantity(item.productId, Number(e.target.value))}
                                                className='text-white bg-[#222527] border-transparent border-0 rounded-md p-2 w-[50px]'
                                            />
                                            <button className='text-red-500 text-sm' onClick={() => removeFromCart(item.productId)}><TrashIcon /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <button className='bg-orange-500 text-white p-4 rounded-md' onClick={handleSubmit}>Atualizar Compra</button>
                <button className='bg-red-500 text-white p-4 rounded-md ml-4' onClick={() => setIsModalOpen(false)}>Fechar</button>
            </div>
        </div>
    );
};

export default UpdatePurchaseModal;
