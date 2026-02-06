'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Globe, Loader2 } from 'lucide-react'

export function LanguageToggle() {
  const router = useRouter()
  const [isChanging, setIsChanging] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<'en' | 'es'>('en')

  // Fetch current locale on mount
  useEffect(() => {
    fetch('/api/locale')
      .then(res => res.json())
      .then(data => setCurrentLocale(data.locale || 'en'))
      .catch(() => setCurrentLocale('en'))
  }, [])

  const changeLocale = async (newLocale: 'en' | 'es') => {
    if (newLocale === currentLocale) return

    setIsChanging(true)
    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      })
      setCurrentLocale(newLocale)
      router.refresh()
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {isChanging ? (
        <Loader2 className="w-4 h-4 text-blue-500 ml-1 animate-spin" />
      ) : (
        <Globe className="w-4 h-4 text-gray-500 ml-1" />
      )}
      <button
        onClick={() => changeLocale('en')}
        disabled={isChanging}
        aria-label="Switch to English"
        aria-pressed={currentLocale === 'en'}
        className={`px-2 py-1 text-xs font-medium rounded transition-all
          ${currentLocale === 'en'
            ? 'bg-white shadow-sm text-blue-600'
            : 'text-gray-600 hover:bg-white/50'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
      >
        EN
      </button>
      <button
        onClick={() => changeLocale('es')}
        disabled={isChanging}
        aria-label="Cambiar a Español"
        aria-pressed={currentLocale === 'es'}
        className={`px-2 py-1 text-xs font-medium rounded transition-all
          ${currentLocale === 'es'
            ? 'bg-white shadow-sm text-blue-600'
            : 'text-gray-600 hover:bg-white/50'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
      >
        ES
      </button>
    </div>
  )
}
