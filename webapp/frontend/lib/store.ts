import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/lib/supabase/types'

// API Key Store
interface ApiKeyState {
  apiKey: string | null
  isConfigured: boolean
  setApiKey: (key: string) => void
  clearApiKey: () => void
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set) => ({
      apiKey: null,
      isConfigured: false,
      setApiKey: (key: string) =>
        set({
          apiKey: key,
          isConfigured: key.length > 0,
        }),
      clearApiKey: () =>
        set({
          apiKey: null,
          isConfigured: false,
        }),
    }),
    {
      name: 'alphagenome-api-key',
    }
  )
)

// Analysis History Store
interface AnalysisResult {
  id: string
  timestamp: Date
  variant: string
  summary: any
  scores: any[]
}

interface HistoryState {
  analyses: AnalysisResult[]
  addAnalysis: (result: AnalysisResult) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      analyses: [],
      addAnalysis: (result: AnalysisResult) =>
        set((state) => ({
          analyses: [result, ...state.analyses].slice(0, 50),
        })),
      clearHistory: () => set({ analyses: [] }),
    }),
    {
      name: 'alphagenome-history',
    }
  )
)

// Profile Store (auth + role)
interface ProfileState {
  walletAddress: string | null
  displayName: string | null
  role: UserRole
  profileId: string | null
  setProfile: (data: { walletAddress: string; displayName?: string; role?: UserRole; profileId?: string }) => void
  setRole: (role: UserRole) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      walletAddress: null,
      displayName: null,
      role: 'FREE' as UserRole,
      profileId: null,
      setProfile: ({ walletAddress, displayName, role, profileId }) =>
        set({
          walletAddress,
          displayName: displayName ?? null,
          role: role ?? 'FREE',
          profileId: profileId ?? null,
        }),
      setRole: (role: UserRole) => set({ role }),
      clearProfile: () =>
        set({
          walletAddress: null,
          displayName: null,
          role: 'FREE' as UserRole,
          profileId: null,
        }),
    }),
    {
      name: 'alphagenome-profile',
    }
  )
)
