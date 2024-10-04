'use client'
import PurchaseAnalysis from './analysis/page'
export default function dashboard() {
    return (
        <div className="flex h-screen bg-[#111111] text-white relative">
            <PurchaseAnalysis />
        </div>
    )
}