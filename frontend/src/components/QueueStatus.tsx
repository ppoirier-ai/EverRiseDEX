'use client';

import React, { useState, useMemo } from 'react';

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
  const itemsPerPage = 10;

  // Mock sales queue data
  const mockSalesQueue: SaleOrder[] = useMemo(() => {
    if (sellQueueLength === 0) return [];
    
    const orders: SaleOrder[] = [];
    for (let i = 1; i <= sellQueueLength; i++) {
      orders.push({
        id: `${Math.random().toString(36).substr(2, 9)}${i}`,
        seller: `5CPg...${Math.random().toString(36).substr(2, 6)}`,
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

  const displayQueueLength = isNaN(sellQueueLength) || sellQueueLength < 0 ? 0 : sellQueueLength;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Sell Queue ({displayQueueLength})</h2>
      </div>
      <div className="p-6">
        {mockSalesQueue.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-bold text-gray-900">Sell Queue is Empty</p>
            <p className="text-gray-600 mt-2">No pending sell orders at this time.</p>
          </div>
        ) : (
          <div>
            {/* Table and pagination */}
          </div>
        )}
      </div>
    </div>
  );
};
