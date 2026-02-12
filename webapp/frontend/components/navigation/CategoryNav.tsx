'use client'

import React from 'react'
import { ToolCategory, CATEGORY_META, getCategoryCounts } from '@/lib/tools/categories'

interface CategoryNavProps {
  selected: ToolCategory | 'ALL'
  onSelect: (category: ToolCategory | 'ALL') => void
}

export function CategoryNav({ selected, onSelect }: CategoryNavProps) {
  const counts = getCategoryCounts()

  return (
    <nav aria-label="Tool categories" className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('ALL')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
          ${selected === 'ALL'
            ? 'bg-white/10 text-white border border-white/20'
            : 'bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/8 border border-transparent'
          }`}
        aria-pressed={selected === 'ALL'}
      >
        All
        <span className="text-xs opacity-60">30</span>
      </button>

      {Object.values(ToolCategory).map((cat) => {
        const meta = CATEGORY_META[cat]
        const Icon = meta.icon
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
              ${selected === cat
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/8 border border-transparent'
              }`}
            aria-pressed={selected === cat}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {meta.label}
            <span className="text-xs opacity-60">{counts[cat]}</span>
          </button>
        )
      })}
    </nav>
  )
}
