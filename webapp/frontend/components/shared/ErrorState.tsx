'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  error: Error | string | null
  onRetry?: () => void
  onReset?: () => void
  suggestions?: string[]
}

export function ErrorState({
  error,
  onRetry,
  onReset,
  suggestions,
}: ErrorStateProps) {
  const message = error instanceof Error ? error.message : error || 'An unexpected error occurred'

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-6 space-y-3 rounded-xl bg-red-500/10 border border-red-500/20"
    >
      <AlertTriangle className="w-8 h-8 text-red-400" aria-hidden="true" />
      <p className="text-red-300 text-sm text-center">{message}</p>

      {suggestions && suggestions.length > 0 && (
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Retry
          </button>
        )}
        {onReset && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
