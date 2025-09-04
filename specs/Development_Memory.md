# EverRiseDEX Development Memory

## Important Token and Wallet Addresses

### Test Token (Devnet)
- **EVER Token Mint**: `85XVWBtfKcycymJehFWAJcH1iDfHQRihxryZjugUkgnb`
  - This is the test token for EverRise ($EVER) on Solana devnet
  - Used for development and testing purposes
  - **IMPORTANT**: Always use this address when referencing the EVER token in development

### Treasury Wallet
- **Treasury Address**: `FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA`
  - This wallet receives USDC when buys are taken from the reserve
  - Used for bonding curve mechanics (X variable in the formula)
  - **IMPORTANT**: All reserve buy transactions should send USDC to this address
  - **NOTE**: This is the TREASURY, not the reserve. The reserve refers to unsold EVER tokens.

### Smart Contract Program ID
- **Program ID**: `9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy`
  - This is the deployed EverRise DEX smart contract program ID
  - **Network**: Solana DevNet
  - **Deployment Status**: ✅ Successfully Deployed and Initialized
  - **Last Deployment**: January 3, 2025
- **Deployment Signature**: `3HqeDbKpKM3W49HX1xUFMgKQaE9LyZvGxKmwgW5WB2MBgkCEeVS2hBthVvBsnw2xgHvP47udtPQ39ws61JsWYxU6`
  - **CRITICAL**: Always use this exact ID when interacting with the contract
  - **IMPORTANT**: If redeployed, this ID will change - update this memory file immediately
  - Used in frontend integration and all contract interactions
- **Version**: 10 (Added atomic buy function and queue reinitialization)
  - **CRITICAL**: Always increment version number on each deployment
  - **IMPORTANT**: Version is checked on page load to verify correct contract deployment
  - **PRACTICE**: Every deployment must include version increment and verification
  - **Version Check Function**: `get_version()` returns current version number
  - **NEW FEATURES**: 
    - `buy_atomic()` - USDC + EVER transfer in one transaction (no queue)
    - `reinitialize_queues()` - Clear all buy/sell queues (emergency function)

### USDC DevNet Contract
- **USDC DevNet Address**: `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr`
- **Decimals**: 6 (standard USDC)
- **Note**: This is the official USDC token on Solana DevNet

### DevNet Deployment Details
- **Bonding Curve PDA**: `9pdSYBWZfgm9S8qJJA2vVs1iRfPeosoagh1aKsm83ddU`
- **Initial Treasury USDC**: 10,000 USDC (10,000,000,000 with 6 decimals)
- **Initial Reserve EVER**: 100,000,000 EVER (100,000,000,000,000,000 with 9 decimals)
- **Initial Price**: $0.0001 per EVER
- **K Constant**: 1,000,000,000,000,000,000,000,000,000 (10^27)
- **Initialization TX**: `5t1VEyuKcVH4TcD4awcHVer9U9EMT6QShVLePph9HjKaWqDWszKNjG2pPDBUNKZrxkkaR5yFYvphzwvhs9CtiW33`
- **Status**: ✅ Live and operational on DevNet
- **Bonding Curve**: ✅ Successfully initialized with transaction `mHePcpjnWfv4zsmwT24nhsn7Cfw6tJLqmPxUW7AdtNMBgQFYUUqt2tdGaN7mM5rxeVbahRHjA2KBf5QFvjw9rgj`
- **Treasury USDC Account**: `9ib4KLusxgGmqQ5qvwPSwD7y4BJRiyyNyeZSQt8S6e61` (✅ Created)
- **Treasury EVER Account**: `81xDWLArux2ni1HWXxzzrxFGrb5UyPJhByXahwPm2D6K` (✅ Created)

### Program Token Accounts (Owned by Bonding Curve PDA)
- **Program USDC Account**: `CcpCLzvrwcY9Ufupvp69BDKuYZieE2ExQLoHdPKa3Aus` (✅ Created)
- **Program EVER Account**: `8t4CT8pfMjvVTGmvdtKUkVfaqrLZuEW8WaVKLPqaogpN` (100M EVER tokens available for distribution) (✅ Created)
- **Note**: These accounts are owned by the bonding curve PDA and used for program-controlled token transfers

## Development Guidelines

### Specification Consistency
- **CRITICAL**: Always check both specification files before starting any task:
  - `EverRise - Formula.md` (Primary source of truth)
  - `EverRiseDEX - Technical Specs.md` (Secondary reference)
- Look for conflicts between the two documents
- Ensure mathematical formulas are consistent
- Verify variable definitions match across both files
- **Action Required**: Check specs files at least once per development session

### Stablecoin Standard
- **USDC is the chosen stablecoin** (not USDT)
- All references should use USDC
- Initial treasury value: 10,000 USDC (corrected from 100,000)
- All price calculations in USDC

### Key Formula Constants
- **Daily Minimum Growth**: 0.02% (0.0002)
- **Queue Bonus Factor**: 0.1% (0.001)
- **Initial X (USDC Treasury)**: 10,000 USDC (corrected from 100,000)
- **Initial Y (EVER Reserve)**: 100,000,000 EVER tokens (corrected from 1,000,000,000)
- **Initial K (Constant Product)**: 10,000 × 100,000,000 = 10^27
- **Initial Price**: $0.0001 per EVER

## Frontend Development Notes

### Current Status
- ✅ Frontend completed with Next.js 14 + TypeScript
- ✅ Solana wallet integration (Phantom, Solflare)
- ✅ Trading interface with buy/sell functionality
- ✅ Real-time price display and charts
- ✅ Queue status monitoring
- ✅ Responsive design with Tailwind CSS

### Mock Data Implementation
- Currently using simulated data for demonstration
- Price updates every 5 seconds with small increases
- Queue processing simulation
- **TODO**: Replace with actual smart contract integration

## Smart Contract Development

### Architecture Decisions
- Solana program with Program Derived Addresses (PDAs)
- Bonding curve mechanics (K = X × Y)
- Queue-based peer-to-peer matching
- Daily boost mechanism for minimum growth
- Treasury system for buybacks

### 🚨 CRITICAL ISSUES IDENTIFIED
- **Missing Buy Queue System**: No FIFO ordering for buy transactions
- **Race Conditions**: Concurrent transactions can interfere with each other
- **Price Inconsistency**: Price reconstructed from scratch each time
- **Transaction Safety**: Risk of USDC loss on failed transactions
- **Missing Queue Processing**: `process_sell_queue` function not implemented
- **Volume-Weighted Formula**: Appreciation bonus formula not properly implemented

### Security Considerations
- Use fixed-point arithmetic (no floats)
- Implement overflow protection
- Atomic transaction processing
- Input validation for all user inputs
- Access control for admin functions
- **CRITICAL**: Implement buy queue system to prevent race conditions
- **CRITICAL**: Add transaction safety measures to prevent USDC loss

## Common Mistakes to Avoid

1. **Token Address Confusion**: Always use the correct EVER token mint address
2. **Stablecoin References**: Use USDC, not USDT
3. **Specification Conflicts**: Check both spec files for consistency
4. **Mathematical Precision**: Use fixed-point arithmetic, avoid floats
5. **Wallet Address Mix-ups**: Use correct USDC treasury wallet address
6. **Reserve vs Treasury Confusion**: Reserve = unsold EVER tokens (Y), Treasury = USDC wallet (X)
7. **🚨 CRITICAL: Race Conditions**: Never process buys without queuing - use buy queue system
8. **🚨 CRITICAL: Price Determination**: Price determined at processing time, NOT queue entry time
9. **🚨 CRITICAL: Transaction Safety**: Never allow USDC loss on failed transactions
10. **🚨 CRITICAL: Volume-Weighted Formula**: Use (0.001 × V) / (current_price × SC), not flat 0.1%
11. **🚨 CRITICAL: Partial Fills**: Sell orders can be partially filled - use remaining_amount tracking
12. **🚨 CRITICAL: Appreciation Bonus**: Only apply to queue transactions, NOT reserve buys
13. **🚨 CRITICAL: Buy Order Structure**: NO locked_price field - only USDC amount

## Testing Environment

### Devnet Configuration
- **Network**: Solana Devnet
- **RPC Endpoint**: https://api.devnet.solana.com
- **Wallet**: Use devnet-compatible wallets (Phantom, Solflare)
- **Test Tokens**: Use devnet USDC and EVER test tokens

## Deployment Notes

### Current Deployment Status
- **Phase 1**: ✅ COMPLETED - Smart contract deployed and initialized on DevNet
- **Network**: Solana DevNet
- **Program ID**: `9tXMAMrSrdkQ6ojkU87TRn3w13joZioz6iuab44ywwpy`
- **Bonding Curve**: ✅ Initialized with corrected values
- **Ready for**: Buy/sell transactions and queue processing
- **Next Phase**: Frontend integration with live contract

### Smart Contract Deployment Rules
- NEVER deploy using admin panel's "Deploy" button
- ALWAYS use `anchor deploy --provider.cluster devnet` command
- Ensure Program ID matches `declare_id!` in contract
- Deployer wallet should be the authority
- Double-check Program ID before deployment
- **CRITICAL**: If Program ID changes after deployment, update memory file immediately

## Commit Message Format

Always prefix commit messages:
- `Feat(component): add new component`
- `Fix(api): fix api error`
- `Docs(readme): update readme`
- `Refactor(utils): refactor utils`
- `Style(tailwind): add new tailwind class`
- `Test(unit): add unit test`
- `Chore(deps): update dependencies`

## Regular Maintenance Tasks

### Weekly Checklist
- [ ] Review specification files for consistency
- [ ] Check for any new conflicts between docs
- [ ] Verify token addresses are still valid
- [ ] Verify smart contract Program ID is current
- [ ] Update any outdated information
- [ ] Review commit message format compliance

### Before Each Development Session
- [ ] Read this memory file
- [ ] Check specification files for updates
- [ ] Verify current token addresses
- [ ] Verify smart contract Program ID is current
- [ ] Review any new requirements or changes

---

**Last Updated**: [Current Date]
**Next Review**: [Set reminder for weekly review]
