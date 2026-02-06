'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { useEffect } from 'react'

function ThemeColorUpdater({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useTheme()

  useEffect(() => {
    // Determine the actual theme (considering system preference)
    const currentTheme = theme === 'system' ? systemTheme : theme

    // Update theme-color meta tag based on current theme
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      // Dark mode: #0A0E15 (rgb(10, 14, 21))
      // Light mode: #FFFFFF (rgb(255, 255, 255))
      const darkColor = '#0A0E15'
      const lightColor = '#FFFFFF'
      metaThemeColor.setAttribute('content', currentTheme === 'dark' ? darkColor : lightColor)
    } else {
      // Create the meta tag if it doesn't exist
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = currentTheme === 'dark' ? '#0A0E15' : '#FFFFFF'
      document.head.appendChild(meta)
    }
  }, [theme, systemTheme])

  return (
    <div className="min-h-screen min-h-[100dvh]">
      {children}
    </div>
  )
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <ThemeColorUpdater>
        {children}
      </ThemeColorUpdater>
    </NextThemesProvider>
  )
}
