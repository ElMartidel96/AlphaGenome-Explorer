import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SkipLink } from '@/components/shared/SkipLink'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AlphaGenome Explorer',
  description: 'Professional web interface for Google DeepMind AlphaGenome API',
  keywords: ['genomics', 'variant effect', 'AlphaGenome', 'DeepMind', 'bioinformatics'],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0E15" />
      </head>
      <body className={inter.className}>
        <SkipLink />
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Providers>
              <main id="main-content" className="min-h-screen theme-gradient-bg transition-colors duration-300">
                {children}
              </main>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--bg-glass)',
                    color: 'rgb(var(--text-primary))',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--border-glass)',
                  },
                }}
              />
            </Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
