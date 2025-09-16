'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowUpDown, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { EnhancedWalletButton } from './EnhancedWalletButton';

interface TradingInterfaceProps {
  currentPrice: number;
  userUsdcBalance: number;
  userEverBalance: number;
  onBuy: (amount: number) => void;
  onSell: (amount: number) => void;
  isLoading: boolean;
}

export const TradingInterface: React.FC<TradingInterfaceProps> = ({
  currentPrice,
  userUsdcBalance,
  userEverBalance,
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

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      if (activeTab === 'buy') {
        onBuy(numAmount);
      } else {
        onSell(numAmount);
      }
    }
  }, [amount, activeTab, onBuy, onSell]);

  const handleMaxClick = useCallback(() => {
    if (activeTab === 'buy') {
      setAmount(userUsdcBalance.toString());
    } else {
      setAmount(userEverBalance.toString());
    }
  }, [activeTab, userUsdcBalance, userEverBalance]);


  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(price);
  }, []);

  const handleTabChange = useCallback((tab: 'buy' | 'sell') => {
    setActiveTab(tab);
    setAmount('');
  }, []);

  // Memoized computed values
  const formattedPrice = useMemo(() => formatPrice(currentPrice), [currentPrice, formatPrice]);
  const isBuyDisabled = useMemo(() => !connected || isLoading || parseFloat(amount) <= 0 || parseFloat(amount) > userUsdcBalance, [connected, isLoading, amount, userUsdcBalance]);
  const isSellDisabled = useMemo(() => !connected || isLoading || parseFloat(amount) <= 0 || parseFloat(amount) > userEverBalance, [connected, isLoading, amount, userEverBalance]);

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
        <p className="text-gray-600">Current Price: {formattedPrice}</p>
        
        {/* Total Capital Display */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Capital</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(userEverBalance * currentPrice)}
              </p>
              <p className="text-xs text-gray-500">
                {userEverBalance.toFixed(2)} EVER × {formattedPrice}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTabChange('buy')}
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
            onClick={() => handleTabChange('sell')}
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {activeTab === 'buy' ? 'Amount in USDC' : 'Amount in EVER'}
              </label>
              <div className="text-sm text-gray-500">
                Balance: {activeTab === 'buy' 
                  ? `${userUsdcBalance.toFixed(2)} USDC` 
                  : `${userEverBalance.toFixed(2)} EVER`}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500">
                {activeTab === 'buy' ? 'USDC' : 'EVER'}
              </div>
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
              >
                Max
              </button>
            </div>
          </div>


          <button
            type="submit"
            disabled={activeTab === 'buy' ? isBuyDisabled : isSellDisabled}
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
