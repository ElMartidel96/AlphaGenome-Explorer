import { getSupabaseClient } from '@/lib/supabase/client'
import type { SavedVariant } from '@/lib/supabase/types'

export async function saveVariant(params: {
  userId: string
  variant: string
  gene?: string
  chromosome?: string
  position?: number
  referenceAllele?: string
  alternateAllele?: string
  significance?: string
  notes?: string
  tags?: string[]
  sourceTool?: string
  metadata?: Record<string, unknown>
}): Promise<SavedVariant | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const client = supabase as any
  const { data, error } = await client
    .from('saved_variants')
    .insert({
      user_id: params.userId,
      variant: params.variant,
      gene: params.gene || null,
      chromosome: params.chromosome || null,
      position: params.position || null,
      reference_allele: params.referenceAllele || null,
      alternate_allele: params.alternateAllele || null,
      significance: params.significance || null,
      notes: params.notes || null,
      tags: params.tags || [],
      source_tool: params.sourceTool || null,
      metadata: params.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to save variant:', error)
    return null
  }
  return data as SavedVariant
}

export async function getSavedVariants(userId: string): Promise<SavedVariant[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const client = supabase as any
  const { data } = await client
    .from('saved_variants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data as SavedVariant[]) || []
}

export async function updateVariant(
  variantId: string,
  updates: Partial<Pick<SavedVariant, 'notes' | 'tags' | 'significance'>>
): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const client = supabase as any
  const { error } = await client
    .from('saved_variants')
    .update(updates)
    .eq('id', variantId)

  return !error
}

export async function deleteVariant(variantId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const client = supabase as any
  const { error } = await client
    .from('saved_variants')
    .delete()
    .eq('id', variantId)

  return !error
}
