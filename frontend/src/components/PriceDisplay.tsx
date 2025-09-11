'use client';

import React from 'react';
import { TrendingUp, DollarSign, Activity, Coins, Clock } from 'lucide-react';

interface PriceDisplayProps {
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  circulatingSupply: number;
  reserveSupply: number;
  treasuryBitcoin: number;
  treasuryValueUSDC: number;
  lastUpdated: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  currentPrice,
  priceChange24h,
  marketCap,
  circulatingSupply,
  reserveSupply,
  treasuryBitcoin,
  treasuryValueUSDC,
  lastUpdated,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(4)}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EverRise</h1>
            <p className="text-gray-500">$EVER</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            {formatPrice(currentPrice)}
          </div>
          <div className={`flex items-center space-x-1 ${
            priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">
              {formatPercentage(priceChange24h)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Market Cap</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            ${formatNumber(marketCap)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-600">Circulating Supply</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(circulatingSupply)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-600">Reserve Supply</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(reserveSupply)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Treasury</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {treasuryBitcoin.toFixed(4)} BTC
          </div>
          <div className="text-sm text-gray-600">
            ${formatNumber(treasuryValueUSDC)} USDC
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">Updated: {lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
