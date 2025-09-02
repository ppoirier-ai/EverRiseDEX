'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowUpDown, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { EnhancedWalletButton } from './EnhancedWalletButton';

interface TradingInterfaceProps {
  currentPrice: number;
  onBuy: (amount: number) => void;
  onSell: (amount: number) => void;
  isLoading: boolean;
}

export const TradingInterface: React.FC<TradingInterfaceProps> = ({
  currentPrice,
  onBuy,
  onSell,
  isLoading,
}) => {
  const { connected } = useWallet();
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      if (activeTab === 'buy') {
        onBuy(numAmount);
      } else {
        onSell(numAmount);
      }
    }
  };

  const calculateTokens = (usdcAmount: number) => {
    if (usdcAmount <= 0) return 0;
    return usdcAmount / currentPrice;
  };

  const calculateUSDC = (tokenAmount: number) => {
    if (tokenAmount <= 0) return 0;
    return tokenAmount * currentPrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(price);
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowUpDown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Connect your Solana wallet to start trading EverRise tokens
          </p>
        </div>
        <EnhancedWalletButton className="w-full" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowUpDown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Connect your Solana wallet to start trading EverRise tokens
          </p>
        </div>
        <EnhancedWalletButton className="w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trade EverRise</h2>
        <p className="text-gray-600">Current Price: {formatPrice(currentPrice)}</p>
      </div>

      <div className="p-6">
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'buy'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowUp className="w-4 h-4 inline mr-2" />
            Buy
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'sell'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowDown className="w-4 h-4 inline mr-2" />
            Sell
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount in USDC
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                USDC
              </div>
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  You will {activeTab === 'buy' ? 'receive' : 'spend'}:
                </span>
                <span className="font-semibold text-gray-900">
                  {activeTab === 'buy' 
                    ? `${calculateTokens(parseFloat(amount)).toLocaleString()} EVER`
                    : `${calculateUSDC(parseFloat(amount)).toFixed(6)} USDC`
                  }
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              activeTab === 'buy'
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `${activeTab === 'buy' ? 'Buy' : 'Sell'} EverRise`
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How EverRise Works:</p>
              <ul className="space-y-1 text-xs">
                <li>• Price only goes up with bonding curve mechanics</li>
                <li>• Daily minimum 0.02% growth guarantee</li>
                <li>• Queue-based peer-to-peer trading</li>
                <li>• No traditional liquidity pools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
