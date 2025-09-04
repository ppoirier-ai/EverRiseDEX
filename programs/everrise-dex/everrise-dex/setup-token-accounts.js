const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { createAssociatedTokenAccount, getAssociatedTokenAddress, createMint, mintTo, getAccount } = require('@solana/spl-token');
const fs = require('fs');

async function main() {
  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/ppoirier/.config/solana/id.json', 'utf8')))
  );
  
  const TREASURY_WALLET = new PublicKey('FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA');
  const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'); // USDC DevNet
  const EVER_MINT = new PublicKey('85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb'); // EVER Test Token
  
  console.log('🚀 Setting up token accounts...');
  console.log('Treasury Wallet:', TREASURY_WALLET.toString());
  console.log('USDC Mint:', USDC_MINT.toString());
  console.log('EVER Mint:', EVER_MINT.toString());
  
  try {
    // Get associated token addresses
    const treasuryUsdcAccount = await getAssociatedTokenAddress(USDC_MINT, TREASURY_WALLET);
    const treasuryEverAccount = await getAssociatedTokenAddress(EVER_MINT, TREASURY_WALLET);
    
    console.log('\n📊 Token Account Addresses:');
    console.log('Treasury USDC Account:', treasuryUsdcAccount.toString());
    console.log('Treasury EVER Account:', treasuryEverAccount.toString());
    
    // Check if accounts exist
    const usdcAccountInfo = await connection.getAccountInfo(treasuryUsdcAccount);
    const everAccountInfo = await connection.getAccountInfo(treasuryEverAccount);
    
    if (!usdcAccountInfo) {
      console.log('\n🏦 Creating Treasury USDC Account...');
      const tx = await createAssociatedTokenAccount(
        connection,
        wallet,
        TREASURY_WALLET,
        USDC_MINT
      );
      console.log('✅ USDC Account created:', tx);
    } else {
      console.log('✅ Treasury USDC Account already exists');
    }
    
    if (!everAccountInfo) {
      console.log('\n🪙 Creating Treasury EVER Account...');
      const tx = await createAssociatedTokenAccount(
        connection,
        wallet,
        TREASURY_WALLET,
        EVER_MINT
      );
      console.log('✅ EVER Account created:', tx);
    } else {
      console.log('✅ Treasury EVER Account already exists');
    }
    
    // Check balances
    try {
      const usdcBalance = await getAccount(connection, treasuryUsdcAccount);
      console.log('\n💰 Treasury USDC Balance:', (Number(usdcBalance.amount) / 1_000_000).toLocaleString(), 'USDC');
    } catch (e) {
      console.log('❌ Treasury USDC Account not found or empty');
    }
    
    try {
      const everBalance = await getAccount(connection, treasuryEverAccount);
      console.log('🪙 Treasury EVER Balance:', (Number(everBalance.amount) / 1_000_000_000).toLocaleString(), 'EVER');
    } catch (e) {
      console.log('❌ Treasury EVER Account not found or empty');
    }
    
    console.log('\n🎉 Token account setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Transfer USDC to Treasury USDC Account:', treasuryUsdcAccount.toString());
    console.log('2. Transfer EVER tokens to Treasury EVER Account:', treasuryEverAccount.toString());
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
