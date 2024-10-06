'use client'
import React, { useEffect, useState } from 'react'
import { submit as fetchProdutcts } from './ListProducts/fetch'
import { Product } from 'app/types'
import ListProducts from './ListProducts/ListProducts';
import {CreateProduct} from './CreateProduct/CreateProduct';
export default function ClientsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const fetchProductsData = async (page: number) => {
        try {
            const response = await fetchProdutcts(page);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.products) && data.products !== null) {
                    setProducts(data.products as Product[]);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProductsData(currentPage);
    }, [currentPage]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <ListProducts />
            <CreateProduct />
        </div>
    )
}
