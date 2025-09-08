use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};
use std::str::FromStr;

// Mint addresses for validation
const USDC_MINT: Pubkey = pubkey!("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
const EVER_MINT: Pubkey = pubkey!("85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb");

declare_id!("9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy");

// Constants from EverRise Formula
const INITIAL_X: u64 = 10_000_000_000; // 10,000 USDC (6 decimals)
const INITIAL_Y: u64 = 100_000_000_000_000_000; // 100,000,000 EVER (9 decimals)
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
        // Calculate initial price: X / Y * 10^3 (to convert from 6 decimals to 9 decimals)
        // Price = (10,000 USDC / 100,000,000 EVER) * 10^3 = 0.1 * 10^3 = 100
        bonding_curve.current_price = 100; // 0.0001 USDC per EVER in proper decimals
        bonding_curve.last_price_update = clock.unix_timestamp;
        bonding_curve.daily_boost_applied = false;
        bonding_curve.circulating_supply = 0;
        bonding_curve.bump = ctx.bumps.bonding_curve;

        msg!("EverRise DEX initialized with K={}, X={}, Y={}", 
             bonding_curve.k, bonding_curve.x, bonding_curve.y);

        Ok(())
    }

    /// Buy EVER tokens using USDC from the bonding curve. This is now an atomic operation.
    pub fn buy(ctx: Context<Buy>, usdc_amount: u64) -> Result<()> {
        // Validate input parameters
        require!(usdc_amount > 0, ErrorCode::InvalidAmount);
        require!(usdc_amount <= 10_000_000_000_000, ErrorCode::AmountTooLarge); // Max 10M USDC per transaction

        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Apply daily boost if needed
        apply_daily_boost(bonding_curve, clock.unix_timestamp)?;

        // Calculate exact tokens to receive
        let tokens_to_receive = calculate_buy_amount(bonding_curve, usdc_amount)?;
        require!(tokens_to_receive > 0, ErrorCode::InvalidAmount);

        // Check if program has enough EVER tokens
        require!(ctx.accounts.program_ever_account.amount >= tokens_to_receive, ErrorCode::InsufficientFunds);

        // 1. Transfer USDC from user to treasury
        let cpi_accounts_usdc = token::Transfer {
            from: ctx.accounts.user_usdc_account.to_account_info(),
            to: ctx.accounts.treasury_usdc_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program_usdc = ctx.accounts.token_program.to_account_info();
        let cpi_ctx_usdc = CpiContext::new(cpi_program_usdc, cpi_accounts_usdc);
        token::transfer(cpi_ctx_usdc, usdc_amount)?;

        // 2. Transfer EVER tokens from program to user
        let seeds = &[&b"bonding_curve"[..], &[bonding_curve.bump]];
        let signer_seeds = &[&seeds[..]];
        let cpi_accounts_ever = token::Transfer {
            from: ctx.accounts.program_ever_account.to_account_info(),
            to: ctx.accounts.user_ever_account.to_account_info(),
            authority: bonding_curve.to_account_info(),
        };
        let cpi_program_ever = ctx.accounts.token_program.to_account_info();
        let cpi_ctx_ever = CpiContext::new_with_signer(cpi_program_ever, cpi_accounts_ever, signer_seeds);
        token::transfer(cpi_ctx_ever, tokens_to_receive)?;

        // 3. Update bonding curve state
        bonding_curve.x = bonding_curve.x.checked_add(usdc_amount).ok_or(ErrorCode::MathOverflow)?;
        bonding_curve.y = bonding_curve.y.checked_sub(tokens_to_receive).ok_or(ErrorCode::MathOverflow)?;
        bonding_curve.k = u128::from(bonding_curve.x).checked_mul(u128::from(bonding_curve.y)).ok_or(ErrorCode::MathOverflow)?;
        bonding_curve.circulating_supply = bonding_curve.circulating_supply.checked_add(tokens_to_receive).ok_or(ErrorCode::MathOverflow)?;
        bonding_curve.total_volume_24h = bonding_curve.total_volume_24h.checked_add(usdc_amount).ok_or(ErrorCode::MathOverflow)?;
        bonding_curve.current_price = calculate_effective_price(bonding_curve);
        bonding_curve.last_price_update = clock.unix_timestamp;
        
        emit!(AtomicBuyEvent {
            buyer: ctx.accounts.user.key(),
            usdc_amount,
            ever_received: tokens_to_receive,
            new_price: bonding_curve.current_price,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Smart buy that processes sell orders first, then buys from reserves if needed
    pub fn buy_smart(ctx: Context<BuyWithSellProcessing>, usdc_amount: u64) -> Result<()> {
        // Validate input parameters
        require!(usdc_amount > 0, ErrorCode::InvalidAmount);
        require!(usdc_amount <= 10_000_000_000_000, ErrorCode::AmountTooLarge); // Max 10M USDC per transaction

        let bonding_curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Apply daily boost if needed
        apply_daily_boost(bonding_curve, clock.unix_timestamp)?;

        let mut remaining_usdc = usdc_amount;
        let mut total_ever_received = 0u64;

        // First, try to fulfill from sell orders if any exist
        if bonding_curve.sell_queue_head < bonding_curve.sell_queue_tail {
            // Process sell orders (similar logic to process_buy_queue)
            let sell_order_info = ctx.accounts.sell_order.to_account_info();
            if sell_order_info.data_len() > 0 {
                let sell_order_data = sell_order_info.try_borrow_data()?;
                if let Ok(mut sell_order) = SellOrder::try_deserialize(&mut sell_order_data.as_ref()) {
                    if !sell_order.processed && sell_order.remaining_amount > 0 {
                        // Calculate how much USDC we can spend on this sell order
                        let usdc_for_this_sell = sell_order.remaining_amount
                            .checked_mul(sell_order.locked_price)
                            .unwrap_or(0)
                            .checked_div(1_000_000_000) // Convert from 9 decimals to 6
                            .unwrap_or(0);

                        if usdc_for_this_sell > 0 && usdc_for_this_sell <= remaining_usdc {
                            // Full fill of this sell order
                            let ever_from_sell = sell_order.remaining_amount;
                            
                            // Transfer USDC from buyer to seller
                            let cpi_accounts_usdc = token::Transfer {
                                from: ctx.accounts.user_usdc_account.to_account_info(),
                                to: ctx.accounts.seller_usdc_account.to_account_info(),
                                authority: ctx.accounts.user.to_account_info(),
                            };
                            let cpi_program_usdc = ctx.accounts.token_program.to_account_info();
                            let cpi_ctx_usdc = CpiContext::new(cpi_program_usdc, cpi_accounts_usdc);
                            token::transfer(cpi_ctx_usdc, usdc_for_this_sell)?;

                            // Transfer EVER tokens from program to buyer
                            let seeds = &[&b"bonding_curve"[..], &[bonding_curve.bump]];
                            let signer_seeds = &[&seeds[..]];
                            let cpi_accounts_ever = token::Transfer {
                                from: ctx.accounts.program_ever_account.to_account_info(),
                                to: ctx.accounts.user_ever_account.to_account_info(),
                                authority: bonding_curve.to_account_info(),
                            };
                            let cpi_program_ever = ctx.accounts.token_program.to_account_info();
                            let cpi_ctx_ever = CpiContext::new_with_signer(cpi_program_ever, cpi_accounts_ever, signer_seeds);
                            token::transfer(cpi_ctx_ever, ever_from_sell)?;

                            // Update tracking
                            remaining_usdc = remaining_usdc.checked_sub(usdc_for_this_sell).unwrap();
                            total_ever_received = total_ever_received.checked_add(ever_from_sell).unwrap();

                            // Mark sell order as processed and advance queue
                            sell_order.processed = true;
                            sell_order.remaining_amount = 0;
                            bonding_curve.sell_queue_head = bonding_curve.sell_queue_head.checked_add(1).unwrap();
                        }
                    }
                }
            }
        }

        // If there's still USDC remaining, buy from reserves using bonding curve
        if remaining_usdc > 0 {
            let tokens_from_reserves = calculate_buy_amount(bonding_curve, remaining_usdc)?;
            require!(tokens_from_reserves > 0, ErrorCode::InvalidAmount);
            require!(ctx.accounts.program_ever_account.amount >= tokens_from_reserves, ErrorCode::InsufficientFunds);

            // Transfer remaining USDC to treasury
            let cpi_accounts_usdc = token::Transfer {
                from: ctx.accounts.user_usdc_account.to_account_info(),
                to: ctx.accounts.treasury_usdc_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_program_usdc = ctx.accounts.token_program.to_account_info();
            let cpi_ctx_usdc = CpiContext::new(cpi_program_usdc, cpi_accounts_usdc);
            token::transfer(cpi_ctx_usdc, remaining_usdc)?;

            // Transfer EVER tokens from reserves to buyer
            let seeds = &[&b"bonding_curve"[..], &[bonding_curve.bump]];
            let signer_seeds = &[&seeds[..]];
            let cpi_accounts_ever = token::Transfer {
                from: ctx.accounts.program_ever_account.to_account_info(),
                to: ctx.accounts.user_ever_account.to_account_info(),
                authority: bonding_curve.to_account_info(),
            };
            let cpi_program_ever = ctx.accounts.token_program.to_account_info();
            let cpi_ctx_ever = CpiContext::new_with_signer(cpi_program_ever, cpi_accounts_ever, signer_seeds);
            token::transfer(cpi_ctx_ever, tokens_from_reserves)?;

            // Update bonding curve state for reserve purchase
            bonding_curve.x = bonding_curve.x.checked_add(remaining_usdc).ok_or(ErrorCode::MathOverflow)?;
            bonding_curve.y = bonding_curve.y.checked_sub(tokens_from_reserves).ok_or(ErrorCode::MathOverflow)?;
            bonding_curve.k = u128::from(bonding_curve.x).checked_mul(u128::from(bonding_curve.y)).ok_or(ErrorCode::MathOverflow)?;
            bonding_curve.circulating_supply = bonding_curve.circulating_supply.checked_add(tokens_from_reserves).ok_or(ErrorCode::MathOverflow)?;
            
            total_ever_received = total_ever_received.checked_add(tokens_from_reserves).unwrap();
        }

        // Update global state
        bonding_curve.total_volume_24h = bonding_curve.total_volume_24h.checked_add(usdc_amount).ok_or(ErrorCode::MathOverflow)?;
        bonding_curve.current_price = calculate_effective_price(bonding_curve);
        bonding_curve.last_price_update = clock.unix_timestamp;
        
        emit!(AtomicBuyEvent {
            buyer: ctx.accounts.user.key(),
            usdc_amount,
            ever_received: total_ever_received,
            new_price: bonding_curve.current_price,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Sell EVER tokens to the queue system with enhanced transaction safety
    pub fn sell(ctx: Context<Sell>, ever_amount: u64) -> Result<()> {
        // Validate input parameters for transaction safety
        require!(ever_amount > 0, ErrorCode::InvalidAmount);
        require!(ever_amount <= 10_000_000_000_000_000, ErrorCode::AmountTooLarge); // Max 10M EVER per transaction

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
        require!(usdc_value <= 10_000_000_000_000, ErrorCode::AmountTooLarge); // Max 10M USDC value

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

        let queue_position = bonding_curve.sell_queue_tail + 1;
        bonding_curve.sell_queue_tail = queue_position;

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
            queue_position: queue_position - 1,
            timestamp: clock.unix_timestamp,
        });

        msg!("Sell: {} EVER tokens queued for {} USDC at price {} (position: {})", 
             ever_amount, usdc_value, current_price, queue_position - 1);

        Ok(())
    }

    /// Process buy orders from the queue with partial fill support and transaction safety
    pub fn process_buy_queue(ctx: Context<ProcessBuyQueue>) -> Result<()> {
        // CRITICAL DEBUG: Check program EVER account at the ABSOLUTE BEGINNING
        msg!("START");
        msg!("ADDR: {}", ctx.accounts.program_ever_account.key());
        msg!("BAL: {}", ctx.accounts.program_ever_account.amount);
        msg!("END");
        
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

        // Update bonding curve state
        bonding_curve.x = bonding_curve.x.checked_add(result.reserve_usdc).unwrap();
        bonding_curve.y = bonding_curve.y.checked_sub(result.reserve_ever).unwrap();
        bonding_curve.k = (bonding_curve.x as u128).checked_mul(bonding_curve.y as u128).unwrap();

        // Update cumulative bonus
        bonding_curve.cumulative_bonus = bonding_curve.cumulative_bonus
            .checked_add(result.appreciation_bonus)
            .unwrap();

        // Update sell order if it was processed
        if result.queue_usdc > 0 && bonding_curve.sell_queue_head < bonding_curve.sell_queue_tail {
            // We know a sell order was processed, so deserialize and update it
            let sell_order_info = ctx.accounts.sell_order.to_account_info();
            let mut sell_order_data = sell_order_info.try_borrow_mut_data()?;
            let sell_order = SellOrder::try_deserialize(&mut sell_order_data.as_ref())?;
            
            // Calculate how much of the sell order was consumed
            let usdc_consumed = result.queue_usdc;
            let ever_consumed = usdc_consumed
                .checked_mul(1_000_000_000)
                .unwrap_or(0)
                .checked_div(sell_order.locked_price)
                .unwrap_or(0);
            
            // Create updated sell order
            let mut updated_sell_order = sell_order;
            updated_sell_order.remaining_amount = updated_sell_order.remaining_amount
                .checked_sub(ever_consumed)
                .unwrap();
            
            // Mark as processed if fully consumed
            if updated_sell_order.remaining_amount == 0 {
                updated_sell_order.processed = true;
                bonding_curve.sell_queue_head = bonding_curve.sell_queue_head.checked_add(1).unwrap();
            }
            
            // Serialize the updated sell order back
            updated_sell_order.try_serialize(&mut sell_order_data.as_mut())?;
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


    /// Get smart contract version for debugging
    pub fn get_version(ctx: Context<GetVersion>) -> Result<u32> {
        Ok(16) // Version 16 - make sell_order optional in process_buy_queue
    }
    /// Bump buy_queue_tail by 1 to skip an occupied PDA
    pub fn bump_buy_tail(ctx: Context<BumpBuyTail>) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        bonding_curve.buy_queue_tail = bonding_curve.buy_queue_tail.checked_add(1).unwrap();
        Ok(())
    }

    /// Bump sell_queue_tail by 1 to skip an occupied sell_order PDA
    pub fn bump_sell_tail(ctx: Context<BumpSellTail>) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        bonding_curve.sell_queue_tail = bonding_curve.sell_queue_tail.checked_add(1).unwrap();
        Ok(())
    }

    /// Skip orphaned buy order accounts (emergency function)
    pub fn skip_orphaned_buy_orders(ctx: Context<SkipOrphanedBuyOrders>, count: u32) -> Result<()> {
        let bonding_curve = &mut ctx.accounts.bonding_curve;
        
        // Increment buy queue tail to skip orphaned accounts
        bonding_curve.buy_queue_tail = bonding_curve.buy_queue_tail.checked_add(count as u64).unwrap();
        
        msg!("Skipped {} orphaned buy order accounts", count);
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
        // Try to deserialize the sell order
        let sell_order_info = accounts.sell_order.to_account_info();
        if sell_order_info.data_len() > 0 {
            let sell_order_data = sell_order_info.try_borrow_data()?;
            if let Ok(sell_order) = SellOrder::try_deserialize(&mut sell_order_data.as_ref()) {
                if !sell_order.processed && sell_order.remaining_amount > 0 {
                    // Get seller USDC account
                    let seller_usdc_account = accounts.seller_usdc_account.to_account_info();
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
                                to: seller_usdc_account,
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
                                    to: seller_usdc_account,
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
        }
    }

    // If there's still USDC remaining, buy from reserves
    let mut reserve_usdc = 0u64;
    // CRITICAL DEBUG: Check program EVER account at the VERY BEGINNING
    msg!("CRITICAL DEBUG: Starting process_buy_queue");
    msg!("CRITICAL DEBUG: Program EVER account address: {}", accounts.program_ever_account.key());
    msg!("CRITICAL DEBUG: Program EVER account balance: {}", accounts.program_ever_account.amount);
    
    let mut reserve_ever = 0u64;
    
    if remaining_usdc > 0 {
        msg!("CRITICAL DEBUG: About to calculate buy amount for USDC: {}", remaining_usdc);
        msg!("CRITICAL DEBUG: Bonding curve X: {}", accounts.bonding_curve.x);
        msg!("CRITICAL DEBUG: Bonding curve Y: {}", accounts.bonding_curve.y);
        msg!("CRITICAL DEBUG: Bonding curve K: {}", accounts.bonding_curve.k);
        reserve_ever = calculate_buy_amount(&accounts.bonding_curve, remaining_usdc)?;
        msg!("CRITICAL DEBUG: Calculated reserve EVER needed: {}", reserve_ever);
        msg!("CRITICAL DEBUG: Sufficient balance: {}", accounts.program_ever_account.amount >= reserve_ever);
        
        // Check if this is the correct account
        let expected_program_ever_account = Pubkey::from_str("8t4CT8pfMjvVTGmvdtKUkVfaqrLZuEW8WaVKLPqaogpN").unwrap();
        msg!("CRITICAL DEBUG: Expected program EVER account: {}", expected_program_ever_account);
        msg!("CRITICAL DEBUG: Account matches expected: {}", accounts.program_ever_account.key() == expected_program_ever_account);
        
        // Check if the account is owned by the bonding curve PDA
        msg!("CRITICAL DEBUG: Program EVER account owner: {}", accounts.program_ever_account.owner);
        msg!("CRITICAL DEBUG: Bonding curve PDA: {}", accounts.bonding_curve.key());
        msg!("CRITICAL DEBUG: Account owned by bonding curve: {}", accounts.program_ever_account.owner == accounts.bonding_curve.key());
        
        // Check if the account is a token account
        msg!("CRITICAL DEBUG: Program EVER account is token account: {}", accounts.program_ever_account.owner == token::ID);
        msg!("CRITICAL DEBUG: Program EVER account data length: {}", accounts.program_ever_account.to_account_info().data_len());
        
        // Check if the account is empty
        msg!("CRITICAL DEBUG: Program EVER account is empty: {}", accounts.program_ever_account.amount == 0);
        msg!("CRITICAL DEBUG: Program EVER account has tokens: {}", accounts.program_ever_account.amount > 0);
        
        // Check if the account is the right mint
        msg!("CRITICAL DEBUG: Program EVER account mint: {}", accounts.program_ever_account.mint);
        let expected_ever_mint = Pubkey::from_str("85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb").unwrap();
        msg!("CRITICAL DEBUG: Expected EVER mint: {}", expected_ever_mint);
        msg!("CRITICAL DEBUG: Mint matches expected: {}", accounts.program_ever_account.mint == expected_ever_mint);
        
        // Safety check: cap the transfer at available balance
        let actual_transfer_amount = if reserve_ever > accounts.program_ever_account.amount {
            msg!("Capping transfer amount from {} to {}", reserve_ever, accounts.program_ever_account.amount);
            accounts.program_ever_account.amount
        } else {
            reserve_ever
        };

        // Transfer USDC from program to treasury
        let cpi_accounts = token::Transfer {
            from: accounts.program_usdc_account.to_account_info(),
            to: accounts.treasury_usdc_account.to_account_info(),
            authority: accounts.bonding_curve.to_account_info(),
        };
        let cpi_program = accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, remaining_usdc)?;
        
        // Debug logging before transfer
        msg!("About to transfer EVER tokens:");
        msg!("  From: {}", accounts.program_ever_account.key());
        msg!("  To: {}", accounts.buyer_ever_account.key());
        msg!("  Amount: {}", actual_transfer_amount);
        msg!("  Authority: {}", accounts.bonding_curve.key());
        msg!("  Program EVER balance before transfer: {}", accounts.program_ever_account.amount);
        msg!("  Buyer EVER balance before transfer: {}", accounts.buyer_ever_account.amount);
        msg!("About to transfer {} EVER tokens from program account", actual_transfer_amount);
        msg!("Transfer amount in EVER (with decimals): {}", actual_transfer_amount / 1_000_000_000);
        // Ensure we have a meaningful amount to transfer (at least 1 EVER token)
        if actual_transfer_amount == 0 {
            msg!("WARNING: Calculated transfer amount is 0, skipping transfer");
            msg!("  USDC amount: {}", remaining_usdc);
            msg!("  Bonding curve X: {}", accounts.bonding_curve.x);
            msg!("  Bonding curve Y: {}", accounts.bonding_curve.y);
            msg!("  Bonding curve K: {}", accounts.bonding_curve.k);
            // Don't fail, just skip the transfer
            return Ok(BuyProcessingResult {
                total_ever_received: 0,
                queue_usdc: 0,
                reserve_usdc: remaining_usdc,
                reserve_ever: 0,
                appreciation_bonus: 0,
            });
        }
        
        // Check if the program EVER account has enough balance
        if accounts.program_ever_account.amount < actual_transfer_amount {
            msg!("ERROR: Program EVER account has insufficient balance!");
            msg!("  Required: {}", actual_transfer_amount);
            msg!("  Available: {}", accounts.program_ever_account.amount);
            msg!("  Shortfall: {}", actual_transfer_amount - accounts.program_ever_account.amount);
            return Err(ErrorCode::InsufficientFunds.into());
        }
        
        // Transfer EVER tokens from program account to buyer using bonding curve PDA as authority
        let cpi_accounts = token::Transfer {
            from: accounts.program_ever_account.to_account_info(),
            to: accounts.buyer_ever_account.to_account_info(),
            authority: accounts.bonding_curve.to_account_info(),
        };
        let cpi_program = accounts.token_program.to_account_info();
        let signer_seeds: &[&[&[u8]]] = &[&[b"bonding_curve", &[accounts.bonding_curve.bump]]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, actual_transfer_amount)?;

        reserve_usdc = remaining_usdc;
        total_ever_received = total_ever_received.checked_add(actual_transfer_amount).unwrap();
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
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    // User's USDC account
    #[account(
        mut,
        constraint = user_usdc_account.owner == user.key(),
        constraint = user_usdc_account.mint == USDC_MINT
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    // User's EVER account
    #[account(
        mut,
        constraint = user_ever_account.owner == user.key(),
        constraint = user_ever_account.mint == EVER_MINT
    )]
    pub user_ever_account: Account<'info, TokenAccount>,
    
    // Treasury USDC account
    #[account(
        mut,
        constraint = treasury_usdc_account.owner == bonding_curve.treasury_wallet,
        constraint = treasury_usdc_account.mint == USDC_MINT
    )]
    pub treasury_usdc_account: Account<'info, TokenAccount>,
    
    // Program EVER account (holds EVER tokens for distribution)
    #[account(
        mut,
        constraint = program_ever_account.owner == bonding_curve.key(),
        constraint = program_ever_account.mint == EVER_MINT
    )]
    pub program_ever_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BuyWithSellProcessing<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve"],
        bump = bonding_curve.bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    // User's USDC account
    #[account(
        mut,
        constraint = user_usdc_account.owner == user.key(),
        constraint = user_usdc_account.mint == USDC_MINT
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,
    
    // User's EVER account
    #[account(
        mut,
        constraint = user_ever_account.owner == user.key(),
        constraint = user_ever_account.mint == EVER_MINT
    )]
    pub user_ever_account: Account<'info, TokenAccount>,
    
    // Treasury USDC account
    #[account(
        mut,
        constraint = treasury_usdc_account.owner == bonding_curve.treasury_wallet,
        constraint = treasury_usdc_account.mint == USDC_MINT
    )]
    pub treasury_usdc_account: Account<'info, TokenAccount>,
    
    // Program EVER account (holds EVER tokens for distribution)
    #[account(
        mut,
        constraint = program_ever_account.owner == bonding_curve.key(),
        constraint = program_ever_account.mint == EVER_MINT
    )]
    pub program_ever_account: Account<'info, TokenAccount>,
    
    // Sell order account - optional, only used when sell queue is not empty
    /// CHECK: This account is only validated/used when sell queue is not empty
    pub sell_order: UncheckedAccount<'info>,
    
    // Seller's USDC account - optional, only used when processing sell orders
    /// CHECK: This account is only validated/used when processing a sell order
    pub seller_usdc_account: UncheckedAccount<'info>,
    
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
        seeds = [b"sell_order", (bonding_curve.sell_queue_tail + 1).to_le_bytes().as_ref()],
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
    
    // Sell order account - will be validated in the instruction if needed
    /// CHECK: This account is only validated/used when sell queue is not empty
    pub sell_order: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub program_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub program_ever_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub buyer_ever_account: Account<'info, TokenAccount>,
    
    // Seller account - will be validated in the instruction if needed
    /// CHECK: This account is only validated/used when processing a sell order
    pub seller_usdc_account: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub treasury_usdc_account: Account<'info, TokenAccount>,
    
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
pub struct GetVersion {
    // No accounts needed for version check
}

#[derive(Accounts)]
pub struct BumpBuyTail<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve"],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct BumpSellTail<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve"],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct SkipOrphanedBuyOrders<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve"],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,
    
    /// Anyone can call this function to skip orphaned accounts
    pub user: Signer<'info>,
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

#[event]
pub struct AtomicBuyEvent {
    pub buyer: Pubkey,
    pub usdc_amount: u64,
    pub ever_received: u64,
    pub new_price: u64,
    pub timestamp: i64,
}

// Helper functions
/// Calculate how many EVER tokens a user will receive for a given USDC amount
fn calculate_buy_amount(bonding_curve: &BondingCurve, usdc_amount: u64) -> Result<u64> {
    let new_x = bonding_curve.x.checked_add(usdc_amount).ok_or(ErrorCode::MathOverflow)?;
    let new_y = bonding_curve.k.checked_div(new_x as u128).ok_or(ErrorCode::MathOverflow)? as u64;
    let tokens_received = bonding_curve.y.checked_sub(new_y).ok_or(ErrorCode::MathOverflow)?;
    
    msg!("calculate_buy_amount: usdc_amount={}, new_x={}, new_y={}, tokens_received={}", 
         usdc_amount, new_x, new_y, tokens_received);
    
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
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid buyer address")]
    InvalidBuyer,
    #[msg("Transaction not ready for refund")]
    RefundNotReady,
    #[msg("Price calculation failed")]
    PriceCalculationFailed,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
}