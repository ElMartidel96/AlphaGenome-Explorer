'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfileStore } from '@/lib/store'
import {
  getAnalysisHistory,
  saveAnalysis,
  shareAnalysis,
  deleteAnalysis,
} from '@/lib/analysis/save'
import type { AnalysisHistoryEntry } from '@/lib/supabase/types'

export function useAnalysisHistory() {
  const profileId = useProfileStore((s) => s.profileId)
  const queryClient = useQueryClient()

  const history = useQuery({
    queryKey: ['analysis-history', profileId],
    queryFn: () => (profileId ? getAnalysisHistory(profileId) : []),
    enabled: !!profileId,
  })

  const save = useMutation({
    mutationFn: (params: {
      toolName: string
      toolCategory?: string
      inputData: Record<string, unknown>
      resultData: Record<string, unknown>
      durationMs?: number
    }) => {
      if (!profileId) throw new Error('Not logged in')
      return saveAnalysis({ userId: profileId, ...params })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-history'] })
    },
  })

  const share = useMutation({
    mutationFn: (analysisId: string) => shareAnalysis(analysisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-history'] })
    },
  })

  const remove = useMutation({
    mutationFn: (analysisId: string) => deleteAnalysis(analysisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-history'] })
    },
  })

  return {
    history: history.data || [],
    isLoading: history.isLoading,
    save: save.mutateAsync,
    share: share.mutateAsync,
    remove: remove.mutateAsync,
  }
}
