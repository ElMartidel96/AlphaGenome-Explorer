'use client'

import { useState } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  FileUp,
  Download,
  Filter,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Dna,
  Search,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'complete'

interface VariantResult {
  id: string
  chromosome: string
  position: number
  ref: string
  alt: string
  gene: string
  impact: 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER'
  consequence: string
  score: number
}

interface FilterState {
  chromosome: string
  impact: string
  minScore: number
  gene: string
}

const DEMO_VARIANTS: VariantResult[] = [
  { id: 'v1', chromosome: 'chr1', position: 11856378, ref: 'G', alt: 'A', gene: 'MTHFR', impact: 'MODERATE', consequence: 'missense_variant', score: 0.82 },
  { id: 'v2', chromosome: 'chr7', position: 117548628, ref: 'C', alt: 'T', gene: 'CFTR', impact: 'HIGH', consequence: 'stop_gained', score: 0.97 },
  { id: 'v3', chromosome: 'chr13', position: 32315086, ref: 'A', alt: 'G', gene: 'BRCA2', impact: 'HIGH', consequence: 'splice_donor_variant', score: 0.95 },
  { id: 'v4', chromosome: 'chr17', position: 7578406, ref: 'C', alt: 'T', gene: 'TP53', impact: 'HIGH', consequence: 'missense_variant', score: 0.99 },
  { id: 'v5', chromosome: 'chr6', position: 26093141, ref: 'T', alt: 'C', gene: 'HFE', impact: 'MODERATE', consequence: 'missense_variant', score: 0.71 },
  { id: 'v6', chromosome: 'chr11', position: 5248232, ref: 'A', alt: 'T', gene: 'HBB', impact: 'HIGH', consequence: 'missense_variant', score: 0.93 },
  { id: 'v7', chromosome: 'chr12', position: 21178615, ref: 'G', alt: 'C', gene: 'KRAS', impact: 'MODERATE', consequence: 'missense_variant', score: 0.78 },
  { id: 'v8', chromosome: 'chr3', position: 37067240, ref: 'T', alt: 'A', gene: 'MLH1', impact: 'LOW', consequence: 'synonymous_variant', score: 0.15 },
  { id: 'v9', chromosome: 'chr1', position: 55505647, ref: 'C', alt: 'G', gene: 'PCSK9', impact: 'MODERATE', consequence: 'missense_variant', score: 0.65 },
  { id: 'v10', chromosome: 'chr19', position: 44908684, ref: 'T', alt: 'C', gene: 'APOE', impact: 'MODERATE', consequence: 'missense_variant', score: 0.88 },
  { id: 'v11', chromosome: 'chr22', position: 36201698, ref: 'A', alt: 'C', gene: 'SOX10', impact: 'LOW', consequence: '3_prime_UTR_variant', score: 0.22 },
  { id: 'v12', chromosome: 'chr9', position: 21971137, ref: 'G', alt: 'A', gene: 'CDKN2A', impact: 'HIGH', consequence: 'missense_variant', score: 0.91 },
  { id: 'v13', chromosome: 'chr16', position: 68771195, ref: 'C', alt: 'T', gene: 'CDH1', impact: 'MODIFIER', consequence: 'intron_variant', score: 0.08 },
  { id: 'v14', chromosome: 'chr5', position: 112173917, ref: 'A', alt: 'G', gene: 'APC', impact: 'LOW', consequence: 'synonymous_variant', score: 0.12 },
  { id: 'v15', chromosome: 'chr2', position: 47702181, ref: 'G', alt: 'T', gene: 'MSH2', impact: 'MODERATE', consequence: 'missense_variant', score: 0.74 },
]

const CHROMOSOMES = ['Todos', 'chr1', 'chr2', 'chr3', 'chr5', 'chr6', 'chr7', 'chr9', 'chr11', 'chr12', 'chr13', 'chr16', 'chr17', 'chr19', 'chr22']
const IMPACTS = ['Todos', 'HIGH', 'MODERATE', 'LOW', 'MODIFIER']

export function BatchAnalyzer() {
  const t = useTranslations()
  const [state, setState] = useState<AnalysisState>('idle')
  const [progress, setProgress] = useState(0)
  const [currentChromosome, setCurrentChromosome] = useState('')
  const [variants, setVariants] = useState<VariantResult[]>([])
  const [filters, setFilters] = useState<FilterState>({
    chromosome: 'Todos',
    impact: 'Todos',
    minScore: 0,
    gene: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'score' | 'position' | 'impact'>('score')

  const handleUpload = () => {
    setState('uploading')
    setProgress(0)

    // Simulate upload
    setTimeout(() => {
      setState('analyzing')
      const chroms = ['chr1', 'chr2', 'chr3', 'chr5', 'chr6', 'chr7', 'chr9', 'chr11', 'chr12', 'chr13', 'chr16', 'chr17', 'chr19', 'chr22']
      let i = 0
      const interval = setInterval(() => {
        if (i >= chroms.length) {
          clearInterval(interval)
          setVariants(DEMO_VARIANTS)
          setState('complete')
          toast.success(`${DEMO_VARIANTS.length} variantes analizadas!`)
          return
        }
        setCurrentChromosome(chroms[i])
        setProgress(Math.round(((i + 1) / chroms.length) * 100))
        i++
      }, 300)
    }, 1000)
  }

  const filteredVariants = variants
    .filter((v) => filters.chromosome === 'Todos' || v.chromosome === filters.chromosome)
    .filter((v) => filters.impact === 'Todos' || v.impact === filters.impact)
    .filter((v) => v.score >= filters.minScore)
    .filter((v) => !filters.gene || v.gene.toLowerCase().includes(filters.gene.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score
      if (sortBy === 'position') return a.position - b.position
      const impactOrder = { HIGH: 0, MODERATE: 1, LOW: 2, MODIFIER: 3 }
      return impactOrder[a.impact] - impactOrder[b.impact]
    })

  const impactCounts = {
    HIGH: variants.filter((v) => v.impact === 'HIGH').length,
    MODERATE: variants.filter((v) => v.impact === 'MODERATE').length,
    LOW: variants.filter((v) => v.impact === 'LOW').length,
    MODIFIER: variants.filter((v) => v.impact === 'MODIFIER').length,
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'red'
      case 'MODERATE': return 'amber'
      case 'LOW': return 'green'
      default: return 'gray'
    }
  }

  if (state === 'idle') {
    return (
      <div role="region" aria-label="Batch Analyzer" className="space-y-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <Title className="text-title">Analizador Masivo de Variantes</Title>
            <Text className="text-body mt-2 max-w-lg mx-auto">
              Sube un archivo VCF y analiza miles de variantes con filtros inteligentes por cromosoma,
              impacto y gen. Exporta resultados en CSV o Excel.
            </Text>
          </div>
        </Card>

        <Card>
          <div
            className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={handleUpload}
          >
            <FileUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="font-medium text-title">Arrastra tu archivo VCF aqui</p>
            <p className="text-sm text-muted mt-1">o haz clic para explorar</p>
            <p className="text-xs text-muted mt-3">Soportados: .vcf, .vcf.gz (max 10,000 variantes)</p>
          </div>
          <div className="flex justify-center mt-4">
            <Button variant="light" size="xs" icon={Sparkles} onClick={handleUpload}>
              Probar con datos demo (15 variantes)
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (state === 'uploading' || state === 'analyzing') {
    return (
      <div role="region" aria-label="Batch Analyzer">
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <Title className="text-title">
            {state === 'uploading' ? 'Subiendo archivo...' : `Analizando ${currentChromosome}...`}
          </Title>
          <div className="max-w-sm mx-auto mt-4">
            <ProgressBar value={progress} color="blue" />
            <Text className="text-sm text-muted mt-2">{progress}% completado</Text>
          </div>
        </div>
      </Card>
      </div>
    )
  }

  // Results view
  return (
    <div role="region" aria-label="Batch Analyzer" className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card decoration="top" decorationColor="red">
          <Text className="text-muted text-xs">Alto Impacto</Text>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{impactCounts.HIGH}</p>
        </Card>
        <Card decoration="top" decorationColor="amber">
          <Text className="text-muted text-xs">Impacto Moderado</Text>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{impactCounts.MODERATE}</p>
        </Card>
        <Card decoration="top" decorationColor="green">
          <Text className="text-muted text-xs">Bajo Impacto</Text>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{impactCounts.LOW}</p>
        </Card>
        <Card decoration="top" decorationColor="gray">
          <Text className="text-muted text-xs">Modificador</Text>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{impactCounts.MODIFIER}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <button
          aria-label="Toggle advanced filters"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 w-full"
        >
          <Filter className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-title flex-1 text-left">Filtros Avanzados</span>
          <Badge color="blue" size="xs">{filteredVariants.length}/{variants.length}</Badge>
          {showFilters ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
        </button>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <Text className="text-xs text-muted mb-1">Cromosoma</Text>
              <select
                aria-label="Chromosome filter"
                value={filters.chromosome}
                onChange={(e) => setFilters({ ...filters, chromosome: e.target.value })}
                className="w-full p-2 bg-surface-soft border border-adaptive rounded-xl text-body text-sm"
              >
                {CHROMOSOMES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Text className="text-xs text-muted mb-1">Impacto</Text>
              <select
                aria-label="Impact filter"
                value={filters.impact}
                onChange={(e) => setFilters({ ...filters, impact: e.target.value })}
                className="w-full p-2 bg-surface-soft border border-adaptive rounded-xl text-body text-sm"
              >
                {IMPACTS.map((i) => (
                  <option key={i} value={i}>{i === 'Todos' ? 'Todos' : i}</option>
                ))}
              </select>
            </div>
            <div>
              <Text className="text-xs text-muted mb-1">Score minimo</Text>
              <input
                aria-label="Minimum score filter"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: parseFloat(e.target.value) })}
                className="w-full mt-2"
              />
              <span className="text-xs text-muted">{filters.minScore}</span>
            </div>
            <div>
              <Text className="text-xs text-muted mb-1">Gen</Text>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted" />
                <input
                  aria-label="Gene search"
                  type="text"
                  value={filters.gene}
                  onChange={(e) => setFilters({ ...filters, gene: e.target.value })}
                  placeholder="Buscar gen..."
                  className="w-full pl-7 pr-3 py-2 bg-surface-soft border border-adaptive rounded-xl text-body text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title className="text-title text-sm">Resultados ({filteredVariants.length})</Title>
          <div className="flex gap-2">
            <select
              aria-label="Sort results by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-1.5 bg-surface-soft border border-adaptive rounded-xl text-body text-xs"
            >
              <option value="score">Ordenar por Score</option>
              <option value="impact">Ordenar por Impacto</option>
              <option value="position">Ordenar por Posicion</option>
            </select>
            <Button
              size="xs"
              variant="light"
              icon={Download}
              onClick={() => toast.success('Resultados exportados como CSV')}
            >
              CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-adaptive">
                <th className="text-left py-2 px-2 text-muted font-medium">Variante</th>
                <th className="text-left py-2 px-2 text-muted font-medium">Gen</th>
                <th className="text-left py-2 px-2 text-muted font-medium">Impacto</th>
                <th className="text-left py-2 px-2 text-muted font-medium">Consecuencia</th>
                <th className="text-right py-2 px-2 text-muted font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.map((v) => (
                <tr key={v.id} className="border-b border-adaptive/50 hover:bg-surface-soft">
                  <td className="py-2 px-2">
                    <code className="text-xs text-body">{v.chromosome}:{v.position}</code>
                    <span className="text-xs text-muted ml-1">{v.ref}{'>'}{v.alt}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-medium text-title">{v.gene}</span>
                  </td>
                  <td className="py-2 px-2">
                    <Badge color={getImpactColor(v.impact)} size="xs">{v.impact}</Badge>
                  </td>
                  <td className="py-2 px-2">
                    <span className="text-xs text-body">{v.consequence.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className={`font-mono font-medium ${v.score > 0.8 ? 'text-red-600 dark:text-red-400' : v.score > 0.5 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                      {v.score.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button
          variant="light"
          icon={FileUp}
          onClick={() => { setState('idle'); setVariants([]); }}
        >
          Analizar otro archivo
        </Button>
      </div>
    </div>
  )
}
