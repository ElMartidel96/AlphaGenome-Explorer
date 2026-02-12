'use client'

import { useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useApiKeyStore } from '@/lib/store'
import { apiClient, type VariantPredictRequest, type PredictionResult, type GeneScore, type ApiResponse } from '@/lib/api'

export function useAlphaGenomeAPI() {
  const apiKey = useApiKeyStore((s) => s.apiKey)
  const isConfigured = useApiKeyStore((s) => s.isConfigured)

  // Cache ontologies for 24h
  const ontologies = useQuery({
    queryKey: ['ontologies'],
    queryFn: () => apiClient.getOntologies(),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: isConfigured,
  })

  const predictVariant = useMutation({
    mutationFn: (request: VariantPredictRequest) => {
      if (!apiKey) throw new Error('API key required. Configure it in settings.')
      return apiClient.predictVariant(apiKey, request)
    },
  })

  const scoreVariant = useMutation({
    mutationFn: ({ variant, scorers }: { variant: string; scorers: string[] }) => {
      if (!apiKey) throw new Error('API key required. Configure it in settings.')
      return apiClient.scoreVariant(apiKey, variant, scorers)
    },
  })

  const predictInterval = useMutation({
    mutationFn: (request: VariantPredictRequest) => {
      if (!apiKey) throw new Error('API key required. Configure it in settings.')
      return apiClient.predictVariant(apiKey, request)
    },
  })

  const predictBatch = useCallback(
    async (variants: VariantPredictRequest[]): Promise<ApiResponse<PredictionResult>[]> => {
      if (!apiKey) throw new Error('API key required. Configure it in settings.')
      const results: ApiResponse<PredictionResult>[] = []
      for (const req of variants) {
        const result = await apiClient.predictVariant(apiKey, req)
        results.push(result)
      }
      return results
    },
    [apiKey]
  )

  return {
    apiKey,
    isConfigured,
    ontologies: ontologies.data?.data,
    predictVariant,
    scoreVariant,
    predictInterval,
    predictBatch,
  }
}
