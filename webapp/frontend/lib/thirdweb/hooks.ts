'use client'

import { useActiveAccount, useActiveWallet } from 'thirdweb/react'

export function useAccount() {
  const account = useActiveAccount()

  return {
    address: account?.address,
    isConnected: !!account,
    isDisconnected: !account,
  }
}

export function useWallet() {
  return useActiveWallet()
}
