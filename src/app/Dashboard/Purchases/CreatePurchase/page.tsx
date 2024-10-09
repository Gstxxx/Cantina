import React, { useState, useEffect } from 'react';
import { submit as createPurchase } from './Create';
import { submit as fetchProducts } from 'app/Dashboard/Products/ListProducts/fetch';
import { submit as fetchUsers } from 'app/Dashboard/Clients/ListClients/fetch';
import { Client } from 'app/types';

import { TrashIcon } from "@radix-ui/react-icons"

type Product = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    price: number;
};

const PurchaseModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedClient, setSelectedClient] = useState<number | null>(null);
    const [cart, setCart] = useState<{ productId: number; quantity: number }[]>([]);
    const [currentPageClients, setCurrentPageClients] = useState(1);
    const [currentPageProducts, setCurrentPageProducts] = useState(1);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');

    useEffect(() => {
        async function loadInitialData() {
            await loadClients();
            await loadProducts();
        }

        loadInitialData();
    }, []);

    const loadClients = async (page = 1) => {
        const response = await fetchUsers(page);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.clients) && data.clients !== null) {
                const clientsWithPurchases = data.clients.map(client => ({
                    ...client,
                    purchases: client.purchases || []
                }));
                setClients(clientsWithPurchases as Client[]);
                setFilteredClients(clientsWithPurchases as Client[]);
            }
        } else {
            console.error('Error fetching clients:', Response.json);
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
                clientId: selectedClient,
                products: cart,
            };

            try {
                await createPurchase(purchaseData);
                alert('Compra criada com sucesso!');
                setCart([]);
                setIsModalOpen(false);
            } catch (error) {
                console.error('Erro ao criar compra', error);
            }
        } else {
            alert('Selecione um cliente e adicione produtos ao carrinho.');
        }
    };

    const loadMoreClients = () => {
        const nextPage = currentPageClients + 1;
        setCurrentPageClients(nextPage);
        loadClients(nextPage);
    };

    const loadMoreProducts = () => {
        const nextPage = currentPageProducts + 1;
        setCurrentPageProducts(nextPage);
        loadProducts();
    };

    const handleClientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setClientSearchTerm(searchTerm);
        setFilteredClients(clients.filter(client => client.name.toLowerCase().includes(searchTerm)));
    };

    const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setProductSearchTerm(searchTerm);
        setFilteredProducts(products.filter(product =>
            (product.name.toLowerCase().includes(searchTerm) ||
                product.id.toString().includes(searchTerm)) &&
            product.deleted_at === null
        ));
    };

    if (!isModalOpen) return null;

    return (
        <div className="modal fixed inset-0 rounded-lg bg-[#222527]/50 border-transparent border-0 flex items-center justify-center z-50">
            <div className="rounded-lg bg-[#272b2f] border-transparent border-0 p-6 shadow-lg w-[1000px]">
                <h2 className="text-xl font-bold mb-4 text-orange-500">Criar Compra</h2>
                <div className='grid grid-cols-2 gap-8'>
                    <div >
                        <div className='flex flex-col gap-2'>
                            <h3 className='text-gray-400 font-bold text-xl'>Cliente</h3>
                            <input
                                className='bg-[#222527] w-full p-2 border-transparent border-0 rounded-md'
                                value={clientSearchTerm}
                                onChange={handleClientSearch}
                                placeholder="Pesquisar cliente"
                            />
                            <select
                                className='bg-[#222527] w-full p-2 border-transparent border-0 rounded-md'
                                value={selectedClient || ''}
                                onChange={(e) => setSelectedClient(Number(e.target.value))}
                            >
                                <option className='text-white hover:bg-orange-500' value="" disabled>Selecione um cliente</option>
                                {filteredClients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                            <button className='bg-green-500 text-white p-2 rounded-md mt-2' onClick={loadMoreClients}>Carregar Mais Clientes</button>
                        </div>

                        <div className='mt-4 flex flex-col gap-2 mb-4'>
                            <h3 className='text-gray-400 font-bold text-xl'>Pesquisar produto</h3>
                            <input
                                className='bg-[#222527] w-full p-2 border-transparent border-0 rounded-md'
                                value={productSearchTerm}
                                onChange={handleProductSearch}
                                placeholder="Pesquisar produto"
                            />
                            <select multiple className='bg-[#222527] w-full p-2 border-transparent border-0 rounded-md mb-4 h-[300px] overflow-y-auto' onChange={(e) => {
                                const selectedOptions = Array.from(e.target.options)
                                    .filter(option => option.selected)
                                    .map(option => option.value);
                                selectedOptions.forEach(id => addToCart(Number(id), 1));
                            }}>
                                {filteredProducts.map((product) => (
                                    <option className='text-white hover:bg-orange-500 text-bold' key={product.id} value={product.id}>
                                        {product.name} - R$ {(product.price / 100).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                            <button className='bg-green-500 text-white p-2 rounded-md' onClick={loadMoreProducts}>Carregar Mais Produtos</button>
                        </div>
                    </div>

                    <div >
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
                <button className='bg-orange-500 text-white p-4 rounded-md' onClick={handleSubmit}>Criar Compra</button>
                <button className='bg-red-500 text-white p-4 rounded-md ml-4' onClick={() => setIsModalOpen(false)}>Fechar</button>
            </div>
        </div>
    );
};

export default PurchaseModal;