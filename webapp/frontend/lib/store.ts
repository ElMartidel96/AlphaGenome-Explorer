import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      // Only persist to localStorage, not sessionStorage
      // The key stays in the browser, never sent to our server storage
    }
  )
)

// Analysis history store
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
          analyses: [result, ...state.analyses].slice(0, 50), // Keep last 50
        })),
      clearHistory: () => set({ analyses: [] }),
    }),
    {
      name: 'alphagenome-history',
    }
  )
)
