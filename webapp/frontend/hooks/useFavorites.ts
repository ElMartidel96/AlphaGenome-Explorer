'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/lib/store'

const LOCAL_KEY = 'alphagenome-favorites'

function getLocalFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function setLocalFavorites(favs: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(favs))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const profileId = useProfileStore((s) => s.profileId)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function load() {
      if (supabase && profileId) {
        const { data } = await (supabase as any)
          .from('user_favorites')
          .select('tool_name')
          .eq('user_id', profileId)
        if (data) {
          setFavorites((data as { tool_name: string }[]).map((d) => d.tool_name))
          return
        }
      }
      setFavorites(getLocalFavorites())
    }
    load()
  }, [supabase, profileId])

  const toggleFavorite = useCallback(
    async (toolName: string) => {
      const isFav = favorites.includes(toolName)
      const next = isFav ? favorites.filter((f) => f !== toolName) : [...favorites, toolName]
      setFavorites(next)
      setLocalFavorites(next)

      if (supabase && profileId) {
        const client = supabase as any
        if (isFav) {
          await client
            .from('user_favorites')
            .delete()
            .eq('user_id', profileId)
            .eq('tool_name', toolName)
        } else {
          await client
            .from('user_favorites')
            .insert({ user_id: profileId, tool_name: toolName })
        }
      }
    },
    [favorites, supabase, profileId]
  )

  const isFavorite = useCallback((toolName: string) => favorites.includes(toolName), [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
