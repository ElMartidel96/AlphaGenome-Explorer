'use client'

import { useState, useEffect, useCallback } from 'react'

const LOCAL_KEY = 'alphagenome-recent-tools'
const MAX_RECENT = 5

function getStored(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

export function useRecentTools() {
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    setRecent(getStored())
  }, [])

  const addRecent = useCallback((toolId: string) => {
    setRecent((prev) => {
      const next = [toolId, ...prev.filter((id) => id !== toolId)].slice(0, MAX_RECENT)
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { recent, addRecent }
}
