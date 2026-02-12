'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getAnalysisByShareToken } from '@/lib/analysis/save'
import type { AnalysisHistoryEntry } from '@/lib/supabase/types'
import { Share2, Clock, Dna, ExternalLink } from 'lucide-react'

export default function SharePage() {
  const params = useParams()
  const token = params.token as string
  const [analysis, setAnalysis] = useState<AnalysisHistoryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAnalysisByShareToken(token)
        if (!data) {
          setError('Analysis not found or no longer shared')
        } else {
          setAnalysis(data)
        }
      } catch {
        setError('Failed to load shared analysis')
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-gradient-bg">
        <div className="text-center">
          <Dna className="w-8 h-8 text-cyan-400 animate-pulse mx-auto mb-3" />
          <p className="text-gray-400">Loading shared analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-gradient-bg">
        <div className="text-center max-w-md mx-auto p-8">
          <Share2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-200 mb-2">Analysis Not Found</h1>
          <p className="text-gray-500">{error || 'This shared analysis may have been removed.'}</p>
          <a
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors"
          >
            Go to AlphaGenome Explorer
          </a>
        </div>
      </div>
    )
  }

  const toolName = analysis.tool_name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="min-h-screen theme-gradient-bg p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-3 mb-6">
          <Share2 className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-xl font-semibold text-gray-200">Shared Analysis: {toolName}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(analysis.created_at).toLocaleString()}
            </p>
          </div>
        </header>

        <div className="space-y-4">
          {/* Input */}
          <section className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Input</h2>
            <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(analysis.input_data, null, 2)}
            </pre>
          </section>

          {/* Results */}
          <section className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Results</h2>
            <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(analysis.result_data, null, 2)}
            </pre>
          </section>
        </div>

        <footer className="mt-6 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Try AlphaGenome Explorer
          </a>
        </footer>
      </div>
    </div>
  )
}
