'use client'
import React from 'react'
import ListClients from './ListClients/listClients';

export default function ClientsPage() {
    return (
        <div className="grid grid-cols-1">
           <ListClients />
        </div>
    )
}
