import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ConditionalWalletProvider from '@/components/ConditionalWalletProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EverRise DEX - Perpetual Growth Trading',
  description: 'The first decentralized exchange with guaranteed perpetual upward price momentum. Built on Solana with bonding curve mechanics.',
  keywords: ['DeFi', 'DEX', 'Solana', 'Trading', 'EverRise', 'Bonding Curve'],
  authors: [{ name: 'EverRise Team' }],
  openGraph: {
    title: 'EverRise DEX - Perpetual Growth Trading',
    description: 'Trade with guaranteed upward momentum on Solana',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging'
  
  return (
    <html lang="en">
      <body className={inter.className}>
        {isStaging && (
          <div className="bg-yellow-500 text-black text-center py-2 text-sm font-bold">
            🚧 STAGING ENVIRONMENT - FOR TESTING ONLY 🚧
          </div>
        )}
        <ConditionalWalletProvider>
          {children}
        </ConditionalWalletProvider>
      </body>
    </html>
  )
}