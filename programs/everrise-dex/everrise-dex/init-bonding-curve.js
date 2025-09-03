const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Program, AnchorProvider } = require('@coral-xyz/anchor');
const fs = require('fs');

async function main() {
  // Load the IDL
  const idl = JSON.parse(fs.readFileSync('./target/idl/everrise_dex.json', 'utf8'));
  
  // Setup connection and wallet
  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/ppoirier/.config/solana/id.json', 'utf8')))
  );
  
  // Create a proper wallet interface
  const walletInterface = {
    publicKey: wallet.publicKey,
    signTransaction: async (tx) => {
      tx.sign(wallet);
      return tx;
    },
    signAllTransactions: async (txs) => {
      txs.forEach(tx => tx.sign(wallet));
      return txs;
    }
  };
  
  const provider = new AnchorProvider(connection, walletInterface, {});
  const program = new Program(idl, provider);
  
  // Program and PDA addresses
  const PROGRAM_ID = new PublicKey('9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy');
  const TREASURY_WALLET = new PublicKey('FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA');
  const [bondingCurvePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('bonding_curve')],
    PROGRAM_ID
  );
  
  console.log('Program ID:', PROGRAM_ID.toString());
  console.log('Treasury Wallet:', TREASURY_WALLET.toString());
  console.log('Bonding Curve PDA:', bondingCurvePDA.toString());
  
  try {
    // Check if bonding curve already exists
    const existingAccount = await connection.getAccountInfo(bondingCurvePDA);
    if (existingAccount) {
      console.log('✅ Bonding curve already exists!');
      return;
    }
    
    console.log('🚀 Initializing bonding curve...');
    
    // Initialize the bonding curve
    const tx = await program.methods
      .initialize(TREASURY_WALLET)
      .accounts({
        bondingCurve: bondingCurvePDA,
        authority: wallet.publicKey,
        systemProgram: PublicKey.default,
      })
      .rpc();
    
    console.log('✅ Initialize transaction signature:', tx);
    
    // Fetch and display the initialized bonding curve
    const bondingCurve = await program.account.bondingCurve.fetch(bondingCurvePDA);
    
    console.log('\n📊 Bonding Curve Initialized:');
    console.log('Authority:', bondingCurve.authority.toString());
    console.log('Treasury Wallet:', bondingCurve.treasuryWallet.toString());
    console.log('X (USDC):', bondingCurve.x.toString(), '=', (Number(bondingCurve.x) / 1_000_000).toLocaleString(), 'USDC');
    console.log('Y (EVER):', bondingCurve.y.toString(), '=', (Number(bondingCurve.y) / 1_000_000_000).toLocaleString(), 'EVER');
    console.log('K (constant):', bondingCurve.k.toString());
    console.log('Initial Price:', (Number(bondingCurve.x) / Number(bondingCurve.y) * 1_000_000_000 / 1_000_000).toFixed(6), 'USDC per EVER');
    
    console.log('\n🎉 Bonding curve successfully initialized on DevNet!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
