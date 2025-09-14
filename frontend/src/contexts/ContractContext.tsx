'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ContractService, BondingCurveData } from '../services/contractService';

interface ContractContextType {
  contractService: ContractService | null;
  bondingCurveData: BondingCurveData | null;
  userUsdcBalance: number;
  userEverBalance: number;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  buyTokens: (usdcAmount: number, referrer?: string) => Promise<string>;
  sellTokens: (everAmount: number) => Promise<string>;
  dexData: {
    currentPrice: number;
    marketCap: number;
    circulatingSupply: number;
    reserveSupply: number;
    sellQueueHead: number;
    sellQueueTail: number;
    buyQueueHead: number;
    buyQueueTail: number;
  };
}

const ContractContext = createContext<ContractContextType>({
  contractService: null,
  bondingCurveData: null,
  userUsdcBalance: 0,
  userEverBalance: 0,
  isLoading: false,
  error: null,
  refreshData: async () => {},
  buyTokens: async () => '',
  sellTokens: async () => '',
  dexData: {
    currentPrice: 0,
    marketCap: 0,
    circulatingSupply: 0,
    reserveSupply: 0,
    sellQueueHead: 0,
    sellQueueTail: 0,
    buyQueueHead: 0,
    buyQueueTail: 0,
  },
});

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

interface ContractProviderProps {
  children: React.ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [contractService, setContractService] = useState<ContractService | null>(null);
  const [bondingCurveData, setBondingCurveData] = useState<BondingCurveData | null>(null);
  const [userUsdcBalance, setUserUsdcBalance] = useState<number>(0);
  const [userEverBalance, setUserEverBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dexData, setDexData] = useState({
    currentPrice: 0,
    marketCap: 0,
    circulatingSupply: 0,
    reserveSupply: 0,
  });

  // Initialize contract service when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      try {
        const service = new ContractService(connection, wallet);
        setContractService(service);
        // Expose for console debugging
        try { 
          (window as unknown as { contractService: unknown; debugSellOrders: () => unknown }).contractService = service;
          (window as unknown as { contractService: unknown; debugSellOrders: () => unknown }).debugSellOrders = () => service.debugSellOrders();
        } catch {}
        setError(null);
      } catch (err) {
        console.error('Error initializing contract service:', err);
        setError('Failed to initialize contract service');
      }
    } else {
      setContractService(null);
      setBondingCurveData(null);
    }
  }, [connection, wallet]);

  // Fetch bonding curve data and user balances
  const refreshData = useCallback(async () => {
    if (!contractService) return;

    setIsLoading(true);
    setError(null);

    try {
      // First debug the smart contract connection
      await contractService.debugConnection();
      
      const [data, usdcBalance, everBalance] = await Promise.all([
        contractService.getBondingCurveData(),
        contractService.getUserUSDCBalance(),
        contractService.getUserEverBalance(),
      ]);
      setBondingCurveData(data);
      setUserUsdcBalance(usdcBalance);
      setUserEverBalance(everBalance);

      if (data) {
        const currentPrice = data.currentPrice / 1_000_000;
        const circulatingSupply = data.circulatingSupply / 1e9;
        const newDexData = {
          currentPrice,
          marketCap: circulatingSupply * currentPrice,
          circulatingSupply,
          reserveSupply: data.y / 1e9,
          sellQueueHead: data.sellQueueHead,
          sellQueueTail: data.sellQueueTail,
          buyQueueHead: data.buyQueueHead,
          buyQueueTail: data.buyQueueTail,
        };
        setDexData(newDexData);
        console.log('📊 Updated dexData in context:', newDexData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch contract data');
    } finally {
      setIsLoading(false);
    }
  }, [contractService]);

  // Auto-refresh data when contract service is available
  useEffect(() => {
    if (contractService) {
      refreshData();
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [contractService, refreshData]);

  // Buy tokens function
  const buyTokens = useCallback(async (usdcAmount: number, referrer?: string): Promise<string> => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contractService.buyTokens(usdcAmount, referrer);
      // Refresh data after successful transaction
      await refreshData();
      
      // Log the trade to our new backend
      if (dexData.currentPrice > 0) {
        fetch('http://localhost:3001/log_trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usdcAmount: usdcAmount,
            everAmount: usdcAmount / dexData.currentPrice,
            price: dexData.currentPrice
          })
        });
      }

      return tx;
    } catch (err) {
      console.error('Error buying tokens:', err);
      setError('Failed to buy tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractService, refreshData, dexData.currentPrice]);

  // Sell tokens function
  const sellTokens = useCallback(async (everAmount: number): Promise<string> => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contractService.sellTokens(everAmount);
      // Refresh data after successful transaction
      await refreshData();
      return tx;
    } catch (err) {
      console.error('Error selling tokens:', err);
      setError('Failed to sell tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractService, refreshData]);

  const value: ContractContextType = {
    contractService,
    bondingCurveData,
    userUsdcBalance,
    userEverBalance,
    isLoading,
    error,
    refreshData,
    buyTokens,
    sellTokens,
    dexData,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
