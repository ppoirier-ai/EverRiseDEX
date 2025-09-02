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
    pub expected_tokens: u64,   // Estimated tokens (can change based on actual fills)
    pub timestamp: i64,         // Queue entry timestamp
    pub processed: bool,        // Whether order has been processed
    pub bump: u8,              // PDA bump
}
```

### **Sell Order Structure** (Enhanced for Partial Fills)
```rust
pub struct SellOrder {
    pub seller: Pubkey,         // Seller's wallet address
    pub ever_amount: u64,       // Total EVER tokens to sell
    pub remaining_amount: u64,  // Remaining EVER tokens (for partial fills)
    pub locked_price: u64,      // Price at time of queue entry
    pub timestamp: i64,         // Queue entry timestamp
    pub processed: bool,        // true when remaining_amount = 0
    pub bump: u8,              // PDA bump
}
```

## 🔄 Transaction Flow

### **Buy Transaction Flow**
```
1. User initiates buy → Add to buy queue with USDC amount (NO locked price)
2. Queue processor handles orders sequentially (FIFO)
3. For each buy order:
   a. Calculate remaining USDC to spend
   b. While remaining USDC > 0:
      - Check if sell queue has orders
      - If yes: Process partial/full fill from sell order
        * Transfer USDC to seller at sell order's locked price
        * Transfer EVER tokens to buyer
        * Update sell order remaining_amount (or mark processed if fully consumed)
        * Apply appreciation bonus for queue-based transaction
      - If no more sell orders: Buy remaining from reserves
        * Use current bonding curve price (X/Y)
        * No appreciation bonus for reserve buys
   c. Update bonding curve state and price
   d. Mark buy order as processed
4. Apply daily boost if needed
```

### **Sell Transaction Flow**
```
1. User initiates sell → Add to sell queue with locked price
2. Order waits in queue for matching buy orders
3. When processed by buy orders:
   a. Transfer EVER tokens to buyer (partial or full amount)
   b. Transfer USDC to seller at locked price
   c. Update remaining_amount (or mark processed if fully consumed)
   d. Apply appreciation bonus for queue-based transaction
4. Order remains in queue until fully consumed
```

## 🔄 Partial Fill Scenarios

### **Scenario 1: Buy Order < Sell Order**
```
Buy Order: $500 USDC
Sell Order: 10,000 EVER at $0.0001 (locked price)

Processing:
- Buy $500 worth = 5,000 EVER at $0.0001
- Sell order remaining: 5,000 EVER
- Sell order stays in queue with updated remaining_amount
- Apply appreciation bonus for $500 queue transaction
```

### **Scenario 2: Buy Order > Single Sell Order**
```
Buy Order: $1,000 USDC
Sell Queue:
- Order 1: 5,000 EVER at $0.0001 (locked price)
- Order 2: 3,000 EVER at $0.0001 (same price)

Processing:
- Buy $500 from Order 1: 5,000 EVER at $0.0001
- Buy $300 from Order 2: 3,000 EVER at $0.0001
- Remaining $200: Buy from reserves at current bonding curve price
- Apply appreciation bonus for $800 queue transactions
- No bonus for $200 reserve transaction
```

### **Scenario 3: Buy Order > All Sell Orders**
```
Buy Order: $2,000 USDC
Sell Queue:
- Order 1: 1,000 EVER at $0.0001
- Order 2: 500 EVER at $0.0002

Processing:
- Buy $100 from Order 1: 1,000 EVER at $0.0001
- Buy $100 from Order 2: 500 EVER at $0.0002
- Remaining $1,800: Buy from reserves at current bonding curve price
- Apply appreciation bonus for $200 queue transactions
- No bonus for $1,800 reserve transaction
```

### **Key Implementation Details**
- **Partial Fill Handling**: Update `remaining_amount` instead of deleting sell orders
- **Multiple Sell Order Consumption**: Process sell orders sequentially until buy is satisfied
- **Price Consistency**: Each sell order maintains its locked price
- **Appreciation Bonus**: Only applied to queue-based transactions (not reserve buys)
- **FIFO Processing**: Sell orders processed in queue order (head to tail)

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
   - Create BuyOrder PDA structure (NO locked price)
   - Add buy queue management with FIFO processing
   - Implement sequential buy order processing

2. **Fix Price Calculation**
   - Add persistent price storage
   - Implement cumulative bonus tracking
   - Add volume-weighted formula for queue transactions only

3. **Complete Queue Processing with Partial Fills**
   - Implement `process_sell_queue` function
   - Add peer-to-peer matching with partial fill support
   - Add `remaining_amount` tracking for sell orders
   - Add appreciation bonus calculation for queue transactions only

4. **Add Transaction Safety**
   - Implement atomic price updates
   - Add USDC protection
   - Add concurrent transaction handling
   - Ensure proper partial fill handling

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
- ✅ Correct partial fill handling for sell orders
- ✅ Proper price determination at processing time (not queue entry)
- ✅ Appreciation bonus only for queue transactions (not reserve buys)

### **Performance Requirements**
- ✅ Transaction processing time < 1 second
- ✅ Queue processing time < 24 hours under normal load
- ✅ Price consistency across all transactions
- ✅ Proper error handling and recovery

---

**Status**: Ready for implementation
**Priority**: CRITICAL - Must be completed before any deployment
**Estimated Time**: 2-3 days for core implementation
