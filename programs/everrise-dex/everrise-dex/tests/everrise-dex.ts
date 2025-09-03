import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EverriseDex } from "../target/types/everrise_dex";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("everrise-dex", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.everriseDex as Program<EverriseDex>;
  const provider = anchor.getProvider();

  // Test accounts
  const authority = provider.wallet;
  const treasuryWallet = new PublicKey("FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA");
  
  // PDA for bonding curve
  const [bondingCurvePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding_curve")],
    program.programId
  );

  it("Initialize EverRise DEX", async () => {
    const tx = await program.methods
      .initialize(treasuryWallet)
      .accounts({
        bondingCurve: bondingCurvePDA,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize transaction signature:", tx);

    // Verify the bonding curve was initialized correctly
    const bondingCurve = await program.account.bondingCurve.fetch(bondingCurvePDA);
    
    expect(bondingCurve.authority.toString()).to.equal(authority.publicKey.toString());
    expect(bondingCurve.treasuryWallet.toString()).to.equal(treasuryWallet.toString());
    expect(bondingCurve.x.toString()).to.equal("100000000000"); // 100K USDC
    expect(bondingCurve.y.toString()).to.equal("1000000000000000000"); // 1B EVER
    expect(bondingCurve.k.toString()).to.equal("100000000000000000000000000000"); // K = X * Y
    expect(bondingCurve.sellQueueHead.toNumber()).to.equal(0);
    expect(bondingCurve.sellQueueTail.toNumber()).to.equal(0);
    expect(bondingCurve.buyQueueHead.toNumber()).to.equal(0);
    expect(bondingCurve.buyQueueTail.toNumber()).to.equal(0);
  });

  it("Calculate initial price", async () => {
    const bondingCurve = await program.account.bondingCurve.fetch(bondingCurvePDA);
    
    // Price = X / Y = 100,000 USDC / 1,000,000,000 EVER
    // = 0.0001 USDC per EVER = $0.0001
    const expectedPrice = 100_000_000_000 / 1_000_000_000_000_000_000; // 0.0001 in proper decimals
    
    console.log("Initial price should be approximately $0.0001 per EVER");
    console.log("X (USDC):", bondingCurve.x.toString());
    console.log("Y (EVER):", bondingCurve.y.toString());
    console.log("K (constant):", bondingCurve.k.toString());
  });

  it("Test bonding curve math", async () => {
    // Test the bonding curve formula: K = X * Y
    const x = 100_000_000_000; // 100,000 USDC
    const y = 1_000_000_000_000_000_000; // 1,000,000,000 EVER
    const k = x * y;
    
    console.log("Bonding curve test:");
    console.log("X (USDC):", x);
    console.log("Y (EVER):", y);
    console.log("K (constant):", k);
    
    // If someone buys 1,000 USDC worth of tokens
    const buyAmount = 1_000_000_000; // 1,000 USDC (6 decimals)
    const newX = x + buyAmount;
    const newY = k / newX;
    const tokensReceived = y - newY;
    
    console.log("\nBuy simulation (1,000 USDC):");
    console.log("New X:", newX);
    console.log("New Y:", newY);
    console.log("Tokens received:", tokensReceived);
    console.log("Price per token:", (buyAmount * 1_000_000_000) / tokensReceived);
  });
});
