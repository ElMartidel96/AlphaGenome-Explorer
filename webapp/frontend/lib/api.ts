/**
 * API Client for AlphaGenome Explorer Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface VariantPredictRequest {
  variant: string
  outputs: string[]
  tissues: string[]
  sequence_length: string
  organism: string
}

export interface GeneScore {
  gene_id: string
  gene_name: string
  strand: string
  raw_score: number
  quantile_score: number
  tissue: string
  interpretation: string
}

export interface VariantSummary {
  variant: string
  impact_level: string
  affected_genes: string[]
  top_effect: string
  confidence: number
}

export interface PredictionResult {
  metadata: Record<string, any>
  timestamp: string
  request_params: Record<string, any>
  summary: VariantSummary | null
  scores: GeneScore[]
  tracks: Record<string, any>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  export?: Record<string, any>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { apiKey?: string }
  ): Promise<ApiResponse<T>> {
    const { apiKey, ...fetchOptions } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (apiKey) {
      headers['X-API-Key'] = apiKey
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.detail?.message || data.detail || 'Request failed',
        }
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async predictVariant(
    apiKey: string,
    request: VariantPredictRequest
  ): Promise<ApiResponse<PredictionResult>> {
    return this.request('/api/predict/variant', {
      method: 'POST',
      apiKey,
      body: JSON.stringify(request),
    })
  }

  async scoreVariant(
    apiKey: string,
    variant: string,
    scorers: string[]
  ): Promise<ApiResponse<{ scores: GeneScore[] }>> {
    return this.request('/api/predict/score', {
      method: 'POST',
      apiKey,
      body: JSON.stringify({
        variant,
        scorers,
        sequence_length: '1MB',
        organism: 'HOMO_SAPIENS',
      }),
    })
  }

  async getOntologies(): Promise<
    ApiResponse<{ tissues: any[]; cell_lines: any[]; output_types: any[] }>
  > {
    return this.request('/api/metadata/ontologies', {
      method: 'GET',
    })
  }

  async getApiKeyInfo(): Promise<ApiResponse<any>> {
    return this.request('/api-key-required', {
      method: 'GET',
    })
  }

  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request('/health', {
      method: 'GET',
    })
  }

  async exportData(
    data: Record<string, any>,
    format: string,
    filename: string
  ): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/export/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, format, filename }),
    })

    if (!response.ok) {
      throw new Error('Export failed')
    }

    return response.blob()
  }

  async getClipboardText(
    data: Record<string, any>,
    format: string
  ): Promise<string> {
    const response = await this.request<{ text: string }>(
      `/api/export/clipboard/${format}`,
      {
        method: 'POST',
        body: JSON.stringify({ data, format, filename: 'clipboard' }),
      }
    )

    if (response.success && response.data) {
      return response.data.text
    }

    throw new Error('Failed to get clipboard text')
  }
}

export const apiClient = new ApiClient()
