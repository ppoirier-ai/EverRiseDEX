import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EverriseDex } from "../target/types/everrise_dex";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo, getAccount } from "@solana/spl-token";
import { expect } from "chai";

describe("EverRiseDEX Comprehensive Tests", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.EverriseDex as Program<EverriseDex>;
  const provider = anchor.getProvider();

  // Test participants
  let alice: Keypair;
  let bob: Keypair;
  let charlie: Keypair;
  let diana: Keypair;
  let eve: Keypair;

  // Token accounts
  let aliceUsdcAccount: PublicKey;
  let bobUsdcAccount: PublicKey;
  let charlieUsdcAccount: PublicKey;
  let dianaEverAccount: PublicKey;
  let eveEverAccount: PublicKey;

  // Program accounts
  let bondingCurve: PublicKey;
  let everMint: PublicKey;
  let usdcMint: PublicKey;
  let treasuryUsdcAccount: PublicKey;
  let programUsdcAccount: PublicKey;
  let programEverAccount: PublicKey;
  let burnEverAccount: PublicKey;

  // Constants
  const INITIAL_TREASURY_USDC = 1_000_000 * 1_000_000; // 1M USDC (6 decimals)
  const INITIAL_RESERVE_EVER = 1_000_000_000 * 1_000_000_000; // 1B EVER (9 decimals)
  const INITIAL_PRICE = 0.001; // 0.001 USDC per EVER

  before(async () => {
    // Create test participants
    alice = Keypair.generate();
    bob = Keypair.generate();
    charlie = Keypair.generate();
    diana = Keypair.generate();
    eve = Keypair.generate();

    // Airdrop SOL to participants
    await Promise.all([
      provider.connection.requestAirdrop(alice.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(bob.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(charlie.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(diana.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(eve.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
    ]);

    // Create token mints
    everMint = await createMint(
      provider.connection,
      alice,
      alice.publicKey,
      null,
      9 // 9 decimals for EVER
    );

    usdcMint = await createMint(
      provider.connection,
      alice,
      alice.publicKey,
      null,
      6 // 6 decimals for USDC
    );

    // Create token accounts for participants
    aliceUsdcAccount = await createAccount(
      provider.connection,
      alice,
      usdcMint,
      alice.publicKey
    );

    bobUsdcAccount = await createAccount(
      provider.connection,
      bob,
      usdcMint,
      bob.publicKey
    );

    charlieUsdcAccount = await createAccount(
      provider.connection,
      charlie,
      usdcMint,
      charlie.publicKey
    );

    dianaEverAccount = await createAccount(
      provider.connection,
      diana,
      everMint,
      diana.publicKey
    );

    eveEverAccount = await createAccount(
      provider.connection,
      eve,
      everMint,
      eve.publicKey
    );

    // Create program token accounts
    treasuryUsdcAccount = await createAccount(
      provider.connection,
      alice,
      usdcMint,
      alice.publicKey
    );

    programUsdcAccount = await createAccount(
      provider.connection,
      alice,
      usdcMint,
      alice.publicKey
    );

    programEverAccount = await createAccount(
      provider.connection,
      alice,
      everMint,
      alice.publicKey
    );

    burnEverAccount = await createAccount(
      provider.connection,
      alice,
      everMint,
      alice.publicKey
    );

    // Mint initial tokens
    await mintTo(
      provider.connection,
      alice,
      usdcMint,
      aliceUsdcAccount,
      alice,
      100_000 * 1_000_000 // 100K USDC for Alice
    );

    await mintTo(
      provider.connection,
      alice,
      usdcMint,
      bobUsdcAccount,
      alice,
      50_000 * 1_000_000 // 50K USDC for Bob
    );

    await mintTo(
      provider.connection,
      alice,
      usdcMint,
      charlieUsdcAccount,
      alice,
      25_000 * 1_000_000 // 25K USDC for Charlie
    );

    await mintTo(
      provider.connection,
      alice,
      everMint,
      dianaEverAccount,
      alice,
      500_000 * 1_000_000_000 // 500K EVER for Diana
    );

    await mintTo(
      provider.connection,
      alice,
      everMint,
      eveEverAccount,
      alice,
      200_000 * 1_000_000_000 // 200K EVER for Eve
    );

    // Mint initial treasury USDC
    await mintTo(
      provider.connection,
      alice,
      usdcMint,
      treasuryUsdcAccount,
      alice,
      INITIAL_TREASURY_USDC
    );

    // Initialize bonding curve
    const [bondingCurvePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bonding_curve")],
      program.programId
    );
    bondingCurve = bondingCurvePda;

    await program.methods
      .initialize(
        new anchor.BN(INITIAL_TREASURY_USDC),
        new anchor.BN(INITIAL_RESERVE_EVER),
        treasuryUsdcAccount
      )
      .accounts({
        bondingCurve: bondingCurve,
        authority: alice.publicKey,
        treasuryWallet: alice.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([alice])
      .rpc();
  });

  it("Test Scenario 1: Initial Buy Order - Alice buys 10,000 USDC worth of EVER", async () => {
    const buyAmount = 10_000 * 1_000_000; // 10K USDC

    // Get bonding curve state before
    const bondingCurveBefore = await program.account.bondingCurve.fetch(bondingCurve);
    const priceBefore = Number(bondingCurveBefore.x) / Number(bondingCurveBefore.y);

    // Create buy order PDA
    const [buyOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("buy_order"), bondingCurveBefore.buyQueueTail.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Execute buy
    await program.methods
      .buy(new anchor.BN(buyAmount))
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        user: alice.publicKey,
        userUsdcAccount: aliceUsdcAccount,
        userEverAccount: alice.publicKey, // Will be created
        programUsdcAccount: programUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([alice])
      .rpc();

    // Process buy queue
    const [sellOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sell_order"), bondingCurveBefore.sellQueueHead.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .processBuyQueue()
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        sellOrder: sellOrderPda,
        programUsdcAccount: programUsdcAccount,
        programEverAccount: programEverAccount,
        buyerEverAccount: alice.publicKey, // Will be created
        sellerUsdcAccount: alice.publicKey, // Not used in this case
        treasuryUsdcAccount: treasuryUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Verify results
    const bondingCurveAfter = await program.account.bondingCurve.fetch(bondingCurve);
    const priceAfter = Number(bondingCurveAfter.x) / Number(bondingCurveAfter.y);

    console.log(`Price before: ${priceBefore}`);
    console.log(`Price after: ${priceAfter}`);
    console.log(`Expected price increase: ${priceBefore * 1.01}`);

    // Price should increase due to bonding curve mechanics
    expect(priceAfter).to.be.greaterThan(priceBefore);
  });

  it("Test Scenario 2: Sell Order to Queue - Diana sells 100,000 EVER", async () => {
    const sellAmount = 100_000 * 1_000_000_000; // 100K EVER

    // Get bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);
    const currentPrice = Number(bondingCurveState.x) / Number(bondingCurveState.y);

    // Create sell order PDA
    const [sellOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sell_order"), bondingCurveState.sellQueueTail.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Execute sell
    await program.methods
      .sell(new anchor.BN(sellAmount))
      .accounts({
        bondingCurve: bondingCurve,
        sellOrder: sellOrderPda,
        user: diana.publicKey,
        userEverAccount: dianaEverAccount,
        programEverAccount: programEverAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([diana])
      .rpc();

    // Verify sell order was created
    const sellOrder = await program.account.sellOrder.fetch(sellOrderPda);
    expect(Number(sellOrder.everAmount)).to.equal(sellAmount);
    expect(Number(sellOrder.remainingAmount)).to.equal(sellAmount);
    expect(sellOrder.processed).to.be.false;

    console.log(`Sell order created: ${Number(sellOrder.everAmount) / 1_000_000_000} EVER at price ${Number(sellOrder.lockedPrice) / 1_000_000_000}`);
  });

  it("Test Scenario 3: Buy Order with Queue Matching - Bob buys 5,000 USDC", async () => {
    const buyAmount = 5_000 * 1_000_000; // 5K USDC

    // Get bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);

    // Create buy order PDA
    const [buyOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("buy_order"), bondingCurveState.buyQueueTail.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Execute buy
    await program.methods
      .buy(new anchor.BN(buyAmount))
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        user: bob.publicKey,
        userUsdcAccount: bobUsdcAccount,
        userEverAccount: bob.publicKey, // Will be created
        programUsdcAccount: programUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([bob])
      .rpc();

    // Process buy queue (should match with Diana's sell order)
    const [sellOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sell_order"), bondingCurveState.sellQueueHead.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .processBuyQueue()
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        sellOrder: sellOrderPda,
        programUsdcAccount: programUsdcAccount,
        programEverAccount: programEverAccount,
        buyerEverAccount: bob.publicKey, // Will be created
        sellerUsdcAccount: diana.publicKey, // Diana should receive USDC
        treasuryUsdcAccount: treasuryUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Verify partial fill
    const sellOrderAfter = await program.account.sellOrder.fetch(sellOrderPda);
    expect(Number(sellOrderAfter.remainingAmount)).to.be.lessThan(Number(sellOrderAfter.everAmount));
    expect(sellOrderAfter.processed).to.be.false; // Should not be fully processed

    console.log(`Sell order remaining: ${Number(sellOrderAfter.remainingAmount) / 1_000_000_000} EVER`);
  });

  it("Test Scenario 4: Complete Sell Order Fill - Charlie buys 10,000 USDC", async () => {
    const buyAmount = 10_000 * 1_000_000; // 10K USDC

    // Get bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);

    // Create buy order PDA
    const [buyOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("buy_order"), bondingCurveState.buyQueueTail.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Execute buy
    await program.methods
      .buy(new anchor.BN(buyAmount))
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        user: charlie.publicKey,
        userUsdcAccount: charlieUsdcAccount,
        userEverAccount: charlie.publicKey, // Will be created
        programUsdcAccount: programUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([charlie])
      .rpc();

    // Process buy queue (should complete Diana's sell order)
    const [sellOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sell_order"), bondingCurveState.sellQueueHead.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .processBuyQueue()
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        sellOrder: sellOrderPda,
        programUsdcAccount: programUsdcAccount,
        programEverAccount: programEverAccount,
        buyerEverAccount: charlie.publicKey, // Will be created
        sellerUsdcAccount: diana.publicKey, // Diana should receive USDC
        treasuryUsdcAccount: treasuryUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Verify sell order is completed
    const sellOrderAfter = await program.account.sellOrder.fetch(sellOrderPda);
    expect(sellOrderAfter.processed).to.be.true;
    expect(Number(sellOrderAfter.remainingAmount)).to.equal(0);

    console.log(`Sell order completed: ${Number(sellOrderAfter.everAmount) / 1_000_000_000} EVER`);
  });

  it("Test Scenario 5: Multiple Sell Orders - Eve sells 50,000 EVER", async () => {
    const sellAmount = 50_000 * 1_000_000_000; // 50K EVER

    // Get bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);

    // Create sell order PDA
    const [sellOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sell_order"), bondingCurveState.sellQueueTail.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Execute sell
    await program.methods
      .sell(new anchor.BN(sellAmount))
      .accounts({
        bondingCurve: bondingCurve,
        sellOrder: sellOrderPda,
        user: eve.publicKey,
        userEverAccount: eveEverAccount,
        programEverAccount: programEverAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([eve])
      .rpc();

    // Verify sell order was created
    const sellOrder = await program.account.sellOrder.fetch(sellOrderPda);
    expect(Number(sellOrder.everAmount)).to.equal(sellAmount);
    expect(Number(sellOrder.remainingAmount)).to.equal(sellAmount);
    expect(sellOrder.processed).to.be.false;

    console.log(`Eve's sell order created: ${Number(sellOrder.everAmount) / 1_000_000_000} EVER`);
  });

  it("Test Scenario 6: Large Buy Order - Alice buys 25,000 USDC", async () => {
    const buyAmount = 25_000 * 1_000_000; // 25K USDC

    // Get bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);

    // Create buy order PDA
    const [buyOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("buy_order"), bondingCurveState.buyQueueTail.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Execute buy
    await program.methods
      .buy(new anchor.BN(buyAmount))
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        user: alice.publicKey,
        userUsdcAccount: aliceUsdcAccount,
        userEverAccount: alice.publicKey, // Will be created
        programUsdcAccount: programUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([alice])
      .rpc();

    // Process buy queue (should match with Eve's sell order)
    const [sellOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sell_order"), bondingCurveState.sellQueueHead.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .processBuyQueue()
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        sellOrder: sellOrderPda,
        programUsdcAccount: programUsdcAccount,
        programEverAccount: programEverAccount,
        buyerEverAccount: alice.publicKey, // Will be created
        sellerUsdcAccount: eve.publicKey, // Eve should receive USDC
        treasuryUsdcAccount: treasuryUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Verify Eve's sell order is completed
    const sellOrderAfter = await program.account.sellOrder.fetch(sellOrderPda);
    expect(sellOrderAfter.processed).to.be.true;
    expect(Number(sellOrderAfter.remainingAmount)).to.equal(0);

    console.log(`Eve's sell order completed: ${Number(sellOrderAfter.everAmount) / 1_000_000_000} EVER`);
  });

  it("Test Scenario 7: Daily Boost Application", async () => {
    // Get bonding curve state before
    const bondingCurveBefore = await program.account.bondingCurve.fetch(bondingCurve);
    const priceBefore = Number(bondingCurveBefore.x) / Number(bondingCurveBefore.y);

    // Apply daily boost manually
    await program.methods
      .applyDailyBoostManual()
      .accounts({
        bondingCurve: bondingCurve,
        authority: alice.publicKey,
      })
      .signers([alice])
      .rpc();

    // Verify results
    const bondingCurveAfter = await program.account.bondingCurve.fetch(bondingCurve);
    const priceAfter = Number(bondingCurveAfter.x) / Number(bondingCurveAfter.y);

    console.log(`Price before daily boost: ${priceBefore}`);
    console.log(`Price after daily boost: ${priceAfter}`);
    console.log(`Cumulative bonus: ${Number(bondingCurveAfter.cumulativeBonus)}`);

    // Price should increase due to daily boost
    expect(priceAfter).to.be.greaterThan(priceBefore);
  });

  it("Test Scenario 8: Small Buy Order - Bob buys 1,000 USDC", async () => {
    const buyAmount = 1_000 * 1_000_000; // 1K USDC

    // Get bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);

    // Create buy order PDA
    const [buyOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("buy_order"), bondingCurveState.buyQueueTail.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Execute buy
    await program.methods
      .buy(new anchor.BN(buyAmount))
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        user: bob.publicKey,
        userUsdcAccount: bobUsdcAccount,
        userEverAccount: bob.publicKey, // Will be created
        programUsdcAccount: programUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([bob])
      .rpc();

    // Process buy queue (should buy from reserves since no sell queue)
    const [sellOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sell_order"), bondingCurveState.sellQueueHead.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .processBuyQueue()
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        sellOrder: sellOrderPda,
        programUsdcAccount: programUsdcAccount,
        programEverAccount: programEverAccount,
        buyerEverAccount: bob.publicKey, // Will be created
        sellerUsdcAccount: bob.publicKey, // Not used
        treasuryUsdcAccount: treasuryUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Verify bonding curve state changed
    const bondingCurveAfter = await program.account.bondingCurve.fetch(bondingCurve);
    expect(Number(bondingCurveAfter.x)).to.be.greaterThan(Number(bondingCurveState.x));
    expect(Number(bondingCurveAfter.y)).to.be.lessThan(Number(bondingCurveState.y));

    console.log(`Bonding curve updated: X=${Number(bondingCurveAfter.x)}, Y=${Number(bondingCurveAfter.y)}`);
  });

  it("Test Scenario 9: Emergency Refund Scenario", async () => {
    // Create a buy order that will fail to process
    const buyAmount = 1_000 * 1_000_000; // 1K USDC

    // Get bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);

    // Create buy order PDA
    const [buyOrderPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("buy_order"), bondingCurveState.buyQueueTail.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Execute buy
    await program.methods
      .buy(new anchor.BN(buyAmount))
      .accounts({
        bondingCurve: bondingCurve,
        buyOrder: buyOrderPda,
        user: charlie.publicKey,
        userUsdcAccount: charlieUsdcAccount,
        userEverAccount: charlie.publicKey, // Will be created
        programUsdcAccount: programUsdcAccount,
        everMint: everMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([charlie])
      .rpc();

    // Simulate time passing (in real scenario, this would be 1 hour)
    // For testing, we'll skip the time check and test the refund mechanism

    // Test emergency refund (this should fail due to time constraint in real scenario)
    try {
      await program.methods
        .emergencyRefund()
        .accounts({
          bondingCurve: bondingCurve,
          buyOrder: buyOrderPda,
          programUsdcAccount: programUsdcAccount,
          buyerUsdcAccount: charlieUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      // If we get here, the refund succeeded (unexpected in real scenario)
      console.log("Emergency refund succeeded (unexpected)");
    } catch (error) {
      // Expected to fail due to time constraint
      console.log("Emergency refund failed as expected:", error.message);
      expect(error.message).to.include("RefundNotReady");
    }
  });

  it("Test Scenario 10: Price Consistency Check", async () => {
    // Get bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);
    
    // Calculate expected price
    const expectedPrice = Number(bondingCurveState.x) / Number(bondingCurveState.y);
    const effectivePrice = expectedPrice + (Number(bondingCurveState.cumulativeBonus) / 1_000_000_000);

    console.log(`Bonding curve price: ${expectedPrice}`);
    console.log(`Cumulative bonus: ${Number(bondingCurveState.cumulativeBonus)}`);
    console.log(`Effective price: ${effectivePrice}`);

    // Verify price is reasonable
    expect(expectedPrice).to.be.greaterThan(0);
    expect(effectivePrice).to.be.greaterThan(expectedPrice);
  });

  it("Test Scenario 11: Queue State Management", async () => {
    // Get bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);

    // Verify queue pointers
    expect(Number(bondingCurveState.buyQueueHead)).to.be.lessThanOrEqual(Number(bondingCurveState.buyQueueTail));
    expect(Number(bondingCurveState.sellQueueHead)).to.be.lessThanOrEqual(Number(bondingCurveState.sellQueueTail));

    console.log(`Buy queue: head=${bondingCurveState.buyQueueHead}, tail=${bondingCurveState.buyQueueTail}`);
    console.log(`Sell queue: head=${bondingCurveState.sellQueueHead}, tail=${bondingCurveState.sellQueueTail}`);
  });

  it("Test Scenario 12: Error Handling", async () => {
    // Test invalid amount (0)
    try {
      await program.methods
        .buy(new anchor.BN(0))
        .accounts({
          bondingCurve: bondingCurve,
          buyOrder: PublicKey.default,
          user: alice.publicKey,
          userUsdcAccount: aliceUsdcAccount,
          userEverAccount: alice.publicKey,
          programUsdcAccount: programUsdcAccount,
          everMint: everMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([alice])
        .rpc();

      expect.fail("Should have failed with invalid amount");
    } catch (error) {
      expect(error.message).to.include("InvalidAmount");
    }

    // Test amount too large
    try {
      await program.methods
        .buy(new anchor.BN(2_000_000 * 1_000_000)) // 2M USDC
        .accounts({
          bondingCurve: bondingCurve,
          buyOrder: PublicKey.default,
          user: alice.publicKey,
          userUsdcAccount: aliceUsdcAccount,
          userEverAccount: alice.publicKey,
          programUsdcAccount: programUsdcAccount,
          everMint: everMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([alice])
        .rpc();

      expect.fail("Should have failed with amount too large");
    } catch (error) {
      expect(error.message).to.include("AmountTooLarge");
    }
  });

  it("Test Scenario 13: Final State Validation", async () => {
    // Get final bonding curve state
    const bondingCurveState = await program.account.bondingCurve.fetch(bondingCurve);

    // Verify all state is consistent
    expect(Number(bondingCurveState.x)).to.be.greaterThan(0);
    expect(Number(bondingCurveState.y)).to.be.greaterThan(0);
    expect(Number(bondingCurveState.k)).to.equal(Number(bondingCurveState.x) * Number(bondingCurveState.y));

    // Verify queue management
    expect(Number(bondingCurveState.buyQueueHead)).to.be.lessThanOrEqual(Number(bondingCurveState.buyQueueTail));
    expect(Number(bondingCurveState.sellQueueHead)).to.be.lessThanOrEqual(Number(bondingCurveState.sellQueueTail));

    // Verify daily boost state
    expect(bondingCurveState.dailyBoostApplied).to.be.true;

    console.log("Final bonding curve state:");
    console.log(`X (USDC): ${Number(bondingCurveState.x) / 1_000_000}`);
    console.log(`Y (EVER): ${Number(bondingCurveState.y) / 1_000_000_000}`);
    console.log(`K: ${Number(bondingCurveState.k)}`);
    console.log(`Cumulative bonus: ${Number(bondingCurveState.cumulativeBonus)}`);
    console.log(`Buy queue: ${bondingCurveState.buyQueueHead} -> ${bondingCurveState.buyQueueTail}`);
    console.log(`Sell queue: ${bondingCurveState.sellQueueHead} -> ${bondingCurveState.sellQueueTail}`);
  });
});
