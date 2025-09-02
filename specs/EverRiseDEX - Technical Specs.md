# EverRiseDEX \- Technical Specs

## Overview

EverRise ($EVER) employs a dynamic pricing mechanism that guarantees perpetual upward momentum. The price is determined by a bonding curve similar to Uniswap's constant product model (K \= X \* Y), providing a baseline value.

Additionally, to enforce minimum daily growth, the system checks the price appreciation over each 24-hour period. If the organic growth (from bonding curve updates) is below 0.02%, an automatic boost is applied to reach exactly 0.02% for that day, acting like a safety net for consistent ascent.

**Key Principles:**

- **Baseline Bonding Curve**: Mimics a liquidity pool where price rises as supply (Y) decreases, starting with ample reserves for instant buys.  
- **Daily Minimum Boost**: A conditional uplift ensuring at least 0.02% growth per day, applied if needed, to prevent stagnation during low-activity periods.  
- **Perpetual Growth**: Every buy transaction leads to upward pressure via queue mechanics and treasury buybacks, but the formula focuses on price calculation.  
- **No Traditional LP**: Uses a smart queue for matching; reserves handle unmatched buys, with funds flowing to a treasury for strategic buybacks.

## Variable Definitions

- **X**: Quantity of USDC (or equivalent stablecoin) in the virtual "liquidity pool" reserve.  
    
  - Initial Value: 100,000 USDC.  
  - Behavior: Increases when the DEX processes a  buy transaction (adding USDC to the pool) or through treasury actions. Prices do not decrease on sells, as sells are just added to the sales queue and will be processed later upon a buy transaction. All sales are priced at the current market price at the moment of being added to the queue.  
  - Role: Represents accumulated value backing the token, driving the bonding curve higher as X grows.


- **Y**: Quantity of EverRise tokens ($EVER) available in reserves.  
    
  - Initial/Max Supply: 1,000,000,000 (1B) tokens.  
  - Behavior: Decreases every time a buy occurs from the reserve (e.g., when no sellers are queued). Since the DEX uses a bounding curve model, the Y tokens will never be fully depleted, but price increase could become exponential.  
  - Role: Acts as the "supply side" in the bonding curve; shrinking Y naturally increases the baseline price.


- **K**: Constant product for the bonding curve (K \= X \* Y).  
    
  - Behavior: Initiated as a constant when the smart contract is initiated at a value of 1,000,000,000 (quantity of EVER tokens) times 100,000 (initial quantity of virtual USDC), effectively raising the curve. Remains constant between such events.  
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
    - Second Term (Bonus): Sum of all historical bonuses from sales queue buys, each adding 0.1% (0.001) of the trade's relative value.  
    - Daily Boost: A conditional multiplier ensuring minimum 0.02% growth per 24-hour period.


- **Additional Tracking Variables**:  
    
  - **P\_start**: Price at the start of the current 24-hour period (e.g., midnight UTC).  
  - **T\_start**: Timestamp marking the start of the current day.  
  - **OrganicGrowth**: Calculated as (CurrentOrganicP / P\_start) \- 1, where CurrentOrganicP is the price before any daily boost.

## Core Price Formula

The organic price (before daily boost) at any given state is:

[![][image1]](https://www.codecogs.com/eqnedit.php?latex=%20P_%7B%5Ctext%7Borganic%7D%7D\(Y\)%20%3D%20%5Cfrac%7BX%7D%7BY%7D%20%2B%20%5Csum_%7Bi%3D1%7D%5E%7Bn%7D%20%5Cfrac%7B0.001%20%5Ctimes%20V_i%7D%7B%5Cleft\(%20%5Cfrac%7BX_i%7D%7BY_i%7D%20%5Cright\)%20%5Ctimes%20SC_i%7D%20#0)

Where:

- The sum is over all historical queue-based buys (i \= 1 to n).  
- For each historical buy i:  
  - (V\_i): USDC volume of that specific queue buy.  
  - (X\_i / Y\_i): Bonding curve price at the exact time of that buy.  
  - (SC\_i): Circulating supply at the time of that buy.  
- Note: The bonus is cumulative and permanent—once added, it persists in the price forever, stacking like layers of rocket boosters.

The final price incorporates the daily minimum boost:

If the current timestamp is within the same day as T\_start and OrganicGrowth \< 0.0002, then:  
[![][image2]](https://www.codecogs.com/eqnedit.php?latex=%20P\(Y\)%20%3D%20P_%7B%5Ctext%7Borganic%7D%7D\(Y\)%20%5Ctimes%20%5Cleft\(1%20%2B%20\(0.0002%20-%20%5Ctext%7BOrganicGrowth%7D\)%5Cright\)%20#0)

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


[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPQAAAA0BAMAAABP6Qh5AAAAMFBMVEX///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAv3aB7AAAAD3RSTlMAid3vzburmXZEVBBmMiJm6649AAAAQElEQVR4Xu3NsQEAEADAMPz/M7sDYtCMXTr3eGXdwWmNtcZaY62x1lhrrDXWGmuNtcZaY62x1lhrrDXWGvtzfQAP8wFnTXTt4wAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,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>