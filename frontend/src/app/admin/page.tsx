'use client';

import React, { useState, useEffect } from 'react';
import { AdminPanel } from '@/components/AdminPanel';
import { ContractService } from '@/services/contractService';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export default function AdminPage() {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [treasuryBitcoin, setTreasuryBitcoin] = useState(0.5);
  const [treasuryValueUSDC, setTreasuryValueUSDC] = useState(25000);
  const [lastUpdated, setLastUpdated] = useState('Never');
  const [contractService, setContractService] = useState<ContractService | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleUpdateTreasury = (bitcoin: number, usdc: number) => {
    setTreasuryBitcoin(bitcoin);
    setTreasuryValueUSDC(usdc);
    setLastUpdated(new Date().toLocaleString());
    
    // In real implementation, this would save to your backend/database
    localStorage.setItem('treasuryBitcoin', bitcoin.toString());
    localStorage.setItem('treasuryValueUSDC', usdc.toString());
    localStorage.setItem('treasuryLastUpdated', new Date().toISOString());
  };

  // Load saved values from localStorage on component mount
  useEffect(() => {
    const savedBitcoin = localStorage.getItem('treasuryBitcoin');
    const savedUSDC = localStorage.getItem('treasuryValueUSDC');
    const savedLastUpdated = localStorage.getItem('treasuryLastUpdated');

    if (savedBitcoin) setTreasuryBitcoin(parseFloat(savedBitcoin));
    if (savedUSDC) setTreasuryValueUSDC(parseFloat(savedUSDC));
    if (savedLastUpdated) {
      setLastUpdated(new Date(savedLastUpdated).toLocaleString());
    }
  }, []);

  // Initialize contract service only when wallet is connected
  useEffect(() => {
    console.log('Admin page useEffect triggered:', { connected, publicKey: !!publicKey, wallet: !!wallet, connection: !!connection });
    
    const initContractService = async () => {
      // Only proceed if wallet is fully connected and ready
      if (!connected || !publicKey || !wallet) {
        console.log('Wallet not ready, skipping ContractService initialization');
        console.log('Debug - connected:', connected, 'publicKey:', !!publicKey, 'wallet:', !!wallet);
        setContractService(null);
        setIsInitializing(false);
        return;
      }

      console.log('Initializing ContractService...');
      console.log('Connection:', connection);
      console.log('Wallet:', wallet);
      console.log('Wallet publicKey:', wallet.publicKey);
      console.log('useWallet publicKey:', publicKey);
      setIsInitializing(true);
      try {
        // Create a wallet object with the correct publicKey
        const walletWithPublicKey = {
          ...wallet,
          publicKey: publicKey
        };
        const service = new ContractService(connection, walletWithPublicKey);
        setContractService(service);
        console.log('ContractService initialized successfully');
        console.log('Service object:', service);
      } catch (error) {
        console.error('Failed to initialize contract service:', error);
        console.error('Error details:', error);
        setContractService(null);
      } finally {
        setIsInitializing(false);
      }
    };

    // Only run if we have all required values and wallet is connected
    if (connection && wallet && connected && publicKey) {
      initContractService();
    } else {
      // Reset state if wallet is not connected
      setContractService(null);
      setIsInitializing(false);
    }
  }, [connected, publicKey, wallet, connection]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage treasury values and system settings</p>
        </div>

        {isInitializing ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing...</h2>
            <p className="text-gray-600">Setting up contract service</p>
          </div>
        ) : (
                  <AdminPanel
          treasuryBitcoin={treasuryBitcoin}
          treasuryValueUSDC={treasuryValueUSDC}
          lastUpdated={lastUpdated}
          onUpdateTreasury={handleUpdateTreasury}
        />
        )}
        
        {/* Debug info - Client only to avoid hydration issues */}
        {typeof window !== 'undefined' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p>Contract Service: {contractService ? '✅ Available' : '❌ Not Available'}</p>
            <p>Wallet Connected: {connected ? '✅ Yes' : '❌ No'}</p>
            <p>Public Key: {publicKey ? '✅ Available' : '❌ Not Available'}</p>
            <p>Wallet Object: {wallet ? '✅ Available' : '❌ No'}</p>
            <p>Connection Object: {connection ? '✅ Available' : '❌ No'}</p>
            <p>Is Initializing: {isInitializing ? '⏳ Yes' : '✅ No'}</p>
            <p>Public Key Value: {publicKey?.toString() || 'None'}</p>
            <p>Wallet Public Key: {wallet?.publicKey?.toString() || 'None'}</p>
            <div className="mt-2">
              <button
                onClick={() => {
                  console.log('Manual test - trying to create ContractService');
                  console.log('Connection:', connection);
                  console.log('Wallet:', wallet);
                  console.log('Connected:', connected);
                  console.log('PublicKey:', publicKey);
                  
                  if (connection && wallet && connected && publicKey) {
                    try {
                      const service = new ContractService(connection, wallet);
                      console.log('Manual creation successful:', service);
                      setContractService(service);
                    } catch (error) {
                      console.error('Manual creation failed:', error);
                    }
                  } else {
                    console.log('Missing required values for manual creation');
                  }
                }}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
              >
                Manual Create Contract Service
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
