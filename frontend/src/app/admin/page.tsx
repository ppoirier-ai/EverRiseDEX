'use client';

import React, { useState, useEffect } from 'react';
import { AdminPanel } from '@/components/AdminPanel';

export default function AdminPage() {
  const [treasuryBitcoin, setTreasuryBitcoin] = useState(0.5);
  const [treasuryValueUSDC, setTreasuryValueUSDC] = useState(25000);
  const [lastUpdated, setLastUpdated] = useState('Never');

  const handleUpdateTreasury = (bitcoin: number, usdc: number) => {
    setTreasuryBitcoin(bitcoin);
    setTreasuryValueUSDC(usdc);
    setLastUpdated(new Date().toLocaleString());
    
    // In real implementation, this would save to your backend/database
    localStorage.setItem('treasuryBitcoin', bitcoin.toString());
    localStorage.setItem('treasuryValueUSDC', usdc.toString());
    localStorage.setItem('treasuryLastUpdated', new Date().toISOString());
  };

  useEffect(() => {
    // Load saved values from localStorage
    const savedBitcoin = localStorage.getItem('treasuryBitcoin');
    const savedUSDC = localStorage.getItem('treasuryValueUSDC');
    const savedLastUpdated = localStorage.getItem('treasuryLastUpdated');

    if (savedBitcoin) setTreasuryBitcoin(parseFloat(savedBitcoin));
    if (savedUSDC) setTreasuryValueUSDC(parseFloat(savedUSDC));
    if (savedLastUpdated) {
      setLastUpdated(new Date(savedLastUpdated).toLocaleString());
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage treasury values and system settings</p>
        </div>

        <AdminPanel
          treasuryBitcoin={treasuryBitcoin}
          treasuryValueUSDC={treasuryValueUSDC}
          lastUpdated={lastUpdated}
          onUpdateTreasury={handleUpdateTreasury}
        />
      </div>
    </div>
  );
}
