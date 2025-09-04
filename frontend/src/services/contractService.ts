import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
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
    
    // Create a proper wallet interface for Anchor
    const anchorWallet = {
      publicKey: wallet.publicKey!,
      signTransaction: async (tx: any) => {
        if (!wallet.signTransaction) {
          throw new Error('Wallet does not support signing transactions');
        }
        return await wallet.signTransaction(tx);
      },
      signAllTransactions: async (txs: any[]) => {
        if (!wallet.signAllTransactions) {
          throw new Error('Wallet does not support signing multiple transactions');
        }
        return await wallet.signAllTransactions(txs);
      }
    };
    
    const provider = new AnchorProvider(connection, anchorWallet, {});
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
      
      // Try to fetch the account data using the program
      try {
        const data = await this.program.account.bondingCurve.fetch(bondingCurvePDA);
        
        console.log('Raw bonding curve data:', data);
        
        // Parse the data correctly - handle BN objects properly
        const parsedData = {
          authority: data.authority,
          treasuryWallet: data.treasuryWallet,
          x: data.x ? parseInt(data.x.toString()) : 0,
          y: data.y ? parseInt(data.y.toString()) : 0,
          k: data.k ? data.k.toString() : "0",
          currentPrice: data.currentPrice ? parseInt(data.currentPrice.toString()) : 0,
          sellQueueHead: data.sellQueueHead ? parseInt(data.sellQueueHead.toString()) : 0,
          sellQueueTail: data.sellQueueTail ? parseInt(data.sellQueueTail.toString()) : 0,
          buyQueueHead: data.buyQueueHead ? parseInt(data.buyQueueHead.toString()) : 0,
          buyQueueTail: data.buyQueueTail ? parseInt(data.buyQueueTail.toString()) : 0,
          cumulativeBonus: data.cumulativeBonus ? parseInt(data.cumulativeBonus.toString()) : 0,
          lastPriceUpdate: data.lastPriceUpdate ? parseInt(data.lastPriceUpdate.toString()) : 0,
          dailyBoostApplied: data.dailyBoostApplied || false,
          circulatingSupply: data.circulatingSupply ? parseInt(data.circulatingSupply.toString()) : 0,
          lastDailyBoost: data.lastDailyBoost ? parseInt(data.lastDailyBoost.toString()) : 0,
          totalVolume24h: data.totalVolume24h ? parseInt(data.totalVolume24h.toString()) : 0,
        };
        
        console.log('Parsed bonding curve data:', parsedData);
        return parsedData;
        
      } catch (fetchError) {
        console.error('Could not fetch bonding curve data:', fetchError);
        
        // Try alternative method - fetch raw account data
        try {
          const accountInfo = await this.connection.getAccountInfo(bondingCurvePDA);
          if (!accountInfo) {
            throw new Error('Bonding curve account not found');
          }
          
          console.log('Raw account data length:', accountInfo.data.length);
          console.log('Raw account data:', accountInfo.data);
          
          // For now, return mock data but log the error for debugging
          console.log('Using mock data due to parsing error');
          
        } catch (rawFetchError) {
          console.error('Could not fetch raw account data:', rawFetchError);
        }
        
        // Fallback to mock data
        return {
          authority: bondingCurvePDA, // Placeholder
          treasuryWallet: TREASURY_WALLET,
          x: 10_000_000_000, // 10,000 USDC in 6 decimals
          y: 100_000_000_000_000_000, // 100M EVER in 9 decimals
          k: "1000000000000000000000000000", // K constant
          currentPrice: 100, // 0.0001 USDC per EVER
          sellQueueHead: 0,
          sellQueueTail: 0, // Start with 0 for new orders
          buyQueueHead: 0,
          buyQueueTail: 0, // Start with 0 for new orders
          cumulativeBonus: 0,
          lastPriceUpdate: Math.floor(Date.now() / 1000),
          dailyBoostApplied: false,
          circulatingSupply: 0,
          lastDailyBoost: Math.floor(Date.now() / 1000),
          totalVolume24h: 0,
        };
      }
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

  // Get buy order PDA (uses bonding curve's buy_queue_tail)
  getBuyOrderPDA(bondingCurvePDA: PublicKey, queueTail: number): PublicKey {
    // Convert number to little-endian bytes (8 bytes for u64) to match to_le_bytes()
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(queueTail, 0);
    buffer.writeUInt32LE(0, 4); // High 32 bits are 0 for small numbers
    
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('buy_order'), buffer],
      PROGRAM_ID
    );
    return pda;
  }

  // Get user's USDC token account
  async getUserUsdcAccount(): Promise<PublicKey> {
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'); // USDC DevNet
    return getAssociatedTokenAddress(USDC_MINT, this.wallet.publicKey!);
  }

  // Get user's EVER token account
  async getUserEverAccount(): Promise<PublicKey> {
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb'); // EVER Test Token
    return getAssociatedTokenAddress(EVER_MINT, this.wallet.publicKey!);
  }

  // Get program's USDC token account (treasury)
  async getProgramUsdcAccount(): Promise<PublicKey> {
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'); // USDC DevNet
    return getAssociatedTokenAddress(USDC_MINT, TREASURY_WALLET);
  }

  // Get program's EVER token account (reserve)
  async getProgramEverAccount(): Promise<PublicKey> {
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb'); // EVER Test Token
    return getAssociatedTokenAddress(EVER_MINT, TREASURY_WALLET);
  }

  // Buy EVER tokens (queues the order)
  async buyTokens(usdcAmount: number): Promise<string> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      const userPubkey = this.wallet.publicKey!;
      const usdcAmountBN = new BN(Math.floor(usdcAmount * 1_000_000)); // Convert to 6 decimals using BN

      // Get bonding curve data to get current queue tail
      const bondingCurveData = await this.getBondingCurveData();
      if (!bondingCurveData) {
        throw new Error('Failed to fetch bonding curve data');
      }
      
      const buyOrderPDA = this.getBuyOrderPDA(bondingCurvePDA, bondingCurveData.buyQueueTail);

      // Get all required token accounts
      const userUsdcAccount = await this.getUserUsdcAccount();
      const userEverAccount = await this.getUserEverAccount();
      const programUsdcAccount = await this.getProgramUsdcAccount();

      // Token mint addresses
      const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb'); // EVER Test Token

      // Try using instruction method with manual transaction building
      const instruction = await this.program.methods
        .buy(usdcAmountBN)
        .accounts({
          bondingCurve: bondingCurvePDA,
          buyOrder: buyOrderPDA,
          user: userPubkey,
          userUsdcAccount: userUsdcAccount,
          userEverAccount: userEverAccount,
          programUsdcAccount: programUsdcAccount,
          everMint: EVER_MINT,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          systemProgram: PublicKey.default,
        })
        .instruction();

      const { Transaction, sendAndConfirmTransaction } = await import('@solana/web3.js');
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;
      
      // Sign and send transaction
      const signedTransaction = await this.wallet.signTransaction!(transaction);
      const tx = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await this.connection.confirmTransaction(tx);

      return tx;
    } catch (error) {
      console.error('Error buying tokens:', error);
      throw error;
    }
  }

  // Process buy queue (actually executes the purchase)
  async processBuyQueue(): Promise<string> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      
      // Get bonding curve data to get current queue head
      const bondingCurveData = await this.getBondingCurveData();
      if (!bondingCurveData) {
        throw new Error('Failed to fetch bonding curve data');
      }
      
      // Check if there are orders to process
      if (bondingCurveData.buyQueueHead >= bondingCurveData.buyQueueTail) {
        throw new Error('No buy orders to process');
      }
      
      const buyOrderPDA = this.getBuyOrderPDA(bondingCurvePDA, bondingCurveData.buyQueueHead);
      const sellOrderPDA = this.getSellOrderPDA(bondingCurvePDA, bondingCurveData.sellQueueHead);
      
      // Get required accounts for processing
      const userEverAccount = await this.getUserEverAccount();
      const userUsdcAccount = await this.getUserUsdcAccount(); // This is the seller_usdc_account
      const programUsdcAccount = await this.getProgramUsdcAccount();
      const programEverAccount = await this.getProgramEverAccount();
      
      // Token mint addresses
      const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb'); // EVER Test Token
      
      // Get treasury accounts
      const treasuryUsdcAccount = new PublicKey('9ib4KLusxgGmqQ5qvwPSwD7y4BJRiyyNyeZSQt8S6e61');
      
      // Create instruction for processing buy queue
      const instruction = await this.program.methods
        .processBuyQueue()
        .accounts({
          bondingCurve: bondingCurvePDA,
          buyOrder: buyOrderPDA,
          sellOrder: sellOrderPDA,
          programUsdcAccount: programUsdcAccount,
          programEverAccount: programEverAccount,
          buyerEverAccount: userEverAccount,
          sellerUsdcAccount: userUsdcAccount,
          treasuryUsdcAccount: treasuryUsdcAccount,
          everMint: EVER_MINT,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        })
        .instruction();

      const { Transaction } = await import('@solana/web3.js');
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.wallet.publicKey!;
      
      // Sign and send transaction
      const signedTransaction = await this.wallet.signTransaction!(transaction);
      const tx = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await this.connection.confirmTransaction(tx);

      return tx;
    } catch (error) {
      console.error('Error processing buy queue:', error);
      throw error;
    }
  }

  // Get sell order PDA (uses bonding curve's sell_queue_tail)
  getSellOrderPDA(bondingCurvePDA: PublicKey, queueTail: number): PublicKey {
    // Convert number to little-endian bytes (8 bytes for u64) to match to_le_bytes()
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32LE(queueTail, 0);
    buffer.writeUInt32LE(0, 4); // High 32 bits are 0 for small numbers
    
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('sell_order'), buffer],
      PROGRAM_ID
    );
    return pda;
  }

  // Sell EVER tokens
  async sellTokens(everAmount: number): Promise<string> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      const userPubkey = this.wallet.publicKey!;
      const everAmountBN = new BN(Math.floor(everAmount * 1_000_000_000)); // Convert to 9 decimals using BN

      // Get bonding curve data to get current queue tail
      const bondingCurveData = await this.getBondingCurveData();
      if (!bondingCurveData) {
        throw new Error('Failed to fetch bonding curve data');
      }
      
      const sellOrderPDA = this.getSellOrderPDA(bondingCurvePDA, bondingCurveData.sellQueueTail);

      // Get required token accounts (sell only needs EVER accounts)
      const userEverAccount = await this.getUserEverAccount();
      const programEverAccount = await this.getProgramEverAccount();

      const instruction = await this.program.methods
        .sell(everAmountBN)
        .accounts({
          bondingCurve: bondingCurvePDA,
          sellOrder: sellOrderPDA,
          user: userPubkey,
          userEverAccount: userEverAccount,
          programEverAccount: programEverAccount,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          systemProgram: PublicKey.default,
        })
        .instruction();

      const { Transaction } = await import('@solana/web3.js');
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;
      
      // Sign and send transaction
      const signedTransaction = await this.wallet.signTransaction!(transaction);
      const tx = await this.connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await this.connection.confirmTransaction(tx);

      return tx;
    } catch (error) {
      console.error('Error selling tokens:', error);
      throw error;
    }
  }

  // Get user's EVER token balance
  async getUserEverBalance(): Promise<number> {
    try {
      const { getAccount } = await import('@solana/spl-token');
      const userEverAccount = await this.getUserEverAccount();
      const account = await getAccount(this.connection, userEverAccount);
      return Number(account.amount) / 1_000_000_000; // Convert from 9 decimals
    } catch (error) {
      console.error('Error getting user EVER balance:', error);
      return 0;
    }
  }

  // Get user's USDC balance
  async getUserUSDCBalance(): Promise<number> {
    try {
      const { getAccount } = await import('@solana/spl-token');
      const userUsdcAccount = await this.getUserUsdcAccount();
      const account = await getAccount(this.connection, userUsdcAccount);
      return Number(account.amount) / 1_000_000; // Convert from 6 decimals
    } catch (error) {
      console.error('Error getting user USDC balance:', error);
      return 0;
    }
  }

  // Debug function to manually check bonding curve data
  async debugBondingCurveData(): Promise<void> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      console.log('Bonding curve PDA:', bondingCurvePDA.toString());
      
      // Check if account exists
      const accountInfo = await this.connection.getAccountInfo(bondingCurvePDA);
      if (!accountInfo) {
        console.error('Bonding curve account does not exist!');
        return;
      }
      
      console.log('Account exists, data length:', accountInfo.data.length);
      console.log('Account owner:', accountInfo.owner.toString());
      console.log('Account executable:', accountInfo.executable);
      
      // Try to fetch using program
      try {
        const data = await this.program.account.bondingCurve.fetch(bondingCurvePDA);
        console.log('Successfully fetched data:', data);
      } catch (fetchError) {
        console.error('Failed to fetch with program:', fetchError);
      }
      
    } catch (error) {
      console.error('Debug error:', error);
    }
  }
}
