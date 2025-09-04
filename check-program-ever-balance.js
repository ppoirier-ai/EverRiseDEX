const { Connection, PublicKey } = require('@solana/web3.js');
const { getAccount } = require('@solana/spl-token');

async function checkProgramEverBalance() {
    const connection = new Connection('https://api.devnet.solana.com');
    
    // Program EVER account address
    const programEverAccount = new PublicKey('8t4CT8pfMjvVTGmvdtKUkVfaqrLZuEW8WaVKLPqaogpN');
    
    try {
        const accountInfo = await getAccount(connection, programEverAccount);
        console.log('Program EVER Account Info:');
        console.log('- Address:', programEverAccount.toString());
        console.log('- Owner:', accountInfo.owner.toString());
        console.log('- Mint:', accountInfo.mint.toString());
        console.log('- Amount:', accountInfo.amount.toString());
        console.log('- Decimals:', accountInfo.amount.toString().length - 9, 'EVER tokens');
    } catch (error) {
        console.error('Error fetching program EVER account:', error.message);
        console.log('Account might not exist or be empty');
    }
}

checkProgramEverBalance();
