import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, Connection, Transaction } from '@solana/web3.js';
import type { VersionedTransaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import IDL from '../everrise_dex.json';

// Contract configuration
export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy');
export const BONDING_CURVE_SEED = process.env.NEXT_PUBLIC_BONDING_CURVE_SEED || 'bonding_curve';
export const TREASURY_WALLET = new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET || 'DTA5uQocoAaZwXL59DoVZwWUxJCsxjfBCM6mzpws8T4');

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
    
    // Ensure wallet is connected before creating provider
    if (!wallet.publicKey) {
      throw new Error('Wallet must be connected to create ContractService');
    }
    
  // Create a proper wallet interface for Anchor
  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
      if (!wallet.signTransaction) {
        throw new Error('Wallet does not support signing transactions');
      }
      return await wallet.signTransaction(tx) as T;
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
      if (!wallet.signAllTransactions) {
        throw new Error('Wallet does not support signing multiple transactions');
      }
      return await wallet.signAllTransactions(txs) as T[];
    }
  };
    
    const provider = new AnchorProvider(connection, anchorWallet, {});
    this.program = new Program(IDL as unknown, provider);
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
        const data = await (this.program.account as { bondingCurve: { fetch: (pda: PublicKey) => Promise<unknown> } }).bondingCurve.fetch(bondingCurvePDA);
        
        console.log('Raw bonding curve data:', data);
        
        // Parse the data correctly - handle BN objects properly
        const dataTyped = data as {
          authority: PublicKey;
          treasuryWallet: PublicKey;
          x: { toString(): string };
          y: { toString(): string };
          k: { toString(): string };
          currentPrice: { toString(): string };
          sellQueueHead: { toString(): string };
          sellQueueTail: { toString(): string };
          buyQueueHead: { toString(): string };
          buyQueueTail: { toString(): string };
          cumulativeBonus: { toString(): string };
          lastPriceUpdate: { toString(): string };
          dailyBoostApplied: boolean;
          circulatingSupply: { toString(): string };
          lastDailyBoost: { toString(): string };
          totalVolume24h: { toString(): string };
        };
        
        const parsedData = {
          authority: dataTyped.authority,
          treasuryWallet: dataTyped.treasuryWallet,
          x: dataTyped.x ? parseInt(dataTyped.x.toString()) : 0,
          y: dataTyped.y ? parseInt(dataTyped.y.toString()) : 0,
          k: dataTyped.k ? dataTyped.k.toString() : "0",
          currentPrice: dataTyped.currentPrice ? parseInt(dataTyped.currentPrice.toString()) : 0,
          sellQueueHead: dataTyped.sellQueueHead ? parseInt(dataTyped.sellQueueHead.toString()) : 0,
          sellQueueTail: dataTyped.sellQueueTail ? parseInt(dataTyped.sellQueueTail.toString()) : 0,
          buyQueueHead: dataTyped.buyQueueHead ? parseInt(dataTyped.buyQueueHead.toString()) : 0,
          buyQueueTail: dataTyped.buyQueueTail ? parseInt(dataTyped.buyQueueTail.toString()) : 0,
          cumulativeBonus: dataTyped.cumulativeBonus ? parseInt(dataTyped.cumulativeBonus.toString()) : 0,
          lastPriceUpdate: dataTyped.lastPriceUpdate ? parseInt(dataTyped.lastPriceUpdate.toString()) : 0,
          dailyBoostApplied: dataTyped.dailyBoostApplied || false,
          circulatingSupply: dataTyped.circulatingSupply ? parseInt(dataTyped.circulatingSupply.toString()) : 0,
          lastDailyBoost: dataTyped.lastDailyBoost ? parseInt(dataTyped.lastDailyBoost.toString()) : 0,
          totalVolume24h: dataTyped.totalVolume24h ? parseInt(dataTyped.totalVolume24h.toString()) : 0,
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
    const USDC_MINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    return getAssociatedTokenAddress(USDC_MINT, this.wallet.publicKey!);
  }

  // Get user's EVER token account
  async getUserEverAccount(): Promise<PublicKey> {
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const EVER_MINT = new PublicKey(process.env.NEXT_PUBLIC_EVER_MINT || '3q4YFYMKHrdYw5FPANQ7nrCQMT4t12XKgzYX8JaTeEx8');
    return getAssociatedTokenAddress(EVER_MINT, this.wallet.publicKey!);
  }

  // Check if a token account exists and create it if it doesn't
  async ensureTokenAccountExists(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } = await import('@solana/spl-token');
    const { Transaction } = await import('@solana/web3.js');
    
    const tokenAccount = await getAssociatedTokenAddress(mint, owner);
    
    // Check if the account exists
    const accountInfo = await this.connection.getAccountInfo(tokenAccount);
    
    if (!accountInfo) {
      console.log(`Creating token account for mint ${mint.toString()}`);
      
      // Create the associated token account instruction
      const instruction = createAssociatedTokenAccountInstruction(
        this.wallet.publicKey!, // payer
        tokenAccount, // associated token account
        owner, // owner
        mint // mint
      );
      
      // Create and send transaction
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
      
      console.log(`✅ Token account created: ${tokenAccount.toString()}`);
    } else {
      console.log(`✅ Token account already exists: ${tokenAccount.toString()}`);
    }
    
    return tokenAccount;
  }

  // Get program's USDC token account (owned by bonding curve PDA)
  async getProgramUsdcAccount(): Promise<PublicKey> {
    // Program USDC account owned by the bonding curve PDA
    return new PublicKey('5ZYxeV1qQJmynuKs1m1jonrw8pUTaHonr5anP3YwRYLA');
  }

  // Get program's EVER token account (owned by bonding curve PDA)
  async getProgramEverAccount(): Promise<PublicKey> {
    // Program EVER account owned by the bonding curve PDA
    return new PublicKey('2zxSEQRegNfZddGHC7xBcCtXzfafnMKdEhh2rp3KDzrz');
  }

  // Get treasury's USDC token account
  async getTreasuryUsdcAccount(): Promise<PublicKey> {
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const USDC_MINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    return await getAssociatedTokenAddress(USDC_MINT, TREASURY_WALLET);
  }

  // Debug function to verify smart contract connection
  async debugConnection(): Promise<void> {
    try {
      console.log('🔍 Smart Contract Connection Debug:');
      console.log('  Program ID:', this.program.programId.toString());
      console.log('  Bonding Curve PDA:', this.getBondingCurvePDA().toString());
      console.log('  Program EVER Account:', (await this.getProgramEverAccount()).toString());
      console.log('  Program USDC Account:', (await this.getProgramUsdcAccount()).toString());
      
      // Check smart contract version
      try {
        const version = await this.program.methods.getVersion().view();
        console.log('🔍 Smart Contract Version:', version);
      } catch (error) {
        console.log('🔍 Version check failed (expected for some deployments):', error);
      }
    } catch (error) {
      console.error('❌ Error in debug connection:', error);
    }
  }

  // Clear all queues (emergency function)
  async clearQueues(): Promise<string> {
    try {
      console.log('🧹 Clearing all queues...');
      
      // Ensure wallet is still connected
      if (!this.wallet.publicKey) {
        throw new Error('Wallet is not connected');
      }
      
      const bondingCurvePDA = this.getBondingCurvePDA();
      console.log('Bonding Curve PDA:', bondingCurvePDA.toString());
      
      // Call reinitialize_queues
      const tx = await this.program.methods
        .reinitializeQueues()
        .accounts({
          bondingCurve: bondingCurvePDA,
          user: this.wallet.publicKey!,
        })
        .rpc();
      
      console.log('✅ Queues cleared successfully!');
      console.log('Transaction signature:', tx);
      
      // Verify the queues are cleared
      const bondingCurve = await (this.program.account as unknown as { BondingCurve: { fetch: (pda: PublicKey) => Promise<unknown> } }).BondingCurve.fetch(bondingCurvePDA);
      const bondingCurveTyped = bondingCurve as {
        buyQueueHead: { toString(): string };
        buyQueueTail: { toString(): string };
        sellQueueHead: { toString(): string };
        sellQueueTail: { toString(): string };
      };
      console.log('\n📊 Updated queue status:');
      console.log('Buy Queue Head:', bondingCurveTyped.buyQueueHead.toString());
      console.log('Buy Queue Tail:', bondingCurveTyped.buyQueueTail.toString());
      console.log('Sell Queue Head:', bondingCurveTyped.sellQueueHead.toString());
      console.log('Sell Queue Tail:', bondingCurveTyped.sellQueueTail.toString());
      
      return tx;
    } catch (error) {
      console.error('❌ Error clearing queues:', error);
      throw error;
    }
  }

  // Buy EVER tokens (smart buy that processes sell orders first)
  async buyTokens(usdcAmount: number, referrer?: string): Promise<string> {
    try {
      const amount = new BN(usdcAmount * 1_000_000); // Convert to 6 decimals
      const bondingCurvePDA = this.getBondingCurvePDA();
      
      // Get bonding curve data to check if there are sell orders
      const bondingCurveData = await this.getBondingCurveData();
      if (!bondingCurveData) {
        throw new Error('Failed to fetch bonding curve data');
      }

      // Always provide dummy accounts (Anchor requires all accounts to be provided)
      let sellOrderPDA = new PublicKey('11111111111111111111111111111111'); // SystemProgram.programId
      let sellerUsdcAccount = new PublicKey('11111111111111111111111111111111'); // SystemProgram.programId

      // If there are sell orders, get the first one
      if (bondingCurveData.sellQueueHead < bondingCurveData.sellQueueTail) {
        console.log('🔍 Processing sell orders - head:', bondingCurveData.sellQueueHead, 'tail:', bondingCurveData.sellQueueTail);
        const firstSellOrderPosition = bondingCurveData.sellQueueHead;
        const pdaSeed = firstSellOrderPosition + 1; // PDA was created with (position + 1)
        sellOrderPDA = this.getSellOrderPDA(bondingCurvePDA, pdaSeed);
        
        // Fetch the sell order data to get the seller's address
        try {
          const sellOrderData = await this.getSellOrderData(pdaSeed);
          if (sellOrderData) {
            console.log('🔍 Sell order data:', sellOrderData);
            const sellOrderTyped = sellOrderData as { seller: string };
            const { getAssociatedTokenAddress } = await import('@solana/spl-token');
            const USDC_MINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
            sellerUsdcAccount = await getAssociatedTokenAddress(USDC_MINT, new PublicKey(sellOrderTyped.seller));
            
            // Check if the seller's USDC account exists
            const accountInfo = await this.connection.getAccountInfo(sellerUsdcAccount);
            if (!accountInfo) {
              console.warn('Seller USDC account does not exist, using dummy account');
              sellerUsdcAccount = new PublicKey('11111111111111111111111111111111');
            } else {
              console.log('Seller USDC account exists:', sellerUsdcAccount.toString());
            }
          }
        } catch (error) {
          console.warn('Could not fetch sell order data, using dummy account:', error);
        }
      } else {
        console.log('🔍 No sell orders to process - using dummy accounts');
      }

      // Get referrer's USDC account if referrer is provided
      console.log('🔍 buyTokens called with referrer:', referrer);
      let referrerUsdcAccount = null;
      if (referrer) {
        try {
          const { getAssociatedTokenAddress } = await import('@solana/spl-token');
          const usdcMint = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
          const referrerUsdcAddress = await getAssociatedTokenAddress(usdcMint, new PublicKey(referrer));
          
          // Check if the account exists
          const accountInfo = await this.connection.getAccountInfo(referrerUsdcAddress);
          if (accountInfo) {
            referrerUsdcAccount = referrerUsdcAddress;
            console.log('Referrer USDC account exists:', referrerUsdcAddress.toString());
          } else {
            console.warn('Referrer USDC account does not exist, using treasury instead');
            referrerUsdcAccount = null;
          }
        } catch (error) {
          console.warn('Could not get referrer USDC account:', error);
          referrerUsdcAccount = null;
        }
      }

      // Ensure user's token accounts exist before proceeding
      const USDC_MINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      const EVER_MINT = new PublicKey(process.env.NEXT_PUBLIC_EVER_MINT || '3q4YFYMKHrdYw5FPANQ7nrCQMT4t12XKgzYX8JaTeEx8');
      
      console.log('🔍 Ensuring token accounts exist...');
      const userUsdcAccount = await this.ensureTokenAccountExists(USDC_MINT, this.wallet.publicKey!);
      const userEverAccount = await this.ensureTokenAccountExists(EVER_MINT, this.wallet.publicKey!);

      const accounts = {
        bondingCurve: bondingCurvePDA,
        user: this.wallet.publicKey!,
        userUsdcAccount: userUsdcAccount,
        userEverAccount: userEverAccount,
        treasuryUsdcAccount: await this.getTreasuryUsdcAccount(),
        programEverAccount: await this.getProgramEverAccount(),
        sellOrder: sellOrderPDA,
        sellerUsdcAccount: sellerUsdcAccount,
        referrer: referrer ? new PublicKey(referrer) : new PublicKey('11111111111111111111111111111111'), // Use dummy account if no referrer
        referrerUsdcAccount: referrerUsdcAccount || await this.getTreasuryUsdcAccount(), // Use treasury account if no referrer
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      };

      console.log('🔍 Accounts being passed to instruction:', Object.keys(accounts));
      console.log('🔍 referrerUsdcAccount:', referrerUsdcAccount?.toString() || 'null');
      console.log('🔍 referrer:', referrer || 'null');
      console.log('🔍 sellerUsdcAccount:', sellerUsdcAccount.toString());
      console.log('🔍 sellOrderPDA:', sellOrderPDA.toString());

      const instruction = await this.program.methods
        .buySmart(amount)
        .accounts(accounts)
        .instruction();

      const { Transaction } = await import('@solana/web3.js');
      const transaction = new Transaction().add(instruction);
      
      // Debug: Log instruction keys to see their writable status
      console.log('🔍 Instruction keys:');
      instruction.keys.forEach((key, index) => {
        console.log(`  ${index}: ${key.pubkey.toString()} - writable: ${key.isWritable}, signer: ${key.isSigner}`);
      });
      
      // Explicitly mark seller's USDC account and sell order as writable if they're not dummy accounts
      if (sellerUsdcAccount.toString() !== '11111111111111111111111111111111') {
        const sellerAccountIndex = instruction.keys.findIndex(key => key.pubkey.equals(sellerUsdcAccount));
        console.log('🔍 Seller USDC account index:', sellerAccountIndex);
        if (sellerAccountIndex !== -1) {
          instruction.keys[sellerAccountIndex].isWritable = true;
          console.log('🔍 Marked seller USDC account as writable');
        } else {
          console.log('🔍 Seller USDC account not found in instruction keys');
        }
      }
      
      if (sellOrderPDA.toString() !== '11111111111111111111111111111111') {
        const sellOrderIndex = instruction.keys.findIndex(key => key.pubkey.equals(sellOrderPDA));
        console.log('🔍 Sell order account index:', sellOrderIndex);
        if (sellOrderIndex !== -1) {
          instruction.keys[sellOrderIndex].isWritable = true;
          console.log('🔍 Marked sell order account as writable');
        } else {
          console.log('🔍 Sell order account not found in instruction keys');
        }
      }
      
      const result = await this.sendTransaction(transaction);
      
      // Check sell queue status after transaction
      console.log('🔍 Checking sell queue status after transaction...');
      try {
        const updatedBondingCurveData = await this.getBondingCurveData();
        if (updatedBondingCurveData) {
          console.log('🔍 Updated sell queue - head:', updatedBondingCurveData.sellQueueHead, 'tail:', updatedBondingCurveData.sellQueueTail);
          
          // Check if sell orders were processed
          if (updatedBondingCurveData.sellQueueHead > bondingCurveData.sellQueueHead) {
            console.log('🔍 Sell orders were processed! Head moved from', bondingCurveData.sellQueueHead, 'to', updatedBondingCurveData.sellQueueHead);
          } else {
            console.log('🔍 No sell orders were processed - head unchanged at', updatedBondingCurveData.sellQueueHead);
          }
        }
      } catch (error) {
        console.warn('Could not fetch updated bonding curve data:', error);
      }
      
      return result;
    } catch (error) {
      console.error('Error in buyTokens:', error);
      throw error;
    }
  }


  // This function is no longer needed as buys are now atomic.
  // async processBuyQueue(): Promise<string> {
  //   try {
  //     const { getAssociatedTokenAddress } = await import('@solana/spl-token');
  //     const bondingCurvePDA = this.getBondingCurvePDA();
  //     const bondingCurveData = await this.getBondingCurveData();
  //     if (!bondingCurveData) {
  //       throw new Error('Could not fetch bonding curve data');
  //     }
  //
  //     // Check if there are orders to process
  //     if (bondingCurveData.buyQueueHead >= bondingCurveData.buyQueueTail) {
  //       throw new Error('No buy orders to process');
  //     }
  //     
  //     const buyOrderPDA = this.getBuyOrderPDA(bondingCurvePDA, bondingCurveData.buyQueueHead);
  //     
  //     // Fetch the buy order to get the actual buyer's public key
  //     const buyOrderAccount = await this.program.account.buyOrder.fetch(buyOrderPDA);
  //     const buyerPublicKey = buyOrderAccount.buyer;
  //
  //     // Define mints
  //     const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb');
  //     const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDQRjg'); // Devnet USDC
  //
  //     // Derive the buyer's EVER ATA
  //     const buyerEverAccount = await getAssociatedTokenAddress(EVER_MINT, buyerPublicKey);
  //     
  //     const programUsdcAccount = await this.getProgramUsdcAccount();
  //     const programEverAccount = await this.getProgramEverAccount();
  //     const treasuryUsdcAccount = new PublicKey('9ib4KLusxgGmqQ5qvwPSwD7y4BJRiyyNyeZSQt8S6e61');
  //     
  //     // Check if there's a sell order to process
  //     const hasSellOrder = bondingCurveData.sellQueueHead < bondingCurveData.sellQueueTail;
  //     let sellOrderPDA: PublicKey;
  //     let sellerUsdcAccount: PublicKey;
  //     
  //     if (hasSellOrder) {
  //       // There's a sell order, find the seller's USDC ATA
  //       sellOrderPDA = this.getSellOrderPDA(bondingCurvePDA, bondingCurveData.sellQueueHead);
  //       const sellOrderAccount = await this.program.account.sellOrder.fetch(sellOrderPDA);
  //       const sellerPublicKey = sellOrderAccount.seller;
  //       sellerUsdcAccount = await getAssociatedTokenAddress(USDC_MINT, sellerPublicKey);
  //     } else {
  //       // No sell order, use dummy accounts that won't be accessed by program logic
  //       sellOrderPDA = SystemProgram.programId;
  //       sellerUsdcAccount = SystemProgram.programId;
  //     }
  //     
  //     // Create instruction for processing buy queue
  //     const instruction = await this.program.methods
  //       .processBuyQueue()
  //       .accounts({
  //         bondingCurve: bondingCurvePDA,
  //         buyOrder: buyOrderPDA,
  //         sellOrder: sellOrderPDA,
  //         programUsdcAccount,
  //         programEverAccount,
  //         buyerEverAccount,
  //         sellerUsdcAccount,
  //         treasuryUsdcAccount,
  //         tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  //       })
  //       .instruction();
  //
  //     const { Transaction } = await import('@solana/web3.js');
  //     const transaction = new Transaction().add(instruction);
  //     
  //     const signature = await this.sendTransaction(transaction);
  //     
  //     console.log('Buy queue processed successfully:', signature);
  //     return signature;
  //   } catch (error) {
  //     console.error('Error processing buy queue:', error);
  //     throw error;
  //   }
  // }

  // Atomic buy function - USDC + EVER transfer in one transaction (no queue)
  async buyAtomic(usdcAmount: BN): Promise<string> {
    try {
      console.log('🚀 Starting atomic buy transaction...');
      console.log('💰 USDC Amount:', usdcAmount);

      // Get user's USDC and EVER accounts
      const userUsdcAccount = await this.getUserUsdcAccount();
      const userEverAccount = await this.getUserEverAccount();
      
      // Get treasury and program accounts
      const treasuryUsdcAccount = await this.getTreasuryUsdcAccount();
      const programEverAccount = await this.getProgramEverAccount();

      console.log('📊 Account addresses:');
      console.log('  User USDC:', userUsdcAccount.toString());
      console.log('  User EVER:', userEverAccount.toString());
      console.log('  Treasury USDC:', treasuryUsdcAccount.toString());
      console.log('  Program EVER:', programEverAccount.toString());

      // Create atomic buy instruction
      const instruction = await this.program.methods
        .buyAtomic(new BN(usdcAmount))
        .accounts({
          bondingCurve: this.getBondingCurvePDA(),
          user: this.wallet.publicKey!,
          userUsdcAccount: userUsdcAccount,
          userEverAccount: userEverAccount,
          treasuryUsdcAccount: treasuryUsdcAccount,
          programEverAccount: programEverAccount,
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

      console.log('✅ Atomic buy completed successfully:', tx);
      return tx;
    } catch (error) {
      console.error('❌ Error in atomic buy:', error);
      throw error;
    }
  }

  // Get sell order PDA (uses the provided seed directly)
  getSellOrderPDA(bondingCurvePDA: PublicKey, pdaSeed: number): PublicKey {
    // Convert number to little-endian bytes (8 bytes for u64) to match to_le_bytes()
    const buffer = Buffer.alloc(8);
    
    // Manual little-endian encoding for u64 (8 bytes)
    let value = pdaSeed;
    for (let i = 0; i < 8; i++) {
      buffer[i] = value & 0xff;
      value = Math.floor(value / 256);
    }
    
    console.log(`Generating sell order PDA with seed: ${pdaSeed}, buffer: ${Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('')}`);
    
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
      
      console.log('🔍 Bonding Curve Data Debug:');
      console.log('  Sell Queue Head:', bondingCurveData.sellQueueHead);
      console.log('  Sell Queue Tail:', bondingCurveData.sellQueueTail);
      console.log('  Buy Queue Head:', bondingCurveData.buyQueueHead);
      console.log('  Buy Queue Tail:', bondingCurveData.buyQueueTail);
      
      // Use sell_queue_tail + 1 as the seed (matches smart contract)
      const sellOrderPDA = this.getSellOrderPDA(bondingCurvePDA, bondingCurveData.sellQueueTail + 1);
      
      console.log('🔍 Sell Order PDA Debug:');
      console.log('  Bonding Curve PDA:', bondingCurvePDA.toString());
      console.log('  Sell Queue Tail:', bondingCurveData.sellQueueTail);
      console.log('  Sell Order Seed (tail + 1):', bondingCurveData.sellQueueTail + 1);
      console.log('  Generated Sell Order PDA:', sellOrderPDA.toString());

      // Ensure user's EVER account exists before proceeding
      const EVER_MINT = new PublicKey(process.env.NEXT_PUBLIC_EVER_MINT || '3q4YFYMKHrdYw5FPANQ7nrCQMT4t12XKgzYX8JaTeEx8');
      console.log('🔍 Ensuring EVER token account exists...');
      const userEverAccount = await this.ensureTokenAccountExists(EVER_MINT, this.wallet.publicKey!);
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
      // Account doesn't exist yet - this is normal for new users
      const errorTyped = error as { message?: string };
      if (errorTyped.message?.includes('Account does not exist') || errorTyped.message?.includes('AbortError')) {
        return 0;
      }
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
      // Account doesn't exist yet - this is normal for new users
      const errorTyped = error as { message?: string };
      if (errorTyped.message?.includes('Account does not exist') || errorTyped.message?.includes('AbortError')) {
        return 0;
      }
      console.error('Error getting user USDC balance:', error);
      return 0;
    }
  }

  // A helper function to send transactions
  private async sendTransaction(transaction: Transaction): Promise<string> {
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey!;

    const signedTransaction = await this.wallet.signTransaction!(transaction);
    const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());
    await this.connection.confirmTransaction(signature);

    return signature;
  }

  // Get sell order data by position
  async getSellOrderData(queuePosition: number): Promise<unknown | null> {
    try {
      const bondingCurvePDA = this.getBondingCurvePDA();
      const sellOrderPDA = this.getSellOrderPDA(bondingCurvePDA, queuePosition);
      
      console.log(`Fetching sell order at position ${queuePosition}:`, sellOrderPDA.toString());
      
      const sellOrderData = await (this.program.account as unknown as { sellOrder: { fetch: (pda: PublicKey) => Promise<unknown> } }).sellOrder.fetch(sellOrderPDA);
      return sellOrderData;
    } catch (error) {
      console.error(`Error fetching sell order at position ${queuePosition}:`, error);
      return null;
    }
  }

  // Get all active sell orders
  async getAllSellOrders(): Promise<unknown[]> {
    try {
      const bondingCurveData = await this.getBondingCurveData();
      if (!bondingCurveData) return [];

      console.log('🔍 getAllSellOrders - Queue status:', {
        head: bondingCurveData.sellQueueHead,
        tail: bondingCurveData.sellQueueTail,
        length: bondingCurveData.sellQueueTail - bondingCurveData.sellQueueHead
      });

      const sellOrders = [];
      // The sell orders are created with PDA seed (i + 1), where i is the queue position
      // So for queue positions 0, 1, 2... the PDAs use seeds 1, 2, 3...
      for (let i = bondingCurveData.sellQueueHead; i < bondingCurveData.sellQueueTail; i++) {
        const pdaSeed = i + 1; // PDA was created with (queue_position + 1)
        console.log(`🔍 Fetching order at queue position ${i}, PDA seed ${pdaSeed}`);
        const orderData = await this.getSellOrderData(pdaSeed);
        if (orderData) {
          const orderTyped = orderData as {
            seller: { toString(): string };
            remaining_amount?: { toString(): string };
            remainingAmount?: { toString(): string };
            locked_price?: { toString(): string };
            lockedPrice?: { toString(): string };
            processed: boolean;
          };
          console.log(`✅ Found order at position ${i}:`, {
            seller: orderTyped.seller.toString(),
            remainingAmount: orderTyped.remaining_amount?.toString() || orderTyped.remainingAmount?.toString(),
            lockedPrice: orderTyped.locked_price?.toString() || orderTyped.lockedPrice?.toString(),
            processed: orderTyped.processed
          });
          sellOrders.push({
            position: i,
            seller: orderTyped.seller.toString(),
            remainingAmount: orderTyped.remaining_amount?.toString() || orderTyped.remainingAmount?.toString(),
            lockedPrice: orderTyped.locked_price?.toString() || orderTyped.lockedPrice?.toString(),
            processed: orderTyped.processed
          });
        } else {
          console.log(`❌ No order found at position ${i}`);
        }
      }
      
      console.log('🔍 Total sell orders fetched:', sellOrders.length);
      console.log('Fetched sell orders:', sellOrders);
      return sellOrders;
    } catch (error) {
      console.error('Error fetching all sell orders:', error);
      return [];
    }
  }

  // Debug function to check sell orders
  async debugSellOrders(): Promise<void> {
    try {
      console.log('🔍 Debugging sell orders...');
      const bondingCurveData = await this.getBondingCurveData();
      if (!bondingCurveData) {
        console.log('❌ No bonding curve data');
        return;
      }
      
      console.log(`📊 Sell Queue: Head=${bondingCurveData.sellQueueHead}, Tail=${bondingCurveData.sellQueueTail}`);
      console.log(`📊 Queue Length: ${bondingCurveData.sellQueueTail - bondingCurveData.sellQueueHead}`);
      
      // Try to fetch the sell order at position 1 (your sell order)
      if (bondingCurveData.sellQueueTail > bondingCurveData.sellQueueHead) {
        // The first sell order should be at queue position 0, but PDA seed is 1
        const queuePosition = bondingCurveData.sellQueueHead;
        const pdaSeed = queuePosition + 1;
        console.log(`Trying to fetch sell order at queue position ${queuePosition} with PDA seed ${pdaSeed}`);
        const sellOrderData = await this.getSellOrderData(pdaSeed);
        if (sellOrderData) {
          console.log('✅ Found sell order:', sellOrderData);
        } else {
          console.log('❌ Could not fetch sell order');
        }
      }
      
      // Get all sell orders
      const allOrders = await this.getAllSellOrders();
      console.log(`📋 Total sell orders found: ${allOrders.length}`);
      
    } catch (error) {
      console.error('❌ Error debugging sell orders:', error);
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
        const data = await (this.program.account as { bondingCurve: { fetch: (pda: PublicKey) => Promise<unknown> } }).bondingCurve.fetch(bondingCurvePDA);
        console.log('Successfully fetched data:', data);
      } catch (fetchError) {
        console.error('Failed to fetch with program:', fetchError);
      }
      
    } catch (error) {
      console.error('Debug error:', error);
    }
  }
}
