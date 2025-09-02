'use client';

import React, { useState, useMemo } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SaleOrder {
  id: string;
  seller: string;
  quantity: number;
  price: number;
}

interface QueueStatusProps {
  sellQueueLength: number;
  averageWaitTime: number;
  lastProcessedTime: number;
  queueVolume: number;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({
  sellQueueLength,
  averageWaitTime,
  lastProcessedTime,
  queueVolume,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('All');
  const itemsPerPage = 10;

  // Mock sales queue data - in real implementation, this would come from the smart contract
  const mockSalesQueue: SaleOrder[] = useMemo(() => {
    if (sellQueueLength === 0) return [];
    
    const orders: SaleOrder[] = [];
    for (let i = 1; i <= sellQueueLength; i++) {
      orders.push({
        id: `${Math.random().toString(36).substr(2, 9)}${i}`,
        seller: `5CPg6nKszi3ediWD6f2fqJxpUxfUaUZrB74h${Math.random().toString(36).substr(2, 10)}`,
        quantity: Math.random() * 1000 + 100,
        price: 0.000115 + (Math.random() * 0.00001)
      });
    }
    return orders;
  }, [sellQueueLength]);

  const totalPages = Math.ceil(mockSalesQueue.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = mockSalesQueue.slice(startIndex, endIndex);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatQuantity = (quantity: number) => {
    return quantity.toLocaleString(undefined, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 6 
    });
  };

  const formatPrice = (price: number) => {
    return price.toFixed(8);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRefresh = () => {
    // In real implementation, this would refresh the queue data
    console.log('Refreshing sales queue...');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm border-0 focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
            </select>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {mockSalesQueue.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-bold text-gray-900">Sales Queue is Empty</p>
            <p className="text-gray-600 mt-2">No pending sell orders at this time</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Seller</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">EVER</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Price (USDC)</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-mono text-sm">
                      {order.id}...
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-mono text-sm">
                      {formatAddress(order.seller)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                      {formatQuantity(order.quantity)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                      ${formatPrice(order.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
