import type { AIProvider } from './config'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  success: boolean
  content: string
  provider: string
  model: string
  usage: { input_tokens: number; output_tokens: number }
}

export interface AnalyzeResponse {
  success: boolean
  content: string
  provider: string
  model: string
}

export async function chat(
  messages: ChatMessage[],
  provider: AIProvider = 'claude',
  systemPrompt?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      provider,
      system_prompt: systemPrompt,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'AI service unavailable' }))
    throw new Error(err.detail || 'AI request failed')
  }

  return res.json()
}

export async function analyzeGenomicData(
  data: Record<string, unknown>,
  question: string,
  provider: AIProvider = 'claude'
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/api/ai/analyze-genomic-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, question, provider }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'AI analysis unavailable' }))
    throw new Error(err.detail || 'AI analysis failed')
  }

  return res.json()
}

export async function getAvailableProviders(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/ai/providers`)
    if (!res.ok) return []
    const data = await res.json()
    return data.providers || []
  } catch {
    return []
  }
}
