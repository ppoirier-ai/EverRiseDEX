const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAccount
} = require('@solana/spl-token');
const fs = require('fs');

// Configuration
const PROGRAM_ID = new PublicKey('9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy');
const BONDING_CURVE_PDA = new PublicKey('9pdSYBWZfgm9S8qJJA2vVs1iRfPeosoagh1aKsm83ddU');
const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb');
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

// Load wallet
const walletPath = process.env.HOME + '/.config/solana/id.json';
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
);

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function createProgramTokenAccounts() {
  console.log('🔧 Creating program-owned token accounts...');
  
  try {
    // Get the bonding curve PDA as the owner
    const bondingCurvePDA = BONDING_CURVE_PDA;
    
    // Calculate the associated token addresses for the bonding curve PDA
    const programUsdcAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      bondingCurvePDA,
      true // allowOwnerOffCurve = true for PDAs
    );
    
    const programEverAccount = await getAssociatedTokenAddress(
      EVER_MINT,
      bondingCurvePDA,
      true // allowOwnerOffCurve = true for PDAs
    );
    
    console.log('📊 Program Token Account Addresses:');
    console.log('  Program USDC Account:', programUsdcAccount.toString());
    console.log('  Program EVER Account:', programEverAccount.toString());
    
    // Check if accounts already exist
    let usdcAccountExists = false;
    let everAccountExists = false;
    
    try {
      await getAccount(connection, programUsdcAccount);
      usdcAccountExists = true;
      console.log('✅ Program USDC account already exists');
    } catch (e) {
      console.log('❌ Program USDC account does not exist, will create');
    }
    
    try {
      await getAccount(connection, programEverAccount);
      everAccountExists = true;
      console.log('✅ Program EVER account already exists');
    } catch (e) {
      console.log('❌ Program EVER account does not exist, will create');
    }
    
    // Create accounts if they don't exist
    const instructions = [];
    
    if (!usdcAccountExists) {
      const createUsdcInstruction = createAssociatedTokenAccountInstruction(
        walletKeypair.publicKey, // payer
        programUsdcAccount,      // associatedToken
        bondingCurvePDA,         // owner (bonding curve PDA)
        USDC_MINT                // mint
      );
      instructions.push(createUsdcInstruction);
    }
    
    if (!everAccountExists) {
      const createEverInstruction = createAssociatedTokenAccountInstruction(
        walletKeypair.publicKey, // payer
        programEverAccount,      // associatedToken
        bondingCurvePDA,         // owner (bonding curve PDA)
        EVER_MINT                // mint
      );
      instructions.push(createEverInstruction);
    }
    
    if (instructions.length > 0) {
      console.log(`🚀 Creating ${instructions.length} token account(s)...`);
      
      const { Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
      const transaction = new Transaction().add(...instructions);
      
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [walletKeypair],
        { commitment: 'confirmed' }
      );
      
      console.log('✅ Token accounts created successfully!');
      console.log('📝 Transaction signature:', signature);
    } else {
      console.log('✅ All token accounts already exist');
    }
    
    // Update memory file with the new account addresses
    const memoryPath = 'specs/Development_Memory.md';
    let memoryContent = fs.readFileSync(memoryPath, 'utf8');
    
    // Add the program token account addresses
    const newAccountsSection = `
### Program Token Accounts (Owned by Bonding Curve PDA)
- **Program USDC Account**: \`${programUsdcAccount.toString()}\` (✅ Created)
- **Program EVER Account**: \`${programEverAccount.toString()}\` (✅ Created)
- **Note**: These accounts are owned by the bonding curve PDA and used for program-controlled token transfers
`;
    
    // Insert after the Treasury accounts section
    const insertPoint = memoryContent.indexOf('### Treasury USDC Account');
    if (insertPoint !== -1) {
      const beforeInsert = memoryContent.substring(0, insertPoint);
      const afterInsert = memoryContent.substring(insertPoint);
      memoryContent = beforeInsert + newAccountsSection + afterInsert;
      
      fs.writeFileSync(memoryPath, memoryContent);
      console.log('📝 Updated Development_Memory.md with program token account addresses');
    }
    
    console.log('\n🎉 Setup complete! The smart contract should now work properly.');
    console.log('💡 You can now try clicking "Process Queue" again.');
    
  } catch (error) {
    console.error('❌ Error creating program token accounts:', error);
    throw error;
  }
}

// Run the script
createProgramTokenAccounts().catch(console.error);
