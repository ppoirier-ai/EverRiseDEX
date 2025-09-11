import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - Litepaper',
  subtitle: 'Bitcoin pioneered money that cannot be printed. EverRise improved with prices that cannot be haggled.',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `Ever fell prey to pump and dump schemes? Buying an asset at the top, only to suffer a massive crash not long after? You'll want to pay attention to EverRise, the innovative asset that is programmatically designed to never decrease in price. While Bitcoin pioneered money that cannot be printed, EverRise improved with prices that cannot be haggled.

In an era where financial markets are increasingly plagued by short-term volatility, the world demands a new breed of store of value—one that shields investors from the erratic swings of traditional assets while delivering consistent, long-term growth. Traditional stores like gold or government bonds offer stability but often lag in appreciation, while cryptocurrencies like Bitcoin promise revolutionary upside yet expose holders to dramatic drawdowns driven by speculation and macroeconomic pressures.

EverRise ($EVER) emerges as an innovative alternative—a cryptocurrency engineered for perpetual upward momentum, offering a different paradigm from traditional approaches. By eliminating traditional liquidity pools and incorporating an atomic transaction system, EverRise aims to provide stability and long-term value accrual for holders.`
    },
    {
      id: 'need-for-new-store',
      title: 'The Need for a New Store of Value',
      content: `The global financial landscape is evolving rapidly, with inflation eroding fiat currencies and geopolitical uncertainties amplifying market turbulence. Investors seek assets that not only preserve wealth but actively compound it without the heart-stopping volatility that characterizes many cryptocurrencies.

Since the beginning of time, every asset humanity has known has bowed to expansion and negotiation. Gold's price surges? Dig deeper, flood the market with more supply, and watch value haggle downward. Oil, land, even ancient barter goods—rising demand always invites more creation, diluting the pie, while prices get talked up or down based on whims.

Bitcoin shattered that cycle as the first truly unprintable money: A fixed 21 million cap, code-enforced scarcity that no one could inflate away. It was a big bang for programmable currency, proving money could resist endless dilution.

But what if we took it further? EverRise concepts the first unhaggleable price asset, where the algorithm prevents any downward debate—prices can't be negotiated down, designed to only go up at a manageable rate.`
    },
    {
      id: 'core-mechanics',
      title: 'Core Mechanics',
      content: `EverRise operates on a foundation that prioritizes upward price momentum. Key features include:

• Perpetual Price Increase: Utilizes a bonding curve model engineered such that the price never decreases and only increases with every buy transaction, creating consistent growth.

• Atomic Trading: Transactions are processed immediately through atomic operations, ensuring instant execution without waiting periods.

• Reserve Supply Integration: For buys, tokens are drawn from a reserve supply (if available), with proceeds directed to an external treasury. The maximum supply is capped at 100M tokens, ensuring scarcity.

• Treasury Utilization: Accumulated funds in the treasury are held for future strategic purposes, with the potential for yield generation and buybacks.

These elements combine to foster an environment where price appreciation is inherent and predictable.`
    },
    {
      id: 'pricing-formula',
      title: 'Pricing Formula',
      content: `The price of $EVER is calculated using a bonding curve model inspired by constant product mechanisms, augmented by a daily minimum growth assurance.

Variable Definitions:
• X: USDC quantity in the virtual reserve pool. Initial value: 10,000 USDC. Increases with reserve buys.
• Y: $EVER tokens in reserves. Initial/max supply: 100,000,000. Decreases on reserve buys.
• K: Constant product (K = X * Y), updated after reserve transactions.
• SC: Circulating supply of $EVER, starting at 0 and increasing with buys.
• P(Y): Current price in USDC.

Organic Price Calculation:
The base price is calculated using the following formula:

![Organic Price Formula](/images/organic-price-formula.png)

Where:
- The first term **(X / Y)** provides a baseline that rises as reserves diminish
- The summation adds permanent bonuses from queue-based buys
- Each historical queue buy i contributes a bonus scaled by volume and normalized by price and circulating supply

Daily Minimum Boost:
To guarantee at least 0.02% growth per 24-hour period, the system applies a daily boost if organic growth falls below this threshold:

![Daily Boost Formula](/images/daily-boost-formula.png)

This boost is temporary and non-compounding, resetting each day.`
    },
    {
      id: 'affiliate-program',
      title: 'Affiliate Marketing Program',
      content: `EverRise includes an affiliate marketing program designed to drive ecosystem expansion and reward community-driven growth. 

Key Features:
• 5% Commission: Affiliates receive 5% of USDC from reserve purchases as direct commission
• Referral Links: Anyone can generate a unique referral link to share with potential users
• Direct Payment: Commissions are paid directly to the affiliate's USDC account as part of the atomic transaction
• Treasury Fallback: If no referrer is provided, the 5% commission goes to the treasury wallet

The program underscores EverRise's commitment to decentralized, incentive-aligned marketing, fostering widespread adoption while compensating promoters for their role in building the network.`
    },
    {
      id: 'roadmap',
      title: 'Roadmap',
      content: `Digital Asset Treasury Company

There will be the release of a Staking Vault where users can lock their EVER tokens with the intention that they will be converted into stocks of a Nasdaq listed company. The Nasdaq listed company will be a Digital Asset Treasury (DAT) company similar to MicroStrategy.

The EVER tokens that are staked will be used to initiate the process of either an IPO/SPAC once the capital is large enough to complete the listing process. Typically it costs roughly $4M to raise a $250M SPAC. Most of the funds raised in the public listing process will be used to grow a much larger treasury, but stakers will receive a portion of shares of the publicly traded company that is commensurate with their stake.

Note that this staking activity will require KYC (Know Your Customer), which is a standard practice of identification to comply with regulatory authorities, in this case with the SEC.

If the required capital threshold is not reached in a timely manner, stakers will have the opportunity to unstake their locked capital, and this means it is entirely possible that the DAT never comes to fruition.

During the staking process, users will keep benefiting from the price growth of the token, but won't be able to sell or transfer the tokens until they are unlocked.

Also note that stakers will become part of a Decentralized Autonomous Organization with voting rights and visibility on the entire listing process.`
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      content: `EverRise offers a structured framework for cryptocurrency that emphasizes sustained growth and stability. By integrating bonding curves, atomic transaction mechanics, minimum appreciation guarantees, and a treasury-backed system, it positions itself as a reliable asset in the digital economy.

This model draws from advancements in decentralized finance while providing a unique approach to price stability and growth. EverRise represents a new paradigm in digital assets—one where price appreciation is guaranteed by code, not speculation.`
    }
  ]
};

export default function EnglishLitepaper() {
  return (
    <LitepaperLayout 
      language="English" 
      content={litepaperContent} 
    />
  );
}
