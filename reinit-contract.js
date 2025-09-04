const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Program, AnchorProvider } = require('@coral-xyz/anchor');
const fs = require('fs');

// Load the IDL
const idl = JSON.parse(fs.readFileSync('../frontend/src/everrise_dex.json', 'utf8'));

// Connection to DevNet
const connection = new Connection('https://api.devnet.solana.com');

// Program ID
const PROGRAM_ID = new PublicKey('9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy');

// Bonding curve PDA
const BONDING_CURVE_PDA = new PublicKey('9pdSYBWZfgm9S8qJJA2vVs1iRfPeosoagh1aKsm83ddU');

async function reinitContract() {
    try {
        console.log('🔍 Current bonding curve state:');
        const accountInfo = await connection.getAccountInfo(BONDING_CURVE_PDA);
        if (accountInfo) {
            console.log('✅ Bonding curve account exists');
            console.log('📊 Account data length:', accountInfo.data.length);
            console.log('💰 Account lamports:', accountInfo.lamports);
            console.log('👤 Account owner:', accountInfo.owner.toString());
            
            // The account exists, we need to reinitialize it
            console.log('🔄 Bonding curve needs to be reinitialized to clear queues');
            console.log('💡 This requires the authority key to reinitialize');
            console.log('📝 Note: Reinitializing will reset all queue data to empty state');
        } else {
            console.log('❌ Bonding curve account does not exist');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

reinitContract();
