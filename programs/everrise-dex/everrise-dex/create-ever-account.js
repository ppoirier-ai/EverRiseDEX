const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');

async function main() {
  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/ppoirier/.config/solana/id.json', 'utf8')))
  );
  
  const TREASURY_WALLET = new PublicKey('FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA');
  const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb');
  
  console.log('🚀 Creating Treasury EVER Account...');
  
  try {
    const treasuryEverAccount = await getAssociatedTokenAddress(EVER_MINT, TREASURY_WALLET);
    console.log('Treasury EVER Account:', treasuryEverAccount.toString());
    
    // Check if account already exists
    const accountInfo = await connection.getAccountInfo(treasuryEverAccount);
    if (accountInfo) {
      console.log('✅ Treasury EVER Account already exists');
      return;
    }
    
    // Create the associated token account instruction
    const instruction = createAssociatedTokenAccountInstruction(
      wallet.publicKey, // payer
      treasuryEverAccount, // associated token account
      TREASURY_WALLET, // owner
      EVER_MINT // mint
    );
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    const signature = await connection.sendTransaction(transaction, [wallet]);
    
    console.log('✅ EVER Account created:', signature);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    console.log('✅ Transaction confirmed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
