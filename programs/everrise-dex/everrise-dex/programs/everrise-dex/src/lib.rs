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
        
        // Calculate price and tokens to receive using bonding curve formula
        let new_x = bonding_curve.x.checked_add(usdc_amount).unwrap();
        let new_y = bonding_curve.k.checked_div(new_x).unwrap();
        let tokens_received = bonding_curve.y.checked_sub(new_y).unwrap();

        // Update bonding curve state
        bonding_curve.x = new_x;
        bonding_curve.y = new_y;
        bonding_curve.total_volume_24h = bonding_curve.total_volume_24h
            .checked_add(usdc_amount)
            .unwrap();

        // Transfer USDC from user to treasury
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.user_usdc_account.to_account_info(),
            to: ctx.accounts.treasury_usdc_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );

        token::transfer(cpi_ctx, usdc_amount)?;

        // Mint EVER tokens to user
        let seeds = &[
            b"bonding_curve",
            &[bonding_curve.bump][..],
        ];
        let signer = &[&seeds[..]];

        let mint_instruction = anchor_spl::token::MintTo {
            mint: ctx.accounts.ever_mint.to_account_info(),
            to: ctx.accounts.user_ever_account.to_account_info(),
            authority: ctx.accounts.bonding_curve.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            mint_instruction,
            signer,
        );

        token::mint_to(cpi_ctx, tokens_received)?;

        msg!("Buy: {} USDC -> {} EVER tokens", usdc_amount, tokens_received);

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

        msg!("Sell: {} EVER tokens queued for {} USDC", ever_amount, usdc_value);

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
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_ever_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub ever_mint: Account<'info, token::Mint>,
    
    pub token_program: Program<'info, Token>,
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