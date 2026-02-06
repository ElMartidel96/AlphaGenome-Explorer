import { NextResponse } from 'next/server'

// In-memory store for development (replace with database in production)
const featureRequests: Map<string, Set<string>> = new Map()

// Rate limiting: max 5 requests per email per hour
const rateLimits: Map<string, { count: number; resetAt: number }> = new Map()

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function isRateLimited(email: string): boolean {
  const now = Date.now()
  const limit = rateLimits.get(email)

  if (!limit || now > limit.resetAt) {
    rateLimits.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return true
  }

  limit.count++
  return false
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { featureId, featureName, email, timestamp } = body

    // Validation
    if (!featureId || typeof featureId !== 'string') {
      return NextResponse.json(
        { error: 'Feature ID is required' },
        { status: 400 }
      )
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Rate limiting
    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Store the request
    if (!featureRequests.has(featureId)) {
      featureRequests.set(featureId, new Set())
    }
    featureRequests.get(featureId)!.add(email)

    // Log for analytics (in production, send to analytics service)
    console.log(`[Feature Request] ${featureId}: ${email} at ${timestamp}`)

    // In production, you would:
    // 1. Store in database
    // 2. Send confirmation email
    // 3. Create ticket in project management system
    // 4. Trigger notification to team

    return NextResponse.json({
      success: true,
      message: 'Request registered successfully',
      featureId,
      totalRequests: featureRequests.get(featureId)?.size || 1,
    })
  } catch (error) {
    console.error('[Feature Request Error]', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const featureId = searchParams.get('featureId')

  if (featureId) {
    const requests = featureRequests.get(featureId)
    return NextResponse.json({
      featureId,
      totalRequests: requests?.size || 0,
    })
  }

  // Return all feature request counts
  const allCounts: Record<string, number> = {}
  featureRequests.forEach((emails, id) => {
    allCounts[id] = emails.size
  })

  return NextResponse.json({ featureRequests: allCounts })
}
