'use client';

import { usePathname } from 'next/navigation';
import { WalletContextProvider } from '@/contexts/WalletContext';
import { ContractProvider } from '@/contexts/ContractContext';
import { Navbar } from '@/components/Navbar';
import { SimpleNavbar } from '@/components/SimpleNavbar';

interface ConditionalWalletProviderProps {
  children: React.ReactNode;
}

export default function ConditionalWalletProvider({ children }: ConditionalWalletProviderProps) {
  const pathname = usePathname();
  
  // Pages that need wallet connection
  const tradingPages = ['/', '/admin'];
  const needsWallet = tradingPages.includes(pathname);
  
  if (needsWallet) {
    return (
      <WalletContextProvider>
        <ContractProvider>
          <Navbar />
          {children}
        </ContractProvider>
      </WalletContextProvider>
    );
  }
  
  // For docs and litepaper pages, only show simple navbar without wallet context
  return (
    <>
      <SimpleNavbar />
      {children}
    </>
  );
}
