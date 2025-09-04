const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { transfer, getAccount } = require('@solana/spl-token');
const fs = require('fs');

// Load the treasury wallet keypair
const treasuryKeypairPath = '/Users/ppoirier/.config/solana/id.json';
const treasuryKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(treasuryKeypairPath, 'utf8')))
);

const connection = new Connection('https://api.devnet.solana.com');

async function transferEverToProgram() {
  try {
    console.log('Treasury wallet:', treasuryKeypair.publicKey.toString());
    
    // Account addresses
    const treasuryEverAccount = new PublicKey('81xDWLArux2ni1HWXxzzrxFGrb5UyPJhByXahwPm2D6K');
    const programEverAccount = new PublicKey('8t4CT8pfMjvVTGmvdtKUkVfaqrLZuEW8WaVKLPqaogpN');
    
    // Check current balances
    const treasuryBalance = await getAccount(connection, treasuryEverAccount);
    const programBalance = await getAccount(connection, programEverAccount);
    
    console.log('Treasury EVER balance:', treasuryBalance.amount.toString());
    console.log('Program EVER balance:', programBalance.amount.toString());
    
    // Transfer 10M EVER tokens (10,000,000 * 10^9) to the program account
    const transferAmount = 10_000_000_000_000_000; // 10M EVER tokens
    
    console.log(`Transferring ${transferAmount / 1_000_000_000} EVER tokens to program account...`);
    
    const signature = await transfer(
      connection,
      treasuryKeypair,
      treasuryEverAccount,
      programEverAccount,
      treasuryKeypair,
      transferAmount
    );
    
    console.log('Transfer signature:', signature);
    console.log('Transfer successful!');
    
    // Check new balances
    const newTreasuryBalance = await getAccount(connection, treasuryEverAccount);
    const newProgramBalance = await getAccount(connection, programEverAccount);
    
    console.log('New Treasury EVER balance:', newTreasuryBalance.amount.toString());
    console.log('New Program EVER balance:', newProgramBalance.amount.toString());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

transferEverToProgram();
