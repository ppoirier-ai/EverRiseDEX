'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ContractService } from '../services/contractService';

interface SaleOrder {
  orderNumber: number;
  seller: string;
  quantity: number;
  price: number;
  timestamp: number;
  processed: boolean;
}

interface QueueStatusProps {
  sellQueueLength: number;
  contractService: ContractService | null;
  refreshTrigger?: number; // Optional trigger to force refresh
}

export const QueueStatus: React.FC<QueueStatusProps> = ({
  sellQueueLength,
  contractService,
  refreshTrigger,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sellOrders, setSellOrders] = useState<SaleOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Function to fetch sell order data
  const fetchSellOrders = useCallback(async () => {
    if (!contractService || sellQueueLength === 0) {
      setSellOrders([]);
      return;
    }

    setIsLoading(true);
    try {
      const orders = await contractService.getAllSellOrders();
      const formattedOrders: SaleOrder[] = orders.map((order: unknown, index) => {
        const orderData = order as {
          seller: { toString: () => string };
          remaining_amount?: { toString: () => string };
          remainingAmount?: { toString: () => string };
          locked_price?: { toString: () => string };
          lockedPrice?: { toString: () => string };
          timestamp?: { toString: () => string };
          processed?: boolean;
        };
        
        return {
          orderNumber: index + 1,
          seller: orderData.seller.toString(),
          quantity: parseInt(orderData.remaining_amount?.toString() || orderData.remainingAmount?.toString() || '0') / 1_000_000_000, // Convert from 9 decimals - use remaining amount, not original
          price: parseInt(orderData.locked_price?.toString() || orderData.lockedPrice?.toString() || '0') / 1_000_000, // Convert from 6 decimals
          timestamp: parseInt(orderData.timestamp?.toString() || '0'),
          processed: orderData.processed || false,
        };
      });
      setSellOrders(formattedOrders);
      console.log('🔄 QueueStatus: Refreshed sell orders data');
    } catch (error) {
      console.error('Error fetching sell orders:', error);
      setSellOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [contractService, sellQueueLength]);

  // Fetch real sell order data
  useEffect(() => {
    fetchSellOrders();
  }, [fetchSellOrders, refreshTrigger]);

  // Helper function to truncate wallet address
  const truncateAddress = (address: string): string => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(6)}`;
  };

  // Helper function to format quantity
  const formatQuantity = (quantity: number): string => {
    return quantity.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const totalPages = Math.ceil(sellOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = sellOrders.slice(startIndex, endIndex);

  const displayQueueLength = isNaN(sellQueueLength) || sellQueueLength < 0 ? 0 : sellQueueLength;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Sell Queue ({displayQueueLength})</h2>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading sell orders...</p>
          </div>
        ) : sellOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-bold text-gray-900">Sell Queue is Empty</p>
            <p className="text-gray-600 mt-2">No pending sell orders at this time.</p>
          </div>
        ) : (
          <div>
            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity (EVER)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price (USDC)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.orderNumber} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {truncateAddress(order.seller)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatQuantity(order.quantity)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatPrice(order.price)}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, sellOrders.length)} of{' '}
                  {sellOrders.length} orders
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                    ))}
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
  );
};
