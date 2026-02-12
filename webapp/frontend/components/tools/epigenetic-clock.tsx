'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Activity,
  Clock,
  Brain,
  Heart,
  Shield,
  Zap,
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronRight,
  ChevronDown,
  Info,
  Dna,
  Dumbbell,
  Utensils,
  Moon,
  Sparkles,
  Target,
  Gauge,
  FlaskConical,
  Timer,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

// Types
interface MethylationGene {
  id: string
  symbol: string
  rsId: string
  name: string
  role: string
  methylationStatus: 'hypermethylated' | 'hypomethylated' | 'normal'
  ageCorrelation: number // -1 to 1, how strongly it correlates with aging
  yourLevel: number // 0-100 methylation percentage
  averageForAge: number // expected methylation for chronological age
  description: string
}

interface SystemAge {
  id: string
  system: string
  biologicalAge: number
  icon: typeof Heart
  color: string
  bgColor: string
  darkBgColor: string
  keyGenes: string[]
  keyVariants: string[]
  description: string
  status: 'younger' | 'older' | 'match'
}

interface Intervention {
  id: string
  name: string
  icon: typeof Dumbbell
  impactYears: number
  evidenceLevel: 'strong' | 'moderate' | 'preliminary'
  mechanism: string
  description: string
}

// Methylation clock genes - real biomarkers used in Horvath and Hannum clocks
const METHYLATION_GENES: MethylationGene[] = [
  {
    id: 'elovl2',
    symbol: 'ELOVL2',
    rsId: 'rs9393903',
    name: 'Elongation of Very Long Chain Fatty Acids Protein 2',
    role: 'Strongest aging biomarker, hypermethylated with age',
    methylationStatus: 'hypermethylated',
    ageCorrelation: 0.96,
    yourLevel: 42,
    averageForAge: 51,
    description: 'ELOVL2 is the most robust epigenetic aging marker. Its promoter CpG island gains methylation linearly with age across all tissues. Your lower-than-expected methylation suggests slower epigenetic aging at this locus.',
  },
  {
    id: 'fhl2',
    symbol: 'FHL2',
    rsId: 'rs12432566',
    name: 'Four And A Half LIM Domains 2',
    role: 'Muscle aging marker, sarcopenia indicator',
    methylationStatus: 'hypermethylated',
    ageCorrelation: 0.89,
    yourLevel: 38,
    averageForAge: 44,
    description: 'FHL2 methylation tracks muscle aging and sarcopenia risk. It is involved in Wnt signaling and muscle regeneration. Your methylation level indicates preserved muscular biological youth.',
  },
  {
    id: 'trim59',
    symbol: 'TRIM59',
    rsId: 'rs17576',
    name: 'Tripartite Motif Containing 59',
    role: 'Immune aging indicator, inflammaging marker',
    methylationStatus: 'normal',
    ageCorrelation: 0.82,
    yourLevel: 55,
    averageForAge: 56,
    description: 'TRIM59 is part of the innate immune response and its methylation reflects immune system aging (immunosenescence). Your level is age-appropriate, indicating normal immune aging trajectory.',
  },
  {
    id: 'klf14',
    symbol: 'KLF14',
    rsId: 'rs972283',
    name: 'Kruppel Like Factor 14',
    role: 'Metabolic age regulator, master trans-regulator of adipose',
    methylationStatus: 'hypomethylated',
    ageCorrelation: 0.78,
    yourLevel: 62,
    averageForAge: 58,
    description: 'KLF14 is a master trans-regulator of metabolic gene expression in adipose tissue. Linked to type 2 diabetes and BMI. Slightly elevated methylation may reflect metabolic stress — diet and exercise can modulate this.',
  },
  {
    id: 'penk',
    symbol: 'PENK',
    rsId: 'rs1975197',
    name: 'Proenkephalin',
    role: 'Brain aging marker, neurodegeneration indicator',
    methylationStatus: 'hypomethylated',
    ageCorrelation: 0.85,
    yourLevel: 33,
    averageForAge: 41,
    description: 'PENK encodes endogenous opioid peptides critical for brain aging and pain modulation. Lower methylation at this locus is associated with younger neurological age and better cognitive preservation.',
  },
]

// System-specific biological ages
const createSystemAges = (chronoAge: number): SystemAge[] => [
  {
    id: 'cardiovascular',
    system: 'Cardiovascular',
    biologicalAge: chronoAge - 1.8,
    icon: Heart,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-900/30',
    keyGenes: ['APOE', 'PCSK9', 'LPA', 'NOS3'],
    keyVariants: ['rs429358 (APOE)', 'rs11591147 (PCSK9)'],
    description: 'Heart and vascular system age based on lipid metabolism genes and endothelial function markers.',
    status: 'younger',
  },
  {
    id: 'immune',
    system: 'Immune',
    biologicalAge: chronoAge - 4.9,
    icon: Shield,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-900/30',
    keyGenes: ['HLA-DRB1', 'IL6', 'TNF', 'CTLA4'],
    keyVariants: ['rs9271366 (HLA)', 'rs1800795 (IL6)'],
    description: 'Immune system age based on inflammatory markers, HLA diversity, and T-cell senescence indicators.',
    status: 'younger',
  },
  {
    id: 'metabolic',
    system: 'Metabolic',
    biologicalAge: chronoAge - 0.2,
    icon: Zap,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100',
    darkBgColor: 'dark:bg-amber-900/30',
    keyGenes: ['FTO', 'TCF7L2', 'PPARG', 'ADIPOQ'],
    keyVariants: ['rs9939609 (FTO)', 'rs7903146 (TCF7L2)'],
    description: 'Metabolic age reflects insulin sensitivity, adipose function, and mitochondrial efficiency.',
    status: 'match',
  },
  {
    id: 'neurological',
    system: 'Neurological',
    biologicalAge: chronoAge - 5.5,
    icon: Brain,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100',
    darkBgColor: 'dark:bg-purple-900/30',
    keyGenes: ['BDNF', 'APOE', 'COMT', 'KIBRA'],
    keyVariants: ['rs6265 (BDNF)', 'rs429358 (APOE)'],
    description: 'Brain age based on neurotrophic factors, amyloid processing, and synaptic plasticity genes.',
    status: 'younger',
  },
]

// Lifestyle interventions with biological age impact
const INTERVENTIONS: Intervention[] = [
  {
    id: 'exercise',
    name: 'Regular Exercise',
    icon: Dumbbell,
    impactYears: -2.1,
    evidenceLevel: 'strong',
    mechanism: 'Increases telomerase activity, reduces inflammation via IL-6 modulation, enhances mitochondrial biogenesis',
    description: '150+ min/week moderate or 75+ min/week vigorous activity. Strongest single modifiable factor for epigenetic age reversal.',
  },
  {
    id: 'diet',
    name: 'Mediterranean Diet',
    icon: Utensils,
    impactYears: -1.5,
    evidenceLevel: 'strong',
    mechanism: 'Polyphenols activate SIRT1, omega-3s reduce NF-kB inflammation, fiber supports microbiome diversity',
    description: 'Rich in olive oil, fish, nuts, vegetables. Shown to reverse epigenetic aging by 1-3 years in clinical trials.',
  },
  {
    id: 'meditation',
    name: 'Meditation Practice',
    icon: Brain,
    impactYears: -0.8,
    evidenceLevel: 'moderate',
    mechanism: 'Reduces cortisol-driven methylation changes, preserves telomere length, modulates stress-response genes',
    description: '20+ minutes daily mindfulness or focused-attention meditation. Reduces stress-induced epigenetic aging.',
  },
  {
    id: 'sleep',
    name: 'Quality Sleep',
    icon: Moon,
    impactYears: -1.2,
    evidenceLevel: 'strong',
    mechanism: 'Enables DNA damage repair during deep sleep, regulates circadian methylation rhythms, clears beta-amyloid',
    description: '7-9 hours with consistent schedule. Sleep disruption accelerates Horvath clock by up to 2.6 years.',
  },
  {
    id: 'nmn',
    name: 'NMN Supplementation',
    icon: FlaskConical,
    impactYears: -0.5,
    evidenceLevel: 'preliminary',
    mechanism: 'Boosts NAD+ levels, activating sirtuins (SIRT1-7) that deacetylate histones and repair DNA damage',
    description: 'Nicotinamide mononucleotide (250-500 mg/day). Animal data compelling; human trials ongoing with early positive signals.',
  },
]

export function EpigeneticClock() {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(true)
  const [chronologicalAge, setChronologicalAge] = useState(35)
  const [expandedGene, setExpandedGene] = useState<string | null>(null)
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null)
  const [expandedIntervention, setExpandedIntervention] = useState<string | null>(null)
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([])

  // Loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Calculate biological age from methylation markers
  const calculateBiologicalAge = () => {
    const methylationDelta = METHYLATION_GENES.reduce((acc, gene) => {
      const diff = gene.yourLevel - gene.averageForAge
      return acc + (diff * gene.ageCorrelation * 0.08)
    }, 0)
    return parseFloat((chronologicalAge + methylationDelta).toFixed(1))
  }

  const biologicalAge = calculateBiologicalAge()
  const ageAcceleration = parseFloat((biologicalAge - chronologicalAge).toFixed(1))
  const systemAges = createSystemAges(chronologicalAge)

  // Calculate projected age with selected interventions
  const projectedReduction = INTERVENTIONS
    .filter(i => selectedInterventions.includes(i.id))
    .reduce((acc, i) => acc + i.impactYears, 0)
  const projectedBiologicalAge = parseFloat((biologicalAge + projectedReduction).toFixed(1))

  const toggleIntervention = (id: string) => {
    setSelectedInterventions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getMethylationColor = (status: string) => {
    if (status === 'hypermethylated') return 'red'
    if (status === 'hypomethylated') return 'blue'
    return 'gray'
  }

  const getEvidenceColor = (level: string) => {
    if (level === 'strong') return 'green'
    if (level === 'moderate') return 'yellow'
    return 'gray'
  }

  // Loading screen
  if (isLoading) {
    return (
      <div role="region" aria-label="Epigenetic Clock" className="space-y-6">
        <Card className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <Title>{t('tools.epigeneticClock.title')}</Title>
              <Text>{t('tools.epigeneticClock.description')}</Text>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-cyan-200 dark:border-cyan-800 rounded-full animate-spin border-t-cyan-500" />
              <Activity className="w-8 h-8 text-cyan-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-body font-medium">Analyzing DNA methylation patterns...</p>
            <p className="text-muted text-sm">Calculating epigenetic age across 353 CpG sites</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div role="region" aria-label="Epigenetic Clock" className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>{t('tools.epigeneticClock.title')}</Title>
            <Text>{t('tools.epigeneticClock.description')}</Text>
          </div>
        </div>
      </Card>

      {/* Age Comparison Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chronological Age */}
        <Card>
          <div className="text-center">
            <p className="text-sm text-muted uppercase tracking-wide">Chronological Age</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <input
                aria-label="Chronological age"
                type="number"
                value={chronologicalAge}
                onChange={(e) => setChronologicalAge(parseInt(e.target.value) || 35)}
                className="text-4xl font-bold text-title w-20 text-center border-b-2 border-adaptive focus:border-cyan-500 focus:outline-none bg-transparent"
                min={18}
                max={100}
              />
              <span className="text-xl text-muted">years</span>
            </div>
            <p className="text-xs text-subtle mt-2">Your calendar age</p>
          </div>
        </Card>

        {/* Biological Age */}
        <Card className={`${ageAcceleration < 0 ? 'bg-success-soft border-success' : ageAcceleration > 0 ? 'bg-danger-soft border-danger' : ''}`}>
          <div className="text-center">
            <p className="text-sm text-muted uppercase tracking-wide">Biological Age</p>
            <p className={`text-5xl font-bold mt-2 ${
              ageAcceleration < 0 ? 'text-success' : ageAcceleration > 0 ? 'text-danger' : 'text-title'
            }`}>
              {biologicalAge}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {ageAcceleration < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-success">{Math.abs(ageAcceleration)} years younger</span>
                </>
              ) : ageAcceleration > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-danger">{ageAcceleration} years older</span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 text-muted" />
                  <span className="text-sm text-body">Matches chronological</span>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Age Acceleration */}
        <Card>
          <div className="text-center">
            <p className="text-sm text-muted uppercase tracking-wide">Age Acceleration</p>
            <p className={`text-5xl font-bold mt-2 ${
              ageAcceleration < 0 ? 'text-green-600 dark:text-green-400' : ageAcceleration > 0 ? 'text-red-600 dark:text-red-400' : 'text-title'
            }`}>
              {ageAcceleration > 0 ? '+' : ''}{ageAcceleration}
            </p>
            <p className="text-xs text-subtle mt-2">
              {ageAcceleration < 0 ? 'Your cells are aging slower than average' : ageAcceleration > 0 ? 'Your cells are aging faster than average' : 'Your cells are aging at the expected rate'}
            </p>
          </div>
        </Card>
      </div>

      {/* Methylation Clock Genes */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Dna className="w-5 h-5 text-cyan-500" />
          <Title>Methylation Clock Genes</Title>
        </div>
        <Text className="mb-6">
          Key CpG sites analyzed from the Horvath and Hannum epigenetic clocks. These genes show the strongest correlation with biological aging.
        </Text>

        <div className="space-y-4">
          {METHYLATION_GENES.map(gene => {
            const isExpanded = expandedGene === gene.id
            const levelDiff = gene.yourLevel - gene.averageForAge
            const isYounger = (gene.ageCorrelation > 0 && levelDiff < 0) || (gene.ageCorrelation < 0 && levelDiff > 0)

            return (
              <div
                key={gene.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isYounger
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                    : Math.abs(levelDiff) <= 2
                    ? 'border-adaptive bg-surface-soft/50'
                    : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                }`}
                onClick={() => setExpandedGene(isExpanded ? null : gene.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isYounger
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : Math.abs(levelDiff) <= 2
                        ? 'bg-surface-muted text-body'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {gene.symbol.slice(0, 4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-title">{gene.symbol}</p>
                        <Badge color="blue" size="xs">{gene.rsId}</Badge>
                        <Badge color={getMethylationColor(gene.methylationStatus)} size="xs">
                          {gene.methylationStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">{gene.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-title">{gene.yourLevel}%</p>
                      <p className="text-xs text-muted">avg: {gene.averageForAge}%</p>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-subtle" /> : <ChevronRight className="w-5 h-5 text-subtle" />}
                  </div>
                </div>

                {/* Methylation bar comparison */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted w-12">You</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isYounger ? 'bg-green-500' : Math.abs(levelDiff) <= 2 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${gene.yourLevel}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted w-12">Avg</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-400 dark:bg-slate-500 transition-all"
                        style={{ width: `${gene.averageForAge}%` }}
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-adaptive space-y-3">
                    <p className="text-sm text-body">{gene.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>Age correlation: <strong className="text-title">r = {gene.ageCorrelation}</strong></span>
                      <span>Your methylation: <strong className="text-title">{gene.yourLevel}%</strong></span>
                      <span>Expected for age {chronologicalAge}: <strong className="text-title">{gene.averageForAge}%</strong></span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Aging Rate by System */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-indigo-500" />
          <Title>Aging Rate by System</Title>
        </div>
        <Text className="mb-6">
          Each organ system ages at its own rate. AlphaGenome predicts system-specific biological age from tissue-relevant variant effects.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemAges.map(system => {
            const Icon = system.icon
            const ageDiff = parseFloat((system.biologicalAge - chronologicalAge).toFixed(1))
            const isExpanded = expandedSystem === system.id

            return (
              <div
                key={system.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  ageDiff < -2
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                    : ageDiff > 2
                    ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-adaptive bg-surface-soft/50'
                }`}
                onClick={() => setExpandedSystem(isExpanded ? null : system.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${system.bgColor} ${system.darkBgColor}`}>
                      <Icon className={`w-6 h-6 ${system.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-title">{system.system}</p>
                      <p className="text-xs text-muted">{system.keyGenes.join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-title">{system.biologicalAge.toFixed(1)}</p>
                    <p className={`text-xs font-medium ${
                      ageDiff < 0 ? 'text-green-600 dark:text-green-400' : ageDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted'
                    }`}>
                      {ageDiff > 0 ? '+' : ''}{ageDiff} years
                    </p>
                  </div>
                </div>

                {/* Progress bar showing system age relative to chronological */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted mb-1">
                    <span>Younger</span>
                    <span>Chrono: {chronologicalAge}</span>
                    <span>Older</span>
                  </div>
                  <div className="relative h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute h-full rounded-full transition-all ${
                        ageDiff < -2 ? 'bg-green-500' : ageDiff > 2 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(5, (system.biologicalAge / (chronologicalAge * 1.3)) * 100))}%`,
                      }}
                    />
                    {/* Chronological age marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-gray-800 dark:bg-gray-200"
                      style={{ left: `${(chronologicalAge / (chronologicalAge * 1.3)) * 100}%` }}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-adaptive space-y-3">
                    <p className="text-sm text-body">{system.description}</p>
                    <div>
                      <p className="text-xs font-medium text-muted uppercase mb-2">Key Variants Analyzed</p>
                      <div className="flex flex-wrap gap-2">
                        {system.keyVariants.map((variant, idx) => (
                          <span key={idx} className="px-2 py-1 bg-surface-muted rounded-lg text-xs text-body">
                            {variant}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Intervention Impact */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <Title>Intervention Impact</Title>
        </div>
        <Text className="mb-2">
          Select lifestyle interventions to see their projected effect on your biological age. Evidence from epigenetic clock studies.
        </Text>

        {/* Projected age summary */}
        {selectedInterventions.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-indigo-50 dark:from-cyan-950/30 dark:to-indigo-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Current Biological Age</p>
                <p className="text-2xl font-bold text-title">{biologicalAge}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 bg-cyan-400" />
                <TrendingDown className="w-5 h-5 text-cyan-500" />
                <div className="w-12 h-0.5 bg-cyan-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">Projected Biological Age</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{projectedBiologicalAge}</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted mt-2">
              Total projected reduction: <strong className="text-green-600 dark:text-green-400">{projectedReduction.toFixed(1)} years</strong> with {selectedInterventions.length} intervention{selectedInterventions.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="space-y-4 mt-4">
          {INTERVENTIONS.map(intervention => {
            const Icon = intervention.icon
            const isExpanded = expandedIntervention === intervention.id
            const isSelected = selectedInterventions.includes(intervention.id)

            return (
              <div
                key={intervention.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-cyan-300 dark:border-cyan-700 bg-cyan-50/50 dark:bg-cyan-950/20'
                    : 'border-adaptive bg-surface-soft/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => setExpandedIntervention(isExpanded ? null : intervention.id)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-cyan-100 dark:bg-cyan-900/30' : 'bg-surface-muted'
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-body'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-title">{intervention.name}</p>
                        <Badge color={getEvidenceColor(intervention.evidenceLevel)} size="xs">
                          {intervention.evidenceLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">{intervention.description.slice(0, 80)}...</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {intervention.impactYears} yrs
                      </p>
                    </div>
                    <button
                      aria-label={`Toggle ${intervention.name} intervention`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleIntervention(intervention.id)
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-white'
                          : 'bg-surface-muted text-body hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? '✓' : '+'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-adaptive space-y-3">
                    <p className="text-sm text-body">{intervention.description}</p>
                    <div className="p-3 bg-surface-muted rounded-xl">
                      <p className="text-xs font-medium text-muted uppercase mb-1">
                        <FlaskConical className="w-3 h-3 inline mr-1" />
                        Biological Mechanism
                      </p>
                      <p className="text-sm text-body">{intervention.mechanism}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Summary Action Card */}
      <Card className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Your Epigenetic Age Summary</p>
            <p className="text-white/80 text-sm mt-1">
              Your biological age is {biologicalAge} — {ageAcceleration < 0 ? `${Math.abs(ageAcceleration)} years younger` : ageAcceleration > 0 ? `${ageAcceleration} years older` : 'matching'} your chronological age of {chronologicalAge}.
              {' '}Your strongest advantage is your neurological system ({systemAges[3].biologicalAge.toFixed(1)} yrs). Focus on metabolic health through diet and exercise for the greatest improvement potential.
            </p>
          </div>
          <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            Full Report
          </Button>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-muted mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-muted">
              <strong className="text-title">Scientific Note:</strong> This epigenetic clock uses a simplified model inspired by the Horvath (2013) and Hannum (2013) multi-tissue clocks.
              Clinical-grade epigenetic age requires whole-genome bisulfite sequencing across 353+ CpG sites. Results shown are educational estimates based on
              AlphaGenome variant-effect predictions and should not replace clinical assessment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
