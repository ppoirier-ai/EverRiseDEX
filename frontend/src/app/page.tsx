'use client';

import React, { useState, useEffect } from 'react';
import { PriceDisplay } from '@/components/PriceDisplay';
import { TradingInterface } from '@/components/TradingInterface';
import { PriceChart } from '@/components/PriceChart';
import { QueueStatus } from '@/components/QueueStatus';

// Mock data - in real implementation, this would come from the smart contract
const mockPriceData = [
  { timestamp: Date.now() - 3600000, price: 0.000100, volume: 1000 },
  { timestamp: Date.now() - 3000000, price: 0.000102, volume: 1500 },
  { timestamp: Date.now() - 2400000, price: 0.000105, volume: 2000 },
  { timestamp: Date.now() - 1800000, price: 0.000108, volume: 1200 },
  { timestamp: Date.now() - 1200000, price: 0.000110, volume: 1800 },
  { timestamp: Date.now() - 600000, price: 0.000112, volume: 2200 },
  { timestamp: Date.now(), price: 0.000115, volume: 2500 },
];

export default function Home() {
  const [currentPrice, setCurrentPrice] = useState(0.000115);
  const [priceChange24h, setPriceChange24h] = useState(0.02);
  const [volume24h, setVolume24h] = useState(125000);
  const [marketCap, setMarketCap] = useState(115000);
  const [circulatingSupply, setCirculatingSupply] = useState(1000000000);
  const [chartData, setChartData] = useState(mockPriceData);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [isLoading, setIsLoading] = useState(false);
  
  // Queue data
  const [sellQueueLength, setSellQueueLength] = useState(0);
  const [averageWaitTime, setAverageWaitTime] = useState(0);
  const [lastProcessedTime, setLastProcessedTime] = useState(0);
  const [queueVolume, setQueueVolume] = useState(0);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small price increases (bonding curve effect)
      setCurrentPrice(prev => prev * (1 + Math.random() * 0.0001));
      
      // Simulate queue processing
      if (sellQueueLength > 0 && Math.random() > 0.7) {
        setSellQueueLength(prev => Math.max(0, prev - 1));
        setLastProcessedTime(Date.now() / 1000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sellQueueLength]);

  const handleBuy = async (amount: number) => {
    setIsLoading(true);
    
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update price based on bonding curve
    const priceIncrease = amount * 0.000001; // Simulate bonding curve effect
    setCurrentPrice(prev => prev + priceIncrease);
    
    // Update circulating supply
    const tokensBought = amount / currentPrice;
    setCirculatingSupply(prev => prev + tokensBought);
    
    // Update market cap
    setMarketCap(prev => prev + amount);
    
    // Update volume
    setVolume24h(prev => prev + amount);
    
    setIsLoading(false);
  };

  const handleSell = async (amount: number) => {
    setIsLoading(true);
    
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add to sell queue
    const tokensToSell = amount / currentPrice;
    setSellQueueLength(prev => prev + 1);
    setQueueVolume(prev => prev + amount);
    
    // Update average wait time based on queue length
    setAverageWaitTime(sellQueueLength * 300); // 5 minutes per position
    
    setIsLoading(false);
  };

  const handleTimeRangeChange = (range: '1h' | '24h' | '7d' | '30d') => {
    setTimeRange(range);
    // In real implementation, fetch new data based on time range
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bitcoin pioneered unprintable money. EverRise improved with price you cannot haggle.
          </p>
        </div>

        {/* Price Display */}
        <div className="mb-8">
          <PriceDisplay
            currentPrice={currentPrice}
            priceChange24h={priceChange24h}
            volume24h={volume24h}
            marketCap={marketCap}
            circulatingSupply={circulatingSupply}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trading Interface */}
          <div>
            <TradingInterface
              currentPrice={currentPrice}
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
            />
          </div>
        </div>

        {/* Price Chart */}
        <div className="mb-8">
          <PriceChart
            data={chartData}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
          />
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