# EverRise Price Formula Documentation

## Overview

EverRise ($EVER) employs a dynamic pricing mechanism that guarantees perpetual upward momentum. The price is determined by a bonding curve similar to Uniswap's constant product model (K \= X \* Y), providing a baseline value, plus a cumulative appreciation bonus triggered exclusively by buys from the sales queue (peer-to-peer trades). This bonus adds a 0.1% uplift scaled by the trade volume, normalized against the current price and circulating supply, ensuring growth accelerates with real user activity while maintaining stability.

Additionally, to enforce minimum daily growth, the system checks the price appreciation over each 24-hour period. If the organic growth (from bonding curve updates and bonuses) is below 0.02%, an automatic boost is applied to reach exactly 0.02% for that day, acting like a safety net for consistent ascent.

**Key Principles:**

- **Baseline Bonding Curve**: Mimics a liquidity pool where price rises as supply (Y) decreases, starting with ample reserves for instant buys.  
- **Appreciation Bonus**: Only activates on queue-based buys (not reserve buys), cumulatively stacking small percentage increases to fuel long-term ascent.  
- **Daily Minimum Boost**: A conditional uplift ensuring at least 0.02% growth per day, applied if needed, to prevent stagnation during low-activity periods.  
- **Perpetual Growth**: Every transaction (buy or sell) indirectly supports upward pressure via queue mechanics and treasury buybacks, but the formula focuses on price calculation.  
- **No Traditional LP**: Uses a smart queue for matching; reserves handle unmatched buys, with funds flowing to a treasury for strategic buybacks.

## Variable Definitions

- **X**: Quantity of USDC (or equivalent stablecoin) in the virtual "liquidity pool" reserve.  
    
  - Initial Value: 100,000 USDC.  
  - Behavior: Increases when users buy from reserves (adding USDC to the pool) or through treasury actions. Does not decrease on sells, as sells queue for peer matches.  
  - Role: Represents accumulated value backing the token, driving the bonding curve higher as X grows.


- **Y**: Quantity of EverRise tokens ($EVER) available in reserves.  
    
  - Initial/Max Supply: 1,000,000,000 (1B) tokens.  
  - Behavior: Decreases every time a buy occurs from the reserve (e.g., when no sellers are queued). Once depleted, all buys must come from the sales queue.  
  - Role: Acts as the "supply side" in the bonding curve; shrinking Y naturally increases the baseline price.


- **K**: Constant product for the bonding curve (K \= X \* Y).  
    
  - Behavior: Recalculated after each reserve buy (as X increases and Y decreases), effectively raising the curve. Remains constant between such events.  
  - Role: Ensures price stability and automatic appreciation as reserves are tapped.


- **V**: Volume of the purchase in USDC, specifically for buys fulfilled from the sales queue (peer-to-peer).  
    
  - Behavior: Measured at the time of the transaction; ignored for reserve buys (no bonus applied).  
  - Role: Scales the appreciation bonus; larger queue trades yield bigger cumulative uplifts.


- **SC**: Circulating supply of $EVER tokens that have been bought by users (excluding reserves).  
    
  - Initial Value: 0\.  
  - Behavior: Increases with every buy (from queue or reserves), as tokens enter user wallets. Does not decrease on sells (sells queue but tokens remain in circulation until bought).  
  - Role: Normalizes the bonus to prevent over-inflation as the ecosystem scales; larger SC means smaller relative impact per trade.


- **P(Y)**: Current price of $EVER in USDC, as a function of Y.  
    
  - Formula: P(Y) \= \[X / Y \+ Σ\[(0.001 \* V) / ((X / Y) \* SC)\]\] \* (1 \+ DailyBoost) if applicable.  
  - Components:  
    - First Term (Baseline): X / Y – The bonding curve price, rising as Y shrinks or X grows.  
    - Second Term (Bonus): Sum of all historical bonuses from queue buys, each adding 0.1% (0.001) of the trade's relative value.  
    - Daily Boost: A conditional multiplier ensuring minimum 0.02% growth per 24-hour period.


- **Additional Tracking Variables**:  
    
  - **P\_start**: Price at the start of the current 24-hour period (e.g., midnight UTC).  
  - **T\_start**: Timestamp marking the start of the current day.  
  - **OrganicGrowth**: Calculated as (CurrentOrganicP / P\_start) \- 1, where CurrentOrganicP is the price before any daily boost.

## Core Price Formula

The organic price (before daily boost) at any given state is:

$$ P\_{\\text{organic}}(Y) \= \\frac{X}{Y} \+ \\sum\_{i=1}^{n} \\frac{0.001 \\times V\_i}{\\left( \\frac{X\_i}{Y\_i} \\right) \\times SC\_i} $$

Where:

- The sum is over all historical queue-based buys (i \= 1 to n).  
- For each historical buy i:  
  - (V\_i): USDC volume of that specific queue buy.  
  - (X\_i / Y\_i): Bonding curve price at the exact time of that buy.  
  - (SC\_i): Circulating supply at the time of that buy.  
- Note: The bonus is cumulative and permanent—once added, it persists in the price forever, stacking like layers of rocket boosters.

The final price incorporates the daily minimum boost:

If the current timestamp is within the same day as T\_start and OrganicGrowth \< 0.0002, then:  
$$ P(Y) \= P\_{\\text{organic}}(Y) \\times \\left(1 \+ (0.0002 \- \\text{OrganicGrowth})\\right) $$

Else (new day or growth already met): Reset P\_start to current P\_organic(Y), update T\_start to current day start, and P(Y) \= P\_organic(Y).

- This "if statement" applies the boost only if needed, checked on every price query or update, but the boost is temporary for that day—resetting at day end to avoid compounding artificially.

## Step-by-Step Logic for Price Updates

1. **Initialize System**:  
     
   - Set X \= 100,000 USDC.  
   - Set Y \= 1,000,000,000 $EVER.  
   - Set SC \= 0\.  
   - K \= X \* Y \= 100,000 \* 1,000,000,000.  
   - Bonus Sum \= 0 (no queue buys yet).  
   - Set P\_start \= X / Y ≈ 0.0001 USDC.  
   - Set T\_start \= Current day start timestamp (e.g., floor to midnight UTC).  
   - Initial P(Y) \= P\_organic(Y) (no boost needed yet).

   

2. **On a Buy Transaction**:  
     
   - Determine fulfillment:  
     - If sales queue has matching sell orders: Fulfill from queue (peer-to-peer).  
       - Calculate V \= tokens\_bought \* current\_P(Y).  
       - Add bonus: (0.001 \* V) / (current\_P\_organic(Y) \* SC).  
       - Append to cumulative sum.  
       - Update SC \+= tokens\_bought.  
     - If queue empty: Fulfill from reserves (if Y \> 0).  
       - No bonus added (sum unchanged).  
       - Update X \+= V (USDC added to pool).  
       - Update Y \-= tokens\_bought.  
       - Recalculate K \= X \* Y.  
       - Update SC \+= tokens\_bought.  
   - Recalculate P\_organic(Y) with updated baseline \+ full bonus sum.  
   - Check if new day: If current timestamp \>= T\_start \+ 86400 seconds, reset P\_start \= P\_organic(Y), T\_start \= new day start.  
   - Calculate OrganicGrowth \= (P\_organic(Y) / P\_start) \- 1\.  
   - If OrganicGrowth \< 0.0002, apply boost: P(Y) \= P\_organic(Y) \* (1 \+ (0.0002 \- OrganicGrowth)).  
   - Else: P(Y) \= P\_organic(Y).

   

3. **On a Sell Transaction**:  
     
   - Add to sales queue at current P(Y).  
   - No direct price change (price only updates on buys).  
   - If backlog grows, treasury may buy back, triggering a "buy" flow (potentially from queue, adding bonus if applicable).  
   - Re-query P(Y) with daily check as above.

   

4. **Querying Current Price**:  
     
   - Compute P\_organic(Y) \= baseline \+ bonus sum.  
   - Perform daily reset/check as in step 2\.  
   - Apply boost if OrganicGrowth \< 0.0002.  
   - No time-based decay; bonuses are eternal, but daily boost is recalculated fresh each query.

## Implementation Notes for Solana Smart Contract

- **Storage**: Use program accounts/PDAs for:  
  - Global state: X, Y, SC, K, P\_start, T\_start.  
  - Bonus history: An append-only array or linked accounts for sum terms (store running total and add incrementally). Limit size with efficient packing (e.g., fixed-point decimals).  
- **Precision**: Use u128 or fixed-point libraries (e.g., spl-math) for decimals; avoid floats to prevent rounding errors in sums or growth calculations.  
- **Timestamps**: Rely on Solana's block.timestamp for current time; floor to day start (e.g., timestamp / 86400 \* 86400).  
- **Events**: Emit on-chain events for each bonus addition and daily boost applications for transparency/indexing.  
- **Security**: Audit for overflows in sums/X/Y/growth calcs; ensure atomicity in buy fulfillment and daily checks to prevent races or manipulation.  
- **Tuning**: The 0.001 factor (0.1%) and 0.0002 daily min are fixed but can be constants; simulate with expected volumes to balance growth.  
- **Edge Cases**:  
  - Y \== 0: Force all buys from queue; price relies heavily on bonuses and daily boost.  
  - SC \== 0 (early): Bonus denominator avoids division by zero (initial buys from reserves build SC first).  
  - Low activity day: Boost auto-applies on queries if growth \< 0.02%.  
  - High volume: Optimize sum storage to handle thousands of terms without bloating accounts.  
  - Day boundaries: Handle timezone consistently (UTC recommended).

This enhanced formula catapults EverRise into unbreakable orbit: bonding curve for foundation, bonuses for thrill, and daily boosts for assurance. It's the ultimate engine for a token that laughs at market dips—only endless climb ahead.  
