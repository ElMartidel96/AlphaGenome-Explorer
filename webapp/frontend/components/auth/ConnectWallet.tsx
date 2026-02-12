'use client'

import React from 'react'
import { ConnectButton } from 'thirdweb/react'
import { getClient } from '@/lib/thirdweb/client'
import { createWallet, inAppWallet } from 'thirdweb/wallets'

const wallets = [
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  inAppWallet({
    auth: {
      options: ['google', 'email', 'passkey'],
    },
  }),
]

interface ConnectWalletProps {
  fullWidth?: boolean
  label?: string
  className?: string
}

export function ConnectWallet({
  fullWidth = false,
  label = 'Connect',
  className = '',
}: ConnectWalletProps) {
  const client = getClient()

  if (!client) {
    return (
      <button
        disabled
        className={`flex items-center justify-center bg-gray-500/50 text-gray-300 px-3 py-2 rounded-xl
                   font-medium text-sm cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
      >
        Auth Not Configured
      </button>
    )
  }

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      connectButton={{
        label,
        className: `flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600
                   hover:from-cyan-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl
                   transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg
                   ${fullWidth ? 'w-full' : ''} ${className}`,
      }}
      connectModal={{
        size: 'compact',
        title: 'Connect to AlphaGenome',
        welcomeScreen: {
          title: 'Welcome to AlphaGenome Explorer',
          subtitle: 'Connect your wallet to save analyses, sync favorites, and access premium tools',
        },
        showThirdwebBranding: false,
      }}
      theme="dark"
    />
  )
}
