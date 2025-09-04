const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const { 
  createSetAuthorityInstruction,
  AuthorityType
} = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb');
const BONDING_CURVE_PDA = new PublicKey('9pdSYBWZfgm9S8qJJA2vVs1iRfPeosoagh1aKsm83ddU');
const CURRENT_MINT_AUTHORITY = new PublicKey('J5PeKNzfMCDEfSby6ZfCgbjCS9t4AfP5Bg9q8upaHCRn');

// Load wallet (we need the current mint authority's private key)
const walletPath = process.env.HOME + '/.config/solana/id.json';
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
);

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function transferMintAuthority() {
  console.log('🔄 Transferring EVER token mint authority to bonding curve PDA...');
  
  try {
    console.log('📊 Configuration:');
    console.log('  EVER Mint:', EVER_MINT.toString());
    console.log('  Current Mint Authority:', CURRENT_MINT_AUTHORITY.toString());
    console.log('  New Mint Authority (Bonding Curve PDA):', BONDING_CURVE_PDA.toString());
    console.log('  Wallet Public Key:', walletKeypair.publicKey.toString());
    
    // Check if the wallet is the current mint authority
    if (!walletKeypair.publicKey.equals(CURRENT_MINT_AUTHORITY)) {
      console.log('❌ Error: Current wallet is not the mint authority');
      console.log('   Wallet:', walletKeypair.publicKey.toString());
      console.log('   Mint Authority:', CURRENT_MINT_AUTHORITY.toString());
      console.log('   You need to use the wallet that owns the mint authority');
      return;
    }
    
    console.log('✅ Wallet is the mint authority, proceeding...');
    
    // Create set authority instruction
    const setAuthorityInstruction = createSetAuthorityInstruction(
      EVER_MINT,                    // mint
      CURRENT_MINT_AUTHORITY,       // current authority
      AuthorityType.MintTokens,     // authority type
      BONDING_CURVE_PDA            // new authority
    );
    
    // Create and send transaction
    const transaction = new Transaction().add(setAuthorityInstruction);
    
    console.log('🚀 Sending transaction...');
    const signature = await connection.sendTransaction(transaction, [walletKeypair], {
      commitment: 'confirmed'
    });
    
    console.log('✅ Mint authority transferred successfully!');
    console.log('📝 Transaction signature:', signature);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log('\n🎉 Setup complete! The bonding curve PDA is now the mint authority for EVER tokens.');
    console.log('💡 The smart contract should now be able to mint EVER tokens for buy orders.');
    console.log('💡 You can now try clicking "Process Queue" again.');
    
  } catch (error) {
    console.error('❌ Error transferring mint authority:', error);
    throw error;
  }
}

// Run the script
transferMintAuthority().catch(console.error);
