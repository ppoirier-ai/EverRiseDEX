const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { createAssociatedTokenAccount, getAssociatedTokenAddress, createMint, mintTo, getAccount } = require('@solana/spl-token');
const fs = require('fs');

async function main() {
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=75a68bf2-6062-4a1d-a4b5-ef717adf211b');
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/ppoirier/.config/solana/production-deployer.json', 'utf8')))
  );
  
  const TREASURY_WALLET = new PublicKey('DTA5uQocoAaZwXL59DoVZwWUxJCsxjfBCM6mzpws8T4');
  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet USDC
  const EVER_MINT = new PublicKey('3q4YFYMKHrdYw5FPANQ7nrCQMT4t12XKgzYX8JaTeEx8'); // Production EVER
  
  console.log('🚀 Setting up token accounts...');
  console.log('Treasury Wallet:', TREASURY_WALLET.toString());
  console.log('USDC Mint:', USDC_MINT.toString());
  console.log('EVER Mint:', EVER_MINT.toString());
  
  // Program token accounts (these are the accounts that hold the reserves)
  const PROGRAM_USDC_ACCOUNT = new PublicKey('CcpCLzvrwcY9Ufupvp69BDKuYZieE2ExQLoHdPKa3Aus');
  const PROGRAM_EVER_ACCOUNT = new PublicKey('8t4CT8pfMjvVTGmvdtKUkVfaqrLZuEW8WaVKLPqaogpN');
  
  try {
    console.log('\n📊 Program Token Account Addresses:');
    console.log('Program USDC Account:', PROGRAM_USDC_ACCOUNT.toString());
    console.log('Program EVER Account:', PROGRAM_EVER_ACCOUNT.toString());
    
    // Check if program accounts exist
    const usdcAccountInfo = await connection.getAccountInfo(PROGRAM_USDC_ACCOUNT);
    const everAccountInfo = await connection.getAccountInfo(PROGRAM_EVER_ACCOUNT);
    
    if (!usdcAccountInfo) {
      console.log('\n🏦 Creating Program USDC Account...');
      const tx = await createAssociatedTokenAccount(
        connection,
        wallet,
        PROGRAM_USDC_ACCOUNT, // This should be the bonding curve PDA
        USDC_MINT
      );
      console.log('✅ Program USDC Account created:', tx);
    } else {
      console.log('✅ Program USDC Account already exists');
    }
    
    if (!everAccountInfo) {
      console.log('\n🪙 Creating Program EVER Account...');
      const tx = await createAssociatedTokenAccount(
        connection,
        wallet,
        PROGRAM_EVER_ACCOUNT, // This should be the bonding curve PDA
        EVER_MINT
      );
      console.log('✅ Program EVER Account created:', tx);
    } else {
      console.log('✅ Program EVER Account already exists');
    }
    
    // Check balances
    try {
      const usdcBalance = await getAccount(connection, PROGRAM_USDC_ACCOUNT);
      console.log('\n💰 Program USDC Balance:', (Number(usdcBalance.amount) / 1_000_000).toLocaleString(), 'USDC');
    } catch (e) {
      console.log('❌ Program USDC Account not found or empty');
    }
    
    try {
      const everBalance = await getAccount(connection, PROGRAM_EVER_ACCOUNT);
      console.log('🪙 Program EVER Balance:', (Number(everBalance.amount) / 1_000_000_000).toLocaleString(), 'EVER');
    } catch (e) {
      console.log('❌ Program EVER Account not found or empty');
    }
    
    console.log('\n🎉 Token account setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Transfer USDC to Program USDC Account:', PROGRAM_USDC_ACCOUNT.toString());
    console.log('2. Transfer EVER tokens to Program EVER Account:', PROGRAM_EVER_ACCOUNT.toString());
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
