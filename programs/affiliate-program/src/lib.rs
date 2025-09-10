use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("AffiliateProgram1111111111111111111111111111111");

#[program]
pub mod affiliate_program {
    use super::*;

    // Initialize the affiliate program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let affiliate_program = &mut ctx.accounts.affiliate_program;
        affiliate_program.authority = ctx.accounts.authority.key();
        affiliate_program.treasury_wallet = ctx.accounts.treasury_wallet.key();
        affiliate_program.total_referrals = 0;
        affiliate_program.total_commissions_paid = 0;
        
        msg!("Affiliate program initialized");
        Ok(())
    }

    // Register a new referral relationship
    pub fn register_referral(ctx: Context<RegisterReferral>, referrer: Pubkey) -> Result<()> {
        let referral_registry = &mut ctx.accounts.referral_registry;
        let affiliate_program = &mut ctx.accounts.affiliate_program;
        
        // Check if this wallet is already referred
        require!(
            !referral_registry.referred_wallets.contains(&ctx.accounts.referred_wallet.key()),
            ErrorCode::AlreadyReferred
        );
        
        // Add the referred wallet to the referrer's list
        referral_registry.referred_wallets.push(ctx.accounts.referred_wallet.key());
        referral_registry.total_referrals += 1;
        referral_registry.total_commission_earned = 0;
        
        // Update global stats
        affiliate_program.total_referrals += 1;
        
        msg!("New referral registered: {} -> {}", 
             referrer.to_string(), 
             ctx.accounts.referred_wallet.key().to_string());
        
        Ok(())
    }

    // Process affiliate commission for a purchase
    pub fn process_commission(
        ctx: Context<ProcessCommission>,
        purchase_amount: u64,
        commission_rate: u64, // Basis points (500 = 5%)
    ) -> Result<()> {
        let affiliate_program = &mut ctx.accounts.affiliate_program;
        let referral_registry = &mut ctx.accounts.referral_registry;
        
        // Calculate commission amount (5% of purchase)
        let commission_amount = (purchase_amount * commission_rate) / 10000;
        
        require!(commission_amount > 0, ErrorCode::InvalidCommissionAmount);
        
        // Transfer USDC commission to referrer
        let transfer_instruction = Transfer {
            from: ctx.accounts.buyer_usdc_account.to_account_info(),
            to: ctx.accounts.referrer_usdc_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        
        token::transfer(cpi_ctx, commission_amount)?;
        
        // Update referral stats
        referral_registry.total_commission_earned += commission_amount;
        affiliate_program.total_commissions_paid += commission_amount;
        
        msg!("Commission paid: {} USDC to referrer {}", 
             commission_amount, 
             ctx.accounts.referrer.key().to_string());
        
        Ok(())
    }

    // Get referral history for an affiliate
    pub fn get_referral_history(ctx: Context<GetReferralHistory>) -> Result<Vec<Pubkey>> {
        let referral_registry = &ctx.accounts.referral_registry;
        Ok(referral_registry.referred_wallets.clone())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8, // discriminator + authority + treasury + total_referrals + total_commissions
        seeds = [b"affiliate_program"],
        bump
    )]
    pub affiliate_program: Account<'info, AffiliateProgram>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: Treasury wallet for fallback commissions
    pub treasury_wallet: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterReferral<'info> {
    #[account(mut)]
    pub affiliate_program: Account<'info, AffiliateProgram>,
    
    #[account(
        init,
        payer = referred_wallet,
        space = 8 + 32 + 4 + (32 * 100) + 8, // discriminator + referrer + vec_len + wallets + total_commission
        seeds = [b"referral_registry", referrer.key().as_ref()],
        bump
    )]
    pub referral_registry: Account<'info, ReferralRegistry>,
    
    /// CHECK: The referrer wallet
    pub referrer: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub referred_wallet: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessCommission<'info> {
    #[account(mut)]
    pub affiliate_program: Account<'info, AffiliateProgram>,
    
    #[account(mut)]
    pub referral_registry: Account<'info, ReferralRegistry>,
    
    /// CHECK: The referrer wallet
    pub referrer: UncheckedAccount<'info>,
    
    /// CHECK: The buyer wallet
    pub buyer: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub buyer_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub referrer_usdc_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct GetReferralHistory<'info> {
    pub referral_registry: Account<'info, ReferralRegistry>,
}

#[account]
pub struct AffiliateProgram {
    pub authority: Pubkey,
    pub treasury_wallet: Pubkey,
    pub total_referrals: u64,
    pub total_commissions_paid: u64,
}

#[account]
pub struct ReferralRegistry {
    pub referrer: Pubkey,
    pub referred_wallets: Vec<Pubkey>,
    pub total_referrals: u64,
    pub total_commission_earned: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Wallet is already referred")]
    AlreadyReferred,
    #[msg("Invalid commission amount")]
    InvalidCommissionAmount,
    #[msg("Referral not found")]
    ReferralNotFound,
}
