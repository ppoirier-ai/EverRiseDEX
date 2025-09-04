const { Connection, PublicKey } = require('@solana/web3.js');
const { getAccount } = require('@solana/spl-token');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function checkTokenAccount() {
  try {
    const accountAddress = new PublicKey('81xDWLArux2ni1HWXxzzrxFGrb5UyPJhByXahwPm2D6K');
    
    console.log('🔍 Checking token account:', accountAddress.toString());
    
    const account = await getAccount(connection, accountAddress);
    
    console.log('📊 Token Account Details:');
    console.log('  Mint:', account.mint.toString());
    console.log('  Owner:', account.owner.toString());
    console.log('  Amount:', account.amount.toString());
    console.log('  Decimals:', account.mint.toString() === '85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb' ? '9' : '6');
    
    // Check if this is the EVER token
    if (account.mint.toString() === '85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb') {
      console.log('✅ This is an EVER token account');
      console.log('💰 EVER Balance:', Number(account.amount) / 1e9, 'EVER');
    } else {
      console.log('❌ This is not an EVER token account');
    }
    
  } catch (error) {
    console.error('❌ Error checking token account:', error);
  }
}

checkTokenAccount();
