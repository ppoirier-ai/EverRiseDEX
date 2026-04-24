# EverRise DEX Environment Variables

## Production Environment Variables

### Core Configuration
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
```

### Smart Contract Addresses
```bash
NEXT_PUBLIC_PROGRAM_ID=9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy
NEXT_PUBLIC_BONDING_CURVE_SEED=bonding_curve
```

### Token Mints
```bash
NEXT_PUBLIC_EVER_MINT=3q4YFYMKHrdYw5FPANQ7nrCQMT4t12XKgzYX8JaTeEx8
NEXT_PUBLIC_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Wallet Addresses
```bash
NEXT_PUBLIC_TREASURY_WALLET=DTA5uQocoAaZwXL59DoVZwWUxJCsxjfBCM6mzpws8T4
```

### Program Token Accounts (Created Dynamically)
```bash
# Program EVER Account (owned by bonding curve PDA)
NEXT_PUBLIC_PROGRAM_EVER_ACCOUNT=2zxSEQRegNfZddGHC7xBcCtXzfafnMKdEhh2rp3KDzrz

# Program USDC Account (owned by bonding curve PDA)  
NEXT_PUBLIC_PROGRAM_USDC_ACCOUNT=5ZYxeV1qQJmynuKs1m1jonrw8pUTaHonr5anP3YwRYLA

# Optional: if treasury USDC account is not the ATA of NEXT_PUBLIC_TREASURY_WALLET (e.g. Squad)
# NEXT_PUBLIC_TREASURY_USDC_ACCOUNT=<TOKEN_ACCOUNT_PUBKEY>

# Bonding Curve PDA (derived from program ID + seed)
BONDING_CURVE_PDA=9pdSYBWZfgm9S8qJJA2vVs1iRfPeosoagh1aKsm83ddU
```

Set `NEXT_PUBLIC_RPC_URL` and other secrets in the **Vercel** project (or `.env.local` locally); do not commit real API keys. See [frontend/DEPLOYMENT_VERCEL.md](frontend/DEPLOYMENT_VERCEL.md) and [frontend/.env.example](frontend/.env.example).

---

## Staging/Devnet Environment Variables

### Core Configuration
```bash
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

### Smart Contract Addresses
```bash
# Note: These would be different for devnet deployment
NEXT_PUBLIC_PROGRAM_ID=<DEVNET_PROGRAM_ID>
NEXT_PUBLIC_BONDING_CURVE_SEED=bonding_curve
```

### Token Mints
```bash
# Devnet EVER mint (different from production)
NEXT_PUBLIC_EVER_MINT=85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb
NEXT_PUBLIC_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Wallet Addresses
```bash
# Devnet treasury wallet
NEXT_PUBLIC_TREASURY_WALLET=FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA
```

### Program Token Accounts (Created Dynamically)
```bash
# These would be different for devnet deployment
NEXT_PUBLIC_PROGRAM_EVER_ACCOUNT=<DEVNET_PROGRAM_EVER_ACCOUNT>
NEXT_PUBLIC_PROGRAM_USDC_ACCOUNT=<DEVNET_PROGRAM_USDC_ACCOUNT>
BONDING_CURVE_PDA=<DEVNET_BONDING_CURVE_PDA>
```

---

## Important Notes

### Production Status (Current)
- ✅ Smart Contract: Deployed and functional
- ✅ Program EVER Account: 99,999,000 EVER tokens
- ✅ Program USDC Account: 1 USDC (test token)
- ✅ Treasury Wallet: Squad multi-sig wallet
- ✅ Frontend: Updated with correct addresses

### Security Notes
- Program token accounts are owned by the bonding curve PDA
- Only the smart contract can move tokens from program accounts
- Treasury wallet is a Squad multi-sig (manual control only)
- All addresses are verified and tested

### Deployment Checklist
1. Smart contract deployed to mainnet
2. Program token accounts created and funded
3. Frontend code updated with correct addresses
4. Environment variables set in **Vercel** (or host of choice) for production; see [frontend/DEPLOYMENT_VERCEL.md](frontend/DEPLOYMENT_VERCEL.md)
5. Test after deploy (Preview URL or production)

### Cost Summary
- Smart Contract Deployment: ~0.002 SOL (~$0.40)
- Program Account Creation: ~0.001 SOL (~$0.20)
- Total Cost: ~$0.60 (much less than original $600+ estimate)
