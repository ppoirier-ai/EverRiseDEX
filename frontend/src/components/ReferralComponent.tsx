'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, DollarSign } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function ReferralComponent() {
  const { publicKey, connected } = useWallet();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');

  // Generate referral link when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const baseUrl = window.location.origin;
      const refCode = publicKey.toString();
      setReferralCode(`${baseUrl}?ref=${refCode}`);
    }
  }, [connected, publicKey]);

  const copyToClipboard = async () => {
    if (referralCode) {
      try {
        await navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  if (!connected) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Earn 5% Commission</h3>
        </div>
        <p className="text-purple-100 mb-4">
          Connect your wallet to start earning commissions by referring friends to buy EVER tokens!
        </p>
        <div className="bg-white/20 rounded-lg p-3">
          <p className="text-sm font-medium">How it works:</p>
          <ul className="text-sm text-purple-100 mt-2 space-y-1">
            <li>• Share your referral link with friends</li>
            <li>• Earn 5% commission on their EVER purchases</li>
            <li>• Commission only applies to reserve purchases (not peer-to-peer)</li>
            <li>• No commission on sales queue transactions</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Your Referral Link</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="w-4 h-4" />
          <span>5% Commission</span>
        </div>
      </div>
      
      <p className="text-purple-100 mb-4">
        Share this link to earn 5% commission on your friends&apos; EVER token purchases from reserves.
      </p>
      
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-purple-200 mb-1">Your Referral Link:</p>
            <p className="text-sm font-mono break-all text-white">
              {referralCode}
            </p>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex-shrink-0 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Copy referral link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-300" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-white/20 rounded-lg p-3">
        <p className="text-sm font-medium mb-2">Commission Details:</p>
        <ul className="text-sm text-purple-100 space-y-1">
          <li>• 5% commission on reserve purchases only</li>
          <li>• No commission on sales queue transactions</li>
          <li>• Commission paid directly to your wallet</li>
          <li>• Price impact calculated on 95% of purchase amount</li>
        </ul>
      </div>
    </div>
  );
}
