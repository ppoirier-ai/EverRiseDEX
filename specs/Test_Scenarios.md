 # EverRiseDEX - Comprehensive Test Scenarios

## Initial State
- **Treasury USDC**: 100,000 USDC (X = 100,000 * 10^6 = 100,000,000,000)
- **Reserve EVER**: 1,000,000,000 EVER (Y = 1,000,000,000 * 10^9 = 1,000,000,000,000,000,000)
- **Initial Price**: 100,000,000,000 / 1,000,000,000,000,000,000 = 0.0001 USDC per EVER
- **K Constant**: 100,000,000,000 * 1,000,000,000,000,000,000 = 100,000,000,000,000,000,000,000,000

## Test Participants
- **Alice**: 100,000 USDC, 0 EVER
- **Bob**: 50,000 USDC, 0 EVER  
- **Charlie**: 25,000 USDC, 0 EVER
- **Diana**: 0 USDC, 500,000 EVER
- **Eve**: 0 USDC, 200,000 EVER

---

## Test Scenario 1: Initial Buy Order
**Action**: Alice buys 1,000 USDC worth of EVER
**Expected Process**: Direct buy from reserves (no sell queue)
**Calculation**:
- New X = 100,000,000,000 + 1,000,000,000 = 101,000,000,000
- New Y = 100,000,000,000,000,000,000,000,000 / 101,000,000,000 = 990,099,009,900,990,099
- EVER received = 1,000,000,000,000,000,000 - 990,099,009,900,990,099 = 9,900,990,099,009,901
- New price = 101,000,000,000 / 990,099,009,900,990,099 = 0.000102 USDC per EVER

**Expected Results**:
- Alice: 99,000 USDC, 9,900,990,099,009,901 EVER
- Treasury: 101,000 USDC, 990,099,009,900,990,099 EVER
- Price: 0.000102 USDC per EVER

---

## Test Scenario 2: Sell Order to Queue
**Action**: Diana sells 100,000 EVER at current price
**Expected Process**: Add to sell queue, wait for matching
**Calculation**:
- Current price = 0.000121 USDC per EVER
- USDC value = 100,000 * 0.000121 = 12.1 USDC
- Locked price = 0.000121 USDC per EVER

**Expected Results**:
- Diana: 0 USDC, 400,000 EVER (100,000 in queue)
- Sell Queue: 1 order (100,000 EVER at 0.000121 USDC)
- Price: 0.000121 USDC per EVER (unchanged)

---

## Test Scenario 3: Buy Order with Queue Matching
**Action**: Bob buys 5,000 USDC worth of EVER
**Expected Process**: Match with Diana's sell order (partial fill)
**Calculation**:
- Diana's order: 100,000 EVER at 0.000121 USDC
- Bob's USDC: 5,000 USDC
- EVER from Diana: 5,000 / 0.000121 = 41,322,314,049,586,777 EVER
- Remaining in Diana's order: 100,000 - 41,322,314,049,586,777 = 58,677,685,950,413,223 EVER
- Appreciation bonus: (0.001 * 5,000) / (0.000121 * 1,000,000,000) = 0.0413 USDC

**Expected Results**:
- Bob: 45,000 USDC, 41,322,314,049,586,777 EVER
- Diana: 5,000 USDC, 400,000 EVER (58,677,685,950,413,223 in queue)
- Sell Queue: 1 order (58,677,685,950,413,223 EVER at 0.000121 USDC)
- Price: 0.000121 USDC per EVER (unchanged, queue transaction)

---

## Test Scenario 4: Complete Sell Order Fill
**Action**: Charlie buys 10,000 USDC worth of EVER
**Expected Process**: Complete Diana's sell order + buy from reserves
**Calculation**:
- Diana's remaining: 95,098,039,215,686,275 EVER at 0.001020 USDC
- USDC for Diana: 95,098,039,215,686,275 * 0.001020 = 97,000 USDC
- Charlie's remaining USDC: 10,000 - 97 = 9,903 USDC
- EVER from reserves: Calculate using bonding curve with remaining USDC
- Appreciation bonus for Diana's portion: (0.001 * 97) / (0.001020 * 1,000,000,000) = 0.000095 USDC

**Expected Results**:
- Charlie: 15,000 USDC, [EVER from Diana + reserves]
- Diana: 97 USDC, 400,000 EVER (order completed)
- Sell Queue: Empty
- Price: [New price after reserve buy]

---

## Test Scenario 5: Multiple Sell Orders
**Action**: Eve sells 50,000 EVER at current price
**Expected Process**: Add to sell queue
**Calculation**:
- Current price = [Price after Scenario 4]
- USDC value = 50,000 * current_price
- Locked price = current_price

**Expected Results**:
- Eve: 0 USDC, 150,000 EVER (50,000 in queue)
- Sell Queue: 1 order (50,000 EVER at current_price)

---

## Test Scenario 6: Large Buy Order
**Action**: Alice buys 25,000 USDC worth of EVER
**Expected Process**: Match with Eve's sell order + buy from reserves
**Calculation**:
- Eve's order: 50,000 EVER at locked_price
- USDC for Eve: 50,000 * locked_price
- Alice's remaining USDC: 25,000 - USDC_for_Eve
- EVER from reserves: Calculate using bonding curve
- Appreciation bonus for Eve's portion

**Expected Results**:
- Alice: [Remaining USDC], [EVER from Eve + reserves]
- Eve: [USDC from Alice], 150,000 EVER (order completed)
- Sell Queue: Empty
- Price: [New price after reserve buy]

---

## Test Scenario 7: Daily Boost Application
**Action**: Apply daily boost (simulate 1 day passing)
**Expected Process**: Calculate minimum daily growth
**Calculation**:
- Organic price = X / Y
- Minimum price = current_price * 1.0002 (0.02% daily growth)
- Use higher of organic or minimum price
- Apply difference to cumulative bonus

**Expected Results**:
- Price: [Higher of organic or minimum price]
- Cumulative bonus: [Previous + price difference]

---

## Test Scenario 8: Small Buy Order
**Action**: Bob buys 1,000 USDC worth of EVER
**Expected Process**: Direct buy from reserves (no sell queue)
**Calculation**:
- New X = current_X + 1,000,000,000
- New Y = K / new_X
- EVER received = current_Y - new_Y
- New price = new_X / new_Y

**Expected Results**:
- Bob: [Previous USDC - 1,000], [Previous EVER + received_EVER]
- Treasury: [Previous USDC + 1,000], [Previous EVER - received_EVER]
- Price: [New calculated price]

---

## Test Scenario 9: Emergency Refund Scenario
**Action**: Simulate failed transaction and emergency refund
**Expected Process**: Refund USDC after 1 hour timeout
**Calculation**:
- Check if 1 hour has passed since buy order
- Refund full USDC amount to buyer
- Mark buy order as processed

**Expected Results**:
- Buyer: [Original USDC amount restored]
- Treasury: [USDC amount returned]
- Buy Queue: Order marked as processed

---

## Test Scenario 10: Concurrent Transactions
**Action**: Multiple buy orders processed simultaneously
**Expected Process**: FIFO processing with proper state management
**Calculation**:
- Process buy orders in sequence
- Each order affects bonding curve state
- Proper queue management

**Expected Results**:
- All orders processed in correct order
- State consistency maintained
- No race conditions

---

## Test Scenario 11: Partial Fill Edge Case
**Action**: Buy order larger than single sell order
**Expected Process**: Partial fill of sell order, remaining from reserves
**Calculation**:
- Fill sell order completely
- Calculate remaining USDC
- Buy remaining from reserves
- Update sell order state

**Expected Results**:
- Sell order: Fully consumed, marked as processed
- Buyer: [EVER from sell order + reserves]
- Price: [Updated after reserve buy]

---

## Test Scenario 12: Price Consistency Check
**Action**: Verify price consistency across all operations
**Expected Process**: Price should be consistent with bonding curve
**Calculation**:
- Verify price = X / Y
- Check cumulative bonus application
- Validate daily boost integration

**Expected Results**:
- Price matches bonding curve calculation
- Cumulative bonus properly applied
- Daily boost correctly integrated

---

## Test Scenario 13: Queue State Management
**Action**: Verify queue head/tail pointers
**Expected Process**: Proper queue management
**Calculation**:
- Check queue head <= tail
- Verify processed orders are skipped
- Validate queue position tracking

**Expected Results**:
- Queue pointers correctly managed
- No processed orders in active queue
- Proper position tracking

---

## Test Scenario 14: Error Handling
**Action**: Test various error conditions
**Expected Process**: Proper error handling and validation
**Calculation**:
- Test invalid amounts
- Test insufficient funds
- Test queue empty conditions

**Expected Results**:
- Appropriate error codes returned
- No state corruption
- Clear error messages

---

## Test Scenario 15: Event Emission
**Action**: Verify all events are properly emitted
**Expected Process**: Check event data accuracy
**Calculation**:
- Verify event parameters
- Check event timing
- Validate event data

**Expected Results**:
- All events properly emitted
- Event data matches transaction data
- Proper event sequencing

---

## Expected Final State Summary
After all test scenarios, we should have:
- **Consistent price calculation** across all operations
- **Proper queue management** with correct head/tail pointers
- **Accurate token balances** for all participants
- **Correct cumulative bonus** accumulation
- **Proper daily boost** application
- **Event emission** for all operations
- **Error handling** for edge cases
- **State consistency** throughout all transactions

## Validation Criteria
1. **Price Consistency**: Price = X / Y + cumulative_bonus
2. **Queue Management**: head <= tail, processed orders skipped
3. **Token Balances**: Sum of all balances = initial total
4. **Event Accuracy**: Event data matches transaction data
5. **Error Handling**: Appropriate errors for invalid operations
6. **State Management**: No state corruption or race conditions
