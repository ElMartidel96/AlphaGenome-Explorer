'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { searchTools, type ToolMeta } from '@/lib/tools/categories'

interface ToolSearchProps {
  onSelect: (toolId: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ToolSearch({ onSelect, isOpen, onOpenChange }: ToolSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ToolMeta[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setResults([])
      setActiveIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchTools(query).slice(0, 8))
      setActiveIndex(0)
    } else {
      setResults([])
    }
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      onSelect(results[activeIndex].id)
      onOpenChange(false)
    } else if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="dialog" aria-label="Search tools">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-lg mx-4">
        <div className="bg-gray-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search className="w-5 h-5 text-gray-500" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tools... (e.g. CRISPR, diet, aging)"
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
              aria-label="Search tools"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-activedescendant={results[activeIndex] ? `result-${results[activeIndex].id}` : undefined}
            />
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {results.length > 0 && (
            <ul role="listbox" className="max-h-80 overflow-y-auto p-2">
              {results.map((tool, i) => {
                const Icon = tool.icon
                return (
                  <li
                    key={tool.id}
                    id={`result-${tool.id}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    onClick={() => {
                      onSelect(tool.id)
                      onOpenChange(false)
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors
                      ${i === activeIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <Icon className={`w-5 h-5 text-${tool.color}-400 shrink-0`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{tool.name}</p>
                      <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                    </div>
                    {tool.premium && (
                      <span className="text-[10px] text-amber-400 font-semibold">PRO</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {query.length > 0 && results.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              No tools found for &quot;{query}&quot;
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-gray-600">
            <span>Ctrl+K to search</span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
