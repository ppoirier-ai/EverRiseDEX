# EverRise DEX - Bloat Analysis & Cleanup Plan

## Overview
This document identifies potential bloat in the EverRise DEX codebase that can be safely removed to improve performance, reduce bundle size, and simplify maintenance.

## 1. UNUSED DEPENDENCIES

### High Priority (Safe to Remove)
- **`recharts`** (^3.1.2) - **NOT USED ANYWHERE**
  - No imports found in codebase
  - Estimated bundle size: ~200KB
  - **Action**: Remove from package.json

- **`@coral-xyz/borsh`** (^0.31.1) - **NOT USED ANYWHERE**
  - No imports found in codebase
  - Anchor already includes borsh functionality
  - **Action**: Remove from package.json

### Medium Priority (Investigate)
- **`autoprefixer`** (^10.4.21) - **POTENTIALLY UNUSED**
  - May be used by PostCSS/Tailwind
  - **Action**: Verify if actually needed

## 2. UNUSED COMPONENTS & FILES

### High Priority (Safe to Remove)
- **`PriceChart` component** - **COMMENTED OUT**
  - Import is commented out in `page.tsx`
  - No actual component file found
  - **Action**: Remove commented import

### Medium Priority (Investigate)
- **`EnhancedWalletButton` component** - **POTENTIALLY UNUSED**
  - File exists but not imported anywhere
  - May be legacy component
  - **Action**: Verify if needed or remove

## 3. UNUSED CODE & IMPORTS

### High Priority (Safe to Remove)
- **Commented imports in `WalletContext.tsx`**:
  ```typescript
  // import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
  // import { clusterApiUrl } from '@solana/web3.js';
  ```

- **Commented imports in `page.tsx`**:
  ```typescript
  // import { PriceChart } from '@/components/PriceChart';
  ```

- **Commented mock data in `page.tsx`** (lines 12-20):
  ```typescript
  // const mockPriceData = [...]
  ```

- **Commented variables in `page.tsx`** (lines 50-53):
  ```typescript
  // const buyQueueLength = dexData ? dexData.buyQueueTail - dexData.buyQueueHead : 0;
  // const [averageWaitTime, setAverageWaitTime] = useState(0);
  // const [lastProcessedTime, setLastProcessedTime] = useState(0);
  // const [queueVolume, setQueueVolume] = useState(0);
  ```

### Medium Priority (Investigate)
- **Unused state variables in `page.tsx`**:
  ```typescript
  // const [isLoading, setIsLoading] = useState(false); // Line 34 - may be used
  ```

## 4. MULTIPLE LANGUAGE SUPPORT BLOAT

### High Priority (Consider Removing)
- **17 language directories** in `litepaper/` folder
  - Each contains identical page.tsx files
  - Only English version is likely used
  - **Potential savings**: ~17 files × ~3KB = ~51KB
  - **Action**: Keep only English, remove others

### Languages to potentially remove:
- ar, bn, de, es, fr, ha, hi, id, ja, mr, ms, na, pt, ru, te, tr, ur, vi, zh

## 5. UNUSED CONTEXT PROVIDERS

### Medium Priority (Investigate)
- **`WalletContextProvider`** - **POTENTIALLY REDUNDANT**
  - May be duplicating functionality with `@solana/wallet-adapter-react`
  - **Action**: Verify if both are needed

## 6. DEBUG CODE & CONSOLE LOGS

### Medium Priority (Clean Up)
- **Debug console.log statements** throughout codebase
- **Window object assignments** for debugging (lines 90-93 in ContractContext.tsx)
- **Action**: Remove or wrap in development-only conditions

## 7. UNUSED TYPES & INTERFACES

### Low Priority (Investigate)
- **Unused type definitions** in `types/everrise_dex.ts`
- **Action**: Check if all types are actually used

## 8. POTENTIAL BUNDLE SIZE OPTIMIZATIONS

### High Priority
- **Lucide React Icons** - **PARTIALLY USED**
  - Only using 6-8 icons but importing entire library
  - **Action**: Use tree-shaking or import specific icons only

### Medium Priority
- **Wallet Adapter Wallets** - **POTENTIALLY OVER-IMPORTED**
  - May be importing unused wallet adapters
  - **Action**: Import only needed wallet adapters

## ESTIMATED SAVINGS

### Bundle Size Reduction
- **recharts**: ~200KB
- **@coral-xyz/borsh**: ~50KB
- **Unused language files**: ~51KB
- **Lucide optimization**: ~100-150KB
- **Total estimated savings**: ~400-450KB

### File Count Reduction
- **Language files**: -17 files
- **Unused components**: -1-2 files
- **Total file reduction**: ~18-19 files

## CLEANUP PRIORITY ORDER

1. **Phase 1** (Safe, High Impact):
   - Remove unused dependencies (recharts, borsh)
   - Remove commented code and imports
   - Remove unused language directories

2. **Phase 2** (Medium Impact, Test Required):
   - Remove unused components
   - Optimize icon imports
   - Clean up debug code

3. **Phase 3** (Low Impact, Investigation Required):
   - Optimize wallet adapter imports
   - Remove unused types
   - Consolidate context providers

## TESTING STRATEGY

After each phase:
1. Run `npm run build` to ensure no build errors
2. Test core functionality (buy/sell)
3. Deploy to staging environment
4. Verify UI/UX remains intact
5. Check bundle size reduction

## NOTES

- All changes should be made incrementally
- Test thoroughly after each phase
- Keep backups of working versions
- Document any breaking changes
