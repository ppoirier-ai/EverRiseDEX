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
```bash
anchor deploy --provider.cluster devnet
```

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
