'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet, Copy, ExternalLink, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface WalletStatusProps {
  className?: string;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ className }) => {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    }
  }, [connected, publicKey, connection]);

  const fetchBalance = async () => {
    if (!publicKey || !connection) return;
    
    setLoading(true);
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getWalletIcon = () => {
    if (wallet?.adapter.name.toLowerCase().includes('phantom')) {
      return '👻';
    } else if (wallet?.adapter.name.toLowerCase().includes('solflare')) {
      return '☀️';
    }
    return '🔗';
  };

  if (!connected) {
    return null;
  }

  return (
    <div className={`${className} bg-white rounded-xl shadow-lg border border-gray-200 p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">{getWalletIcon()}</span>
          Wallet Status
        </h3>
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh Balance"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Wallet:</span>
          <span className="text-sm font-medium text-gray-900">{wallet?.adapter.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span className="flex items-center text-sm text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            Connected
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Network:</span>
          <span className="text-sm font-medium text-gray-900">Solana Devnet</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">SOL Balance:</span>
          <span className="text-sm font-medium text-gray-900">
            {loading ? (
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            ) : balance !== null ? (
              `${balance.toFixed(4)} SOL`
            ) : (
              'N/A'
            )}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Address:</span>
            <button
              onClick={copyAddress}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{formatAddress(publicKey?.toString() || '')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-3">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-green-800">
                <p className="font-medium mb-1">Ready for Trading</p>
                <p>Your wallet is connected and ready to trade EverRise tokens on Solana Devnet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
