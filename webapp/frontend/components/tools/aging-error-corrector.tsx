'use client'

import { useState } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Bug,
  Shield,
  FlaskConical,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AgingBug {
  id: string
  name: string
  nameEs: string
  category: 'dna_damage' | 'cellular' | 'systemic' | 'epigenetic'
  description: string
  descriptionEs: string
  researchStatus: 'basic' | 'preclinical' | 'clinical' | 'approved'
  correctability: number // 1-10
  keyGenes: string[]
  activeTrials: number
  trialExamples: { name: string; phase: string; target: string }[]
  interventions: string[]
  interventionsEs: string[]
}

const AGING_BUGS: AgingBug[] = [
  {
    id: 'telomere',
    name: 'Telomere Shortening',
    nameEs: 'Acortamiento de Telomeros',
    category: 'dna_damage',
    description: 'Each cell division shortens protective chromosome ends. Eventually cells stop dividing.',
    descriptionEs: 'Cada division celular acorta los extremos protectores de los cromosomas. Eventualmente las celulas dejan de dividirse.',
    researchStatus: 'clinical',
    correctability: 6,
    keyGenes: ['TERT', 'TERC', 'DKC1', 'POT1'],
    activeTrials: 12,
    trialExamples: [
      { name: 'TA-65 Telomerase Activation', phase: 'Phase 2', target: 'Telomere length' },
      { name: 'AAV-TERT Gene Therapy', phase: 'Phase 1', target: 'Telomerase expression' },
    ],
    interventions: ['Exercise (3-5x/week)', 'Stress reduction', 'Mediterranean diet', 'Sleep optimization'],
    interventionsEs: ['Ejercicio (3-5x/semana)', 'Reduccion de estres', 'Dieta mediterranea', 'Optimizacion del sueno'],
  },
  {
    id: 'senescence',
    name: 'Cellular Senescence',
    nameEs: 'Senescencia Celular',
    category: 'cellular',
    description: 'Zombie cells stop dividing but refuse to die, secreting inflammatory signals that damage neighbors.',
    descriptionEs: 'Celulas zombi dejan de dividirse pero se niegan a morir, secretando senales inflamatorias que danan a sus vecinas.',
    researchStatus: 'clinical',
    correctability: 7,
    keyGenes: ['CDKN2A (p16)', 'TP53', 'BCL2', 'SASP'],
    activeTrials: 24,
    trialExamples: [
      { name: 'Dasatinib + Quercetin', phase: 'Phase 2', target: 'Senescent cell clearance' },
      { name: 'Unity Biotechnology UBX1325', phase: 'Phase 2', target: 'Retinal senescence' },
    ],
    interventions: ['Intermittent fasting', 'Quercetin-rich foods', 'Regular exercise', 'Avoid chronic inflammation'],
    interventionsEs: ['Ayuno intermitente', 'Alimentos ricos en quercetina', 'Ejercicio regular', 'Evitar inflamacion cronica'],
  },
  {
    id: 'oxidative',
    name: 'Oxidative Stress',
    nameEs: 'Estres Oxidativo',
    category: 'dna_damage',
    description: 'Free radicals damage DNA, proteins and lipids. Mitochondria are both source and victim.',
    descriptionEs: 'Los radicales libres danan ADN, proteinas y lipidos. Las mitocondrias son fuente y victima.',
    researchStatus: 'preclinical',
    correctability: 5,
    keyGenes: ['SOD2', 'CAT', 'GPX1', 'NRF2'],
    activeTrials: 8,
    trialExamples: [
      { name: 'MitoQ (Mitoquinone)', phase: 'Phase 2', target: 'Mitochondrial ROS' },
      { name: 'NRF2 activators', phase: 'Preclinical', target: 'Antioxidant response' },
    ],
    interventions: ['Colorful fruits/vegetables', 'Avoid excessive alcohol', 'Not smoking', 'Green tea'],
    interventionsEs: ['Frutas/verduras coloridas', 'Evitar exceso de alcohol', 'No fumar', 'Te verde'],
  },
  {
    id: 'epigenetic_drift',
    name: 'Epigenetic Drift',
    nameEs: 'Deriva Epigenetica',
    category: 'epigenetic',
    description: 'Chemical marks that control gene expression gradually become disordered with age.',
    descriptionEs: 'Las marcas quimicas que controlan la expresion genica se desordenan gradualmente con la edad.',
    researchStatus: 'clinical',
    correctability: 8,
    keyGenes: ['DNMT1', 'DNMT3A', 'TET2', 'SIRT1-7'],
    activeTrials: 15,
    trialExamples: [
      { name: 'Yamanaka Factor Partial Reprogramming', phase: 'Phase 1', target: 'Epigenetic age reversal' },
      { name: 'Turn Biotechnologies ERA', phase: 'Preclinical', target: 'mRNA reprogramming' },
    ],
    interventions: ['Caloric restriction', 'Exercise', 'Cold exposure', 'NAD+ precursors'],
    interventionsEs: ['Restriccion calorica', 'Ejercicio', 'Exposicion al frio', 'Precursores de NAD+'],
  },
  {
    id: 'proteostasis',
    name: 'Loss of Proteostasis',
    nameEs: 'Perdida de Proteostasis',
    category: 'cellular',
    description: 'Protein quality control fails, leading to toxic aggregates (Alzheimers amyloid, Parkinsons alpha-synuclein).',
    descriptionEs: 'El control de calidad de proteinas falla, llevando a agregados toxicos (amiloide del Alzheimer, alfa-sinucleina del Parkinson).',
    researchStatus: 'preclinical',
    correctability: 4,
    keyGenes: ['HSF1', 'ATG5', 'HSPA1A', 'UBB'],
    activeTrials: 10,
    trialExamples: [
      { name: 'Rapamycin (mTOR inhibition)', phase: 'Phase 2', target: 'Autophagy activation' },
      { name: 'Anavex 2-73', phase: 'Phase 3', target: 'Protein homeostasis' },
    ],
    interventions: ['Fasting (autophagy)', 'Exercise', 'Spermidine-rich foods', 'Quality sleep'],
    interventionsEs: ['Ayuno (autofagia)', 'Ejercicio', 'Alimentos ricos en espermidina', 'Sueno de calidad'],
  },
  {
    id: 'stem_cell',
    name: 'Stem Cell Exhaustion',
    nameEs: 'Agotamiento de Celulas Madre',
    category: 'systemic',
    description: 'The body runs out of repair crews. Tissues stop regenerating.',
    descriptionEs: 'El cuerpo se queda sin equipos de reparacion. Los tejidos dejan de regenerarse.',
    researchStatus: 'preclinical',
    correctability: 5,
    keyGenes: ['NANOG', 'OCT4', 'SOX2', 'KLF4'],
    activeTrials: 20,
    trialExamples: [
      { name: 'Mesenchymal stem cell infusion', phase: 'Phase 2', target: 'Tissue regeneration' },
      { name: 'Young plasma factors', phase: 'Phase 1', target: 'Stem cell niche rejuvenation' },
    ],
    interventions: ['Exercise (stimulates stem cells)', 'Sleep', 'Avoid toxins', 'Fasting cycles'],
    interventionsEs: ['Ejercicio (estimula celulas madre)', 'Sueno', 'Evitar toxinas', 'Ciclos de ayuno'],
  },
  {
    id: 'inflammation',
    name: 'Chronic Inflammation (Inflammaging)',
    nameEs: 'Inflamacion Cronica (Inflammaging)',
    category: 'systemic',
    description: 'Low-grade chronic inflammation damages tissues. The immune system turns against itself.',
    descriptionEs: 'Inflamacion cronica de bajo grado dana los tejidos. El sistema inmune se vuelve contra si mismo.',
    researchStatus: 'clinical',
    correctability: 7,
    keyGenes: ['IL6', 'TNF', 'NLRP3', 'NFkB'],
    activeTrials: 30,
    trialExamples: [
      { name: 'Canakinumab (CANTOS trial)', phase: 'Phase 3', target: 'IL-1β' },
      { name: 'Low-dose methotrexate', phase: 'Phase 2', target: 'General inflammation' },
    ],
    interventions: ['Anti-inflammatory diet', 'Omega-3 fatty acids', 'Regular exercise', 'Stress management'],
    interventionsEs: ['Dieta antiinflamatoria', 'Acidos grasos Omega-3', 'Ejercicio regular', 'Manejo del estres'],
  },
  {
    id: 'mitochondria',
    name: 'Mitochondrial Dysfunction',
    nameEs: 'Disfuncion Mitocondrial',
    category: 'cellular',
    description: 'Cellular power plants lose efficiency. Less energy, more waste products.',
    descriptionEs: 'Las plantas de energia celulares pierden eficiencia. Menos energia, mas productos de desecho.',
    researchStatus: 'preclinical',
    correctability: 6,
    keyGenes: ['PPARGC1A', 'SIRT3', 'TFAM', 'MT-ND1'],
    activeTrials: 8,
    trialExamples: [
      { name: 'Urolithin A (Mitopure)', phase: 'Phase 2', target: 'Mitophagy' },
      { name: 'NAD+ boosters (NMN/NR)', phase: 'Phase 2', target: 'Mitochondrial function' },
    ],
    interventions: ['HIIT exercise', 'Cold exposure', 'CoQ10', 'NAD+ precursors (NMN)'],
    interventionsEs: ['Ejercicio HIIT', 'Exposicion al frio', 'CoQ10', 'Precursores de NAD+ (NMN)'],
  },
]

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  dna_damage: { label: 'Dano al ADN', color: 'red' },
  cellular: { label: 'Celular', color: 'purple' },
  systemic: { label: 'Sistemico', color: 'blue' },
  epigenetic: { label: 'Epigenetico', color: 'amber' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  basic: { label: 'Investigacion Basica', color: 'gray' },
  preclinical: { label: 'Preclinico', color: 'blue' },
  clinical: { label: 'Ensayo Clinico', color: 'green' },
  approved: { label: 'Terapia Aprobada', color: 'emerald' },
}

export function AgingErrorCorrector() {
  const t = useTranslations()
  const [selectedBug, setSelectedBug] = useState<AgingBug | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filtered = AGING_BUGS.filter(
    (b) => categoryFilter === 'all' || b.category === categoryFilter
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bug className="w-8 h-8 text-rose-500" />
          </div>
          <Title className="text-title">Corrector de Errores del Envejecimiento</Title>
          <Text className="text-body mt-2 max-w-lg mx-auto">
            Explora los "bugs" biologicos del envejecimiento, su estado de investigacion,
            ensayos clinicos activos y que puedes hacer hoy para mitigarlos.
          </Text>
        </div>
      </Card>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={categoryFilter === 'all' ? 'primary' : 'light'}
          size="xs"
          onClick={() => setCategoryFilter('all')}
        >
          Todos ({AGING_BUGS.length})
        </Button>
        {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
          <Button
            key={key}
            variant={categoryFilter === key ? 'primary' : 'light'}
            size="xs"
            onClick={() => setCategoryFilter(key)}
          >
            {val.label} ({AGING_BUGS.filter((b) => b.category === key).length})
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bug list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((bug) => (
            <Card
              key={bug.id}
              className={`cursor-pointer transition-all ${
                selectedBug?.id === bug.id
                  ? 'ring-2 ring-rose-500 dark:ring-rose-400'
                  : 'hover:ring-1 hover:ring-rose-300 dark:hover:ring-rose-700'
              }`}
              onClick={() => setSelectedBug(bug)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bug className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-title">{bug.nameEs}</span>
                    <Badge color={CATEGORY_LABELS[bug.category].color as any} size="xs">
                      {CATEGORY_LABELS[bug.category].label}
                    </Badge>
                    <Badge color={STATUS_LABELS[bug.researchStatus].color as any} size="xs">
                      {STATUS_LABELS[bug.researchStatus].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-body mt-1">{bug.descriptionEs}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-rose-500" />
                      <span className="text-xs font-medium text-title">Corregibilidad: {bug.correctability}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-muted">{bug.activeTrials} ensayos activos</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={bug.correctability * 10} color="rose" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Details */}
        <div>
          {selectedBug ? (
            <div className="space-y-4">
              <Card>
                <Title className="text-title">{selectedBug.nameEs}</Title>
                <p className="text-sm text-body mt-2">{selectedBug.descriptionEs}</p>

                {/* Key genes */}
                <div className="mt-4">
                  <Text className="text-xs text-muted mb-2">Genes Clave</Text>
                  <div className="flex flex-wrap gap-1">
                    {selectedBug.keyGenes.map((gene) => (
                      <Badge key={gene} color="purple" size="xs">{gene}</Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Trials */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="w-4 h-4 text-blue-500" />
                  <Title className="text-title text-sm">Ensayos Clinicos</Title>
                </div>
                <div className="space-y-2">
                  {selectedBug.trialExamples.map((trial, i) => (
                    <div key={i} className="p-3 bg-surface-soft rounded-xl">
                      <p className="text-sm font-medium text-title">{trial.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color="blue" size="xs">{trial.phase}</Badge>
                        <span className="text-xs text-muted">Target: {trial.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* What you can do */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-green-500" />
                  <Title className="text-title text-sm">Que Puedes Hacer Hoy</Title>
                </div>
                <div className="space-y-2">
                  {selectedBug.interventionsEs.map((intervention, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-body">{intervention}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <Bug className="w-12 h-12 text-muted mx-auto mb-3" />
                <Text className="text-muted">Selecciona un "bug" para ver detalles</Text>
              </div>
            </Card>
          )}

          <div className="mt-4 p-3 bg-surface-soft rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted">
                La investigacion del envejecimiento avanza rapidamente. Los datos mostrados son informativos.
                Consulta siempre con un profesional de salud antes de iniciar intervenciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
