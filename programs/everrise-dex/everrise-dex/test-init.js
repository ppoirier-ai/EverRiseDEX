import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EverriseDex } from "../target/types/everrise_dex";
import { PublicKey } from "@solana/web3.js";

async function main() {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.EverriseDex as Program<EverriseDex>;
  const provider = anchor.getProvider();
  const treasuryWallet = new PublicKey("FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA");
  const [bondingCurvePDA] = PublicKey.findProgramAddressSync([Buffer.from("bonding_curve")], program.programId);
  
  console.log("Initializing...");
  const tx = await program.methods.initialize(treasuryWallet).accounts({
    bondingCurve: bondingCurvePDA,
    authority: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  }).rpc();
  
  console.log("Success! TX:", tx);
}

main().catch(console.error);
