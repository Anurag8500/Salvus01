'use client';

import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface WalletConnectProps {
  apiEndpoint?: string;
}

export default function WalletConnect({ apiEndpoint = '/api/link-wallet' }: WalletConnectProps) {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const linkWallet = async () => {
      if (isConnected && address) {
        try {
          await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress: address }),
          });
        } catch (error) {
          console.error('Failed to link wallet:', error);
        }
      }
    };

    linkWallet();
  }, [address, isConnected, apiEndpoint]);

  return (
    <div className="wallet-connect-wrapper">
      <ConnectButton 
        showBalance={false}
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
      />
    </div>
  );
}
