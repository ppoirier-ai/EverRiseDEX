import { useState, useEffect } from 'react';
import { LOCALSTORAGE_KEYS, DEFAULT_TREASURY_BITCOIN, DEFAULT_TREASURY_USDC, DEFAULT_LAST_UPDATED } from '@/constants';

export const useTreasuryState = () => {
  const [treasuryBitcoin, setTreasuryBitcoin] = useState(DEFAULT_TREASURY_BITCOIN);
  const [treasuryValueUSDC, setTreasuryValueUSDC] = useState(DEFAULT_TREASURY_USDC);
  const [lastUpdated, setLastUpdated] = useState(DEFAULT_LAST_UPDATED);

  // Load saved values from localStorage on mount
  useEffect(() => {
    const savedBitcoin = localStorage.getItem(LOCALSTORAGE_KEYS.TREASURY_BITCOIN);
    const savedUSDC = localStorage.getItem(LOCALSTORAGE_KEYS.TREASURY_USDC);
    const savedLastUpdated = localStorage.getItem(LOCALSTORAGE_KEYS.TREASURY_LAST_UPDATED);

    if (savedBitcoin) setTreasuryBitcoin(parseFloat(savedBitcoin));
    if (savedUSDC) setTreasuryValueUSDC(parseFloat(savedUSDC));
    if (savedLastUpdated) {
      setLastUpdated(new Date(savedLastUpdated).toLocaleString());
    }
  }, []);

  const updateTreasury = (bitcoin: number, usdc: number) => {
    setTreasuryBitcoin(bitcoin);
    setTreasuryValueUSDC(usdc);
    setLastUpdated(new Date().toLocaleString());
    
    // Save to localStorage
    localStorage.setItem(LOCALSTORAGE_KEYS.TREASURY_BITCOIN, bitcoin.toString());
    localStorage.setItem(LOCALSTORAGE_KEYS.TREASURY_USDC, usdc.toString());
    localStorage.setItem(LOCALSTORAGE_KEYS.TREASURY_LAST_UPDATED, new Date().toISOString());
  };

  return {
    treasuryBitcoin,
    treasuryValueUSDC,
    lastUpdated,
    setTreasuryBitcoin,
    setTreasuryValueUSDC,
    setLastUpdated,
    updateTreasury,
  };
};
