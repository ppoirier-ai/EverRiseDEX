/** User-facing name of the SPL token traded on-chain (mint env keys may still use EVER). */
export const TOKEN_DISPLAY_NAME = 'SnapCinema';

/** Ticker symbol without `$` — form labels, table headers. */
export const TOKEN_TICKER = 'SNAP';

/** Ticker as shown beside the token name — e.g. explorer / price header. */
export const TOKEN_TICKER_PREFIXED = '$SNAP';

/** Protocol / venue name (navbar). */
export const DEX_DISPLAY_NAME = 'EverRise DEX';

/** Former public names for the same mint (before rebrand). */
export const LEGACY_TOKEN_DISPLAY_NAME = 'EverRise';
export const LEGACY_TOKEN_TICKER_PREFIXED = '$EVER';

/** Same mint; shown for transparency in the UI. */
export const REBRAND_NOTE = `${TOKEN_DISPLAY_NAME} (${TOKEN_TICKER_PREFIXED}) is the rebrand of ${LEGACY_TOKEN_DISPLAY_NAME} (${LEGACY_TOKEN_TICKER_PREFIXED}).`;
