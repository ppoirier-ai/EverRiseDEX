const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createAccount } = require('@solana/spl-token');
const fs = require('fs');

async function main() {
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=75a68bf2-6062-4a1d-a4b5-ef717adf211b');
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/ppoirier/.config/solana/production-deployer.json', 'utf8')))
  );
  
  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  const EVER_MINT = new PublicKey('3q4YFYMKHrdYw5FPANQ7nrCQMT4t12XKgzYX8JaTeEx8');
  const BONDING_CURVE_PDA = new PublicKey('9pdSYBWZfgm9S8qJJA2vVs1iRfPeosoagh1aKsm83ddU');
  
  // Program token accounts (these are the accounts that hold the reserves)
  const PROGRAM_USDC_ACCOUNT = new PublicKey('CcpCLzvrwcY9Ufupvp69BDKuYZieE2ExQLoHdPKa3Aus');
  const PROGRAM_EVER_ACCOUNT = new PublicKey('8t4CT8pfMjvVTGmvdtKUkVfaqrLZuEW8WaVKLPqaogpN');
  
  console.log('🚀 Creating program token accounts...');
  console.log('Bonding Curve PDA:', BONDING_CURVE_PDA.toString());
  console.log('Program USDC Account:', PROGRAM_USDC_ACCOUNT.toString());
  console.log('Program EVER Account:', PROGRAM_EVER_ACCOUNT.toString());
  
  try {
    // Check if accounts exist
    const usdcAccountInfo = await connection.getAccountInfo(PROGRAM_USDC_ACCOUNT);
    const everAccountInfo = await connection.getAccountInfo(PROGRAM_EVER_ACCOUNT);
    
    if (!usdcAccountInfo) {
      console.log('\n🏦 Creating Program USDC Account...');
      const tx = await createAccount(
        connection,
        wallet,
        PROGRAM_USDC_ACCOUNT,
        USDC_MINT,
        BONDING_CURVE_PDA
      );
      console.log('✅ Program USDC Account created:', tx);
    } else {
      console.log('✅ Program USDC Account already exists');
    }
    
    if (!everAccountInfo) {
      console.log('\n🪙 Creating Program EVER Account...');
      const tx = await createAccount(
        connection,
        wallet,
        PROGRAM_EVER_ACCOUNT,
        EVER_MINT,
        BONDING_CURVE_PDA
      );
      console.log('✅ Program EVER Account created:', tx);
    } else {
      console.log('✅ Program EVER Account already exists');
    }
    
    console.log('\n🎉 Program token accounts created successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Transfer USDC to Program USDC Account:', PROGRAM_USDC_ACCOUNT.toString());
    console.log('2. Transfer EVER tokens to Program EVER Account:', PROGRAM_EVER_ACCOUNT.toString());
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
