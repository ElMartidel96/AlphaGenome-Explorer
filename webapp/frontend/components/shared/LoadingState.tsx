'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  progress?: number
  showProgress?: boolean
}

export function LoadingState({
  message = 'Processing...',
  progress,
  showProgress = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-8 space-y-4"
    >
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" aria-hidden="true" />
      <p className="text-gray-300 text-sm">{message}</p>
      {showProgress && typeof progress === 'number' && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${Math.round(progress)}% complete`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">{Math.round(progress)}%</p>
        </div>
      )}
      <span className="sr-only">Loading, please wait</span>
    </div>
  )
}
