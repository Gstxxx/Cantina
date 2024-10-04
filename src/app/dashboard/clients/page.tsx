'use client'
import React, { useEffect, useState } from 'react'
import { submit as fetchClients } from './ListClients/fetch'
import { Client } from 'app/types'
import ListClients from './ListClients/listClients';

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const fetchClientsData = async (page: number) => {
        try {
            const response = await fetchClients(page);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.clients) && data.clients !== null) {
                    setClients(data.clients);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchClientsData(currentPage);
    }, [currentPage]);

    return (
        <div>
            <ListClients />
        </div>
    )
}
