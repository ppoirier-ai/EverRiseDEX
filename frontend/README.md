# EverRise DEX Frontend

A modern, responsive frontend for the EverRise decentralized exchange built on Solana. Features real-time price tracking, trading interface, and queue monitoring.

## Features

- **Real-time Price Display**: Live price updates with market metrics
- **Trading Interface**: Buy/sell EverRise tokens with USDC
- **Price Chart**: Interactive price history with multiple time ranges
- **Queue Status**: Real-time monitoring of sales queue
- **Wallet Integration**: Support for Phantom, Solflare, and other Solana wallets
- **Responsive Design**: Optimized for desktop and mobile devices

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js
- **Wallets**: Solana Wallet Adapter
- **Charts**: Recharts
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── PriceDisplay.tsx   # Price and metrics display
│   ├── TradingInterface.tsx # Buy/sell interface
│   ├── PriceChart.tsx     # Price history chart
│   └── QueueStatus.tsx    # Sales queue monitoring
└── contexts/              # React contexts
    └── WalletContext.tsx  # Solana wallet integration
```

## Components

### PriceDisplay
Displays current price, 24h change, volume, market cap, and circulating supply.

### TradingInterface
Handles buy/sell transactions with wallet integration and transaction simulation.

### PriceChart
Interactive price chart with multiple time ranges (1H, 24H, 7D, 30D).

### QueueStatus
Real-time monitoring of sales queue length, wait times, and processing status.

## Wallet Integration

The app supports multiple Solana wallets:
- Phantom
- Solflare
- And other wallets compatible with Solana Wallet Adapter

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- Prettier for code formatting

## Deployment

The app can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Self-hosted

## Smart Contract Integration

Currently using mock data for demonstration. To integrate with the actual EverRise smart contract:

1. Deploy the smart contract to Solana
2. Update the RPC endpoint in `WalletContext.tsx`
3. Replace mock data with actual contract calls
4. Implement transaction signing and submission

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details