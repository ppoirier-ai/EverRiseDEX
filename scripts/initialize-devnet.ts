import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EverriseDex } from "../programs/everrise-dex/everrise-dex/target/types/everrise_dex";
import { PublicKey, Keypair } from "@solana/web3.js";

async function initializeDevNet() {
  // Configure the client to use DevNet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EverriseDex as Program<EverriseDex>;
  
  // Treasury wallet from memory
  const treasuryWallet = new PublicKey("FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA");
  
  // PDA for bonding curve
  const [bondingCurvePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding_curve")],
    program.programId
  );

  console.log("🚀 Initializing EverRise DEX on DevNet...");
  console.log("Program ID:", program.programId.toString());
  console.log("Treasury Wallet:", treasuryWallet.toString());
  console.log("Bonding Curve PDA:", bondingCurvePDA.toString());

  try {
    // Initialize the bonding curve
    const tx = await program.methods
      .initialize(treasuryWallet)
      .accounts({
        bondingCurve: bondingCurvePDA,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Initialize transaction signature:", tx);

    // Fetch and display the initialized bonding curve
    const bondingCurve = await program.account.bondingCurve.fetch(bondingCurvePDA);
    
    console.log("\n📊 Bonding Curve Initialized:");
    console.log("Authority:", bondingCurve.authority.toString());
    console.log("Treasury Wallet:", bondingCurve.treasuryWallet.toString());
    console.log("X (USDC):", bondingCurve.x.toString(), "=", (Number(bondingCurve.x) / 1_000_000).toLocaleString(), "USDC");
    console.log("Y (EVER):", bondingCurve.y.toString(), "=", (Number(bondingCurve.y) / 1_000_000_000).toLocaleString(), "EVER");
    console.log("K (constant):", bondingCurve.k.toString());
    console.log("Initial Price:", (Number(bondingCurve.x) / Number(bondingCurve.y) * 1_000_000_000 / 1_000_000).toFixed(6), "USDC per EVER");
    console.log("Sell Queue Head:", bondingCurve.sellQueueHead.toNumber());
    console.log("Sell Queue Tail:", bondingCurve.sellQueueTail.toNumber());
    console.log("Buy Queue Head:", bondingCurve.buyQueueHead.toNumber());
    console.log("Buy Queue Tail:", bondingCurve.buyQueueTail.toNumber());

    console.log("\n🎉 EverRise DEX successfully initialized on DevNet!");
    console.log("Ready for testing with frontend integration.");

  } catch (error) {
    console.error("❌ Error initializing bonding curve:", error);
    throw error;
  }
}

// Run the initialization
initializeDevNet()
  .then(() => {
    console.log("\n✅ DevNet initialization complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ DevNet initialization failed:", error);
    process.exit(1);
  });
