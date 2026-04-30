import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import ConditionalWalletProvider from '@/components/ConditionalWalletProvider'
import { DEX_DISPLAY_NAME, TOKEN_DISPLAY_NAME, TOKEN_TICKER } from '@/constants/tokenBrand'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${DEX_DISPLAY_NAME} — Perpetual Growth Trading`,
  description: `${DEX_DISPLAY_NAME}: trade ${TOKEN_DISPLAY_NAME} (${TOKEN_TICKER}) against USDC on Solana with bonding curve mechanics and guaranteed daily minimum upward momentum.`,
  keywords: ['DeFi', 'DEX', 'Solana', 'Trading', DEX_DISPLAY_NAME, TOKEN_DISPLAY_NAME, TOKEN_TICKER, 'Bonding Curve'],
  authors: [{ name: `${DEX_DISPLAY_NAME} Team` }],
  openGraph: {
    title: `${DEX_DISPLAY_NAME} — Perpetual Growth Trading`,
    description: `Trade ${TOKEN_DISPLAY_NAME} (${TOKEN_TICKER}) with upward momentum safeguards on Solana.`,
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
        <Analytics />
      </body>
    </html>
  )
}