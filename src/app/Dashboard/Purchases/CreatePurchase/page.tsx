import React, { useState, useEffect } from 'react';
import { submit as createPurchase } from './Create';
import { submit as fetchProducts } from 'app/Dashboard/Products/ListProducts/fetch';
import { submit as fetchUsers } from 'app/Dashboard/Clients/ListClients/fetch';
import { Client } from 'app/types';

type Product = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    price: number;
};

const PurchaseModal = () => {
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
            setProducts((prevProducts) => [...prevProducts, ...products]);
            setFilteredProducts(products);
        } else {
            console.error('Error fetching products:', response);
        }
    };

    const addToCart = (productId: number, quantity: number) => {
        setCart([...cart, { productId, quantity }]);
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
        setFilteredProducts(products.filter(product => product.name.toLowerCase().includes(searchTerm)));
    };

    return (
        <div className="modal fixed inset-0 rounded-lg bg-[#222527]/50 border-transparent border-0 flex items-center justify-center z-50">
            <div className="rounded-lg bg-[#272b2f] border-transparent border-0 p-6 shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4 text-orange-500">Criar Compra</h2>
                <div className='flex flex-col gap-2'>
                    <label className='text-white font-bold text-xl'>Cliente</label>
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

                    <button className='text-green-500 text-sm' onClick={loadMoreClients}>Carregar mais clientes</button>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-white font-bold text-xl'>Pesquisar produto</label>
                    <input
                        className='bg-[#222527] w-full p-2 border-transparent border-0 rounded-md'
                        value={productSearchTerm}
                        onChange={handleProductSearch}
                        placeholder="Pesquisar produto"
                    />
                    <select className='bg-[#222527] w-full p-2 border-transparent border-0 rounded-md' onChange={(e) => addToCart(Number(e.target.value), 1)}>
                        <option className='text-white hover:bg-orange-500' value="" disabled>Selecione um produto</option>
                        {filteredProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} - R$ {(product.price / 100).toFixed(2)}
                            </option>
                        ))}
                    </select>

                    <button className='text-green-500 text-sm' onClick={loadMoreProducts}>Carregar mais produtos</button>
                </div>

                <div>
                    <h3 className='text-white font-bold text-xl'>Carrinho</h3>
                    {cart.map((item, index) => {
                        const product = products.find((p) => p.id === item.productId);
                        return (
                            <div key={index} className='flex justify-between items-center my-4 bg-orange-500/20 rounded-md p-4'>
                                <span>{product?.name}</span>
                                <span>Quantidade: {item.quantity}</span>
                            </div>
                        );
                    })}
                </div>

                <button className='bg-orange-500 text-white p-4 rounded-md' onClick={handleSubmit}>Criar Compra</button>
            </div>
        </div>
    );
};

export default PurchaseModal;
