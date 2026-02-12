'use client'

import { useCallback, useEffect, useState } from 'react'
import { getSupabaseClient } from './client'
import type { UserProfile } from './types'

export function useSupabase() {
  const client = getSupabaseClient()
  return { supabase: client, isConfigured: !!client }
}

export function useProfile(walletAddress: string | undefined) {
  const { supabase } = useSupabase()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!supabase || !walletAddress) return
    setLoading(true)
    setError(null)

    try {
      const client = supabase as any
      const { data, error: fetchError } = await client
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        setError(fetchError.message)
        return
      }

      if (data) {
        setProfile(data as UserProfile)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }, [supabase, walletAddress])

  const createOrUpdateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!supabase || !walletAddress) return null

      const client = supabase as any
      const normalizedAddress = walletAddress.toLowerCase()

      const { data, error: upsertError } = await client
        .from('user_profiles')
        .upsert(
          { wallet_address: normalizedAddress, ...updates },
          { onConflict: 'wallet_address' }
        )
        .select()
        .single()

      if (upsertError) {
        setError(upsertError.message)
        return null
      }

      setProfile(data as UserProfile)
      return data as UserProfile
    },
    [supabase, walletAddress]
  )

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, createOrUpdateProfile, refetch: fetchProfile }
}
