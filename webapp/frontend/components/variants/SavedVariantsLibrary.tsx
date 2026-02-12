'use client'

import React, { useEffect, useState } from 'react'
import { Dna, Trash2, Tag, Edit3, Save, X } from 'lucide-react'
import { useProfileStore } from '@/lib/store'
import { getSavedVariants, deleteVariant, updateVariant } from '@/lib/variants/save'
import type { SavedVariant } from '@/lib/supabase/types'
import toast from 'react-hot-toast'

const SIGNIFICANCE_COLORS: Record<string, string> = {
  benign: 'text-green-400 bg-green-500/10',
  likely_benign: 'text-green-300 bg-green-500/10',
  uncertain: 'text-yellow-400 bg-yellow-500/10',
  likely_pathogenic: 'text-orange-400 bg-orange-500/10',
  pathogenic: 'text-red-400 bg-red-500/10',
}

export function SavedVariantsLibrary() {
  const profileId = useProfileStore((s) => s.profileId)
  const [variants, setVariants] = useState<SavedVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    async function load() {
      if (!profileId) return
      const data = await getSavedVariants(profileId)
      setVariants(data)
      setLoading(false)
    }
    load()
  }, [profileId])

  async function handleDelete(id: string) {
    const ok = await deleteVariant(id)
    if (ok) {
      setVariants((v) => v.filter((x) => x.id !== id))
      toast.success('Variant deleted')
    }
  }

  async function handleSaveNotes(id: string) {
    const ok = await updateVariant(id, { notes: editNotes })
    if (ok) {
      setVariants((v) => v.map((x) => (x.id === id ? { ...x, notes: editNotes } : x)))
      setEditingId(null)
      toast.success('Notes updated')
    }
  }

  if (!profileId) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Dna className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Connect your wallet to save variants</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Loading variants...</div>
  }

  if (variants.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Dna className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No saved variants yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2" role="list" aria-label="Saved variants">
      {variants.map((v) => (
        <div
          key={v.id}
          role="listitem"
          className="p-3 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono font-medium text-gray-200">{v.variant}</span>
                {v.gene && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-cyan-500/10 text-cyan-400 rounded">
                    {v.gene}
                  </span>
                )}
                {v.significance && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded ${SIGNIFICANCE_COLORS[v.significance] || ''}`}>
                    {v.significance.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              {v.tags.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="w-3 h-3 text-gray-600" />
                  {v.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {editingId === v.id ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-300"
                    aria-label="Edit notes"
                  />
                  <button onClick={() => handleSaveNotes(v.id)} aria-label="Save notes">
                    <Save className="w-3.5 h-3.5 text-green-400" />
                  </button>
                  <button onClick={() => setEditingId(null)} aria-label="Cancel edit">
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              ) : v.notes ? (
                <p className="text-xs text-gray-500 mt-1">{v.notes}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => {
                  setEditingId(v.id)
                  setEditNotes(v.notes || '')
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Edit notes"
              >
                <Edit3 className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button
                onClick={() => handleDelete(v.id)}
                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                aria-label="Delete variant"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
