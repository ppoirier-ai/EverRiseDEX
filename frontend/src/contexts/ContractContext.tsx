'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  ContractService,
  BondingCurveData,
  fetchBondingCurveDataForConnection,
  isRpcAccessForbiddenError,
} from '../services/contractService';

interface ContractContextType {
  contractService: ContractService | null;
  bondingCurveData: BondingCurveData | null;
  userUsdcBalance: number;
  userEverBalance: number;
  isLoading: boolean;
  error: string | null;
  /** RPC or network issue loading on-chain data (e.g. 403 from public mainnet) */
  connectionError: string | null;
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
  connectionError: null,
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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [dexData, setDexData] = useState({
    currentPrice: 0,
    marketCap: 0,
    circulatingSupply: 0,
    reserveSupply: 0,
    sellQueueHead: 0,
    sellQueueTail: 0,
    buyQueueHead: 0,
    buyQueueTail: 0,
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

  const applyBondingDataToState = useCallback((data: BondingCurveData | null) => {
    setBondingCurveData(data);
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
  }, []);

  // Fetch bonding curve (always) and wallet balances when a wallet is connected
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data: BondingCurveData | null = null;

      if (contractService) {
        try {
          await contractService.debugConnection();
        } catch {
          // debug is non-fatal
        }
        data = await contractService.getBondingCurveData();
        const [usdcBalance, everBalance] = await Promise.all([
          contractService.getUserUSDCBalance(),
          contractService.getUserEverBalance(),
        ]);
        setUserUsdcBalance(usdcBalance);
        setUserEverBalance(everBalance);
      } else {
        data = await fetchBondingCurveDataForConnection(connection);
        setUserUsdcBalance(0);
        setUserEverBalance(0);
      }

      if (data) {
        setConnectionError(null);
        applyBondingDataToState(data);
      } else {
        setConnectionError(
          'Could not load on-chain data. If you are on a public Solana endpoint, it may be blocked. Set NEXT_PUBLIC_RPC_URL in Vercel to a private RPC (Helius, Triton, QuickNode, etc.) and redeploy.'
        );
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (isRpcAccessForbiddenError(err)) {
        setConnectionError(
          'RPC blocked this request (403). Public https://api.mainnet-beta.solana.com often returns 403 from cloud hosts. Add NEXT_PUBLIC_RPC_URL with a Helius / QuickNode / Triton (or other) mainnet key in the Vercel project Environment Variables, then redeploy.'
        );
      } else {
        setError('Failed to fetch contract data');
        setConnectionError('Network error while loading market data. Check the RPC configuration.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [connection, contractService, applyBondingDataToState]);

  // Refresh when connection or service changes; also poll while the page is open
  useEffect(() => {
    void refreshData();
    const interval = setInterval(() => {
      void refreshData();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

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
    connectionError,
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
