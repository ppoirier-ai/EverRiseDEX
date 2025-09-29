const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { createAccount } = require('@solana/spl-token');
const fs = require('fs');

async function main() {
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=75a68bf2-6062-4a1d-a4b5-ef717adf211b');
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync('/Users/ppoirier/.config/solana/production-deployer.json', 'utf8')))
  );
  
  const EVER_MINT = new PublicKey('3q4YFYMKHrdYw5FPANQ7nrCQMT4t12XKgzYX8JaTeEx8');
  const BONDING_CURVE_PDA = new PublicKey('9pdSYBWZfgm9S8qJJA2vVs1iRfPeosoagh1aKsm83ddU');
  const PROGRAM_EVER_ACCOUNT = new PublicKey('8t4CT8pfMjvVTGmvdtKUkVfaqrLZuEW8WaVKLPqaogpN');
  
  console.log('🚀 Creating program EVER account...');
  console.log('Bonding Curve PDA:', BONDING_CURVE_PDA.toString());
  console.log('Program EVER Account:', PROGRAM_EVER_ACCOUNT.toString());
  console.log('EVER Mint:', EVER_MINT.toString());
  
  try {
    // Check if account exists
    const everAccountInfo = await connection.getAccountInfo(PROGRAM_EVER_ACCOUNT);
    
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
    
    console.log('\n🎉 Program EVER account created successfully!');
    console.log('\n📝 Next step:');
    console.log('Transfer EVER tokens to Program EVER Account:', PROGRAM_EVER_ACCOUNT.toString());
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);

