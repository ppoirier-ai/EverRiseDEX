'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, Copy, ExternalLink, CheckCircle, Menu, X } from 'lucide-react';

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <nav className={`${className} bg-white shadow-lg border-b border-gray-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">EverRise DEX</span>
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`${className} bg-white shadow-lg border-b border-gray-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">EverRise DEX</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#trading" className="text-gray-600 hover:text-gray-900 transition-colors">
              Trading
            </a>
            <a href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Docs
            </a>
            {connected && publicKey?.toString() === 'FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA' && (
              <a href="/admin" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                Admin
              </a>
            )}
          </div>

          {/* Wallet Section */}
          <div className="flex items-center space-x-4">
            {!connected ? (
              <WalletMultiButton className="!bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !rounded-lg !px-4 !py-2 !text-white !font-medium !border-0 !transition-all !duration-200" />
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDetails(!showWalletDetails)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="text-sm">{getWalletIcon()}</span>
                  <span className="text-sm">{formatAddress(publicKey?.toString() || '')}</span>
                  <Wallet className="w-4 h-4" />
                </button>

                {/* Wallet Details Dropdown */}
                {showWalletDetails && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Wallet Details</h3>
                        <button
                          onClick={() => setShowWalletDetails(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
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
                      
                      <div className="pt-3">
                        <button
                          onClick={disconnect}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Disconnect Wallet</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              <a href="#trading" className="block text-gray-600 hover:text-gray-900 transition-colors">
                Trading
              </a>
              <a href="/docs" className="block text-gray-600 hover:text-gray-900 transition-colors">
                Docs
              </a>
              {connected && publicKey?.toString() === 'FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA' && (
                <a href="/admin" className="block text-blue-600 hover:text-blue-800 transition-colors font-medium">
                  Admin
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
