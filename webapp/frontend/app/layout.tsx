import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AlphaGenome Explorer',
  description: 'Professional web interface for Google DeepMind AlphaGenome API',
  keywords: ['genomics', 'variant effect', 'AlphaGenome', 'DeepMind', 'bioinformatics'],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                },
              }}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
