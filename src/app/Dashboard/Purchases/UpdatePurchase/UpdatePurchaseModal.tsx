'use client'
import React, { useState, useEffect } from 'react';
import { submit as fetchProducts } from 'app/Dashboard/Products/ListProducts/fetch';
import {  getToken } from "lib/apiService";
import { submit as updatePurchase } from './update';
import { Search, ShoppingCart, Trash2 } from 'lucide-react';

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

const UpdatePurchase = ({ purchaseId, onClose }: PurchaseModalProps) => {
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
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.productId === productId);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                return [...prevCart, { productId, quantity }];
            }
        });
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        Atualizar Compra
                        
                    </h2>
                </div>

                <div className="p-6 grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <div className='mb-4'>

                        {purchaseDetails && (
                            <span className="text-xl font-bold text-orange-600">
                                {purchaseDetails.client.name} - #{purchaseDetails.id}
                            </span>
                        )}
                        </div>
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Pesquisar produto</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Pesquisar produto"
                                    value={productSearchTerm}
                                    onChange={handleProductSearch}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
                            </div>
                            <div className="mt-2 border border-gray-200 rounded-lg h-[400px] overflow-y-auto bg-gray-50">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product.id, 1)}
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
                                                        className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-orange-500"
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

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Atualizar Compra
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UpdatePurchase;