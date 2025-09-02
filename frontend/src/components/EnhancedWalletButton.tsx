'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface EnhancedWalletButtonProps {
  className?: string;
}

export const EnhancedWalletButton: React.FC<EnhancedWalletButtonProps> = ({ className }) => {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getWalletIcon = () => {
    if (wallet?.adapter.name.toLowerCase().includes('phantom')) {
      return '👻';
    } else if (wallet?.adapter.name.toLowerCase().includes('solflare')) {
      return '☀️';
    }
    return '🔗';
  };

  if (!mounted) {
    return (
      <div className={`${className} h-12 bg-gray-200 rounded-lg animate-pulse`}></div>
    );
  }



  if (!connected) {
    return (
      <WalletMultiButton 
        className={`${className} !bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !rounded-lg !px-6 !py-3 !text-white !font-semibold !border-0 !transition-all !duration-200`}
      />
    );
  }

  return (
    <div className={`${className} relative`}>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span className="text-lg">{getWalletIcon()}</span>
          <span>{wallet?.adapter.name || 'Wallet'}</span>
          <Wallet className="w-4 h-4" />
        </button>
        
        <button
          onClick={disconnect}
          className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          title="Disconnect"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Wallet Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wallet:</span>
                <span className="text-sm font-medium text-gray-900 flex items-center">
                  <span className="mr-1">{getWalletIcon()}</span>
                  {wallet?.adapter.name}
                </span>
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
            </div>
            
            <div className="pt-2 border-t border-gray-200">
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
            
            <div className="pt-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Ready to Trade!</p>
                    <p>Your wallet is connected and ready for EverRise trading on Solana Devnet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
