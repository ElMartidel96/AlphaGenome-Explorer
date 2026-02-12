'use client'

import { useState } from 'react'
import { Card, Title, Text, Button, Badge } from '@tremor/react'
import {
  BookOpen,
  Search,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
  Heart,
  Zap,
  Brain,
  Dna,
  Star,
  Filter,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

interface BeneficialVariant {
  id: string
  gene: string
  variant: string
  name: string
  nameEs: string
  category: 'longevity' | 'immunity' | 'metabolism' | 'cognition' | 'physical' | 'resilience'
  effect: string
  effectEs: string
  frequency: string
  populations: string
  populationsEs: string
  evidence: 'verified' | 'strong' | 'moderate' | 'anecdotal'
  publications: number
  keyStudy: string
  keyStudyEs: string
}

const BENEFICIAL_VARIANTS: BeneficialVariant[] = [
  {
    id: 'pcsk9_lof',
    gene: 'PCSK9',
    variant: 'rs11591147 (R46L)',
    name: 'Natural Cholesterol Lowering',
    nameEs: 'Reduccion Natural del Colesterol',
    category: 'longevity',
    effect: 'Naturally lower LDL cholesterol by ~15%, reducing cardiovascular disease risk by 47%.',
    effectEs: 'Reduce naturalmente el colesterol LDL en ~15%, disminuyendo el riesgo cardiovascular en 47%.',
    frequency: '~2-3% European',
    populations: 'Most common in European populations',
    populationsEs: 'Mas comun en poblaciones europeas',
    evidence: 'verified',
    publications: 450,
    keyStudy: 'Cohen et al. 2006, New England Journal of Medicine',
    keyStudyEs: 'Cohen et al. 2006, New England Journal of Medicine',
  },
  {
    id: 'ccr5_delta32',
    gene: 'CCR5',
    variant: 'rs333 (delta32)',
    name: 'HIV Resistance',
    nameEs: 'Resistencia al VIH',
    category: 'immunity',
    effect: 'Homozygous carriers are essentially resistant to HIV-1 infection. Heterozygous carriers have delayed disease progression.',
    effectEs: 'Portadores homocigotos son esencialmente resistentes a infeccion por VIH-1. Portadores heterocigotos tienen progresion de enfermedad retardada.',
    frequency: '~10% European (heterozygous)',
    populations: 'Almost exclusively Northern European',
    populationsEs: 'Casi exclusivamente norte de Europa',
    evidence: 'verified',
    publications: 2000,
    keyStudy: 'Liu et al. 1996, Cell. Led to gene therapy cure of Timothy Ray Brown.',
    keyStudyEs: 'Liu et al. 1996, Cell. Llevo a la cura por terapia genica de Timothy Ray Brown.',
  },
  {
    id: 'foxo3',
    gene: 'FOXO3',
    variant: 'rs2802292',
    name: 'Longevity Gene',
    nameEs: 'Gen de Longevidad',
    category: 'longevity',
    effect: 'Associated with significantly increased lifespan. Found in nearly all centenarian studies worldwide.',
    effectEs: 'Asociado con aumento significativo de esperanza de vida. Encontrado en casi todos los estudios de centenarios del mundo.',
    frequency: '~25-30% globally',
    populations: 'All populations, especially Okinawan Japanese',
    populationsEs: 'Todas las poblaciones, especialmente japoneses de Okinawa',
    evidence: 'verified',
    publications: 300,
    keyStudy: 'Willcox et al. 2008, PNAS',
    keyStudyEs: 'Willcox et al. 2008, PNAS',
  },
  {
    id: 'apoe2',
    gene: 'APOE',
    variant: 'rs7412 (APOE-e2)',
    name: 'Alzheimers Protection',
    nameEs: 'Proteccion contra Alzheimer',
    category: 'cognition',
    effect: 'APOE-e2 carriers have 40% lower risk of Alzheimers disease compared to e3/e3.',
    effectEs: 'Portadores de APOE-e2 tienen 40% menor riesgo de Alzheimer comparado con e3/e3.',
    frequency: '~8% globally',
    populations: 'Variable across populations',
    populationsEs: 'Variable entre poblaciones',
    evidence: 'verified',
    publications: 1500,
    keyStudy: 'Reiman et al. 2020, Nature Medicine',
    keyStudyEs: 'Reiman et al. 2020, Nature Medicine',
  },
  {
    id: 'slc30a8',
    gene: 'SLC30A8',
    variant: 'rs13266634 (R325W)',
    name: 'Diabetes Protection',
    nameEs: 'Proteccion contra Diabetes',
    category: 'metabolism',
    effect: 'Loss-of-function variants reduce T2D risk by 65%. Natural model for diabetes prevention.',
    effectEs: 'Variantes de perdida de funcion reducen riesgo de DT2 en 65%. Modelo natural para prevencion de diabetes.',
    frequency: '~1% globally',
    populations: 'Found across multiple populations',
    populationsEs: 'Encontrado en multiples poblaciones',
    evidence: 'verified',
    publications: 200,
    keyStudy: 'Flannick et al. 2014, Nature Genetics',
    keyStudyEs: 'Flannick et al. 2014, Nature Genetics',
  },
  {
    id: 'actn3_577x',
    gene: 'ACTN3',
    variant: 'rs1815739 (R577X)',
    name: 'Endurance Performance',
    nameEs: 'Rendimiento de Resistencia',
    category: 'physical',
    effect: 'XX genotype associated with elite endurance athletes. Shifts muscle fiber type toward slow-twitch.',
    effectEs: 'Genotipo XX asociado con atletas de resistencia de elite. Cambia tipo de fibra muscular hacia contraccion lenta.',
    frequency: '~18% globally (XX)',
    populations: 'Higher in Asian and European populations',
    populationsEs: 'Mayor en poblaciones asiaticas y europeas',
    evidence: 'strong',
    publications: 350,
    keyStudy: 'Yang et al. 2003, American Journal of Human Genetics',
    keyStudyEs: 'Yang et al. 2003, American Journal of Human Genetics',
  },
  {
    id: 'bdnf_met',
    gene: 'BDNF',
    variant: 'rs6265 (Val66Met)',
    name: 'Enhanced Fear Learning',
    nameEs: 'Aprendizaje de Miedo Mejorado',
    category: 'cognition',
    effect: 'Met carriers show enhanced anxiety-related learning but also better episodic memory in some contexts.',
    effectEs: 'Portadores Met muestran aprendizaje de miedo mejorado pero tambien mejor memoria episodica en algunos contextos.',
    frequency: '~20% European, ~45% Asian',
    populations: 'Higher frequency in East Asian populations',
    populationsEs: 'Mayor frecuencia en poblaciones de Asia Oriental',
    evidence: 'moderate',
    publications: 600,
    keyStudy: 'Egan et al. 2003, Cell',
    keyStudyEs: 'Egan et al. 2003, Cell',
  },
  {
    id: 'lpa_null',
    gene: 'LPA',
    variant: 'rs3798220',
    name: 'Heart Attack Protection',
    nameEs: 'Proteccion contra Infarto',
    category: 'longevity',
    effect: 'Low Lp(a) levels associated with reduced coronary heart disease risk. Being targeted by new therapies.',
    effectEs: 'Niveles bajos de Lp(a) asociados con menor riesgo de enfermedad coronaria. Siendo blanco de nuevas terapias.',
    frequency: '~2% globally',
    populations: 'Variable, lower Lp(a) more common in European',
    populationsEs: 'Variable, Lp(a) bajo mas comun en europeos',
    evidence: 'verified',
    publications: 250,
    keyStudy: 'Clarke et al. 2009, New England Journal of Medicine',
    keyStudyEs: 'Clarke et al. 2009, New England Journal of Medicine',
  },
  {
    id: 'epas1',
    gene: 'EPAS1',
    variant: 'Tibetan high-altitude variant',
    name: 'Altitude Adaptation',
    nameEs: 'Adaptacion a Altitud',
    category: 'resilience',
    effect: 'Enables efficient oxygen use at high altitude without dangerous polycythemia.',
    effectEs: 'Permite uso eficiente de oxigeno a gran altitud sin policitemia peligrosa.',
    frequency: '~78% Tibetan',
    populations: 'Tibetan plateau populations, inherited from Denisovans',
    populationsEs: 'Poblaciones de la meseta tibetana, heredada de denisovanos',
    evidence: 'verified',
    publications: 180,
    keyStudy: 'Yi et al. 2010, Science',
    keyStudyEs: 'Yi et al. 2010, Science',
  },
  {
    id: 'scn9a_lof',
    gene: 'SCN9A',
    variant: 'Various loss-of-function',
    name: 'Pain Insensitivity',
    nameEs: 'Insensibilidad al Dolor',
    category: 'resilience',
    effect: 'Complete inability to feel pain. Being studied for non-opioid pain treatment development.',
    effectEs: 'Incapacidad completa de sentir dolor. Siendo estudiado para desarrollo de tratamientos no opioides.',
    frequency: '<0.01%',
    populations: 'Extremely rare, found in Pakistani families',
    populationsEs: 'Extremadamente rara, encontrada en familias pakistanies',
    evidence: 'verified',
    publications: 150,
    keyStudy: 'Cox et al. 2006, Nature',
    keyStudyEs: 'Cox et al. 2006, Nature',
  },
  {
    id: 'cyp1a2_fast',
    gene: 'CYP1A2',
    variant: 'rs762551 (CYP1A2*1F)',
    name: 'Fast Caffeine Metabolism',
    nameEs: 'Metabolismo Rapido de Cafeina',
    category: 'metabolism',
    effect: 'Fast metabolizers get more cardiovascular benefit from coffee and clear caffeine quickly.',
    effectEs: 'Metabolizadores rapidos obtienen mas beneficio cardiovascular del cafe y eliminan cafeina rapidamente.',
    frequency: '~40% globally',
    populations: 'All populations',
    populationsEs: 'Todas las poblaciones',
    evidence: 'strong',
    publications: 100,
    keyStudy: 'Cornelis et al. 2006, JAMA',
    keyStudyEs: 'Cornelis et al. 2006, JAMA',
  },
  {
    id: 'cetp_lof',
    gene: 'CETP',
    variant: 'rs1800777',
    name: 'High HDL Cholesterol',
    nameEs: 'Colesterol HDL Elevado',
    category: 'longevity',
    effect: 'Naturally elevated HDL cholesterol levels, associated with exceptional longevity in Ashkenazi Jewish centenarians.',
    effectEs: 'Niveles de colesterol HDL naturalmente elevados, asociados con longevidad excepcional en centenarios judios ashkenazi.',
    frequency: '~5% Ashkenazi',
    populations: 'Most studied in Ashkenazi Jewish population',
    populationsEs: 'Mas estudiado en poblacion judia ashkenazi',
    evidence: 'strong',
    publications: 120,
    keyStudy: 'Barzilai et al. 2003, JAMA',
    keyStudyEs: 'Barzilai et al. 2003, JAMA',
  },
]

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  longevity: { label: 'Longevidad', icon: Heart, color: 'red' },
  immunity: { label: 'Inmunidad', icon: Shield, color: 'green' },
  metabolism: { label: 'Metabolismo', icon: Zap, color: 'amber' },
  cognition: { label: 'Cognicion', icon: Brain, color: 'purple' },
  physical: { label: 'Fisico', icon: Sparkles, color: 'blue' },
  resilience: { label: 'Resiliencia', icon: Shield, color: 'cyan' },
}

const EVIDENCE_CONFIG: Record<string, { label: string; color: string }> = {
  verified: { label: 'Verificada', color: 'green' },
  strong: { label: 'Evidencia Fuerte', color: 'blue' },
  moderate: { label: 'Moderada', color: 'amber' },
  anecdotal: { label: 'Anecdotica', color: 'gray' },
}

export function BeneficialVariantsLibrary() {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedVariant, setSelectedVariant] = useState<BeneficialVariant | null>(null)

  const filtered = BENEFICIAL_VARIANTS
    .filter((v) => categoryFilter === 'all' || v.category === categoryFilter)
    .filter((v) =>
      v.gene.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nameEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.effectEs.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div role="region" aria-label="Beneficial Variants Library" className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-amber-500" />
          </div>
          <Title className="text-title">Biblioteca de Variantes Beneficiosas</Title>
          <Text className="text-body mt-2 max-w-lg mx-auto">
            Descubre variantes geneticas que confieren beneficios: desde proteccion contra enfermedades
            hasta longevidad excepcional. Cada variante incluye evidencia cientifica verificada.
          </Text>
        </div>
      </Card>

      {/* Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por gen, nombre o efecto..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-soft border border-adaptive rounded-xl text-body text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Search beneficial variants"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            variant={categoryFilter === 'all' ? 'primary' : 'light'}
            size="xs"
            onClick={() => setCategoryFilter('all')}
          >
            Todas ({BENEFICIAL_VARIANTS.length})
          </Button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <Button
              key={key}
              variant={categoryFilter === key ? 'primary' : 'light'}
              size="xs"
              onClick={() => setCategoryFilter(key)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Variant list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((variant) => {
            const catConfig = CATEGORY_CONFIG[variant.category]
            const evConfig = EVIDENCE_CONFIG[variant.evidence]
            return (
              <Card
                key={variant.id}
                className={`cursor-pointer transition-all ${
                  selectedVariant?.id === variant.id
                    ? 'ring-2 ring-amber-500 dark:ring-amber-400'
                    : 'hover:ring-1 hover:ring-amber-300 dark:hover:ring-amber-700'
                }`}
                onClick={() => setSelectedVariant(variant)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 bg-${catConfig.color}-100 dark:bg-${catConfig.color}-900/30 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Dna className={`w-5 h-5 text-${catConfig.color}-500`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-title">{variant.gene}</span>
                      <Badge color={catConfig.color as any} size="xs">{catConfig.label}</Badge>
                      <Badge color={evConfig.color as any} size="xs">{evConfig.label}</Badge>
                    </div>
                    <p className="font-medium text-body text-sm mt-0.5">{variant.nameEs}</p>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{variant.effectEs}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                      <span>{variant.frequency}</span>
                      <span>{variant.publications} publicaciones</span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Details */}
        <div>
          {selectedVariant ? (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <Title className="text-title">{selectedVariant.gene}</Title>
                </div>
                <Badge color="gray" size="xs" className="mb-3">{selectedVariant.variant}</Badge>
                <p className="font-medium text-title text-sm">{selectedVariant.nameEs}</p>
                <p className="text-sm text-body mt-2">{selectedVariant.effectEs}</p>
              </Card>

              <Card>
                <Title className="text-title text-sm mb-3">Detalles</Title>
                <div className="space-y-3">
                  <div className="p-3 bg-surface-soft rounded-xl">
                    <span className="text-xs text-muted">Frecuencia</span>
                    <p className="text-sm font-medium text-title">{selectedVariant.frequency}</p>
                  </div>
                  <div className="p-3 bg-surface-soft rounded-xl">
                    <span className="text-xs text-muted">Poblaciones</span>
                    <p className="text-sm text-body">{selectedVariant.populationsEs}</p>
                  </div>
                  <div className="p-3 bg-surface-soft rounded-xl">
                    <span className="text-xs text-muted">Nivel de Evidencia</span>
                    <div className="mt-1">
                      <Badge color={EVIDENCE_CONFIG[selectedVariant.evidence].color as any}>
                        {EVIDENCE_CONFIG[selectedVariant.evidence].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-surface-soft rounded-xl">
                    <span className="text-xs text-muted">Estudio Clave</span>
                    <p className="text-xs text-body mt-1">{selectedVariant.keyStudyEs}</p>
                  </div>
                  <div className="p-3 bg-surface-soft rounded-xl">
                    <span className="text-xs text-muted">Publicaciones</span>
                    <p className="text-sm font-bold text-title">{selectedVariant.publications.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
                <Text className="text-muted">Selecciona una variante para ver detalles</Text>
              </div>
            </Card>
          )}

          <div className="mt-4 p-3 bg-surface-soft rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted">
                Esta biblioteca es educativa. Las variantes geneticas tienen efectos complejos y
                dependientes del contexto. No uses esta informacion para tomar decisiones medicas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
