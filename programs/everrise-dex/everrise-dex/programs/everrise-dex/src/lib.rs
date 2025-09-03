use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy");

// Constants from EverRise Formula
const INITIAL_X: u64 = 100_000_000_000; // 100,000 USDC (6 decimals)
const INITIAL_Y: u64 = 1_000_000_000_000_000_000; // 1,000,000,000 EVER (9 decimals)
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
        // Calculate K = X * Y using u128 to handle overflow
        bonding_curve.k = (INITIAL_X as u128).checked_mul(INITIAL_Y as u128).ok_or(ErrorCode::MathOverflow)?; // K = X * Y
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

    /// Buy EVER tokens using USDC from the bonding curve with transaction safety
    pub fn buy(ctx: Context<Buy>, usdc_amount: u64) -> Result<()> {
        // Validate input parameters for transaction safety
        require!(usdc_amount > 0, ErrorCode::InvalidAmount);
        require!(usdc_amount <= 1_000_000_000_000, ErrorCode::AmountTooLarge); // Max 1M USDC per transaction

        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Apply daily boost if needed
        apply_daily_boost(bonding_curve, clock.unix_timestamp)?;

        // Calculate estimated tokens (this can change based on actual fills)
        let estimated_tokens = calculate_buy_amount(bonding_curve, usdc_amount)?;
        require!(estimated_tokens > 0, ErrorCode::InvalidAmount);

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

    /// Sell EVER tokens to the queue system with enhanced transaction safety
    pub fn sell(ctx: Context<Sell>, ever_amount: u64) -> Result<()> {
        // Validate input parameters for transaction safety
        require!(ever_amount > 0, ErrorCode::InvalidAmount);
        require!(ever_amount <= 1_000_000_000_000, ErrorCode::AmountTooLarge); // Max 1B EVER per transaction

        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Apply daily boost if needed before calculating price
        apply_daily_boost(bonding_curve, clock.unix_timestamp)?;

        // Calculate current effective price including all bonuses
        let current_price = calculate_effective_price(bonding_curve);
        require!(current_price > 0, ErrorCode::PriceCalculationFailed);
        
        // Calculate USDC value with overflow protection
        let usdc_value = ever_amount
            .checked_mul(current_price)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(1_000_000_000) // Convert from 9 decimals to 6
            .ok_or(ErrorCode::MathOverflow)?;

        // Validate that the sell order has reasonable value
        require!(usdc_value > 0, ErrorCode::InvalidAmount);
        require!(usdc_value <= 1_000_000_000_000, ErrorCode::AmountTooLarge); // Max 1M USDC value

        // Check if there's sufficient liquidity in the bonding curve
        let organic_price = calculate_organic_price(bonding_curve);
        require!(organic_price > 0, ErrorCode::InsufficientLiquidity);

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

        // Transfer EVER tokens from user to program (atomic operation)
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

        msg!("Sell: {} EVER tokens queued for {} USDC at price {} (position: {})", 
             ever_amount, usdc_value, current_price, bonding_curve.sell_queue_tail - 1);

        Ok(())
    }

    /// Process buy orders from the queue with partial fill support and transaction safety
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

        // Validate buy order for transaction safety
        require!(ctx.accounts.buy_order.usdc_amount > 0, ErrorCode::InvalidAmount);
        require!(ctx.accounts.buy_order.buyer != Pubkey::default(), ErrorCode::InvalidBuyer);

        // Extract values before mutable borrows
        let usdc_amount = ctx.accounts.buy_order.usdc_amount;
        let buyer = ctx.accounts.buy_order.buyer;
        let bonding_curve_bump = ctx.accounts.bonding_curve.bump;

        // Try to process with sell queue first, then reserves
        let result = process_buy_with_sell_queue(
            &ctx.accounts,
            usdc_amount,
            buyer,
            bonding_curve_bump,
            clock.unix_timestamp,
        )?;

        // Update bonding curve state
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let buy_order = &mut ctx.accounts.buy_order;
        let sell_order = &mut ctx.accounts.sell_order;

        // Update bonding curve state
        bonding_curve.x = bonding_curve.x.checked_add(result.reserve_usdc).unwrap();
        bonding_curve.y = bonding_curve.y.checked_sub(result.reserve_ever).unwrap();
        bonding_curve.k = (bonding_curve.x as u128).checked_mul(bonding_curve.y as u128).unwrap();

        // Update cumulative bonus
        bonding_curve.cumulative_bonus = bonding_curve.cumulative_bonus
            .checked_add(result.appreciation_bonus)
            .unwrap();

        // Update sell order if it was processed
        if result.queue_usdc > 0 {
            // Calculate how much of the sell order was consumed
            let usdc_consumed = result.queue_usdc;
            let ever_consumed = usdc_consumed
                .checked_mul(1_000_000_000)
                .unwrap_or(0)
                .checked_div(sell_order.locked_price)
                .unwrap_or(0);
            
            sell_order.remaining_amount = sell_order.remaining_amount
                .checked_sub(ever_consumed)
                .unwrap();
            
            // Mark as processed if fully consumed
            if sell_order.remaining_amount == 0 {
                sell_order.processed = true;
                bonding_curve.sell_queue_head = bonding_curve.sell_queue_head.checked_add(1).unwrap();
            }
        }

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
            ever_tokens: result.total_ever_received,
            queue_transactions: result.queue_usdc,
            reserve_transactions: result.reserve_usdc,
            timestamp: clock.unix_timestamp,
        });

        msg!("Buy processed: {} USDC -> {} EVER tokens (queue: {}, reserve: {})", 
             usdc_amount, result.total_ever_received, result.queue_usdc, result.reserve_usdc);

        Ok(())
    }

    /// Process sell orders from the queue - handles matching with buy orders or direct processing
    pub fn process_sell_queue(ctx: Context<ProcessSellQueue>) -> Result<()> {
        let clock = Clock::get()?;

        // Check if there are sell orders to process
        if ctx.accounts.bonding_curve.sell_queue_head >= ctx.accounts.bonding_curve.sell_queue_tail {
            return Err(ErrorCode::QueueEmpty.into());
        }

        // Get the next sell order to process
        if ctx.accounts.sell_order.processed {
            return Err(ErrorCode::InvalidAmount.into()); // Already processed
        }

        // Validate sell order for transaction safety
        require!(ctx.accounts.sell_order.ever_amount > 0, ErrorCode::InvalidAmount);
        require!(ctx.accounts.sell_order.remaining_amount > 0, ErrorCode::InvalidAmount);
        require!(ctx.accounts.sell_order.seller != Pubkey::default(), ErrorCode::InvalidBuyer);

        // Extract values before mutable borrows
        let ever_amount = ctx.accounts.sell_order.remaining_amount;
        let locked_price = ctx.accounts.sell_order.locked_price;
        let seller = ctx.accounts.sell_order.seller;
        let bonding_curve_bump = ctx.accounts.bonding_curve.bump;

        // Calculate USDC value for this sell order
        let usdc_value = ever_amount
            .checked_mul(locked_price)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(1_000_000_000) // Convert from 9 decimals to 6
            .ok_or(ErrorCode::MathOverflow)?;

        // Check if there are buy orders waiting
        if ctx.accounts.bonding_curve.buy_queue_head < ctx.accounts.bonding_curve.buy_queue_tail {
            // There are buy orders - this sell order will be matched when buy orders are processed
            // For now, we just validate the sell order and leave it in the queue
            msg!("Sell order {} EVER at price {} waiting for buy order matching", 
                 ever_amount, locked_price);
        } else {
            // No buy orders - process this sell order directly against the bonding curve
            // This is a direct sell to the treasury/reserves
            
            // Calculate how much USDC the bonding curve can provide
            let available_usdc = ctx.accounts.bonding_curve.x;
            let max_ever_sellable = available_usdc
                .checked_mul(1_000_000_000) // Convert to 9 decimals
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(locked_price)
                .ok_or(ErrorCode::MathOverflow)?;

            let ever_to_sell = if ever_amount <= max_ever_sellable {
                ever_amount
            } else {
                max_ever_sellable
            };

            if ever_to_sell > 0 {
                let usdc_to_pay = ever_to_sell
                    .checked_mul(locked_price)
                    .ok_or(ErrorCode::MathOverflow)?
                    .checked_div(1_000_000_000)
                    .ok_or(ErrorCode::MathOverflow)?;

                // Prepare CPI accounts and signer
                let seeds = &[b"bonding_curve", &[bonding_curve_bump][..]];
                let signer = &[&seeds[..]];

                // Transfer USDC from treasury to seller
                let cpi_accounts = token::Transfer {
                    from: ctx.accounts.treasury_usdc_account.to_account_info(),
                    to: ctx.accounts.seller_usdc_account.to_account_info(),
                    authority: ctx.accounts.bonding_curve.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                token::transfer(cpi_ctx, usdc_to_pay)?;

                // Burn EVER tokens (transfer to a burn address or reduce supply)
                // For now, we'll transfer to the program's EVER account (effectively removing from circulation)
                let cpi_accounts = token::Transfer {
                    from: ctx.accounts.program_ever_account.to_account_info(),
                    to: ctx.accounts.burn_ever_account.to_account_info(),
                    authority: ctx.accounts.bonding_curve.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                token::transfer(cpi_ctx, ever_to_sell)?;

                // Update bonding curve state
                let bonding_curve = &mut ctx.accounts.bonding_curve;
                let sell_order = &mut ctx.accounts.sell_order;

                // Update bonding curve (X decreases, Y increases)
                bonding_curve.x = bonding_curve.x.checked_sub(usdc_to_pay).ok_or(ErrorCode::MathOverflow)?;
                bonding_curve.y = bonding_curve.y.checked_add(ever_to_sell).ok_or(ErrorCode::MathOverflow)?;
                bonding_curve.k = (bonding_curve.x as u128).checked_mul(bonding_curve.y as u128).ok_or(ErrorCode::MathOverflow)?;

                // Update sell order
                sell_order.remaining_amount = sell_order.remaining_amount.checked_sub(ever_to_sell).ok_or(ErrorCode::MathOverflow)?;
                
                if sell_order.remaining_amount == 0 {
                    sell_order.processed = true;
                    bonding_curve.sell_queue_head = bonding_curve.sell_queue_head.checked_add(1).unwrap();
                }

                // Emit sell processed event
                emit!(SellProcessedEvent {
                    seller,
                    ever_amount: ever_to_sell,
                    usdc_amount: usdc_to_pay,
                    locked_price,
                    processing_type: 1, // Direct to reserves
                    timestamp: clock.unix_timestamp,
                });

                msg!("Sell processed: {} EVER -> {} USDC (direct to reserves)", 
                     ever_to_sell, usdc_to_pay);
            }
        }

        Ok(())
    }

    /// Manually apply daily boost (for testing and maintenance)
    pub fn apply_daily_boost_manual(ctx: Context<ApplyDailyBoost>) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Apply daily boost
        apply_daily_boost(bonding_curve, clock.unix_timestamp)?;

        msg!("Daily boost manually applied at timestamp: {}", clock.unix_timestamp);

        Ok(())
    }

    /// Emergency refund function - refunds USDC to buyer if transaction fails
    /// This is a safety mechanism to prevent USDC loss
    pub fn emergency_refund(ctx: Context<EmergencyRefund>) -> Result<()> {
        let clock = Clock::get()?;

        // Extract values before mutable borrows
        let bonding_curve_bump = ctx.accounts.bonding_curve.bump;
        let usdc_amount = ctx.accounts.buy_order.usdc_amount;
        let buyer = ctx.accounts.buy_order.buyer;
        let timestamp = ctx.accounts.buy_order.timestamp;

        // Validate that this is a failed transaction
        require!(!ctx.accounts.buy_order.processed, ErrorCode::InvalidAmount);
        require!(usdc_amount > 0, ErrorCode::InvalidAmount);

        // Check if enough time has passed (e.g., 1 hour) to allow emergency refund
        let time_elapsed = clock.unix_timestamp - timestamp;
        require!(time_elapsed >= 3600, ErrorCode::RefundNotReady); // 1 hour = 3600 seconds

        // Prepare CPI accounts and signer for refund
        let seeds = &[b"bonding_curve", &[bonding_curve_bump][..]];
        let signer = &[&seeds[..]];

        // Refund USDC from program to buyer
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.program_usdc_account.to_account_info(),
            to: ctx.accounts.buyer_usdc_account.to_account_info(),
            authority: ctx.accounts.bonding_curve.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, usdc_amount)?;

        // Now update state after CPI calls
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let buy_order = &mut ctx.accounts.buy_order;

        // Mark buy order as processed (refunded)
        buy_order.processed = true;
        bonding_curve.buy_queue_head = bonding_curve.buy_queue_head.checked_add(1).unwrap();

        // Emit emergency refund event
        emit!(EmergencyRefundEvent {
            buyer,
            usdc_amount,
            time_elapsed,
            timestamp: clock.unix_timestamp,
        });

        msg!("Emergency refund: {} USDC refunded to buyer {}", 
             usdc_amount, buyer);

        Ok(())
    }
}

// Result struct for buy processing
#[derive(Debug)]
struct BuyProcessingResult {
    total_ever_received: u64,
    queue_usdc: u64,
    reserve_usdc: u64,
    reserve_ever: u64,
    appreciation_bonus: u64,
}

// Helper function to process buy with sell queue (one sell order at a time)
fn process_buy_with_sell_queue(
    accounts: &ProcessBuyQueue,
    usdc_amount: u64,
    _buyer: Pubkey,
    bonding_curve_bump: u8,
    _timestamp: i64,
) -> Result<BuyProcessingResult> {
    let mut remaining_usdc = usdc_amount;
    let mut total_ever_received = 0u64;
    let mut queue_usdc = 0u64;
    let mut appreciation_bonus = 0u64;

    // Prepare CPI accounts and signer
    let seeds = &[b"bonding_curve", &[bonding_curve_bump][..]];
    let signer = &[&seeds[..]];

    // Try to fill from the current sell order if available
    if accounts.bonding_curve.sell_queue_head < accounts.bonding_curve.sell_queue_tail {
        let sell_order = &accounts.sell_order;
        
        if !sell_order.processed && sell_order.remaining_amount > 0 {
            // Calculate how much USDC we can spend on this sell order
            let usdc_for_this_sell = sell_order.remaining_amount
                .checked_mul(sell_order.locked_price)
                .unwrap_or(0)
                .checked_div(1_000_000_000) // Convert from 9 decimals to 6
                .unwrap_or(0);

            if usdc_for_this_sell > 0 {
                if usdc_for_this_sell <= remaining_usdc {
                    // Full fill of this sell order
                    let ever_from_sell = sell_order.remaining_amount;
                    
                    // Transfer USDC from program to seller
                    let cpi_accounts = token::Transfer {
                        from: accounts.program_usdc_account.to_account_info(),
                        to: accounts.seller_usdc_account.to_account_info(),
                        authority: accounts.bonding_curve.to_account_info(),
                    };
                    let cpi_program = accounts.token_program.to_account_info();
                    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                    token::transfer(cpi_ctx, usdc_for_this_sell)?;

                    // Transfer EVER tokens from program to buyer
                    let cpi_accounts = token::Transfer {
                        from: accounts.program_ever_account.to_account_info(),
                        to: accounts.buyer_ever_account.to_account_info(),
                        authority: accounts.bonding_curve.to_account_info(),
                    };
                    let cpi_program = accounts.token_program.to_account_info();
                    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                    token::transfer(cpi_ctx, ever_from_sell)?;

                    // Update tracking
                    remaining_usdc = remaining_usdc.checked_sub(usdc_for_this_sell).unwrap();
                    total_ever_received = total_ever_received.checked_add(ever_from_sell).unwrap();
                    queue_usdc = queue_usdc.checked_add(usdc_for_this_sell).unwrap();

                    // Apply appreciation bonus for queue transaction
                    let bonus = calculate_appreciation_bonus(
                        &accounts.bonding_curve,
                        usdc_for_this_sell,
                        sell_order.locked_price
                    )?;
                    appreciation_bonus = appreciation_bonus.checked_add(bonus).unwrap();

                } else {
                    // Partial fill of this sell order
                    let ever_for_partial = remaining_usdc
                        .checked_mul(1_000_000_000) // Convert to 9 decimals
                        .unwrap_or(0)
                        .checked_div(sell_order.locked_price)
                        .unwrap_or(0);

                    if ever_for_partial > 0 {
                        // Transfer USDC from program to seller
                        let cpi_accounts = token::Transfer {
                            from: accounts.program_usdc_account.to_account_info(),
                            to: accounts.seller_usdc_account.to_account_info(),
                            authority: accounts.bonding_curve.to_account_info(),
                        };
                        let cpi_program = accounts.token_program.to_account_info();
                        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                        token::transfer(cpi_ctx, remaining_usdc)?;

                        // Transfer EVER tokens from program to buyer
                        let cpi_accounts = token::Transfer {
                            from: accounts.program_ever_account.to_account_info(),
                            to: accounts.buyer_ever_account.to_account_info(),
                            authority: accounts.bonding_curve.to_account_info(),
                        };
                        let cpi_program = accounts.token_program.to_account_info();
                        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
                        token::transfer(cpi_ctx, ever_for_partial)?;

                        // Update tracking
                        total_ever_received = total_ever_received.checked_add(ever_for_partial).unwrap();
                        queue_usdc = queue_usdc.checked_add(remaining_usdc).unwrap();

                        // Apply appreciation bonus for queue transaction
                        let bonus = calculate_appreciation_bonus(
                            &accounts.bonding_curve,
                            remaining_usdc,
                            sell_order.locked_price
                        )?;
                        appreciation_bonus = appreciation_bonus.checked_add(bonus).unwrap();

                        remaining_usdc = 0; // Buy order fully satisfied
                    }
                }
            }
        }
    }

    // If there's still USDC remaining, buy from reserves
    let mut reserve_usdc = 0u64;
    let mut reserve_ever = 0u64;
    
    if remaining_usdc > 0 {
        reserve_ever = calculate_buy_amount(&accounts.bonding_curve, remaining_usdc)?;

        // Transfer USDC from program to treasury
        let cpi_accounts = token::Transfer {
            from: accounts.program_usdc_account.to_account_info(),
            to: accounts.treasury_usdc_account.to_account_info(),
            authority: accounts.bonding_curve.to_account_info(),
        };
        let cpi_program = accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, remaining_usdc)?;

        // Mint EVER tokens to buyer
        let mint_instruction = anchor_spl::token::MintTo {
            mint: accounts.ever_mint.to_account_info(),
            to: accounts.buyer_ever_account.to_account_info(),
            authority: accounts.bonding_curve.to_account_info(),
        };
        let cpi_program = accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, mint_instruction, signer);
        token::mint_to(cpi_ctx, reserve_ever)?;

        reserve_usdc = remaining_usdc;
        total_ever_received = total_ever_received.checked_add(reserve_ever).unwrap();
    }

    Ok(BuyProcessingResult {
        total_ever_received,
        queue_usdc,
        reserve_usdc,
        reserve_ever,
        appreciation_bonus,
    })
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
    
    #[account(
        mut,
        seeds = [b"sell_order", bonding_curve.sell_queue_head.to_le_bytes().as_ref()],
        bump = sell_order.bump
    )]
    pub sell_order: Account<'info, SellOrder>,
    
    #[account(mut)]
    pub program_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub program_ever_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub buyer_ever_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub seller_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub ever_mint: Account<'info, token::Mint>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ProcessSellQueue<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve"],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(
        mut,
        seeds = [b"sell_order", bonding_curve.sell_queue_head.to_le_bytes().as_ref()],
        bump = sell_order.bump
    )]
    pub sell_order: Account<'info, SellOrder>,
    
    #[account(mut)]
    pub program_ever_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub seller_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub burn_ever_account: Account<'info, TokenAccount>, // Account to burn EVER tokens
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ApplyDailyBoost<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve"],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct EmergencyRefund<'info> {
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
    pub buyer_usdc_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct BondingCurve {
    pub authority: Pubkey,
    pub treasury_wallet: Pubkey,
    pub x: u64, // USDC in treasury
    pub y: u64, // EVER in reserve
    pub k: u128, // K = X * Y (constant)
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

#[event]
pub struct DailyBoostEvent {
    pub organic_price: u64,
    pub minimum_price: u64,
    pub final_price: u64,
    pub days_passed: i64,
    pub boost_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct EmergencyRefundEvent {
    pub buyer: Pubkey,
    pub usdc_amount: u64,
    pub time_elapsed: i64,
    pub timestamp: i64,
}

#[event]
pub struct SellProcessedEvent {
    pub seller: Pubkey,
    pub ever_amount: u64,
    pub usdc_amount: u64,
    pub locked_price: u64,
    pub processing_type: u8, // 0 = queue matching, 1 = direct to reserves
    pub timestamp: i64,
}

// Helper functions
/// Calculate how many EVER tokens a user will receive for a given USDC amount
fn calculate_buy_amount(bonding_curve: &BondingCurve, usdc_amount: u64) -> Result<u64> {
    let new_x = bonding_curve.x.checked_add(usdc_amount).ok_or(ErrorCode::MathOverflow)?;
    let new_y = bonding_curve.k.checked_div(new_x as u128).ok_or(ErrorCode::MathOverflow)? as u64;
    let tokens_received = bonding_curve.y.checked_sub(new_y).ok_or(ErrorCode::MathOverflow)?;
    Ok(tokens_received)
}

/// Calculate current effective price including all bonuses and daily boosts
fn calculate_effective_price(bonding_curve: &BondingCurve) -> u64 {
    // Start with organic price from bonding curve
    let organic_price = calculate_organic_price(bonding_curve);
    
    // Add cumulative bonus (from queue transactions and daily boosts)
    organic_price
        .checked_add(bonding_curve.cumulative_bonus)
        .unwrap_or(organic_price)
}

/// Calculate current price using bonding curve formula (legacy function)
fn calculate_price(bonding_curve: &BondingCurve) -> u64 {
    calculate_organic_price(bonding_curve)
}

/// Apply daily boost if needed - ensures minimum 0.02% daily price growth
fn apply_daily_boost(bonding_curve: &mut BondingCurve, current_timestamp: i64) -> Result<()> {
    let days_since_last_boost = (current_timestamp - bonding_curve.last_daily_boost) / 86400; // 86400 seconds in a day
    
    if days_since_last_boost > 0 {
        // Reset daily boost flag for new day
        bonding_curve.daily_boost_applied = false;
        
        // Calculate organic growth from bonding curve
        let organic_price = calculate_organic_price(bonding_curve);
        
        // Calculate minimum required price (0.02% daily growth)
        let minimum_price = calculate_minimum_daily_price(bonding_curve, days_since_last_boost)?;
        
        // Use the higher of organic price or minimum price
        let boosted_price = if organic_price >= minimum_price {
            organic_price
        } else {
            minimum_price
        };
        
        // Apply the boost to cumulative bonus
        let price_difference = boosted_price.checked_sub(organic_price).unwrap_or(0);
        if price_difference > 0 {
            bonding_curve.cumulative_bonus = bonding_curve.cumulative_bonus
                .checked_add(price_difference)
                .ok_or(ErrorCode::MathOverflow)?;
        }
        
        // Update current price and state
        bonding_curve.current_price = boosted_price;
        bonding_curve.last_daily_boost = current_timestamp;
        bonding_curve.daily_boost_applied = true;
        
        // Emit daily boost event
        emit!(DailyBoostEvent {
            organic_price,
            minimum_price,
            final_price: boosted_price,
            days_passed: days_since_last_boost,
            boost_amount: price_difference,
            timestamp: current_timestamp,
        });
        
        msg!("Daily boost applied: organic={}, minimum={}, final={}", 
             organic_price, minimum_price, boosted_price);
    }
    
    Ok(())
}

/// Calculate organic price from bonding curve (X/Y)
fn calculate_organic_price(bonding_curve: &BondingCurve) -> u64 {
    if bonding_curve.y == 0 {
        return 0;
    }
    
    bonding_curve.x
        .checked_mul(1_000_000_000) // 9 decimals for EVER
        .unwrap_or(0)
        .checked_div(bonding_curve.y)
        .unwrap_or(0)
}

/// Calculate minimum daily price based on 0.02% daily growth guarantee
fn calculate_minimum_daily_price(bonding_curve: &BondingCurve, days_passed: i64) -> Result<u64> {
    if days_passed <= 0 {
        return Ok(bonding_curve.current_price);
    }
    
    // Calculate compound growth: price * (1.0002)^days
    // For small percentages, we can approximate: price * (1 + 0.0002 * days)
    let growth_factor = 1_000_000u64 // 1.0 in 6 decimal places
        .checked_add(
            (days_passed as u64)
                .checked_mul(200) // 0.02% = 200 basis points in 6 decimals
                .ok_or(ErrorCode::MathOverflow)?
        )
        .ok_or(ErrorCode::MathOverflow)?;
    
    let minimum_price = bonding_curve.current_price
        .checked_mul(growth_factor)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(1_000_000) // Convert back from 6 decimal places
        .ok_or(ErrorCode::MathOverflow)?;
    
    Ok(minimum_price)
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
    #[msg("Transaction amount too large")]
    AmountTooLarge,
    #[msg("Invalid buyer address")]
    InvalidBuyer,
    #[msg("Transaction not ready for refund")]
    RefundNotReady,
    #[msg("Price calculation failed")]
    PriceCalculationFailed,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
}