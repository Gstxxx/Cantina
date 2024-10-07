'use client'
import PurchaseAnalysis from './Purchases/page'
export default function dashboard() {
    return (
        <div className="flex h-screen text-white relative">
            <PurchaseAnalysis />
        </div>
    )
}