import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EverriseDex } from "../target/types/everrise_dex";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("Simple DevNet Test", () => {
  // Configure the client to use DevNet
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.EverriseDex as Program<EverriseDex>;
  const provider = anchor.getProvider();

  // Treasury wallet from memory
  const treasuryWallet = new PublicKey("FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA");
  
  // PDA for bonding curve
  const [bondingCurvePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding_curve")],
    program.programId
  );

  it("Initialize EverRise DEX on DevNet", async () => {
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

      // Verify the bonding curve was initialized correctly
      expect(bondingCurve.authority.toString()).to.equal(provider.wallet.publicKey.toString());
      expect(bondingCurve.treasuryWallet.toString()).to.equal(treasuryWallet.toString());
      expect(bondingCurve.x.toString()).to.equal("10000000000"); // 10K USDC
      expect(bondingCurve.y.toString()).to.equal("100000000000000000"); // 100M EVER

      console.log("\n🎉 EverRise DEX successfully initialized on DevNet!");
    } catch (error) {
      console.error("❌ Error:", error);
      throw error;
    }
  });
});
