'use client';

import React from 'react';
import { Clock, Users, TrendingUp, AlertCircle } from 'lucide-react';

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
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m`;
    } else {
      return `${Math.round(seconds / 3600)}h`;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  const getQueueStatus = () => {
    if (sellQueueLength === 0) {
      return {
        status: 'Empty',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: TrendingUp,
        description: 'No pending sell orders'
      };
    } else if (sellQueueLength < 10) {
      return {
        status: 'Low',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: Clock,
        description: 'Minimal queue backlog'
      };
    } else {
      return {
        status: 'High',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: AlertCircle,
        description: 'Significant queue backlog'
      };
    }
  };

  const queueInfo = getQueueStatus();
  const IconComponent = queueInfo.icon;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sales Queue Status</h2>
        <p className="text-gray-600">Real-time queue monitoring and processing</p>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${queueInfo.bgColor} mb-4`}>
            <IconComponent className={`w-5 h-5 mr-2 ${queueInfo.color}`} />
            <span className={`font-semibold ${queueInfo.color}`}>
              Queue Status: {queueInfo.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{queueInfo.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Queue Length</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {sellQueueLength.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">pending orders</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Avg Wait Time</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(averageWaitTime)}
            </div>
            <div className="text-xs text-gray-500">estimated</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Queue Volume</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatVolume(queueVolume)}
            </div>
            <div className="text-xs text-gray-500">total value</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Last Processed</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {lastProcessedTime > 0 ? formatTime(Date.now() / 1000 - lastProcessedTime) : 'Never'}
            </div>
            <div className="text-xs text-gray-500">ago</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How the Queue Works:</p>
              <ul className="space-y-1 text-xs">
                <li>• Sell orders are queued and matched with incoming buy orders</li>
                <li>• Queue processing happens automatically on each buy transaction</li>
                <li>• Treasury buybacks help clear queue backlogs when needed</li>
                <li>• Queue position determines processing order (FIFO)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
