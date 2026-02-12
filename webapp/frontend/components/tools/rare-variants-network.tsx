'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge } from '@tremor/react'
import {
  Share2,
  Search,
  Globe,
  Users,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  Dna,
  Clock,
  MapPin,
  Activity,
  Loader2,
  Heart,
  FileSearch,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

// Types
interface RareVariant {
  id: string
  gene: string
  rsId: string
  frequency: number
  matchesWorldwide: number
  condition: string
  conditionEs: string
  category: 'carrier' | 'risk' | 'protective' | 'unknown'
  chromosome: string
  position: string
  refAllele: string
  altAllele: string
  populations: PopulationDistribution[]
  alphaGenomePrediction: AlphaGenomePrediction
}

interface PopulationDistribution {
  population: string
  populationEs: string
  frequency: number
  note: string
  noteEs: string
}

interface AlphaGenomePrediction {
  expressionChange: string
  expressionChangeEs: string
  splicingEffect: string
  splicingEffectEs: string
  regulatoryImpact: string
  regulatoryImpactEs: string
  confidenceScore: number
}

interface DiagnosticCase {
  id: string
  yearsUndiagnosed: number
  symptoms: string[]
  symptomsEs: string[]
  variantFound: string
  resolution: string
  resolutionEs: string
}

interface CommunityStats {
  totalMembers: number
  totalVariantsShared: number
  matchesMade: number
  lastMatchTime: string
  lastMatchTimeEs: string
  countriesRepresented: number
}

// Rarity scale
interface RarityLevel {
  label: string
  labelEs: string
  range: string
  color: string
  bgColor: string
  percentage: number
}

const RARITY_SCALE: RarityLevel[] = [
  { label: 'Common', labelEs: 'Comun', range: '>5%', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', percentage: 100 },
  { label: 'Low frequency', labelEs: 'Baja frecuencia', range: '1-5%', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', percentage: 75 },
  { label: 'Rare', labelEs: 'Rara', range: '0.1-1%', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', percentage: 50 },
  { label: 'Very rare', labelEs: 'Muy rara', range: '0.01-0.1%', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', percentage: 25 },
  { label: 'Ultra-rare', labelEs: 'Ultra-rara', range: '<0.01%', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', percentage: 10 },
]

// Demo rare variants
const DEMO_VARIANTS: RareVariant[] = [
  {
    id: 'cftr',
    gene: 'CFTR',
    rsId: 'rs75527207',
    frequency: 0.0003,
    matchesWorldwide: 15,
    condition: 'Cystic fibrosis carrier',
    conditionEs: 'Portador de fibrosis quistica',
    category: 'carrier',
    chromosome: '7',
    position: '117,559,590',
    refAllele: 'G',
    altAllele: 'A',
    populations: [
      { population: 'Northern European', populationEs: 'Europa del Norte', frequency: 0.0008, note: 'Highest prevalence — founder effect in Celtic/Nordic populations', noteEs: 'Mayor prevalencia — efecto fundador en poblaciones celtas/nordicas' },
      { population: 'Southern European', populationEs: 'Europa del Sur', frequency: 0.0004, note: 'Moderate prevalence', noteEs: 'Prevalencia moderada' },
      { population: 'East Asian', populationEs: 'Asia Oriental', frequency: 0.00001, note: 'Extremely rare', noteEs: 'Extremadamente rara' },
      { population: 'African', populationEs: 'Africana', frequency: 0.00005, note: 'Very rare', noteEs: 'Muy rara' },
    ],
    alphaGenomePrediction: {
      expressionChange: 'Reduced CFTR expression by 35% in lung epithelium',
      expressionChangeEs: 'Reduccion de expresion CFTR del 35% en epitelio pulmonar',
      splicingEffect: 'Minor splicing alteration in exon 11 — partial exon skipping predicted',
      splicingEffectEs: 'Alteracion menor de splicing en exon 11 — se predice salto parcial de exon',
      regulatoryImpact: 'Disrupts enhancer binding site for transcription factor FOXA2',
      regulatoryImpactEs: 'Interrumpe sitio de union del enhancer para factor de transcripcion FOXA2',
      confidenceScore: 92,
    },
  },
  {
    id: 'hexa',
    gene: 'HEXA',
    rsId: 'rs121907970',
    frequency: 0.00008,
    matchesWorldwide: 4,
    condition: 'Tay-Sachs carrier',
    conditionEs: 'Portador de Tay-Sachs',
    category: 'carrier',
    chromosome: '15',
    position: '72,638,892',
    refAllele: 'T',
    altAllele: 'C',
    populations: [
      { population: 'Ashkenazi Jewish', populationEs: 'Judia Ashkenazi', frequency: 0.003, note: 'Founder mutation — 1 in 30 are carriers', noteEs: 'Mutacion fundadora — 1 de cada 30 son portadores' },
      { population: 'French Canadian', populationEs: 'Franco-Canadiense', frequency: 0.001, note: 'Elevated due to founder effect in Quebec', noteEs: 'Elevada por efecto fundador en Quebec' },
      { population: 'General European', populationEs: 'Europea General', frequency: 0.00003, note: 'Very rare outside specific populations', noteEs: 'Muy rara fuera de poblaciones especificas' },
    ],
    alphaGenomePrediction: {
      expressionChange: 'HEXA enzyme activity reduced by 50% — carrier-level reduction',
      expressionChangeEs: 'Actividad enzimatica HEXA reducida en 50% — reduccion a nivel de portador',
      splicingEffect: 'No significant splicing alteration predicted',
      splicingEffectEs: 'No se predice alteracion significativa de splicing',
      regulatoryImpact: 'Missense variant affects protein folding in active site region',
      regulatoryImpactEs: 'Variante missense afecta plegamiento proteico en la region del sitio activo',
      confidenceScore: 88,
    },
  },
  {
    id: 'gjb2',
    gene: 'GJB2',
    rsId: 'rs80338939',
    frequency: 0.001,
    matchesWorldwide: 50,
    condition: 'Hearing loss carrier',
    conditionEs: 'Portador de perdida auditiva',
    category: 'carrier',
    chromosome: '13',
    position: '20,763,612',
    refAllele: 'C',
    altAllele: 'T',
    populations: [
      { population: 'Mediterranean', populationEs: 'Mediterranea', frequency: 0.003, note: 'Most common in Southern Europe, especially Spain and Italy', noteEs: 'Mas comun en el sur de Europa, especialmente Espana e Italia' },
      { population: 'Northern European', populationEs: 'Europa del Norte', frequency: 0.001, note: 'Moderate prevalence', noteEs: 'Prevalencia moderada' },
      { population: 'East Asian', populationEs: 'Asia Oriental', frequency: 0.0008, note: 'Different GJB2 mutations more common here', noteEs: 'Otras mutaciones GJB2 son mas comunes aqui' },
      { population: 'Sub-Saharan African', populationEs: 'Africa Subsahariana', frequency: 0.0002, note: 'Less prevalent', noteEs: 'Menos prevalente' },
    ],
    alphaGenomePrediction: {
      expressionChange: 'Connexin 26 protein levels reduced by 45% in cochlear cells',
      expressionChangeEs: 'Niveles de proteina Conexina 26 reducidos en 45% en celulas cocleares',
      splicingEffect: 'Frameshift predicted — truncated protein at amino acid 35',
      splicingEffectEs: 'Se predice cambio de marco de lectura — proteina truncada en aminoacido 35',
      regulatoryImpact: 'Loss of gap junction function in inner ear sensory epithelium',
      regulatoryImpactEs: 'Perdida de funcion de union gap en epitelio sensorial del oido interno',
      confidenceScore: 95,
    },
  },
  {
    id: 'brca2',
    gene: 'BRCA2',
    rsId: 'rs80359550',
    frequency: 0.0001,
    matchesWorldwide: 5,
    condition: 'Cancer risk variant',
    conditionEs: 'Variante de riesgo de cancer',
    category: 'risk',
    chromosome: '13',
    position: '32,929,387',
    refAllele: 'AGTC',
    altAllele: 'A',
    populations: [
      { population: 'Ashkenazi Jewish', populationEs: 'Judia Ashkenazi', frequency: 0.001, note: 'One of three BRCA founder mutations in this population', noteEs: 'Una de tres mutaciones BRCA fundadoras en esta poblacion' },
      { population: 'Icelandic', populationEs: 'Islandesa', frequency: 0.0006, note: 'Founder effect — 999del5 is the specific Icelandic mutation', noteEs: 'Efecto fundador — 999del5 es la mutacion islandesa especifica' },
      { population: 'General European', populationEs: 'Europea General', frequency: 0.00005, note: 'Very rare in general population', noteEs: 'Muy rara en la poblacion general' },
    ],
    alphaGenomePrediction: {
      expressionChange: 'BRCA2 protein expression reduced by 60% — haploinsufficiency',
      expressionChangeEs: 'Expresion de proteina BRCA2 reducida en 60% — haploinsuficiencia',
      splicingEffect: 'Deletion causes frameshift and premature stop codon in exon 11',
      splicingEffectEs: 'La delecion causa cambio de marco y codon de parada prematuro en exon 11',
      regulatoryImpact: 'Loss of DNA double-strand break repair via homologous recombination',
      regulatoryImpactEs: 'Perdida de reparacion de roturas de doble cadena de ADN por recombinacion homologa',
      confidenceScore: 97,
    },
  },
  {
    id: 'scn5a',
    gene: 'SCN5A',
    rsId: 'rs199473282',
    frequency: 0.00002,
    matchesWorldwide: 1,
    condition: 'Cardiac arrhythmia',
    conditionEs: 'Arritmia cardiaca',
    category: 'risk',
    chromosome: '3',
    position: '38,592,065',
    refAllele: 'G',
    altAllele: 'A',
    populations: [
      { population: 'Southeast Asian', populationEs: 'Sudeste Asiatico', frequency: 0.00008, note: 'Highest prevalence — associated with Brugada syndrome in Thailand', noteEs: 'Mayor prevalencia — asociada con sindrome de Brugada en Tailandia' },
      { population: 'Japanese', populationEs: 'Japonesa', frequency: 0.00005, note: 'Notable prevalence relative to global average', noteEs: 'Prevalencia notable relativa al promedio global' },
      { population: 'European', populationEs: 'Europea', frequency: 0.000008, note: 'Extremely rare — fewer than 1 in 100,000', noteEs: 'Extremadamente rara — menos de 1 en 100,000' },
    ],
    alphaGenomePrediction: {
      expressionChange: 'Sodium channel Nav1.5 conductance reduced by 70%',
      expressionChangeEs: 'Conductancia del canal de sodio Nav1.5 reducida en 70%',
      splicingEffect: 'Missense variant in voltage-sensing domain — no splicing alteration',
      splicingEffectEs: 'Variante missense en dominio sensor de voltaje — sin alteracion de splicing',
      regulatoryImpact: 'Altered cardiac action potential duration — risk of Brugada syndrome pattern',
      regulatoryImpactEs: 'Duracion alterada del potencial de accion cardiaco — riesgo de patron de sindrome de Brugada',
      confidenceScore: 85,
    },
  },
]

// Demo diagnostic odyssey cases
const DIAGNOSTIC_CASES: DiagnosticCase[] = [
  {
    id: 'case1',
    yearsUndiagnosed: 7,
    symptoms: ['Chronic fatigue', 'Muscle weakness', 'Recurrent infections'],
    symptomsEs: ['Fatiga cronica', 'Debilidad muscular', 'Infecciones recurrentes'],
    variantFound: 'MOGS (rs121434580)',
    resolution: 'Matched with 2 other patients who shared the same ultra-rare MOGS variant. Diagnosis: CDG-IIb (Congenital Disorder of Glycosylation). Treatment initiated.',
    resolutionEs: 'Emparejado con 2 otros pacientes que compartian la misma variante ultra-rara de MOGS. Diagnostico: CDG-IIb (Trastorno Congenito de Glicosilacion). Tratamiento iniciado.',
  },
  {
    id: 'case2',
    yearsUndiagnosed: 12,
    symptoms: ['Progressive vision loss', 'Balance issues', 'Hearing decline'],
    symptomsEs: ['Perdida progresiva de vision', 'Problemas de equilibrio', 'Disminucion auditiva'],
    variantFound: 'USH2A (rs80338903)',
    resolution: 'Connected with a family in Norway carrying the same variant. Joint clinical study confirmed Usher syndrome type II. Gene therapy trial enrollment offered.',
    resolutionEs: 'Conectado con una familia en Noruega portadora de la misma variante. Estudio clinico conjunto confirmo sindrome de Usher tipo II. Ofrecida inscripcion en ensayo de terapia genica.',
  },
  {
    id: 'case3',
    yearsUndiagnosed: 4,
    symptoms: ['Unexplained seizures', 'Developmental delay', 'Movement disorder'],
    symptomsEs: ['Convulsiones inexplicables', 'Retraso del desarrollo', 'Trastorno del movimiento'],
    variantFound: 'GNAO1 (rs587777613)',
    resolution: 'Only 1 other person worldwide found with this variant. Virtual meeting between families led to shared symptom tracking and identification of effective medication combination.',
    resolutionEs: 'Solo 1 otra persona en el mundo encontrada con esta variante. Reunion virtual entre familias llevo a seguimiento compartido de sintomas e identificacion de combinacion efectiva de medicacion.',
  },
]

// Community stats
const COMMUNITY_STATS: CommunityStats = {
  totalMembers: 48_372,
  totalVariantsShared: 2_847_193,
  matchesMade: 1_247,
  lastMatchTime: '23 minutes ago',
  lastMatchTimeEs: 'Hace 23 minutos',
  countriesRepresented: 94,
}

export function RareVariantsNetwork() {
  const t = useTranslations('tools.rareVariants')
  const [loading, setLoading] = useState(true)
  const [variants, setVariants] = useState<RareVariant[]>([])
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null)
  const [expandedCase, setExpandedCase] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'variants' | 'odyssey' | 'community'>('variants')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      setVariants(DEMO_VARIANTS)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const getRarityLevel = (frequency: number): RarityLevel => {
    if (frequency > 0.05) return RARITY_SCALE[0]
    if (frequency > 0.01) return RARITY_SCALE[1]
    if (frequency > 0.001) return RARITY_SCALE[2]
    if (frequency > 0.0001) return RARITY_SCALE[3]
    return RARITY_SCALE[4]
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'carrier': return 'amber'
      case 'risk': return 'red'
      case 'protective': return 'green'
      default: return 'gray'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'carrier': return 'Portador'
      case 'risk': return 'Riesgo'
      case 'protective': return 'Protectora'
      default: return 'Desconocida'
    }
  }

  const formatFrequency = (freq: number): string => {
    if (freq >= 0.01) return `${(freq * 100).toFixed(1)}%`
    if (freq >= 0.001) return `${(freq * 100).toFixed(2)}%`
    if (freq >= 0.0001) return `${(freq * 100).toFixed(3)}%`
    return `${(freq * 100).toFixed(4)}%`
  }

  const handleShareVariant = (variant: RareVariant) => {
    const text = `I carry a rare variant in ${variant.gene} (${variant.rsId}) found in only ${variant.matchesWorldwide} people worldwide. Frequency: ${formatFrequency(variant.frequency)}. #RareVariants #AlphaGenome`
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles!')
  }

  const filteredVariants = variants.filter(
    (v) =>
      v.gene.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.rsId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.conditionEs.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-full animate-spin opacity-20"></div>
            <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <Share2 className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
          </div>
          <Title className="text-title">Escaneando variantes raras en tu genoma...</Title>
          <Text className="text-body mt-2">Buscando variantes ultra-raras y conexiones globales</Text>
        </div>
      </Card>
    )
  }

  return (
    <div role="region" aria-label="Rare Variants Network" className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title className="text-title">{t('title')}</Title>
            <Text className="text-body">{t('description')}</Text>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Badge color="orange" size="sm">
            {variants.length} variantes raras detectadas
          </Badge>
          <Badge color="amber" size="sm">
            {variants.reduce((sum, v) => sum + v.matchesWorldwide, 0)} coincidencias globales
          </Badge>
        </div>
      </Card>

      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto">
        <Button
          size="xs"
          variant={activeTab === 'variants' ? 'primary' : 'secondary'}
          icon={Dna}
          onClick={() => setActiveTab('variants')}
        >
          Tus Variantes
        </Button>
        <Button
          size="xs"
          variant={activeTab === 'odyssey' ? 'primary' : 'secondary'}
          icon={FileSearch}
          onClick={() => setActiveTab('odyssey')}
        >
          Odisea Diagnostica
        </Button>
        <Button
          size="xs"
          variant={activeTab === 'community' ? 'primary' : 'secondary'}
          icon={Users}
          onClick={() => setActiveTab('community')}
        >
          Comunidad
        </Button>
      </div>

      {/* === VARIANTS TAB === */}
      {activeTab === 'variants' && (
        <>
          {/* Search bar */}
          <Card>
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted flex-shrink-0" />
              <input
                aria-label="Search by gene, rsID or condition"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por gen, rsID o condicion..."
                className="w-full bg-transparent border-none outline-none text-title placeholder:text-muted text-sm"
              />
            </div>
          </Card>

          {/* Variant Rarity Scale */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-amber-500" />
              <Title className="text-title">Escala de Rareza de Variantes</Title>
            </div>
            <div className="space-y-3">
              {RARITY_SCALE.map((level, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-28 text-right">
                    <span className={`text-sm font-medium ${level.color}`}>{level.labelEs}</span>
                  </div>
                  <div className="flex-1 h-6 bg-surface-soft rounded-full overflow-hidden relative">
                    <div
                      className={`h-full ${level.bgColor} rounded-full transition-all duration-700`}
                      style={{ width: `${level.percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-body">
                      {level.range}
                    </span>
                  </div>
                  <div className="w-24">
                    {variants.filter((v) => getRarityLevel(v.frequency) === level).length > 0 && (
                      <Badge color={getCategoryColor('carrier')} size="xs">
                        {variants.filter((v) => getRarityLevel(v.frequency) === level).length} tuyas
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Your Rare Variants */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Dna className="w-5 h-5 text-orange-500" />
              <Title className="text-title">Tus Variantes Raras</Title>
              <Badge color="orange" size="xs">{filteredVariants.length} detectadas</Badge>
            </div>
            <div className="space-y-3">
              {filteredVariants.map((variant) => {
                const rarity = getRarityLevel(variant.frequency)
                const isExpanded = expandedVariant === variant.id

                return (
                  <div key={variant.id} className="border border-adaptive rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedVariant(isExpanded ? null : variant.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-surface-soft transition-colors text-left"
                    >
                      <div className={`w-10 h-10 ${rarity.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Dna className={`w-5 h-5 ${rarity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-title">{variant.gene}</span>
                          <Badge color="gray" size="xs">{variant.rsId}</Badge>
                          <Badge color={getCategoryColor(variant.category)} size="xs">
                            {getCategoryLabel(variant.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted truncate">{variant.conditionEs}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${rarity.color}`}>{formatFrequency(variant.frequency)}</p>
                        <p className="text-xs text-muted">{variant.matchesWorldwide} personas</p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-adaptive space-y-4">
                        {/* Variant details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                          <div className="p-2 bg-surface-soft rounded-lg">
                            <span className="text-muted block text-xs">Cromosoma</span>
                            <span className="text-body font-medium">Chr {variant.chromosome}</span>
                          </div>
                          <div className="p-2 bg-surface-soft rounded-lg">
                            <span className="text-muted block text-xs">Posicion</span>
                            <span className="text-body font-medium">{variant.position}</span>
                          </div>
                          <div className="p-2 bg-surface-soft rounded-lg">
                            <span className="text-muted block text-xs">Ref / Alt</span>
                            <span className="text-body font-medium">{variant.refAllele} &rarr; {variant.altAllele}</span>
                          </div>
                          <div className="p-2 bg-surface-soft rounded-lg">
                            <span className="text-muted block text-xs">Rareza</span>
                            <span className={`font-medium ${rarity.color}`}>{rarity.labelEs}</span>
                          </div>
                        </div>

                        {/* Global Distribution */}
                        <div className="p-3 bg-surface-soft rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <p className="text-xs font-medium text-muted uppercase">Distribucion Global</p>
                          </div>
                          <div className="space-y-2">
                            {variant.populations.map((pop, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-32 text-right">
                                  <span className="text-xs text-body">{pop.populationEs}</span>
                                </div>
                                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                                    style={{ width: `${Math.min(100, (pop.frequency / 0.005) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted w-16">{formatFrequency(pop.frequency)}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted mt-2 italic">
                            {variant.populations[0].noteEs}
                          </p>
                        </div>

                        {/* AlphaGenome Prediction */}
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase">Prediccion AlphaGenome</p>
                            <Badge color="purple" size="xs">{variant.alphaGenomePrediction.confidenceScore}% confianza</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted text-xs">Cambio de expresion:</span>
                              <p className="text-body">{variant.alphaGenomePrediction.expressionChangeEs}</p>
                            </div>
                            <div>
                              <span className="text-muted text-xs">Efecto en splicing:</span>
                              <p className="text-body">{variant.alphaGenomePrediction.splicingEffectEs}</p>
                            </div>
                            <div>
                              <span className="text-muted text-xs">Impacto regulatorio:</span>
                              <p className="text-body">{variant.alphaGenomePrediction.regulatoryImpactEs}</p>
                            </div>
                          </div>
                        </div>

                        {/* Share */}
                        <div className="flex justify-end">
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={Share2}
                            onClick={() => handleShareVariant(variant)}
                          >
                            Compartir variante
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Global Distribution Map (text-based) */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-500" />
              <Title className="text-title">Mapa de Distribucion Global</Title>
            </div>
            <Text className="text-muted mb-4">Concentracion poblacional de tus variantes raras</Text>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-surface-soft rounded-xl">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-title text-sm">Europa del Norte</p>
                  <p className="text-xs text-body">Variante CFTR concentrada en poblaciones celtas y nordicas. GJB2 tambien presente con frecuencia moderada.</p>
                  <Badge color="orange" size="xs" className="mt-1">2 variantes</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surface-soft rounded-xl">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-title text-sm">Poblacion Ashkenazi</p>
                  <p className="text-xs text-body">Variantes HEXA y BRCA2 enriquecidas por efecto fundador. 1 de cada 30 portadores de Tay-Sachs.</p>
                  <Badge color="amber" size="xs" className="mt-1">2 variantes</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surface-soft rounded-xl">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium text-title text-sm">Sudeste Asiatico</p>
                  <p className="text-xs text-body">Variante SCN5A con mayor prevalencia. Asociada con sindrome de Brugada en Tailandia.</p>
                  <Badge color="yellow" size="xs" className="mt-1">1 variante</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surface-soft rounded-xl">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-title text-sm">Region Mediterranea</p>
                  <p className="text-xs text-body">GJB2 es mas comun aqui, especialmente en Espana e Italia. Variante de perdida auditiva mas frecuente.</p>
                  <Badge color="blue" size="xs" className="mt-1">1 variante</Badge>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* === DIAGNOSTIC ODYSSEY TAB === */}
      {activeTab === 'odyssey' && (
        <>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <div className="flex items-start gap-3">
              <FileSearch className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-title">Odisea Diagnostica</p>
                <p className="text-sm text-body mt-1">
                  Millones de pacientes con enfermedades raras pasan anos sin diagnostico. Compartir variantes
                  raras puede conectar pacientes con sintomas similares y acelerar el diagnostico.
                </p>
                <div className="flex gap-4 mt-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">350M+</span>
                    <p className="text-xs text-muted">Personas con enfermedad rara</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">5-7 anos</span>
                    <p className="text-xs text-muted">Tiempo medio de diagnostico</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">72%</span>
                    <p className="text-xs text-muted">De origen genetico</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-500" />
              <Title className="text-title">Historias de Exito</Title>
              <Badge color="green" size="xs">{DIAGNOSTIC_CASES.length} diagnosticos logrados</Badge>
            </div>
            <div className="space-y-3">
              {DIAGNOSTIC_CASES.map((dCase) => {
                const isExpanded = expandedCase === dCase.id
                return (
                  <div key={dCase.id} className="border border-adaptive rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedCase(isExpanded ? null : dCase.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-surface-soft transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-title">Variante: {dCase.variantFound}</span>
                        <p className="text-sm text-muted">{dCase.yearsUndiagnosed} anos sin diagnostico</p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-adaptive space-y-3 mt-3">
                        <div>
                          <p className="text-xs font-medium text-muted uppercase mb-1">Sintomas</p>
                          <div className="flex flex-wrap gap-1">
                            {dCase.symptomsEs.map((symptom, i) => (
                              <Badge key={i} color="amber" size="xs">{symptom}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase mb-1">Resolucion</p>
                          <p className="text-sm text-body">{dCase.resolutionEs}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Call to action */}
          <Card className="bg-surface-soft">
            <div className="text-center py-4">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p className="font-semibold text-title">Tienes variantes sin diagnosticar?</p>
              <p className="text-sm text-body mt-1 max-w-md mx-auto">
                Comparte tus variantes raras de forma anonima para buscar coincidencias con otros
                pacientes en todo el mundo. Tu variante podria ser la clave del diagnostico de alguien.
              </p>
              <Button size="xs" icon={Share2} className="mt-3">
                Compartir variantes anonimamente
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* === COMMUNITY TAB === */}
      {activeTab === 'community' && (
        <>
          {/* Community Stats */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-500" />
              <Title className="text-title">Conexion Comunitaria</Title>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-surface-soft rounded-xl">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {COMMUNITY_STATS.totalMembers.toLocaleString()}
                </span>
                <p className="text-xs text-muted mt-1">Miembros totales</p>
              </div>
              <div className="text-center p-3 bg-surface-soft rounded-xl">
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {COMMUNITY_STATS.matchesMade.toLocaleString()}
                </span>
                <p className="text-xs text-muted mt-1">Coincidencias realizadas</p>
              </div>
              <div className="text-center p-3 bg-surface-soft rounded-xl">
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {COMMUNITY_STATS.countriesRepresented}
                </span>
                <p className="text-xs text-muted mt-1">Paises representados</p>
              </div>
              <div className="text-center p-3 bg-surface-soft rounded-xl">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(COMMUNITY_STATS.totalVariantsShared / 1_000_000).toFixed(1)}M
                </span>
                <p className="text-xs text-muted mt-1">Variantes compartidas</p>
              </div>
              <div className="text-center p-3 bg-surface-soft rounded-xl col-span-2 sm:col-span-2">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {COMMUNITY_STATS.lastMatchTimeEs}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">Ultima coincidencia encontrada</p>
              </div>
            </div>
          </Card>

          {/* Your potential matches */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-purple-500" />
              <Title className="text-title">Tus Coincidencias Potenciales</Title>
            </div>
            <div className="space-y-3">
              {variants.map((variant) => (
                <div key={variant.id} className="flex items-center gap-3 p-3 bg-surface-soft rounded-xl">
                  <div className={`w-10 h-10 ${getRarityLevel(variant.frequency).bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Users className={`w-5 h-5 ${getRarityLevel(variant.frequency).color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-title text-sm">{variant.gene} ({variant.rsId})</p>
                    <p className="text-xs text-muted">{variant.conditionEs}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-title">{variant.matchesWorldwide}</span>
                    <p className="text-xs text-muted">en el mundo</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl">
              <p className="text-sm text-body text-center">
                Total: <span className="font-bold text-orange-600 dark:text-orange-400">{variants.reduce((sum, v) => sum + v.matchesWorldwide, 0)} personas</span> en todo el mundo comparten al menos una de tus variantes raras
              </p>
            </div>
          </Card>

          {/* Live activity feed (simulated) */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-500" />
              <Title className="text-title">Actividad Reciente de la Red</Title>
            </div>
            <div className="space-y-2">
              {[
                { time: 'Hace 23 min', event: 'Nueva coincidencia CFTR encontrada entre usuario en Suecia y usuario en Irlanda', color: 'green' },
                { time: 'Hace 1 hora', event: 'Paciente diagnosticado tras conectar con portador de variante MOGS en Brasil', color: 'blue' },
                { time: 'Hace 3 horas', event: 'Variante ultra-rara en GNAO1 compartida — buscando coincidencias...', color: 'amber' },
                { time: 'Hace 5 horas', event: 'Familia en Japon conectada con investigadores en Alemania por variante SCN5A', color: 'purple' },
                { time: 'Hace 8 horas', event: 'Nuevo miembro desde Mexico — 3 variantes raras identificadas', color: 'orange' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-2">
                  <div className={`w-2 h-2 rounded-full bg-${item.color}-500 mt-1.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className="text-sm text-body">{item.event}</p>
                    <p className="text-xs text-muted">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Disclaimer */}
      <Card className="bg-surface-soft">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-body">
              <strong>Aviso importante:</strong> Esta herramienta es educativa e informativa. Las frecuencias de variantes
              provienen de bases de datos publicas (gnomAD, ClinVar). La conexion comunitaria es simulada.
              Consulta siempre con un genetista clinico para interpretar variantes raras.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
