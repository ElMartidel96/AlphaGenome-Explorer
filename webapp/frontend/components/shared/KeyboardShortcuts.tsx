'use client'

import { useEffect } from 'react'

interface KeyboardShortcutsProps {
  onSearch?: () => void
  onHelp?: () => void
}

export function KeyboardShortcuts({ onSearch, onHelp }: KeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onSearch?.()
      }
      // Ctrl+/ or Cmd+/ for help/shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        onHelp?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSearch, onHelp])

  return null
}
