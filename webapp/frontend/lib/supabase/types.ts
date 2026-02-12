export type UserRole = 'FREE' | 'PREMIUM' | 'ADMIN'

export type VariantSignificance =
  | 'benign'
  | 'likely_benign'
  | 'uncertain'
  | 'likely_pathogenic'
  | 'pathogenic'

export interface UserProfile {
  id: string
  wallet_address: string | null
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  preferences: Record<string, unknown>
  api_key_encrypted: string | null
  organism_preference: string
  default_sequence_length: string
  favorite_tissues: string[]
  created_at: string
  updated_at: string
}

export interface AnalysisHistoryEntry {
  id: string
  user_id: string
  tool_name: string
  tool_category: string | null
  input_data: Record<string, unknown>
  result_data: Record<string, unknown>
  share_token: string | null
  is_public: boolean
  duration_ms: number | null
  created_at: string
}

export interface UserFavorite {
  id: string
  user_id: string
  tool_name: string
  created_at: string
}

export interface SavedVariant {
  id: string
  user_id: string
  variant: string
  gene: string | null
  chromosome: string | null
  position: number | null
  reference_allele: string | null
  alternate_allele: string | null
  significance: VariantSignificance | null
  notes: string | null
  tags: string[]
  source_tool: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Partial<UserProfile> & { wallet_address?: string; email?: string }
        Update: Partial<UserProfile>
      }
      analysis_history: {
        Row: AnalysisHistoryEntry
        Insert: Omit<AnalysisHistoryEntry, 'id' | 'created_at'>
        Update: Partial<AnalysisHistoryEntry>
      }
      user_favorites: {
        Row: UserFavorite
        Insert: Omit<UserFavorite, 'id' | 'created_at'>
        Update: Partial<UserFavorite>
      }
      saved_variants: {
        Row: SavedVariant
        Insert: Omit<SavedVariant, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<SavedVariant>
      }
    }
  }
}
