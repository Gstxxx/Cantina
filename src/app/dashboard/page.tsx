'use client'
import PurchaseAnalysis from './analysis/page'
export default function dashboard() {
    return (
        <div className="flex h-screen text-white relative">
            <PurchaseAnalysis />
        </div>
    )
}