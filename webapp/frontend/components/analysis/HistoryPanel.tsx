'use client'

import React, { useState } from 'react'
import { Clock, Share2, Trash2, ExternalLink, Copy, Check } from 'lucide-react'
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory'
import toast from 'react-hot-toast'

export function HistoryPanel() {
  const { history, isLoading, share, remove } = useAnalysisHistory()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleShare(analysisId: string) {
    const token = await share(analysisId)
    if (token) {
      const url = `${window.location.origin}/share/${token}`
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied to clipboard!')
    }
  }

  async function handleDelete(analysisId: string) {
    await remove(analysisId)
    toast.success('Analysis deleted')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <Clock className="w-5 h-5 animate-pulse mr-2" />
        Loading history...
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No analysis history yet</p>
        <p className="text-xs mt-1">Your analyses will appear here after you run them</p>
      </div>
    )
  }

  return (
    <div className="space-y-2" role="list" aria-label="Analysis history">
      {history.map((entry) => (
        <div
          key={entry.id}
          role="listitem"
          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-200 truncate">
                {entry.tool_name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              {entry.tool_category && (
                <span className="px-1.5 py-0.5 text-[10px] bg-white/10 text-gray-400 rounded">
                  {entry.tool_category}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(entry.created_at).toLocaleString()}
              {entry.duration_ms && ` - ${(entry.duration_ms / 1000).toFixed(1)}s`}
            </p>
          </div>

          <div className="flex items-center gap-1 ml-2">
            {entry.share_token && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/share/${entry.share_token}`
                  navigator.clipboard.writeText(url)
                  setCopiedId(entry.id)
                  setTimeout(() => setCopiedId(null), 2000)
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Copy share link"
              >
                {copiedId === entry.id ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
            )}
            <button
              onClick={() => handleShare(entry.id)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Share analysis"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button
              onClick={() => handleDelete(entry.id)}
              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
              aria-label="Delete analysis"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
