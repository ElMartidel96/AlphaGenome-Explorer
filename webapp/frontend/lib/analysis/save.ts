import { getSupabaseClient } from '@/lib/supabase/client'
import type { AnalysisHistoryEntry } from '@/lib/supabase/types'

export async function saveAnalysis(params: {
  userId: string
  toolName: string
  toolCategory?: string
  inputData: Record<string, unknown>
  resultData: Record<string, unknown>
  durationMs?: number
}): Promise<AnalysisHistoryEntry | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const client = supabase as any
  const { data, error } = await client
    .from('analysis_history')
    .insert({
      user_id: params.userId,
      tool_name: params.toolName,
      tool_category: params.toolCategory || null,
      input_data: params.inputData,
      result_data: params.resultData,
      duration_ms: params.durationMs || null,
      is_public: false,
      share_token: null,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to save analysis:', error)
    return null
  }
  return data as AnalysisHistoryEntry
}

export async function getAnalysisHistory(
  userId: string,
  limit = 50
): Promise<AnalysisHistoryEntry[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const client = supabase as any
  const { data } = await client
    .from('analysis_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data as AnalysisHistoryEntry[]) || []
}

export async function getAnalysisByShareToken(
  token: string
): Promise<AnalysisHistoryEntry | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const client = supabase as any
  const { data } = await client
    .from('analysis_history')
    .select('*')
    .eq('share_token', token)
    .eq('is_public', true)
    .single()

  return (data as AnalysisHistoryEntry) || null
}

export async function shareAnalysis(analysisId: string): Promise<string | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  // Generate a share token
  const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const client = supabase as any
  const { error } = await client
    .from('analysis_history')
    .update({ share_token: token, is_public: true })
    .eq('id', analysisId)

  if (error) {
    console.error('Failed to share analysis:', error)
    return null
  }

  return token
}

export async function deleteAnalysis(analysisId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const client = supabase as any
  const { error } = await client
    .from('analysis_history')
    .delete()
    .eq('id', analysisId)

  return !error
}
