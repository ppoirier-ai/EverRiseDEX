// Treasury constants
export const TREASURY_WALLET_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET || 'DTA5uQocoAaZwXL59DoVZwWUxJCsxjfBCM6mzpws8T4';

// Default treasury values
export const DEFAULT_TREASURY_BITCOIN = 0.5;
export const DEFAULT_TREASURY_USDC = 25000;
export const DEFAULT_LAST_UPDATED = 'Never';

// UI constants
export const COPY_TIMEOUT_MS = 2000;

// LocalStorage keys
export const LOCALSTORAGE_KEYS = {
  TREASURY_BITCOIN: 'treasuryBitcoin',
  TREASURY_USDC: 'treasuryValueUSDC',
  TREASURY_LAST_UPDATED: 'treasuryLastUpdated',
} as const;
