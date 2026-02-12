'use client'

import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

export type ToolStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseToolStateOptions<T> {
  onSuccess?: (result: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  toolName?: string
}

interface UseToolStateReturn<T> {
  status: ToolStatus
  result: T | null
  error: Error | null
  progress: number
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  execute: (fn: () => Promise<T>) => Promise<T | null>
  setProgress: (value: number) => void
  reset: () => void
}

export function useToolState<T = unknown>(
  options: UseToolStateOptions<T> = {}
): UseToolStateReturn<T> {
  const [status, setStatus] = useState<ToolStatus>('idle')
  const [result, setResult] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number>(0)

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      setStatus('loading')
      setError(null)
      setProgress(0)
      startTimeRef.current = Date.now()

      try {
        const data = await fn()
        setResult(data)
        setStatus('success')
        setProgress(100)

        if (options.successMessage) {
          toast.success(options.successMessage)
        }
        options.onSuccess?.(data)
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setStatus('error')
        toast.error(error.message || 'An error occurred')
        options.onError?.(error)
        return null
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
    setProgress(0)
  }, [])

  return {
    status,
    result,
    error,
    progress,
    isLoading: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'success',
    execute,
    setProgress,
    reset,
  }
}
