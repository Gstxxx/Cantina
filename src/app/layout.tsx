import type { Metadata } from 'next'
import "./globals.css";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster"
export const metadata: Metadata = {
  title: 'Parada dos sabores',
  description: 'Created by Gstx'
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
      <Toaster />
    </html>
  )
}
