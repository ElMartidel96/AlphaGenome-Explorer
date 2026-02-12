'use client'

import React from 'react'
import { Star, Crown, Clock } from 'lucide-react'
import type { ToolMeta } from '@/lib/tools/categories'

interface ToolCardProps {
  tool: ToolMeta
  isFavorite: boolean
  onSelect: (toolId: string) => void
  onToggleFavorite: (toolId: string) => void
  locale?: string
}

const complexityColors = {
  basic: 'text-green-400 bg-green-500/10',
  intermediate: 'text-yellow-400 bg-yellow-500/10',
  advanced: 'text-red-400 bg-red-500/10',
}

export function ToolCard({ tool, isFavorite, onSelect, onToggleFavorite, locale = 'en' }: ToolCardProps) {
  const Icon = tool.icon
  const name = locale === 'es' ? tool.nameEs : tool.name
  const desc = locale === 'es' ? tool.descriptionEs : tool.description

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${name} - ${desc}`}
      onClick={() => onSelect(tool.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(tool.id)
        }
      }}
      className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20
                 hover:bg-white/8 transition-all cursor-pointer"
    >
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(tool.id)
        }}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      >
        <Star
          className={`w-4 h-4 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 group-hover:text-gray-400'}`}
          aria-hidden="true"
        />
      </button>

      {/* Premium badge */}
      {tool.premium && (
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-md text-[10px] font-semibold">
            <Crown className="w-3 h-3" aria-hidden="true" />
            PRO
          </span>
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-2 pt-2">
        <div className={`p-2.5 rounded-xl bg-${tool.color}-500/10`}>
          <Icon className={`w-6 h-6 text-${tool.color}-400`} aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
          {name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">{desc}</p>

        <div className="flex items-center gap-2 mt-1">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${complexityColors[tool.complexity]}`}>
            {tool.complexity}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-gray-600">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {tool.estimatedTime}
          </span>
        </div>
      </div>
    </div>
  )
}
