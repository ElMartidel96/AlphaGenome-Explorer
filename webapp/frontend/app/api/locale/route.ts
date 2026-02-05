import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SUPPORTED_LOCALES = ['en', 'es'] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { locale } = body

    if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true, locale })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to set locale' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'

  return NextResponse.json({ locale })
}
