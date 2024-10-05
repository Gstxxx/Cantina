import type { Metadata } from 'next'
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
export const metadata: Metadata = {
  title: 'Parada dos sabores',
  description: 'Created by Gstx'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Toaster />
    </html>
  )
}
