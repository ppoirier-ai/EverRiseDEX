'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ContractService, BondingCurveData } from '../services/contractService';

interface ContractContextType {
  contractService: ContractService | null;
  bondingCurveData: BondingCurveData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  buyTokens: (usdcAmount: number) => Promise<string>;
  sellTokens: (everAmount: number) => Promise<string>;
}

const ContractContext = createContext<ContractContextType>({
  contractService: null,
  bondingCurveData: null,
  isLoading: false,
  error: null,
  refreshData: async () => {},
  buyTokens: async () => '',
  sellTokens: async () => '',
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract service when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      try {
        const service = new ContractService(connection, wallet);
        setContractService(service);
        setError(null);
      } catch (err) {
        console.error('Error initializing contract service:', err);
        setError('Failed to initialize contract service');
      }
    } else {
      setContractService(null);
      setBondingCurveData(null);
    }
  }, [connection, wallet.connected, wallet.publicKey]);

  // Fetch bonding curve data
  const refreshData = useCallback(async () => {
    if (!contractService) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await contractService.getBondingCurveData();
      setBondingCurveData(data);
    } catch (err) {
      console.error('Error fetching bonding curve data:', err);
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
  const buyTokens = useCallback(async (usdcAmount: number): Promise<string> => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await contractService.buyTokens(usdcAmount);
      // Refresh data after successful transaction
      await refreshData();
      return tx;
    } catch (err) {
      console.error('Error buying tokens:', err);
      setError('Failed to buy tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractService, refreshData]);

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
    isLoading,
    error,
    refreshData,
    buyTokens,
    sellTokens,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
