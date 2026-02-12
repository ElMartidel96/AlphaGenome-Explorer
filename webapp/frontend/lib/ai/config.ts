export type AIProvider = 'claude' | 'openai' | 'gemini'

export interface AIModel {
  provider: AIProvider
  id: string
  name: string
  description: string
}

export const AI_MODELS: AIModel[] = [
  {
    provider: 'claude',
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    description: 'Anthropic - Best for nuanced genomic analysis',
  },
  {
    provider: 'openai',
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI - Fast and versatile',
  },
  {
    provider: 'gemini',
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Google - Fast with broad knowledge',
  },
]

export const DEFAULT_PROVIDER: AIProvider = 'claude'
