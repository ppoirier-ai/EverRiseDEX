const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  getAccount
} = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb');
const PROGRAM_EVER_ACCOUNT = new PublicKey('8t4CT8pfMjvVTGmvdtKUkVfaqrLZuEW8WaVKLPqaogpN');
const TREASURY_WALLET = new PublicKey('FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA');

// Load wallet
const walletPath = process.env.HOME + '/.config/solana/id.json';
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
);

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function transferEverToProgram() {
  console.log('🔄 Transferring EVER tokens to program account...');
  
  try {
    // Get treasury EVER account
    const treasuryEverAccount = await getAssociatedTokenAddress(
      EVER_MINT,
      TREASURY_WALLET
    );
    
    console.log('📊 Account Addresses:');
    console.log('  Treasury EVER Account:', treasuryEverAccount.toString());
    console.log('  Program EVER Account:', PROGRAM_EVER_ACCOUNT.toString());
    
    // Check treasury EVER balance
    let treasuryBalance = 0;
    try {
      const treasuryAccount = await getAccount(connection, treasuryEverAccount);
      treasuryBalance = Number(treasuryAccount.amount);
      console.log('💰 Treasury EVER Balance:', treasuryBalance / 1e9, 'EVER');
    } catch (e) {
      console.log('❌ Treasury EVER account not found or empty');
      return;
    }
    
    // Check program EVER balance
    let programBalance = 0;
    try {
      const programAccount = await getAccount(connection, PROGRAM_EVER_ACCOUNT);
      programBalance = Number(programAccount.amount);
      console.log('💰 Program EVER Balance:', programBalance / 1e9, 'EVER');
    } catch (e) {
      console.log('❌ Program EVER account not found or empty');
    }
    
    // Transfer amount (let's transfer 10M EVER tokens)
    const transferAmount = 10_000_000 * 1e9; // 10M EVER with 9 decimals
    
    if (treasuryBalance < transferAmount) {
      console.log('❌ Not enough EVER tokens in treasury');
      console.log('   Available:', treasuryBalance / 1e9, 'EVER');
      console.log('   Required:', transferAmount / 1e9, 'EVER');
      return;
    }
    
    console.log(`🚀 Transferring ${transferAmount / 1e9} EVER tokens...`);
    
    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      treasuryEverAccount,    // from
      PROGRAM_EVER_ACCOUNT,   // to
      TREASURY_WALLET,        // authority (treasury wallet)
      transferAmount          // amount
    );
    
    // Create and send transaction
    const transaction = new Transaction().add(transferInstruction);
    
    const signature = await connection.sendTransaction(transaction, [walletKeypair], {
      commitment: 'confirmed'
    });
    
    console.log('✅ EVER tokens transferred successfully!');
    console.log('📝 Transaction signature:', signature);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    // Check new balances
    const newTreasuryAccount = await getAccount(connection, treasuryEverAccount);
    const newProgramAccount = await getAccount(connection, PROGRAM_EVER_ACCOUNT);
    
    console.log('\n📊 Updated Balances:');
    console.log('  Treasury EVER Balance:', Number(newTreasuryAccount.amount) / 1e9, 'EVER');
    console.log('  Program EVER Balance:', Number(newProgramAccount.amount) / 1e9, 'EVER');
    
    console.log('\n🎉 Setup complete! The program now has EVER tokens to fulfill buy orders.');
    console.log('💡 You can now try clicking "Process Queue" again.');
    
  } catch (error) {
    console.error('❌ Error transferring EVER tokens:', error);
    throw error;
  }
}

// Run the script
transferEverToProgram().catch(console.error);
