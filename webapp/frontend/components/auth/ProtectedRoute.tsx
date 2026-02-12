'use client'

import React from 'react'
import { useAccount } from '@/lib/thirdweb/hooks'
import { ConnectWallet } from './ConnectWallet'
import { Shield } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallbackMessage?: string
  requirePremium?: boolean
}

export function ProtectedRoute({
  children,
  fallbackMessage = 'Connect your wallet to access this feature',
  requirePremium = false,
}: ProtectedRouteProps) {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 rounded-2xl bg-white/5 border border-white/10">
        <Shield className="w-12 h-12 text-cyan-400" />
        <p className="text-gray-300 text-center">{fallbackMessage}</p>
        <ConnectWallet label="Connect Wallet" />
      </div>
    )
  }

  return <>{children}</>
}
