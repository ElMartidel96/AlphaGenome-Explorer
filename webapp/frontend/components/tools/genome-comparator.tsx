'use client'

import { useState } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Globe2,
  BarChart3,
  Users,
  ArrowLeftRight,
  Info,
  ChevronDown,
  ChevronRight,
  Dna,
  Map,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Population {
  id: string
  name: string
  nameEs: string
  code: string
  region: string
  regionEs: string
  color: string
  sampleSize: number
  heterozygosity: number
  privateSNPs: number
  description: string
  descriptionEs: string
}

interface PopulationPair {
  pop1: string
  pop2: string
  fst: number
}

const POPULATIONS: Population[] = [
  {
    id: 'afr', name: 'African', nameEs: 'Africana', code: 'AFR',
    region: 'Sub-Saharan Africa', regionEs: 'Africa Subsahariana',
    color: 'amber', sampleSize: 661, heterozygosity: 0.128,
    privateSNPs: 3200000,
    description: 'Highest genetic diversity due to being the ancestral human population.',
    descriptionEs: 'Mayor diversidad genetica por ser la poblacion humana ancestral.',
  },
  {
    id: 'eur', name: 'European', nameEs: 'Europea', code: 'EUR',
    region: 'Europe', regionEs: 'Europa',
    color: 'blue', sampleSize: 503, heterozygosity: 0.108,
    privateSNPs: 1200000,
    description: 'Reduced diversity due to out-of-Africa bottleneck ~60,000 years ago.',
    descriptionEs: 'Diversidad reducida debido al cuello de botella de salida de Africa ~60,000 anos atras.',
  },
  {
    id: 'eas', name: 'East Asian', nameEs: 'Asiatica Oriental', code: 'EAS',
    region: 'East Asia', regionEs: 'Asia Oriental',
    color: 'green', sampleSize: 504, heterozygosity: 0.105,
    privateSNPs: 1100000,
    description: 'Independent migration and adaptation to East Asian environments.',
    descriptionEs: 'Migracion independiente y adaptacion a ambientes de Asia Oriental.',
  },
  {
    id: 'amr', name: 'American', nameEs: 'Americana', code: 'AMR',
    region: 'Americas', regionEs: 'Americas',
    color: 'red', sampleSize: 347, heterozygosity: 0.112,
    privateSNPs: 800000,
    description: 'Mix of Indigenous, European, and African ancestry. High admixture.',
    descriptionEs: 'Mezcla de ancestria indigena, europea y africana. Alta mezcla.',
  },
  {
    id: 'sas', name: 'South Asian', nameEs: 'Asiatica del Sur', code: 'SAS',
    region: 'South Asia', regionEs: 'Asia del Sur',
    color: 'purple', sampleSize: 489, heterozygosity: 0.110,
    privateSNPs: 1000000,
    description: 'Ancient population with contributions from multiple migration waves.',
    descriptionEs: 'Poblacion antigua con contribuciones de multiples olas migratorias.',
  },
  {
    id: 'mea', name: 'Middle Eastern', nameEs: 'Medio Oriente', code: 'MEA',
    region: 'Middle East / North Africa', regionEs: 'Medio Oriente / Norte de Africa',
    color: 'orange', sampleSize: 200, heterozygosity: 0.115,
    privateSNPs: 900000,
    description: 'Crossroads population with gene flow from Africa, Europe, and Asia.',
    descriptionEs: 'Poblacion de cruce con flujo genetico de Africa, Europa y Asia.',
  },
  {
    id: 'oce', name: 'Oceanian', nameEs: 'Oceanica', code: 'OCE',
    region: 'Oceania / Pacific', regionEs: 'Oceania / Pacifico',
    color: 'teal', sampleSize: 100, heterozygosity: 0.102,
    privateSNPs: 700000,
    description: 'Includes Denisovan introgression not found in other populations.',
    descriptionEs: 'Incluye introgresion denisovana no encontrada en otras poblaciones.',
  },
  {
    id: 'csa', name: 'Central/South African', nameEs: 'Centro/Sur Africana', code: 'CSA',
    region: 'Central/South Africa', regionEs: 'Africa Central/Sur',
    color: 'yellow', sampleSize: 150, heterozygosity: 0.132,
    privateSNPs: 3500000,
    description: 'San and Pygmy populations carry the most ancient human lineages.',
    descriptionEs: 'Poblaciones San y Pigmeas portan los linajes humanos mas antiguos.',
  },
]

const FST_DATA: PopulationPair[] = [
  { pop1: 'afr', pop2: 'eur', fst: 0.153 },
  { pop1: 'afr', pop2: 'eas', fst: 0.190 },
  { pop1: 'afr', pop2: 'amr', fst: 0.105 },
  { pop1: 'afr', pop2: 'sas', fst: 0.165 },
  { pop1: 'eur', pop2: 'eas', fst: 0.110 },
  { pop1: 'eur', pop2: 'amr', fst: 0.048 },
  { pop1: 'eur', pop2: 'sas', fst: 0.043 },
  { pop1: 'eas', pop2: 'amr', fst: 0.078 },
  { pop1: 'eas', pop2: 'sas', fst: 0.085 },
  { pop1: 'amr', pop2: 'sas', fst: 0.058 },
  { pop1: 'afr', pop2: 'mea', fst: 0.120 },
  { pop1: 'eur', pop2: 'mea', fst: 0.035 },
  { pop1: 'afr', pop2: 'oce', fst: 0.200 },
  { pop1: 'eur', pop2: 'oce', fst: 0.150 },
  { pop1: 'afr', pop2: 'csa', fst: 0.060 },
]

type ViewMode = 'heatmap' | 'diversity' | 'fst'

export function GenomeComparator() {
  const t = useTranslations()
  const [viewMode, setViewMode] = useState<ViewMode>('diversity')
  const [selectedPop, setSelectedPop] = useState<Population | null>(null)
  const [comparePop1, setComparePop1] = useState<string>('afr')
  const [comparePop2, setComparePop2] = useState<string>('eur')

  const getFst = (p1: string, p2: string): number | null => {
    if (p1 === p2) return 0
    const pair = FST_DATA.find(
      (f) => (f.pop1 === p1 && f.pop2 === p2) || (f.pop1 === p2 && f.pop2 === p1)
    )
    return pair ? pair.fst : null
  }

  const currentFst = getFst(comparePop1, comparePop2)

  const maxHeterozygosity = Math.max(...POPULATIONS.map((p) => p.heterozygosity))

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe2 className="w-8 h-8 text-indigo-500" />
          </div>
          <Title className="text-title">Comparador de Genomas de Poblaciones</Title>
          <Text className="text-body mt-2 max-w-lg mx-auto">
            Compara diversidad genetica entre super-poblaciones humanas. Explora heterocigosidad,
            estadisticas Fst y variantes privadas.
          </Text>
        </div>
      </Card>

      {/* View mode tabs */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'diversity' ? 'primary' : 'light'}
          size="xs"
          icon={BarChart3}
          onClick={() => setViewMode('diversity')}
        >
          Diversidad
        </Button>
        <Button
          variant={viewMode === 'fst' ? 'primary' : 'light'}
          size="xs"
          icon={ArrowLeftRight}
          onClick={() => setViewMode('fst')}
        >
          Distancia Fst
        </Button>
        <Button
          variant={viewMode === 'heatmap' ? 'primary' : 'light'}
          size="xs"
          icon={Map}
          onClick={() => setViewMode('heatmap')}
        >
          Resumen
        </Button>
      </div>

      {viewMode === 'diversity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Population cards */}
          <div className="lg:col-span-2 space-y-3">
            {POPULATIONS.map((pop) => (
              <Card
                key={pop.id}
                className={`cursor-pointer transition-all ${
                  selectedPop?.id === pop.id
                    ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                    : 'hover:ring-1 hover:ring-indigo-300 dark:hover:ring-indigo-700'
                }`}
                onClick={() => setSelectedPop(pop)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-${pop.color}-100 dark:bg-${pop.color}-900/30 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Users className={`w-5 h-5 text-${pop.color}-500`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-title">{pop.nameEs}</span>
                      <Badge color="gray" size="xs">{pop.code}</Badge>
                    </div>
                    <p className="text-xs text-muted">{pop.regionEs}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {pop.heterozygosity.toFixed(3)}
                    </p>
                    <p className="text-xs text-muted">heterocigosidad</p>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    value={(pop.heterozygosity / maxHeterozygosity) * 100}
                    color={pop.color as any}
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Details */}
          <div>
            {selectedPop ? (
              <Card>
                <Title className="text-title">{selectedPop.nameEs}</Title>
                <Text className="text-muted text-sm">{selectedPop.regionEs}</Text>
                <p className="text-sm text-body mt-3">{selectedPop.descriptionEs}</p>
                <div className="space-y-3 mt-4">
                  <div className="p-3 bg-surface-soft rounded-xl">
                    <span className="text-xs text-muted">Tamano de muestra</span>
                    <p className="font-bold text-title">{selectedPop.sampleSize}</p>
                  </div>
                  <div className="p-3 bg-surface-soft rounded-xl">
                    <span className="text-xs text-muted">Heterocigosidad</span>
                    <p className="font-bold text-title">{selectedPop.heterozygosity.toFixed(4)}</p>
                  </div>
                  <div className="p-3 bg-surface-soft rounded-xl">
                    <span className="text-xs text-muted">SNPs Privados</span>
                    <p className="font-bold text-title">{(selectedPop.privateSNPs / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <Globe2 className="w-12 h-12 text-muted mx-auto mb-3" />
                  <Text className="text-muted">Selecciona una poblacion</Text>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {viewMode === 'fst' && (
        <Card>
          <Title className="text-title text-sm mb-4">Distancia Genetica (Fst) entre Poblaciones</Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <Text className="text-xs text-muted mb-1">Poblacion 1</Text>
              <select
                value={comparePop1}
                onChange={(e) => setComparePop1(e.target.value)}
                className="w-full p-2 bg-surface-soft border border-adaptive rounded-xl text-body text-sm"
              >
                {POPULATIONS.map((p) => (
                  <option key={p.id} value={p.id}>{p.nameEs} ({p.code})</option>
                ))}
              </select>
            </div>
            <div>
              <Text className="text-xs text-muted mb-1">Poblacion 2</Text>
              <select
                value={comparePop2}
                onChange={(e) => setComparePop2(e.target.value)}
                className="w-full p-2 bg-surface-soft border border-adaptive rounded-xl text-body text-sm"
              >
                {POPULATIONS.map((p) => (
                  <option key={p.id} value={p.id}>{p.nameEs} ({p.code})</option>
                ))}
              </select>
            </div>
          </div>

          {currentFst !== null ? (
            <div className="text-center p-6 bg-surface-soft rounded-xl">
              <ArrowLeftRight className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {currentFst.toFixed(3)}
              </span>
              <Text className="text-body mt-2">
                Fst entre {POPULATIONS.find((p) => p.id === comparePop1)?.nameEs} y{' '}
                {POPULATIONS.find((p) => p.id === comparePop2)?.nameEs}
              </Text>
              <Text className="text-xs text-muted mt-2">
                {currentFst < 0.05 ? 'Diferenciacion muy baja' :
                 currentFst < 0.10 ? 'Diferenciacion moderada' :
                 currentFst < 0.15 ? 'Diferenciacion significativa' :
                 'Diferenciacion alta'}
              </Text>
            </div>
          ) : (
            <div className="text-center p-6 bg-surface-soft rounded-xl">
              <Text className="text-muted">
                {comparePop1 === comparePop2
                  ? 'Selecciona dos poblaciones diferentes'
                  : 'Datos Fst no disponibles para esta combinacion'}
              </Text>
            </div>
          )}

          <div className="mt-4 p-3 bg-surface-soft rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted">
                Fst (Fixation Index) mide la diferenciacion genetica entre poblaciones.
                Valores cercanos a 0 indican poblaciones similares; valores cercanos a 1, alta diferenciacion.
                En humanos, Fst rara vez supera 0.25.
              </p>
            </div>
          </div>
        </Card>
      )}

      {viewMode === 'heatmap' && (
        <Card>
          <Title className="text-title text-sm mb-4">Resumen de Diversidad Global</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {POPULATIONS.sort((a, b) => b.heterozygosity - a.heterozygosity).map((pop, i) => (
              <div key={pop.id} className="flex items-center gap-3 p-3 bg-surface-soft rounded-xl">
                <span className="text-lg font-bold text-muted w-6">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-title text-sm">{pop.nameEs}</p>
                  <div className="flex gap-4 mt-1 text-xs text-muted">
                    <span>Het: {pop.heterozygosity.toFixed(3)}</span>
                    <span>SNPs: {(pop.privateSNPs / 1000000).toFixed(1)}M</span>
                    <span>n={pop.sampleSize}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
            <div className="flex items-start gap-2">
              <Dna className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-body">
                <strong>Dato clave:</strong> Las poblaciones africanas tienen la mayor diversidad genetica,
                lo que confirma el origen africano de los humanos modernos. Cada migracion fuera de Africa
                redujo la diversidad genetica (efecto fundador).
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
