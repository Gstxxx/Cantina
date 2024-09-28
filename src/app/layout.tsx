import type { Metadata } from 'next'
import "./globals.css";

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
    </html>
  )
}
