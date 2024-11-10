'use client'
import React, { useState, useEffect } from 'react';
import { submit as fetchProducts } from 'app/Dashboard/Products/ListProducts/fetch';
import {  getToken } from "lib/apiService";
import { submit as updatePurchase } from './update';

import { TrashIcon } from "@radix-ui/react-icons"

type Product = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    price: number;
};

type PurchaseProduct = {
    product: Product;
    quantity: number;
};


type PurchaseDetails = {
    id: number;
    client: {
        id: number;
        name: string;
    };
    products: PurchaseProduct[];
};

type CartItem = {
    productId: number;
    quantity: number;
};

interface PurchaseModalProps {
    purchaseId: number;
    onClose: () => void;
}

const UpdatePurchase: React.FC<PurchaseModalProps> = ({ purchaseId, onClose }) => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);

    useEffect(() => {
        async function loadInitialData() {
            await loadProducts();
        }

        loadInitialData();
    }, []);

    useEffect(() => {
        async function loadPurchaseData() {
            const token = getToken();
            
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            try {
                const response = await fetch(`/api/purchases/search?query=${purchaseId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const purchases = await response.json();
                    if (Array.isArray(purchases) && purchases.length > 0) {
                        const purchase = purchases[0];
                        setPurchaseDetails(purchase);
                        setCart(purchase.products.map((p: PurchaseProduct) => ({
                            productId: p.product.id,
                            quantity: p.quantity
                        })));
                    } else {
                        console.error('Purchase not found');
                    }
                } else {
                    console.error('Error fetching purchase details');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        if (purchaseId) {
            loadPurchaseData();
        }
    }, [purchaseId]);

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
        if (cart.length > 0) {
            const purchaseData = {
                id: purchaseId,
                products: cart,
            };

            try {
                await updatePurchase(purchaseData);
                alert('Compra atualizada com sucesso!');
                setCart([]);
                setIsModalOpen(false);
                window.location.reload();
            } catch (error) {
                console.error('Erro ao atualizar compra', error);
            }
        } else {
            alert('Selecione um cliente e adicione produtos ao carrinho.');
        }
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

    const handleClose = () => {
        setIsModalOpen(false);
        onClose();
    };

    if (!isModalOpen) return null;

    return (
        <div className="modal fixed inset-0 rounded-lg bg-gray-100/50 border-transparent border-0 flex items-center justify-center z-50">
            <div className="rounded-lg bg-white border-transparent border-0 p-6 shadow-md w-[1000px]">
                <h2 className="text-xl font-bold mb-4 text-orange-500">Atualizar Compra</h2>
                <h3>{purchaseDetails?.client.name}</h3>
                <h3>ID: {purchaseDetails?.id}</h3>

                <div className='grid grid-cols-2 gap-8'>
                    <div >
                        <div className='mt-4 flex flex-col gap-2 mb-4'>
                            <h3 className='text-gray-400 font-bold text-xl'>Pesquisar produto</h3>
                            <input
                                className='bg-gray-100 text-gray-400 w-full p-2 border-transparent border-0 rounded-md'
                                value={productSearchTerm}
                                onChange={handleProductSearch}
                                placeholder="Pesquisar produto"
                            />
                            <select multiple className='bg-gray-100 text-gray-400 w-full p-2 border-transparent border-0 rounded-md mb-4 h-[300px] overflow-y-auto' onChange={(e) => {
                                const selectedOptions = Array.from(e.target.options)
                                    .filter(option => option.selected)
                                    .map(option => option.value);
                                selectedOptions.forEach(id => addToCart(Number(id), 1));
                            }}>
                                {filteredProducts.map((product) => (
                                    <option className='text-gray-400 hover:bg-orange-500 text-bold' key={product.id} value={product.id}>
                                        {product.name} - R$ {(product.price / 100).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div >
                        <h3 className='text-gray-400 font-bold text-xl'>Carrinho</h3>
                        <div className='h-[700px] overflow-y-auto bg-gray-100 text-gray-400 rounded-md p-4 flex flex-col gap-4'>
                            {cart.map((item: CartItem, index: number) => {
                                const product = products.find((p: Product) => p.id === item.productId);
                                return (
                                    <div key={index} className='flex justify-between items-center bg-gray-600 rounded-md p-2'>
                                        <span>{product?.name}</span>
                                        <div className='flex items-center gap-2'>
                                            <input
                                                type="number"
                                                min="1"
                                                max="99"
                                                value={item.quantity}
                                                onChange={(e) => updateCartQuantity(item.productId, Number(e.target.value))}
                                                className='bg-gray-100 text-gray-400 border-transparent border-0 rounded-md p-2 w-[50px]'
                                            />
                                            <button 
                                                className='text-red-500 text-sm' 
                                                onClick={() => removeFromCart(item.productId)}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <button className='bg-orange-500 text-white p-4 rounded-md' onClick={handleSubmit}>Atualizar Compra</button>
                <button className='bg-red-500 text-white p-4 rounded-md ml-4' onClick={handleClose}>Fechar</button>
            </div>
        </div>
    );
};

export default UpdatePurchase;