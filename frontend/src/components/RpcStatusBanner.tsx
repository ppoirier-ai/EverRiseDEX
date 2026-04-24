'use client';

import { useContract } from '@/contexts/ContractContext';

const hasDedicatedRpc =
  typeof process !== 'undefined' && Boolean(process.env.NEXT_PUBLIC_RPC_URL);

const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

/**
 * Explains missing or blocked RPC (common 403 from public mainnet on Vercel).
 */
export function RpcStatusBanner() {
  const { connectionError } = useContract();

  const showUnconfiguredWarning = isProduction && !hasDedicatedRpc;

  if (!connectionError && !showUnconfiguredWarning) {
    return null;
  }

  if (!connectionError && showUnconfiguredWarning) {
    return (
      <div
        className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-2 text-sm text-center"
        role="status"
      >
        <strong className="font-semibold">RPC not configured:</strong> set{' '}
        <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_RPC_URL</code> in Vercel (Helius,
        QuickNode, or similar). The public mainnet endpoint often blocks cloud traffic and returns
        403, so market data may not load.
      </div>
    );
  }

  return (
    <div
      className="bg-red-50 border-b border-red-200 text-red-950 px-4 py-2 text-sm text-center"
      role="alert"
    >
      <strong className="font-semibold">Cannot load chain data:</strong> {connectionError}
    </div>
  );
}
