const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { createAccount } = require('@solana/spl-token');
const fs = require('fs');

async function main() {
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=75a68bf2-6062-4a1d-a4b5-ef717adf211b');
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/ppoirier/.config/solana/production-deployer.json', 'utf8')))
  );

  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  const TREASURY_WALLET = new PublicKey('DTA5uQocoAaZwXL59DoVZwWUxJCsxjfBCM6mzpws8T4');
  
  // Generate a new keypair for the treasury USDC account
  const treasuryUsdcAccount = Keypair.generate();

  console.log('🚀 Creating Treasury USDC Account...');
  console.log('Treasury Wallet:', TREASURY_WALLET.toString());
  console.log('USDC Mint:', USDC_MINT.toString());
  console.log('Treasury USDC Account:', treasuryUsdcAccount.publicKey.toString());

  try {
    // Check if account exists
    const accountInfo = await connection.getAccountInfo(treasuryUsdcAccount.publicKey);

    if (!accountInfo) {
      console.log('\n🏦 Creating Treasury USDC Account...');
      const tx = await createAccount(
        connection,
        wallet,
        treasuryUsdcAccount.publicKey,
        USDC_MINT,
        TREASURY_WALLET
      );
      console.log('✅ Treasury USDC Account created:', tx);
    } else {
      console.log('✅ Treasury USDC Account already exists');
    }

    console.log('\n🎉 Treasury USDC account created successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add this environment variable to Render.com:');
    console.log(`   NEXT_PUBLIC_TREASURY_USDC_ACCOUNT = ${treasuryUsdcAccount.publicKey.toString()}`);
    console.log('2. Transfer USDC to this account for testing');
    console.log('3. Redeploy the application');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
