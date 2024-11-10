'use client'
import React, { useState, useEffect } from 'react';
import { submit as updatePurchase } from './update';
import { submit as fetchProducts } from '../../Products/ListProducts/fetch';
import { submit as searchProducts } from '../../Products/ListProducts/search';
import { PurchaseRecord, Product } from 'app/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MinusIcon, PlusIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type CartItem = Product & {
    quantity: number;
};

const UpdatePurchaseModal = ({ purchase }: { purchase: PurchaseRecord }) => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>(purchase.products.map(p => ({
        ...p.product,
        quantity: p.quantity
    })));
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        async function loadInitialData() {
            await loadProducts();
        }

        loadInitialData();
    }, []);

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

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: number, quantity: number) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
            ).filter(item => item.quantity > 0)
        );
    };

    const handleSubmit = async () => {
        if (cart.length > 0) {
            const purchaseData = {
                id: purchase.id,
                products: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
            };

            try {
                await updatePurchase(purchaseData);
                toast({
                    title: "Success",
                    description: "Compra atualizada com sucesso!",
                });
                window.location.reload();
            } catch (error) {
                console.error('Erro ao atualizar compra', error);
                toast({
                    title: "Error",
                    description: "Erro ao atualizar compra",
                    variant: "destructive"
                });
            }
        } else {
            toast({
                title: "Warning",
                description: "Adicione produtos ao carrinho.",
            });
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

    if (!isModalOpen) return null;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity / 100, 0);

    return (
        <div className='modal fixed inset-0 rounded-lg bg-gray-100/50 border-transparent border-0 flex items-center justify-center z-50'>
            <Card className="w-full max-w-4xl mx-auto bg-white text-gray-400 border-transparent border-0 rounded-lg shadow-md">
                <CardHeader>
                    <CardTitle className="text-4xl font-semibold text-orange-500">Atualizar Compra</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6 ">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-2xl font-semibold text-orange-500">Pesquisar produto</Label>
                            <Input
                                id="product-search"
                                placeholder="Pesquisar produto"
                                className='bg-gray-100 text-gray-400 border-transparent border-0 rounded-lg p-4'
                                value={productSearchTerm}
                                onChange={handleProductSearch}
                            />
                        </div>
                        <ScrollArea className="h-[440px] border-transparent border-0 rounded-lg rounded-md p-4 overflow-auto bg-gray-100 text-gray-400 text-sm">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="flex flex-col">
                                    <div className="flex justify-between items-center py-2">
                                        <span className='text-gray-400 border-transparent border-0 rounded-lg'>{product.name} - R$ {(product.price / 100).toFixed(2)}</span>
                                        <a className='cursor-pointer' onClick={() => addToCart(product)}><PlusCircle size={20} className='text-green-500 hover:text-green-600' /></a>
                                    </div>
                                    <hr className="my-2 border-t border-gray-600 w-full" />
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-orange-500">Carrinho</h3>
                        <ScrollArea className="h-[440px] rounded-md p-4 overflow-auto bg-gray-100 text-gray-400 text-sm border-transparent border-0 rounded-lg">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center py-2">
                                    <span>{item.name} - R$ {(item.price / 100).toFixed(2)}</span>
                                    <div className="flex items-center">
                                        <a className='cursor-pointer' onClick={() => updateQuantity(item.id, item.quantity - 1)}><MinusIcon size={10} className='text-red-500 hover:text-red-600' /></a>

                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            className="w-16 mx-2 text-center bg-white text-gray-400 border-transparent border-0 rounded-lg p-2"
                                        />
                                        <a className='cursor-pointer' onClick={() => updateQuantity(item.id, item.quantity + 1)}><PlusIcon size={10} className='text-green-500 hover:text-green-600' /></a>

                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-xl font-bold">Total:  <span className='text-green-500'>R$ {total.toFixed(2)}</span></div>
                    <div>
                        <Button className="text-white mr-2 bg-green-500 hover:bg-green-600 p-4" onClick={handleSubmit}>Atualizar Compra</Button>
                        <Button className='text-white bg-red-500 hover:bg-red-600 p-4' onClick={() => setIsModalOpen(false)}>Fechar</Button>
                    </div>
                </CardFooter>
            </Card></div>
    );
};

export default UpdatePurchaseModal;
