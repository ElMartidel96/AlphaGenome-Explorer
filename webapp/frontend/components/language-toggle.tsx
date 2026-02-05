'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const router = useRouter()
  const [isChanging, setIsChanging] = useState(false)

  const changeLocale = async (newLocale: 'en' | 'es') => {
    setIsChanging(true)
    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      })
      router.refresh()
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Globe className="w-4 h-4 text-gray-500 ml-1" />
      <button
        onClick={() => changeLocale('en')}
        disabled={isChanging}
        className="px-2 py-1 text-xs font-medium rounded transition-colors hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        EN
      </button>
      <button
        onClick={() => changeLocale('es')}
        disabled={isChanging}
        className="px-2 py-1 text-xs font-medium rounded transition-colors hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        ES
      </button>
    </div>
  )
}
