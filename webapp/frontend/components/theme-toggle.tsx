'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg glass-button">
        <Sun size={14} className="text-amber-500" />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Light</span>
      </div>
    )
  }

  const getIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon size={14} className="text-blue-400" />
      case 'light':
        return <Sun size={14} className="text-amber-500" />
      default:
        return <Monitor size={14} className="text-purple-500" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Dark'
      case 'light':
        return 'Light'
      default:
        return 'System'
    }
  }

  return (
    <div className="relative">
      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg glass-button transition-all duration-200 hover:scale-105 active:scale-95 z-50 relative"
        aria-label="Toggle theme"
      >
        {getIcon()}
        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{getLabel()}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-36 py-1 rounded-xl glass-panel shadow-xl z-50 spring-in">
          {/* Light Mode */}
          <button
            onClick={() => {
              setTheme('light')
              setIsOpen(false)
            }}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors duration-200 ${
              theme === 'light'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Sun size={14} className="text-amber-500" />
            <span>Light</span>
            {theme === 'light' && (
              <span className="ml-auto text-amber-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>

          {/* Dark Mode */}
          <button
            onClick={() => {
              setTheme('dark')
              setIsOpen(false)
            }}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors duration-200 ${
              theme === 'dark'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Moon size={14} className="text-blue-400" />
            <span>Dark</span>
            {theme === 'dark' && (
              <span className="ml-auto text-blue-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          {/* System Mode */}
          <button
            onClick={() => {
              setTheme('system')
              setIsOpen(false)
            }}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors duration-200 ${
              theme === 'system'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Monitor size={14} className="text-purple-500" />
            <span>System</span>
            {theme === 'system' && (
              <span className="ml-auto text-purple-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
