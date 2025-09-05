const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { createHash } = require('crypto');

async function resetBondingCurve() {
  try {
    const connection = new Connection('https://api.devnet.solana.com');
    const programId = new PublicKey('9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy');
    
    // Get bonding curve PDA
    const [bondingCurvePDA] = await PublicKey.findProgramAddress([Buffer.from('bonding_curve')], programId);
    
    console.log('Bonding Curve PDA:', bondingCurvePDA.toString());
    
    // Create instruction data for reset_bonding_curve
    const discriminator = createHash('sha256').update('global:reset_bonding_curve').digest().slice(0, 8);
    
    console.log('Discriminator:', discriminator.toString('hex'));
    
    console.log('\n📋 Instructions to reset bonding curve:');
    console.log('1. Connect your wallet to the DEX frontend');
    console.log('2. Open browser console (F12)');
    console.log('3. Run this code:');
    console.log(`
const { Connection, PublicKey, Transaction } = require('@solana/web3.js');
const { createHash } = require('crypto');

async function resetBondingCurve() {
  const connection = new Connection('https://api.devnet.solana.com');
  const programId = new PublicKey('9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy');
  const [bondingCurvePDA] = await PublicKey.findProgramAddress([Buffer.from('bonding_curve')], programId);
  
  const discriminator = createHash('sha256').update('global:reset_bonding_curve').digest().slice(0, 8);
  
  const transaction = new Transaction();
  transaction.add({
    keys: [
      { pubkey: bondingCurvePDA, isSigner: false, isWritable: true },
      { pubkey: window.solana.publicKey, isSigner: true, isWritable: false },
    ],
    programId: programId,
    data: Buffer.concat([discriminator, Buffer.alloc(0)]),
  });
  
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = window.solana.publicKey;
  
  const signed = await window.solana.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  console.log('Transaction sent:', signature);
  await connection.confirmTransaction(signature);
  console.log('✅ Bonding curve reset!');
}

resetBondingCurve();
    `);
    
    console.log('\n🎯 This will reset the bonding curve to:');
    console.log('  - X (USDC treasury): 10,000 USDC');
    console.log('  - Y (EVER reserve): 100,000,000 EVER');
    console.log('  - K (constant): 1,000,000,000,000,000,000');
    console.log('  - Current Price: 0.0001 USDC per EVER');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetBondingCurve();
