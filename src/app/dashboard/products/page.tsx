'use client'
import React, { useEffect, useState } from 'react'
import { submit as fetchProdutcts } from './ListProducts/fetch'
import { Product } from 'app/types'
import ListProducts from './ListProducts/ListProducts';
import Loading from '@/components/ui/loading'; // Import the Loading component

export default function ClientsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false); // Add loading state

    const fetchProductsData = async (page: number) => {
        setLoading(true); // Set loading to true before fetching
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
        } finally {
            setTimeout(() => setLoading(false), 500); // Delay hiding the loading indicator by 500ms
        }
    };

    useEffect(() => {
        fetchProductsData(currentPage);
    }, [currentPage]);

    return (
        <div>
            {loading ? <Loading /> : <ListProducts />} {/* Conditionally render Loading or ListProducts */}
        </div>
    )
}
