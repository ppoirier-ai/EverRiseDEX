# EverRise DEX Queue System & Price Calculation Specifications

## 🚨 Critical Issues Identified

### **Current Implementation Problems**
1. **Race Conditions**: Concurrent buy transactions can interfere with each other
2. **Missing Buy Queue**: No FIFO ordering for buy transactions
3. **Price Inconsistency**: Price reconstructed from scratch each time
4. **Transaction Safety**: Risk of USDC loss on failed transactions
5. **Missing Queue Processing**: `process_sell_queue` function not implemented

## 📊 Queue System Architecture

### **Dual Queue System**
- **Buy Queue**: FIFO processing of buy orders with locked prices
- **Sell Queue**: FIFO processing of sell orders (already implemented)

### **Queue Management Structure**
```rust
pub struct BondingCurve {
    // Existing fields...
    pub buy_queue_head: u64,    // Next buy order to process
    pub buy_queue_tail: u64,    // Next position for new buy order
    pub sell_queue_head: u64,   // Next sell order to process
    pub sell_queue_tail: u64,   // Next position for new sell order
    pub cumulative_bonus: u64,  // Sum of all historical bonuses
    pub current_price: u64,     // Current locked price
    pub last_price_update: i64, // Timestamp of last price update
    pub daily_boost_applied: bool, // Whether daily boost was applied today
}
```

### **Buy Order Structure**
```rust
pub struct BuyOrder {
    pub buyer: Pubkey,          // Buyer's wallet address
    pub usdc_amount: u64,       // USDC amount to spend
    pub locked_price: u64,      // Price at time of queue entry
    pub expected_tokens: u64,   // Expected tokens to receive
    pub timestamp: i64,         // Queue entry timestamp
    pub processed: bool,        // Whether order has been processed
    pub bump: u8,              // PDA bump
}
```

### **Sell Order Structure** (Enhanced)
```rust
pub struct SellOrder {
    pub seller: Pubkey,         // Seller's wallet address
    pub ever_amount: u64,       // EVER tokens to sell
    pub locked_price: u64,      // Price at time of queue entry
    pub expected_usdc: u64,     // Expected USDC to receive
    pub timestamp: i64,         // Queue entry timestamp
    pub processed: bool,        // Whether order has been processed
    pub bump: u8,              // PDA bump
}
```

## 🔄 Transaction Flow

### **Buy Transaction Flow**
```
1. User initiates buy → Add to buy queue with locked price
2. Queue processor handles orders sequentially (FIFO)
3. For each buy order:
   a. Check if sell queue has matching orders
   b. If yes: Process peer-to-peer matching
   c. If no: Buy from reserves (bonding curve)
   d. Update price and cumulative bonuses
   e. Mark order as processed
4. Update bonding curve state
5. Apply daily boost if needed
```

### **Sell Transaction Flow**
```
1. User initiates sell → Add to sell queue with locked price
2. Order waits in queue for matching buy orders
3. When processed by buy orders:
   a. Transfer EVER tokens to buyer
   b. Transfer USDC to seller
   c. Apply appreciation bonus
   d. Mark order as processed
```

## 💰 Price Calculation System

### **Volume-Weighted Appreciation Formula**
```
Bonus = (0.001 × V) / (current_price × SC)

Where:
- V = Volume of the buy in USDC
- current_price = Current bonding curve price (X/Y)
- SC = Circulating supply of EVER tokens
```

### **Cumulative Price Formula**
```
P(Y) = [X/Y + Σ(Bonus_i)] × (1 + DailyBoost)

Where:
- X/Y = Bonding curve baseline price
- Σ(Bonus_i) = Sum of all historical bonuses
- DailyBoost = 0.0002 if organic growth < 0.02%
```

### **Price Storage Strategy**
- **Current Price**: Stored in bonding curve state
- **Cumulative Bonus**: Running total of all bonuses
- **Daily Boost State**: Track if boost was applied today
- **Price Updates**: Only on successful transaction completion

## 🔒 Transaction Safety Measures

### **Atomic Operations**
- All price updates are atomic
- Failed transactions don't affect price
- USDC transfers only after successful processing
- Rollback mechanism for failed operations

### **Concurrent Transaction Handling**
- Buy queue ensures FIFO processing
- Price locked at queue entry time
- No mid-transaction price changes
- Sequential processing prevents race conditions

### **Error Handling**
- Comprehensive input validation
- Overflow protection for all calculations
- Graceful failure handling
- User fund protection

## 🚀 Implementation Priority

### **Phase 1: Critical Fixes (URGENT)**
1. **Implement Buy Queue System**
   - Create BuyOrder PDA structure
   - Add buy queue management
   - Implement FIFO processing

2. **Fix Price Calculation**
   - Add persistent price storage
   - Implement cumulative bonus tracking
   - Add volume-weighted formula

3. **Complete Queue Processing**
   - Implement `process_sell_queue` function
   - Add peer-to-peer matching
   - Add appreciation bonus calculation

4. **Add Transaction Safety**
   - Implement atomic price updates
   - Add USDC protection
   - Add concurrent transaction handling

### **Phase 2: Testing & Validation**
1. **Unit Testing**
   - Test all price calculation scenarios
   - Validate queue processing logic
   - Test concurrent transaction handling

2. **Integration Testing**
   - End-to-end transaction flows
   - High-volume scenario testing
   - Edge case validation

3. **Security Testing**
   - Race condition testing
   - Transaction safety validation
   - Error handling verification

## 📋 Success Criteria

### **Technical Requirements**
- ✅ Zero race conditions in concurrent transactions
- ✅ 100% transaction success rate (no USDC loss)
- ✅ Accurate price calculations with cumulative bonuses
- ✅ Proper queue processing with FIFO ordering

### **Performance Requirements**
- ✅ Transaction processing time < 1 second
- ✅ Queue processing time < 24 hours under normal load
- ✅ Price consistency across all transactions
- ✅ Proper error handling and recovery

---

**Status**: Ready for implementation
**Priority**: CRITICAL - Must be completed before any deployment
**Estimated Time**: 2-3 days for core implementation
