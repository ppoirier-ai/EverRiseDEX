'use client';

import React, { useState, useEffect } from 'react';
import { PriceDisplay } from '@/components/PriceDisplay';
import { TradingInterface } from '@/components/TradingInterface';
import { QueueStatus } from '@/components/QueueStatus';
// import { PriceChart } from '@/components/PriceChart';
import ReferralComponent from '@/components/ReferralComponent';
import { useContract } from '@/contexts/ContractContext';

// Mock data - in real implementation, this would come from the smart contract
// const mockPriceData = [
//   { timestamp: Date.now() - 3600000, price: 0.000100, volume: 1000 },
//   { timestamp: Date.now() - 3000000, price: 0.000102, volume: 1500 },
//   { timestamp: Date.now() - 2400000, price: 0.000105, volume: 2000 },
//   { timestamp: Date.now() - 1800000, price: 0.000108, volume: 1200 },
//   { timestamp: Date.now() - 1200000, price: 0.000110, volume: 1800 },
//   { timestamp: Date.now() - 600000, price: 0.000112, volume: 2200 },
//   { timestamp: Date.now(), price: 0.000115, volume: 2500 },
// ];

export default function Home() {
  const { 
    contractService,
    userUsdcBalance, 
    userEverBalance, 
    // isLoading: contractLoading, 
    error, 
    buyTokens, 
    sellTokens,
    dexData 
  } = useContract();
  
  const [isLoading, setIsLoading] = useState(false);
  const [queueRefreshTrigger, setQueueRefreshTrigger] = useState(Date.now());
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Check for referral code in URL on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      console.log('Referral code detected:', ref);
    }
  }, []);
  
  // Queue data from contract
  const sellQueueLength = dexData ? dexData.sellQueueTail - dexData.sellQueueHead : 0;
  // const buyQueueLength = dexData ? dexData.buyQueueTail - dexData.buyQueueHead : 0;
  // const [averageWaitTime, setAverageWaitTime] = useState(0);
  // const [lastProcessedTime, setLastProcessedTime] = useState(0);
  // const [queueVolume, setQueueVolume] = useState(0);
  
  // Treasury data from contract
  const treasuryValueUSDC = dexData ? dexData.x / 1_000_000 : 0;
  const [treasuryBitcoin, setTreasuryBitcoin] = useState(0.5);
  const [treasuryLastUpdated, setTreasuryLastUpdated] = useState('Never');

  // Load treasury data from localStorage (only for Bitcoin, USDC comes from contract)
  useEffect(() => {
    const savedBitcoin = localStorage.getItem('treasuryBitcoin');
    const savedLastUpdated = localStorage.getItem('treasuryLastUpdated');

    if (savedBitcoin) setTreasuryBitcoin(parseFloat(savedBitcoin));
    if (savedLastUpdated) {
      setTreasuryLastUpdated(new Date(savedLastUpdated).toLocaleString());
    }
  }, []);

  // Price updates are now handled by the contract context
  // No need for simulation since we're using real contract data

  const handleBuy = async (amount: number) => {
    setIsLoading(true);
    
    try {
      const tx = await buyTokens(amount, referralCode || undefined);
      console.log('Buy transaction successful:', tx);
      // Contract data will be automatically refreshed by the context
      // Also trigger queue refresh to update sell order details
      setQueueRefreshTrigger(Date.now());
    } catch (error) {
      console.error('Buy transaction failed:', error);
      // Error is handled by the contract context
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async (amount: number) => {
    setIsLoading(true);
    
    try {
      const tx = await sellTokens(amount);
      console.log('Sell transaction successful:', tx);
      // Contract data will be automatically refreshed by the context
    } catch (error) {
      console.error('Sell transaction failed:', error);
      // Error is handled by the contract context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Contract Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bitcoin pioneered money that cannot be printed. EverRise improved with prices that cannot be haggled.
          </p>
        </div>

        {/* Referral Welcome Message */}
        {referralCode && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Welcome! You were referred by a friend</h3>
                <p className="text-sm text-green-700 mt-1">
                  You&apos;re here through a referral link. When you buy EVER tokens from reserves, 
                  your referrer will earn a 5% commission!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Price Display */}
        <div className="mb-8">
          <PriceDisplay
            currentPrice={dexData.currentPrice}
            priceChange24h={0.02}
            marketCap={dexData.marketCap}
            circulatingSupply={dexData.circulatingSupply}
            reserveSupply={dexData.reserveSupply}
            treasuryBitcoin={treasuryBitcoin}
            treasuryValueUSDC={treasuryValueUSDC}
            lastUpdated={treasuryLastUpdated}
          />
        </div>

        {/* Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trading Interface */}
          <div>
            <TradingInterface
              currentPrice={dexData.currentPrice}
              userUsdcBalance={userUsdcBalance}
              userEverBalance={userEverBalance}
              onBuy={handleBuy}
              onSell={handleSell}
              isLoading={isLoading}
            />
          </div>

          {/* Queue Status */}
          <div>
            <QueueStatus
              sellQueueLength={sellQueueLength}
              averageWaitTime={averageWaitTime}
              lastProcessedTime={lastProcessedTime}
              queueVolume={queueVolume}
              contractService={contractService}
              refreshTrigger={queueRefreshTrigger}
            />
          </div>
        </div>

        {/* Referral Component */}
        <div className="mb-8">
          <ReferralComponent />
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why EverRise is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Perpetual Growth</h3>
              <p className="text-gray-600">
                Bonding curve mechanics ensure price only goes up. No dips, no crashes, just continuous upward momentum.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Guarantee</h3>
              <p className="text-gray-600">
                Minimum 0.02% daily growth guarantee ensures consistent appreciation even during low activity periods.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Peer-to-Peer</h3>
              <p className="text-gray-600">
                Smart queue system matches buyers and sellers directly, with treasury buybacks as backup liquidity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}