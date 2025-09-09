'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, ExternalLink, Download } from 'lucide-react';
import { useContract } from '../../contexts/ContractContext';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'queue_processed';
  wallet: string;
  amount: number;
  price: number;
  timestamp: number;
  signature: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function TransactionHistory() {
  const router = useRouter();
  const { contractService } = useContract();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchAddress, setSearchAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  const itemsPerPage = 20;

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!contractService) return;

      setIsLoading(true);
      try {
        // Try to fetch real transaction history from blockchain
        let historyData = [];
        try {
          historyData = await contractService.getTransactionHistory();
          setIsUsingFallbackData(false);
        } catch (rpcError) {
          console.warn('RPC rate limited, using fallback data:', rpcError);
          setIsUsingFallbackData(true);
          // Fallback to mock data if RPC is rate limited
          historyData = [
            {
              id: 'mock-1',
              type: 'buy',
              wallet: 'h8riLT8mzDrjo1MUVNCwtmRcsd2SdV6DRPgyjkkCKCw',
              signature: '3aHUSpxEspakVuZ4kF1AFRGRzES9Ez7w2TZxMnEzToqVND8wiHDQWr5tRgw2qR7gs9D3sZEg93vySsGacRV4sS3N',
              timestamp: Date.now() - 3600000,
              status: 'completed'
            },
            {
              id: 'mock-2',
              type: 'sell',
              wallet: 'FEVyge83aMu6gP2uSXUFFH7ujVs2SQqfA425S7mJJGqA',
              signature: '5oZkqAtzWw7PZrZZC7uu35YgncyBTiT2GmdLtFZuCzHHMs6SAiMpMhAew9mt2Cax99QYYWK9Z9s3ShSymC2LtNMB',
              timestamp: Date.now() - 7200000,
              status: 'completed'
            }
          ];
        }
        
        // Convert to our transaction format
        const formattedTransactions: Transaction[] = historyData.map((tx, index) => ({
          id: tx.signature || tx.id,
          type: tx.type,
          wallet: tx.wallet,
          amount: tx.amount || (tx.type === 'buy' ? 50000 : 100000), // Mock amounts
          price: tx.price || 0.000104, // Default to current price if not available
          timestamp: tx.timestamp,
          signature: tx.signature || tx.id,
          status: tx.status
        }));
        
        setTransactions(formattedTransactions);
        setFilteredTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [contractService]);

  // Filter transactions by search address
  useEffect(() => {
    if (searchAddress.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(tx => 
        tx.wallet.toLowerCase().includes(searchAddress.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchAddress, transactions]);

  // Helper functions
  const truncateAddress = (address: string): string => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number, type: string): string => {
    if (type === 'buy') {
      return `$${amount.toFixed(2)} USDC`;
    } else {
      return `${amount.toLocaleString()} EVER`;
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'buy': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-red-100 text-red-800';
      case 'queue_processed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredTransactions.length} transactions
              </span>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fallback Data Notice */}
        {isUsingFallbackData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> RPC rate limit reached. Showing sample transaction data. 
                  Real transaction history will be available when RPC limits reset.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search by Wallet Address
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Enter wallet address (full or partial)..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {searchAddress && (
              <button
                onClick={() => setSearchAddress('')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {searchAddress ? `Transactions for ${truncateAddress(searchAddress)}` : 'All Transactions'}
            </h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl font-bold text-gray-900">No Transactions Found</p>
                <p className="text-gray-600 mt-2">
                  {searchAddress ? 'No transactions found for this address.' : 'No transaction history available.'}
                </p>
              </div>
            ) : (
              <div>
                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wallet
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                              {transaction.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                            {truncateAddress(transaction.wallet)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatAmount(transaction.amount, transaction.type)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${transaction.price.toFixed(6)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatTimestamp(transaction.timestamp)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <a
                              href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{' '}
                      {filteredTransactions.length} transactions
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold text-blue-600">{filteredTransactions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Buy Orders</h3>
            <p className="text-3xl font-bold text-green-600">
              {filteredTransactions.filter(tx => tx.type === 'buy').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sell Orders</h3>
            <p className="text-3xl font-bold text-red-600">
              {filteredTransactions.filter(tx => tx.type === 'sell').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Volume</h3>
            <p className="text-3xl font-bold text-purple-600">
              ${filteredTransactions.reduce((sum, tx) => sum + (tx.amount * tx.price), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
