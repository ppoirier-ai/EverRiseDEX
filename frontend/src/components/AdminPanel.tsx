'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Settings, Save, AlertCircle, CheckCircle, Coins, DollarSign } from 'lucide-react';

interface AdminPanelProps {
  treasuryBitcoin: number;
  treasuryValueUSDC: number;
  lastUpdated: string;
  onUpdateTreasury: (bitcoin: number, usdc: number) => void;
}

const TREASURY_WALLET_ADDRESS = 'FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  treasuryBitcoin,
  treasuryValueUSDC,
  lastUpdated,
  onUpdateTreasury,
}) => {
  const { connected, publicKey } = useWallet();
  const [bitcoinAmount, setBitcoinAmount] = useState(treasuryBitcoin.toString());
  const [usdcValue, setUsdcValue] = useState(treasuryValueUSDC.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isTreasuryWallet = connected && publicKey?.toString() === TREASURY_WALLET_ADDRESS;

  useEffect(() => {
    setBitcoinAmount(treasuryBitcoin.toString());
    setUsdcValue(treasuryValueUSDC.toString());
  }, [treasuryBitcoin, treasuryValueUSDC]);

  const handleSave = async () => {
    if (!isTreasuryWallet) {
      setMessage({ type: 'error', text: 'Only the treasury wallet can update these values' });
      return;
    }

    const bitcoin = parseFloat(bitcoinAmount);
    const usdc = parseFloat(usdcValue);

    if (isNaN(bitcoin) || isNaN(usdc) || bitcoin < 0 || usdc < 0) {
      setMessage({ type: 'error', text: 'Please enter valid positive numbers' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call - in real implementation, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdateTreasury(bitcoin, usdc);
      setMessage({ type: 'success', text: 'Treasury values updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update treasury values' });
    } finally {
      setIsLoading(false);
    }
  };


  if (!connected) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h2>
        <p className="text-gray-600">Please connect your wallet to access the admin panel</p>
      </div>
    );
  }

  if (!isTreasuryWallet) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">Only the treasury wallet can access the admin panel</p>
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <p className="text-sm text-gray-600 mb-2">Connected wallet:</p>
          <p className="text-sm font-mono text-gray-900 break-all">
            {publicKey?.toString()}
          </p>
          <p className="text-sm text-gray-600 mt-2">Required wallet:</p>
          <p className="text-sm font-mono text-gray-900 break-all">
            {TREASURY_WALLET_ADDRESS}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <p className="text-gray-600 mt-1">Treasury wallet authenticated</p>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Treasury Management</h3>
          
          {/* Clear Queues Section */}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitcoin Amount (BTC)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Coins className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.0001"
                  value={bitcoinAmount}
                  onChange={(e) => setBitcoinAmount(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                USDC Value
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={usdcValue}
                  onChange={(e) => setUsdcValue(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdated}
          </div>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
