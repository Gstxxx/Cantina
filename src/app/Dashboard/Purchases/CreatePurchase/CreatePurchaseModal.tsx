'use client'
import React, { useState, useEffect } from 'react';
import { submit as createPurchase } from './Create';
import { submit as fetchProducts } from 'app/Dashboard/Products/ListProducts/fetch';
import { submit as fetchUsers } from 'app/Dashboard/Clients/ListClients/fetch';
import { Client } from 'app/types';
import { Search, ShoppingCart, Trash2 } from 'lucide-react';

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

    const addToCart = (productId: number) => {
        if (!cart.some(item => item.productId === productId)) {
            setCart([...cart, { productId, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateCartQuantity = (productId: number, quantity: number) => {
        if (quantity > 0 && quantity <= 99) {
            setCart(cart.map(item => 
                item.productId === productId ? { ...item, quantity } : item
            ));
        }
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

    if (!isModalOpen) return null;

    return (
        <div className="min-h-screen p-4 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">Criar Compra</h2>
                </div>

                <div className="p-6 grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Cliente</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Pesquisar cliente"
                                    value={clientSearchTerm}
                                    onChange={(e) => {
                                        setClientSearchTerm(e.target.value);
                                        setFilteredClients(
                                            clients.filter(client => 
                                                client.name.toLowerCase().includes(e.target.value.toLowerCase())
                                            )
                                        );
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
                            </div>
                            <select
                                className="mt-2 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                value={selectedClient || ''}
                                onChange={(e) => setSelectedClient(Number(e.target.value))}
                            >
                                <option value="">Selecione um cliente</option>
                                {filteredClients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Pesquisar produto</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Pesquisar produto"
                                    value={productSearchTerm}
                                    onChange={(e) => {
                                        setProductSearchTerm(e.target.value);
                                        setFilteredProducts(
                                            products.filter(product =>
                                                product.name.toLowerCase().includes(e.target.value.toLowerCase()) &&
                                                product.deleted_at === null
                                            )
                                        );
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
                            </div>
                            <div className="mt-2 border border-gray-200 rounded-lg h-[400px] overflow-y-auto bg-gray-50">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product.id)}
                                        className="w-full px-4 py-2 text-left hover:bg-orange-50 flex justify-between items-center border-b border-gray-100 last:border-0"
                                    >
                                        <span className="text-gray-700">{product.name}</span>
                                        <span className="text-gray-600">
                                            R$ {(product.price / 100).toFixed(2)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-600 mb-2 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-orange-500" />
                            Carrinho
                        </h3>
                        <div className="border border-gray-200 rounded-lg h-[500px] bg-gray-50 overflow-y-auto p-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <ShoppingCart className="h-12 w-12 mb-2" />
                                    <p>Seu carrinho está vazio</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {cart.map((item) => {
                                        const product = products.find((p) => p.id === item.productId);
                                        return (
                                            <div
                                                key={item.productId}
                                                className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                                            >
                                                <span className="text-gray-700">{product?.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="99"
                                                        value={item.quantity}
                                                        onChange={(e) => updateCartQuantity(item.productId, Number(e.target.value))}
                                                        className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    />
                                                    <button
                                                        onClick={() => removeFromCart(item.productId)}
                                                        className="text-red-500 hover:text-red-600 p-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Criar Compra
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseModal;