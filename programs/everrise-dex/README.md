# EverRise DEX Smart Contract

This is the Solana smart contract implementation for the EverRise DEX, featuring a bonding curve mechanism that ensures perpetual upward price momentum.

## 🚀 Features

### Core Mechanics
- **Bonding Curve**: K = X × Y formula where K is constant
- **Perpetual Growth**: Price only goes up, never down
- **Daily Boost**: 0.02% minimum daily growth guarantee
- **Sales Queue**: Peer-to-peer matching system for sells
- **Treasury System**: USDC management for buybacks

### Smart Contract Functions

#### `initialize(treasury_wallet: Pubkey)`
Initializes the EverRise DEX with:
- Initial X: 100,000 USDC (treasury)
- Initial Y: 1,000,000,000 EVER (reserve)
- K: 100,000,000,000,000,000,000,000 (constant)

#### `buy(usdc_amount: u64)`
Buys EVER tokens using USDC:
- Transfers USDC from user to treasury
- Mints EVER tokens to user
- Updates bonding curve state (X increases, Y decreases)
- Maintains K constant

#### `sell(ever_amount: u64)`
Sells EVER tokens to the queue:
- Calculates current price using bonding curve
- Transfers EVER tokens to program
- Creates sell order in queue
- Updates queue tail pointer

## 📊 Bonding Curve Formula

```
Price = X / Y
K = X × Y (constant)

Where:
- X = USDC in treasury
- Y = EVER in reserve
- K = Constant product
```

## 🏗️ Account Structure

### BondingCurve PDA
```rust
pub struct BondingCurve {
    pub authority: Pubkey,
    pub treasury_wallet: Pubkey,
    pub x: u64, // USDC in treasury
    pub y: u64, // EVER in reserve
    pub k: u64, // K = X * Y (constant)
    pub last_daily_boost: i64,
    pub total_volume_24h: u64,
    pub queue_head: u64,
    pub queue_tail: u64,
    pub bump: u8,
}
```

### SellOrder PDA
```rust
pub struct SellOrder {
    pub seller: Pubkey,
    pub ever_amount: u64,
    pub usdc_value: u64,
    pub timestamp: i64,
    pub processed: bool,
    pub bump: u8,
}
```

## 🔧 Development

### Prerequisites
- Rust 1.70+
- Solana CLI 1.16+
- Anchor Framework 0.31.1

### Build
```bash
cd programs/everrise-dex/everrise-dex
anchor build
```

### Test
```bash
anchor test
```

### Deploy

#### Development/Staging
```bash
anchor deploy --provider.cluster devnet
```

#### Production Deployment (CRITICAL STEPS)

**⚠️ IMPORTANT: Follow these steps exactly to prevent address mismatches**

1. **Pre-deployment Setup**
   ```bash
   # Set to mainnet
   solana config set --url https://api.mainnet-beta.solana.com
   
   # Verify wallet has sufficient SOL (minimum 5 SOL recommended)
   solana balance
   ```

2. **Build and Deploy**
   ```bash
   cd programs/everrise-dex/everrise-dex
   anchor build
   anchor deploy --provider.cluster mainnet-beta
   ```

3. **Get Program ID**
   ```bash
   PROGRAM_ID=$(solana address --keypair target/deploy/everrise_dex-keypair.json)
   echo "Program ID: $PROGRAM_ID"
   ```

4. **Create Bonding Curve PDA**
   ```bash
   # Derive bonding curve PDA
   BONDING_CURVE_PDA=$(solana address --keypair <(echo "bonding_curve" | xxd -p -c 256))
   echo "Bonding Curve PDA: $BONDING_CURVE_PDA"
   ```

5. **Create Program Token Accounts (CRITICAL)**
   ```bash
   # Create program EVER account (owned by bonding curve PDA)
   node create-ever-account-simple.js
   
   # Create program USDC account (owned by bonding curve PDA)  
   node create-program-accounts.js
   ```

6. **Initialize Bonding Curve**
   ```bash
   node init-bonding-curve.js
   ```

7. **Verify Deployment**
   ```bash
   # Check bonding curve exists
   solana account $BONDING_CURVE_PDA
   
   # Check program token accounts exist
   node check-program-ever-balance.js
   ```

**🚨 CRITICAL NOTES:**
- **NEVER hardcode token account addresses** - they must be created dynamically
- **Program token accounts MUST be owned by bonding curve PDA** for autonomous operation
- **Always verify addresses match between smart contract and actual accounts**
- **Test thoroughly on devnet before mainnet deployment**

## 📝 Constants

- **Initial X**: 100,000 USDC (6 decimals)
- **Initial Y**: 1,000,000,000 EVER (9 decimals)
- **Daily Growth Rate**: 0.02% (2 basis points)
- **Appreciation Bonus**: 0.1% (1 basis point)
- **Basis Points**: 10,000 (100%)

## 🔒 Security Features

- **Overflow Protection**: All arithmetic operations use `checked_*` methods
- **Input Validation**: Proper bounds checking on all inputs
- **Atomicity**: All state changes are atomic
- **Access Control**: Only authorized accounts can perform operations

## 🌐 Network Support

- **Devnet**: For testing and development
- **Mainnet**: For production deployment

## 📚 Documentation

For detailed technical specifications, see:
- `specs/EverRiseDEX - Technical Specs.md`
- `specs/EverRise - Formula.md`

## 🚨 Important Notes

- The bonding curve ensures price only goes up
- Daily boost provides minimum 0.02% growth
- Sales queue enables peer-to-peer matching
- Treasury wallet receives all USDC from buys
- Program ID: `9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy`

## 🏭 Production Addresses

### Current Production Configuration
- **Program ID**: `9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy`
- **Bonding Curve PDA**: `9pdSYBWZfgm9S8qJJA2vVs1iRfPeosoagh1aKsm83ddU`
- **Treasury Wallet**: `DTA5uQocoAaZwXL59DoVZwWUxJCsxjfBCM6mzpws8T4`
- **EVER Mint**: `3q4YFYMKHrdYw5FPANQ7nrCQMT4t12XKgzYX8JaTeEx8`
- **USDC Mint**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

### Program Token Accounts
- **Program USDC Account**: `CcpCLzvrwcY9Ufupvp69BDKuYZieE2ExQLoHdPKa3Aus`
- **Program EVER Account**: `2zxSEQRegNfZddGHC7xBcCtXzfafnMKdEhh2rp3KDzrz` ⚠️ **UPDATED**

### ⚠️ CRITICAL ISSUE IDENTIFIED
The smart contract currently has a hardcoded incorrect address for the program EVER account:
- **Smart contract expects**: `8t4CT8pfMjvVTGmvdtKUkVfaqrLZuEW8WaVKLPqaogpN` (INVALID)
- **Actually created**: `2zxSEQRegNfZddGHC7xBcCtXzfafnMKdEhh2rp3KDzrz` (VALID)

**This mismatch prevents buy orders from working and requires a smart contract update.**
