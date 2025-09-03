import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import IDL from '../everrise_dex.json';

// Contract configuration
export const PROGRAM_ID = new PublicKey('9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy');
export const BONDING_CURVE_SEED = 'bonding_curve';
export const TREASURY_WALLET = new PublicKey('FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA');

export interface BondingCurveData {
  authority: PublicKey;
  treasuryWallet: PublicKey;
  x: number; // USDC in treasury
  y: number; // EVER in reserve
  k: string; // K constant (u128)
  currentPrice: number;
  sellQueueHead: number;
  sellQueueTail: number;
  buyQueueHead: number;
  buyQueueTail: number;
  cumulativeBonus: number;
  lastPriceUpdate: number;
  dailyBoostApplied: boolean;
  circulatingSupply: number;
  lastDailyBoost: number;
  totalVolume24h: number;
}

export class ContractService {
  private program: Program;
  private connection: Connection;
  private wallet: WalletContextState;

  constructor(connection: Connection, wallet: WalletContextState) {
    this.connection = connection;
    this.wallet = wallet;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = new AnchorProvider(connection, wallet as any, {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.program = new Program(IDL as any, provider);
  }

  // Get bonding curve PDA
  getBondingCurvePDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE_SEED)],
      PROGRAM_ID
    );
    return pda;
  }

  // Fetch bonding curve data
  async getBondingCurveData(): Promise<BondingCurveData | null> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      const data = await this.program.account.bondingCurve.fetch(bondingCurvePDA);
      
      return {
        authority: data.authority,
        treasuryWallet: data.treasuryWallet,
        x: data.x.toNumber(),
        y: data.y.toNumber(),
        k: data.k.toString(),
        currentPrice: data.currentPrice.toNumber(),
        sellQueueHead: data.sellQueueHead.toNumber(),
        sellQueueTail: data.sellQueueTail.toNumber(),
        buyQueueHead: data.buyQueueHead.toNumber(),
        buyQueueTail: data.buyQueueTail.toNumber(),
        cumulativeBonus: data.cumulativeBonus.toNumber(),
        lastPriceUpdate: data.lastPriceUpdate.toNumber(),
        dailyBoostApplied: data.dailyBoostApplied,
        circulatingSupply: data.circulatingSupply.toNumber(),
        lastDailyBoost: data.lastDailyBoost.toNumber(),
        totalVolume24h: data.totalVolume24h.toNumber(),
      };
    } catch (error) {
      console.error('Error fetching bonding curve data:', error);
      return null;
    }
  }

  // Calculate current price from bonding curve
  calculatePrice(x: number, y: number): number {
    if (y === 0) return 0;
    // Convert from 6 decimals (USDC) to 9 decimals (EVER) and back to 6 decimals for display
    return (x * 1_000_000_000) / (y * 1_000_000);
  }

  // Buy EVER tokens
  async buyTokens(usdcAmount: number): Promise<string> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      const usdcAmountBN = Math.floor(usdcAmount * 1_000_000); // Convert to 6 decimals

      const tx = await this.program.methods
        .buy(usdcAmountBN)
        .accounts({
          bondingCurve: bondingCurvePDA,
          user: this.wallet.publicKey!,
          treasuryWallet: TREASURY_WALLET,
          systemProgram: PublicKey.default,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error buying tokens:', error);
      throw error;
    }
  }

  // Sell EVER tokens
  async sellTokens(everAmount: number): Promise<string> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      const everAmountBN = Math.floor(everAmount * 1_000_000_000); // Convert to 9 decimals

      const tx = await this.program.methods
        .sell(everAmountBN)
        .accounts({
          bondingCurve: bondingCurvePDA,
          user: this.wallet.publicKey!,
          treasuryWallet: TREASURY_WALLET,
          systemProgram: PublicKey.default,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error selling tokens:', error);
      throw error;
    }
  }

  // Get user's EVER token balance
  async getUserEverBalance(): Promise<number> {
    try {
      // This would need to be implemented with SPL token accounts
      // For now, return 0
      return 0;
    } catch (error) {
      console.error('Error getting user EVER balance:', error);
      return 0;
    }
  }

  // Get user's USDC balance
  async getUserUSDCBalance(): Promise<number> {
    try {
      // This would need to be implemented with SPL token accounts
      // For now, return 0
      return 0;
    } catch (error) {
      console.error('Error getting user USDC balance:', error);
      return 0;
    }
  }
}
