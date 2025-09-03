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
      
      // Try to fetch the account data directly
      const accountInfo = await this.connection.getAccountInfo(bondingCurvePDA);
      if (!accountInfo) {
        console.error('Bonding curve account does not exist');
        return null;
      }
      
      // For now, return mock data since the account layout might be different
      // This will be fixed once we get the proper account structure
      return {
        authority: bondingCurvePDA, // Placeholder
        treasuryWallet: TREASURY_WALLET,
        x: 10_000_000_000, // 10,000 USDC in 6 decimals
        y: 100_000_000_000_000_000, // 100M EVER in 9 decimals
        k: "1000000000000000000000000000", // K constant
        currentPrice: 100, // 0.0001 USDC per EVER
        sellQueueHead: 0,
        sellQueueTail: 0,
        buyQueueHead: 0,
        buyQueueTail: 0,
        cumulativeBonus: 0,
        lastPriceUpdate: Math.floor(Date.now() / 1000),
        dailyBoostApplied: false,
        circulatingSupply: 0,
        lastDailyBoost: Math.floor(Date.now() / 1000),
        totalVolume24h: 0,
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

  // Get buy order PDA
  getBuyOrderPDA(userPubkey: PublicKey, orderIndex: number): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('buy_order'), userPubkey.toBuffer(), Buffer.from(orderIndex.toString())],
      PROGRAM_ID
    );
    return pda;
  }

  // Buy EVER tokens
  async buyTokens(usdcAmount: number): Promise<string> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      const userPubkey = this.wallet.publicKey!;
      const buyOrderPDA = this.getBuyOrderPDA(userPubkey, 0); // Use index 0 for now
      const usdcAmountBN = Math.floor(usdcAmount * 1_000_000); // Convert to 6 decimals

      const tx = await this.program.methods
        .buy(usdcAmountBN)
        .accounts({
          bondingCurve: bondingCurvePDA,
          buyOrder: buyOrderPDA,
          user: userPubkey,
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

  // Get sell order PDA
  getSellOrderPDA(userPubkey: PublicKey, orderIndex: number): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('sell_order'), userPubkey.toBuffer(), Buffer.from(orderIndex.toString())],
      PROGRAM_ID
    );
    return pda;
  }

  // Sell EVER tokens
  async sellTokens(everAmount: number): Promise<string> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      const userPubkey = this.wallet.publicKey!;
      const sellOrderPDA = this.getSellOrderPDA(userPubkey, 0); // Use index 0 for now
      const everAmountBN = Math.floor(everAmount * 1_000_000_000); // Convert to 9 decimals

      const tx = await this.program.methods
        .sell(everAmountBN)
        .accounts({
          bondingCurve: bondingCurvePDA,
          sellOrder: sellOrderPDA,
          user: userPubkey,
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
