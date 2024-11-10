'use client'
import React, { useEffect, useState } from 'react'
import { submit as fetchClients } from './ListClients/fetch'
import { Client } from 'app/types'
import ListClients from './ListClients/listClients';
import Loading from '@/components/ui/loading'; 

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchClientsData = async (page: number) => {
        setLoading(true);
        try {
            const response = await fetchClients(page);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.clients) && data.clients !== null) {
                    setClients(data.clients as Client[]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    };

    useEffect(() => {
        fetchClientsData(currentPage);
    }, [currentPage]);

    return (
        <div className="grid grid-cols-1">
            {loading ? <Loading /> : <ListClients />}
        </div>
    )
}
