const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { createHash } = require('crypto');

async function resetQueues() {
  try {
    const connection = new Connection('https://api.devnet.solana.com');
    const programId = new PublicKey('9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy');
    
    // Get bonding curve PDA
    const [bondingCurvePDA] = await PublicKey.findProgramAddress([Buffer.from('bonding_curve')], programId);
    
    console.log('Bonding Curve PDA:', bondingCurvePDA.toString());
    
    // Create a dummy keypair for signing
    const keypair = Keypair.generate();
    
    // Airdrop SOL to the keypair
    console.log('Airdropping SOL to keypair...');
    const airdropSignature = await connection.requestAirdrop(keypair.publicKey, 1000000000); // 1 SOL
    await connection.confirmTransaction(airdropSignature);
    console.log('✅ Airdrop confirmed');
    
    // Create instruction data for reset_queues
    // The discriminator for reset_queues is the first 8 bytes of the hash
    const discriminator = createHash('sha256').update('global:reset_queues').digest().slice(0, 8);
    
    console.log('Discriminator:', discriminator.toString('hex'));
    
    // Create transaction
    const transaction = new Transaction();
    
    // Add instruction
    transaction.add({
      keys: [
        { pubkey: bondingCurvePDA, isSigner: false, isWritable: true },
        { pubkey: keypair.publicKey, isSigner: true, isWritable: false },
      ],
      programId: programId,
      data: Buffer.concat([discriminator, Buffer.alloc(0)]), // discriminator + empty data
    });
    
    // Set recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = keypair.publicKey;
    
    // Sign transaction
    transaction.sign(keypair);
    
    // Send transaction
    const signature = await connection.sendTransaction(transaction, [keypair]);
    console.log('✅ Transaction sent:', signature);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    console.log('✅ Transaction confirmed!');
    
    // Verify the queues are reset by checking the bonding curve account
    const bondingCurveAccount = await connection.getAccountInfo(bondingCurvePDA);
    if (bondingCurveAccount) {
      console.log('✅ Bonding curve account exists');
      // The queue pointers are at specific offsets in the account data
      // buyQueueHead: offset 40, buyQueueTail: offset 48, sellQueueHead: offset 56, sellQueueTail: offset 64
      const data = bondingCurveAccount.data;
      const buyQueueHead = data.readBigUInt64LE(40);
      const buyQueueTail = data.readBigUInt64LE(48);
      const sellQueueHead = data.readBigUInt64LE(56);
      const sellQueueTail = data.readBigUInt64LE(64);
      
      console.log('\n📊 Queue status after reset:');
      console.log('Buy Queue Head:', buyQueueHead.toString());
      console.log('Buy Queue Tail:', buyQueueTail.toString());
      console.log('Sell Queue Head:', sellQueueHead.toString());
      console.log('Sell Queue Tail:', sellQueueTail.toString());
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetQueues();
