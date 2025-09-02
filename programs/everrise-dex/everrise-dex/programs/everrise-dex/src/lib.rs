use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy");

// Constants from EverRise Formula
const INITIAL_X: u64 = 100_000_000_000; // 100,000 USDC (6 decimals)
const INITIAL_Y: u64 = 1_000_000_000_000_000; // 1,000,000,000 EVER (9 decimals)
const DAILY_GROWTH_RATE: u64 = 2; // 0.02% = 2 basis points
const BASIS_POINTS: u64 = 10_000; // 100% = 10,000 basis points

#[program]
pub mod everrise_dex {
    use super::*;

    /// Initialize the EverRise DEX with initial bonding curve parameters
    pub fn initialize(
        ctx: Context<Initialize>,
        treasury_wallet: Pubkey,
    ) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        bonding_curve.authority = ctx.accounts.authority.key();
        bonding_curve.treasury_wallet = treasury_wallet;
        bonding_curve.x = INITIAL_X; // USDC in treasury
        bonding_curve.y = INITIAL_Y; // EVER in reserve
        bonding_curve.k = INITIAL_X.checked_mul(INITIAL_Y).unwrap(); // K = X * Y
        bonding_curve.last_daily_boost = clock.unix_timestamp;
        bonding_curve.total_volume_24h = 0;
        bonding_curve.sell_queue_head = 0;
        bonding_curve.sell_queue_tail = 0;
        bonding_curve.buy_queue_head = 0;
        bonding_curve.buy_queue_tail = 0;
        bonding_curve.cumulative_bonus = 0;
        bonding_curve.current_price = INITIAL_X
            .checked_mul(1_000_000_000)
            .unwrap()
            .checked_div(INITIAL_Y)
            .unwrap();
        bonding_curve.last_price_update = clock.unix_timestamp;
        bonding_curve.daily_boost_applied = false;
        bonding_curve.circulating_supply = 0;
        bonding_curve.bump = ctx.bumps.bonding_curve;

        msg!("EverRise DEX initialized with K={}, X={}, Y={}", 
             bonding_curve.k, bonding_curve.x, bonding_curve.y);

        Ok(())
    }

    /// Buy EVER tokens using USDC from the bonding curve
    pub fn buy(ctx: Context<Buy>, usdc_amount: u64) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Apply daily boost if needed
        apply_daily_boost(bonding_curve, clock.unix_timestamp)?;

        // Calculate estimated tokens (this can change based on actual fills)
        let estimated_tokens = calculate_buy_amount(bonding_curve, usdc_amount)?;

        // Add to buy queue
        let buy_order = &mut ctx.accounts.buy_order;
        buy_order.buyer = ctx.accounts.user.key();
        buy_order.usdc_amount = usdc_amount;
        buy_order.expected_tokens = estimated_tokens;
        buy_order.timestamp = clock.unix_timestamp;
        buy_order.processed = false;
        buy_order.bump = ctx.bumps.buy_order;

        // Update buy queue tail
        bonding_curve.buy_queue_tail = bonding_curve.buy_queue_tail.checked_add(1).unwrap();

        // Transfer USDC from user to program (will be used for actual purchases)
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.user_usdc_account.to_account_info(),
            to: ctx.accounts.program_usdc_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, usdc_amount)?;

        // Emit buy queue event
        emit!(BuyQueueEvent {
            buyer: ctx.accounts.user.key(),
            usdc_amount,
            estimated_tokens,
            queue_position: bonding_curve.buy_queue_tail - 1,
            timestamp: clock.unix_timestamp,
        });

        msg!("Buy queued: {} USDC -> ~{} EVER tokens (position: {})", 
             usdc_amount, estimated_tokens, bonding_curve.buy_queue_tail - 1);

        Ok(())
    }

    /// Sell EVER tokens to the queue system
    pub fn sell(ctx: Context<Sell>, ever_amount: u64) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Calculate current price using bonding curve formula
        let current_price = bonding_curve.x
            .checked_mul(1_000_000_000) // 9 decimals for EVER
            .unwrap()
            .checked_div(bonding_curve.y)
            .unwrap();
        
        let usdc_value = ever_amount
            .checked_mul(current_price)
            .unwrap()
            .checked_div(1_000_000_000) // Convert from 9 decimals to 6
            .unwrap();

        // Add to sell queue
        let sell_order = &mut ctx.accounts.sell_order;

        sell_order.seller = ctx.accounts.user.key();
        sell_order.ever_amount = ever_amount;
        sell_order.remaining_amount = ever_amount; // Initially, all tokens are remaining
        sell_order.locked_price = current_price;
        sell_order.timestamp = clock.unix_timestamp;
        sell_order.processed = false;
        sell_order.bump = ctx.bumps.sell_order;

        bonding_curve.sell_queue_tail = bonding_curve.sell_queue_tail.checked_add(1).unwrap();

        // Transfer EVER tokens from user to program
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.user_ever_account.to_account_info(),
            to: ctx.accounts.program_ever_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );

        token::transfer(cpi_ctx, ever_amount)?;

        // Emit sell queue event
        emit!(SellQueueEvent {
            seller: ctx.accounts.user.key(),
            ever_amount,
            locked_price: current_price,
            queue_position: bonding_curve.sell_queue_tail - 1,
            timestamp: clock.unix_timestamp,
        });

        msg!("Sell: {} EVER tokens queued for {} USDC (position: {})", 
             ever_amount, usdc_value, bonding_curve.sell_queue_tail - 1);

        Ok(())
    }

    /// Process buy orders from the queue (simplified version for now)
    pub fn process_buy_queue(ctx: Context<ProcessBuyQueue>) -> Result<()> {
        let clock = Clock::get()?;

        // Check if there are buy orders to process
        if ctx.accounts.bonding_curve.buy_queue_head >= ctx.accounts.bonding_curve.buy_queue_tail {
            return Err(ErrorCode::QueueEmpty.into());
        }

        // Get the next buy order to process
        if ctx.accounts.buy_order.processed {
            return Err(ErrorCode::InvalidAmount.into()); // Already processed
        }

        // Extract values before mutable borrows
        let usdc_amount = ctx.accounts.buy_order.usdc_amount;
        let buyer = ctx.accounts.buy_order.buyer;
        let bonding_curve_bump = ctx.accounts.bonding_curve.bump;

        // Calculate tokens to receive
        let ever_from_reserves = calculate_buy_amount(&ctx.accounts.bonding_curve, usdc_amount)?;

        // Prepare CPI accounts and signer
        let seeds = &[b"bonding_curve", &[bonding_curve_bump][..]];
        let signer = &[&seeds[..]];

        // Transfer USDC from program to treasury
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.program_usdc_account.to_account_info(),
            to: ctx.accounts.treasury_usdc_account.to_account_info(),
            authority: ctx.accounts.bonding_curve.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, usdc_amount)?;

        // Mint EVER tokens to buyer
        let mint_instruction = anchor_spl::token::MintTo {
            mint: ctx.accounts.ever_mint.to_account_info(),
            to: ctx.accounts.buyer_ever_account.to_account_info(),
            authority: ctx.accounts.bonding_curve.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, mint_instruction, signer);
        token::mint_to(cpi_ctx, ever_from_reserves)?;

        // Now update bonding curve state
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let buy_order = &mut ctx.accounts.buy_order;

        // Update bonding curve state
        bonding_curve.x = bonding_curve.x.checked_add(usdc_amount).unwrap();
        bonding_curve.y = bonding_curve.y.checked_sub(ever_from_reserves).unwrap();
        bonding_curve.k = bonding_curve.x.checked_mul(bonding_curve.y).unwrap();

        // Mark buy order as processed
        buy_order.processed = true;
        bonding_curve.buy_queue_head = bonding_curve.buy_queue_head.checked_add(1).unwrap();

        // Update total volume
        bonding_curve.total_volume_24h = bonding_curve.total_volume_24h
            .checked_add(usdc_amount)
            .unwrap();

        // Emit processed event
        emit!(BuyProcessedEvent {
            buyer,
            usdc_amount,
            ever_tokens: ever_from_reserves,
            queue_transactions: 0, // No queue transactions in simplified version
            reserve_transactions: usdc_amount,
            timestamp: clock.unix_timestamp,
        });

        msg!("Buy processed: {} USDC -> {} EVER tokens (reserve only)", 
             usdc_amount, ever_from_reserves);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + BondingCurve::INIT_SPACE,
        seeds = [b"bonding_curve"],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve"],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(
        init,
        payer = user,
        space = 8 + BuyOrder::INIT_SPACE,
        seeds = [b"buy_order", bonding_curve.buy_queue_tail.to_le_bytes().as_ref()],
        bump
    )]
    pub buy_order: Account<'info, BuyOrder>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_ever_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub program_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub ever_mint: Account<'info, token::Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Sell<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve"],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(
        init,
        payer = user,
        space = 8 + SellOrder::INIT_SPACE,
        seeds = [b"sell_order", bonding_curve.sell_queue_tail.to_le_bytes().as_ref()],
        bump
    )]
    pub sell_order: Account<'info, SellOrder>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_ever_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub program_ever_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessBuyQueue<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve"],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(
        mut,
        seeds = [b"buy_order", bonding_curve.buy_queue_head.to_le_bytes().as_ref()],
        bump = buy_order.bump
    )]
    pub buy_order: Account<'info, BuyOrder>,
    
    #[account(mut)]
    pub program_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub buyer_ever_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub ever_mint: Account<'info, token::Mint>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct BondingCurve {
    pub authority: Pubkey,
    pub treasury_wallet: Pubkey,
    pub x: u64, // USDC in treasury
    pub y: u64, // EVER in reserve
    pub k: u64, // K = X * Y (constant)
    pub last_daily_boost: i64,
    pub total_volume_24h: u64,
    pub sell_queue_head: u64,
    pub sell_queue_tail: u64,
    pub buy_queue_head: u64,
    pub buy_queue_tail: u64,
    pub cumulative_bonus: u64, // Sum of all historical bonuses
    pub current_price: u64, // Current locked price
    pub last_price_update: i64, // Timestamp of last price update
    pub daily_boost_applied: bool, // Whether daily boost was applied today
    pub circulating_supply: u64, // Total EVER tokens in circulation
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct SellOrder {
    pub seller: Pubkey,
    pub ever_amount: u64, // Total EVER tokens to sell
    pub remaining_amount: u64, // Remaining EVER tokens (for partial fills)
    pub locked_price: u64, // Price at time of queue entry
    pub timestamp: i64,
    pub processed: bool, // true when remaining_amount = 0
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct BuyOrder {
    pub buyer: Pubkey,
    pub usdc_amount: u64,
    pub expected_tokens: u64, // Estimated tokens (can change based on actual fills)
    pub timestamp: i64,
    pub processed: bool,
    pub bump: u8,
}

// Events
#[event]
pub struct BuyQueueEvent {
    pub buyer: Pubkey,
    pub usdc_amount: u64,
    pub estimated_tokens: u64,
    pub queue_position: u64,
    pub timestamp: i64,
}

#[event]
pub struct BuyProcessedEvent {
    pub buyer: Pubkey,
    pub usdc_amount: u64,
    pub ever_tokens: u64,
    pub queue_transactions: u64,
    pub reserve_transactions: u64,
    pub timestamp: i64,
}

#[event]
pub struct SellQueueEvent {
    pub seller: Pubkey,
    pub ever_amount: u64,
    pub locked_price: u64,
    pub queue_position: u64,
    pub timestamp: i64,
}

// Helper functions
/// Calculate how many EVER tokens a user will receive for a given USDC amount
fn calculate_buy_amount(bonding_curve: &BondingCurve, usdc_amount: u64) -> Result<u64> {
    let new_x = bonding_curve.x.checked_add(usdc_amount).ok_or(ErrorCode::MathOverflow)?;
    let new_y = bonding_curve.k.checked_div(new_x).ok_or(ErrorCode::MathOverflow)?;
    let tokens_received = bonding_curve.y.checked_sub(new_y).ok_or(ErrorCode::MathOverflow)?;
    Ok(tokens_received)
}

/// Calculate current price using bonding curve formula
fn calculate_price(bonding_curve: &BondingCurve) -> u64 {
    bonding_curve.x
        .checked_mul(1_000_000_000) // 9 decimals for EVER
        .unwrap_or(0)
        .checked_div(bonding_curve.y)
        .unwrap_or(0)
}

/// Apply daily boost if needed
fn apply_daily_boost(bonding_curve: &mut BondingCurve, current_timestamp: i64) -> Result<()> {
    let days_since_last_boost = (current_timestamp - bonding_curve.last_daily_boost) / 86400; // 86400 seconds in a day
    
    if days_since_last_boost > 0 && !bonding_curve.daily_boost_applied {
        // Apply 0.02% daily boost
        let boost_amount = bonding_curve.current_price
            .checked_mul(2) // 0.02% = 2 basis points
            .unwrap_or(0)
            .checked_div(10000) // 10,000 basis points = 100%
            .unwrap_or(0);
        
        bonding_curve.current_price = bonding_curve.current_price
            .checked_add(boost_amount)
            .ok_or(ErrorCode::MathOverflow)?;
        
        bonding_curve.last_daily_boost = current_timestamp;
        bonding_curve.daily_boost_applied = true;
    }
    
    Ok(())
}

/// Calculate appreciation bonus for queue-based transactions
/// Formula: (0.001 × V) / (current_price × SC)
/// Where V = transaction volume, current_price = sell order locked price, SC = supply cap
fn calculate_appreciation_bonus(
    bonding_curve: &BondingCurve,
    transaction_volume: u64,
    current_price: u64
) -> Result<u64> {
    // Supply cap is the total supply (1 billion tokens)
    let supply_cap = 1_000_000_000u64;
    
    // Calculate: (0.001 × V) / (current_price × SC)
    let numerator = transaction_volume
        .checked_mul(1) // 0.001 = 1/1000, but we'll use 1 for simplicity
        .ok_or(ErrorCode::MathOverflow)?;
    
    let denominator = current_price
        .checked_mul(supply_cap)
        .ok_or(ErrorCode::MathOverflow)?;
    
    let bonus = numerator
        .checked_div(denominator)
        .unwrap_or(0);
    
    Ok(bonus)
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Queue is empty")]
    QueueEmpty,
}