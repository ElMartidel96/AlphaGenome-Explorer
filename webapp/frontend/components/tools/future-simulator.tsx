'use client'

import { useState, useMemo } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Clock,
  Users,
  TrendingUp,
  Dna,
  ArrowRight,
  Info,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  GitBranch,
  Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

type Scenario = 'natural' | 'positive_selection' | 'crispr_intervention'

interface TrackedVariant {
  id: string
  gene: string
  name: string
  nameEs: string
  initialFrequency: number
  description: string
  descriptionEs: string
  naturalTrend: number // per-generation change multiplier
  selectionTrend: number
  crisprTrend: number
}

const TRACKED_VARIANTS: TrackedVariant[] = [
  {
    id: 'foxo3_long',
    gene: 'FOXO3',
    name: 'Longevity Variant',
    nameEs: 'Variante de Longevidad',
    initialFrequency: 0.28,
    description: 'Associated with exceptional lifespan',
    descriptionEs: 'Asociada con esperanza de vida excepcional',
    naturalTrend: 1.002,
    selectionTrend: 1.015,
    crisprTrend: 1.08,
  },
  {
    id: 'ccr5_d32',
    gene: 'CCR5',
    name: 'HIV Resistance',
    nameEs: 'Resistencia al VIH',
    initialFrequency: 0.10,
    description: 'Confers resistance to HIV infection',
    descriptionEs: 'Confiere resistencia a infeccion por VIH',
    naturalTrend: 1.001,
    selectionTrend: 1.008,
    crisprTrend: 1.05,
  },
  {
    id: 'apoe2',
    gene: 'APOE',
    name: 'Alzheimers Protection',
    nameEs: 'Proteccion contra Alzheimer',
    initialFrequency: 0.08,
    description: 'Reduces Alzheimers risk by 40%',
    descriptionEs: 'Reduce riesgo de Alzheimer en 40%',
    naturalTrend: 1.001,
    selectionTrend: 1.012,
    crisprTrend: 1.06,
  },
  {
    id: 'pcsk9_lof',
    gene: 'PCSK9',
    name: 'Natural Cholesterol Lowering',
    nameEs: 'Colesterol Naturalmente Bajo',
    initialFrequency: 0.03,
    description: 'Naturally lower cardiovascular risk',
    descriptionEs: 'Riesgo cardiovascular naturalmente menor',
    naturalTrend: 1.003,
    selectionTrend: 1.020,
    crisprTrend: 1.10,
  },
  {
    id: 'slc30a8',
    gene: 'SLC30A8',
    name: 'Diabetes Protection',
    nameEs: 'Proteccion contra Diabetes',
    initialFrequency: 0.01,
    description: 'Reduces T2D risk by 65%',
    descriptionEs: 'Reduce riesgo de diabetes T2 en 65%',
    naturalTrend: 1.001,
    selectionTrend: 1.018,
    crisprTrend: 1.12,
  },
]

const GENERATION_YEARS = 25

export function FutureSimulator() {
  const t = useTranslations()
  const [scenario, setScenario] = useState<Scenario>('natural')
  const [generations, setGenerations] = useState(5)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const projections = useMemo(() => {
    return TRACKED_VARIANTS.map((variant) => {
      const trend =
        scenario === 'natural' ? variant.naturalTrend :
        scenario === 'positive_selection' ? variant.selectionTrend :
        variant.crisprTrend

      const frequencies: number[] = [variant.initialFrequency]
      for (let g = 1; g <= generations; g++) {
        const prev = frequencies[g - 1]
        const next = Math.min(0.99, prev * trend)
        frequencies.push(next)
      }
      return {
        ...variant,
        frequencies,
        finalFrequency: frequencies[frequencies.length - 1],
        percentChange: ((frequencies[frequencies.length - 1] - variant.initialFrequency) / variant.initialFrequency * 100),
      }
    })
  }, [scenario, generations])

  const handleSimulate = () => {
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
      setShowResults(true)
      toast.success(`Proyeccion a ${generations} generaciones completada!`)
    }, 1500)
  }

  const scenarioDescriptions: Record<Scenario, { label: string; desc: string }> = {
    natural: {
      label: 'Evolucion Natural',
      desc: 'Sin intervenciones. Las frecuencias cambian solo por seleccion natural y deriva genetica.',
    },
    positive_selection: {
      label: 'Seleccion Positiva Moderna',
      desc: 'Tecnologias reproductivas y screening genetico aumentan la frecuencia de variantes beneficiosas.',
    },
    crispr_intervention: {
      label: 'Intervencion CRISPR',
      desc: 'Escenario hipotetico donde la edicion genetica se aplica ampliamente (con implicaciones eticas significativas).',
    },
  }

  return (
    <div role="region" aria-label="Future Simulator" className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-violet-500" />
          </div>
          <Title className="text-title">Simulador del Futuro Genetico</Title>
          <Text className="text-body mt-2 max-w-lg mx-auto">
            Proyecta como podrian cambiar las frecuencias de variantes geneticas beneficiosas
            a lo largo de 3, 5 o 10 generaciones bajo diferentes escenarios.
          </Text>
        </div>
      </Card>

      {/* Controls */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scenario selection */}
          <div>
            <Title className="text-title text-sm mb-3">Escenario</Title>
            <div className="space-y-2">
              {(Object.keys(scenarioDescriptions) as Scenario[]).map((s) => (
                <button
                  key={s}
                  aria-label={scenarioDescriptions[s].label}
                  onClick={() => { setScenario(s); setShowResults(false); }}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    scenario === s
                      ? 'bg-violet-50 dark:bg-violet-950/20 border-2 border-violet-300 dark:border-violet-700'
                      : 'bg-surface-soft border-2 border-transparent hover:border-violet-200 dark:hover:border-violet-800'
                  }`}
                >
                  <p className="font-medium text-title text-sm">{scenarioDescriptions[s].label}</p>
                  <p className="text-xs text-muted mt-1">{scenarioDescriptions[s].desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generations */}
          <div>
            <Title className="text-title text-sm mb-3">Generaciones</Title>
            <div className="space-y-4">
              {[3, 5, 10].map((g) => (
                <button
                  key={g}
                  aria-label={`${g} generaciones`}
                  onClick={() => { setGenerations(g); setShowResults(false); }}
                  className={`w-full p-4 rounded-xl text-center transition-all ${
                    generations === g
                      ? 'bg-violet-50 dark:bg-violet-950/20 border-2 border-violet-300 dark:border-violet-700'
                      : 'bg-surface-soft border-2 border-transparent hover:border-violet-200 dark:hover:border-violet-800'
                  }`}
                >
                  <span className="text-2xl font-bold text-title">{g}</span>
                  <p className="text-xs text-muted mt-1">generaciones (~{g * GENERATION_YEARS} anos)</p>
                </button>
              ))}
            </div>

            <Button
              className="w-full mt-4"
              icon={isSimulating ? Clock : Sparkles}
              color="violet"
              loading={isSimulating}
              onClick={handleSimulate}
            >
              {isSimulating ? 'Simulando...' : 'Simular Futuro'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {showResults && (
        <>
          {/* Timeline header */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="w-5 h-5 text-violet-500" />
              <Title className="text-title text-sm">
                Proyeccion: {scenarioDescriptions[scenario].label} - {generations} Generaciones ({generations * GENERATION_YEARS} anos)
              </Title>
            </div>

            {/* Variant projections */}
            <div className="space-y-4">
              {projections.map((proj) => (
                <div key={proj.id} className="p-4 bg-surface-soft rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Dna className="w-4 h-4 text-violet-500" />
                      <span className="font-bold text-title">{proj.gene}</span>
                      <span className="text-sm text-muted">- {proj.nameEs}</span>
                    </div>
                    <Badge
                      color={proj.percentChange > 10 ? 'green' : proj.percentChange > 1 ? 'blue' : 'gray'}
                      size="xs"
                    >
                      {proj.percentChange > 0 ? '+' : ''}{proj.percentChange.toFixed(1)}%
                    </Badge>
                  </div>

                  {/* Frequency bar */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-right">
                      <span className="text-xs text-muted">Hoy</span>
                      <p className="text-sm font-mono font-medium text-title">{(proj.initialFrequency * 100).toFixed(1)}%</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full relative overflow-hidden">
                        <div
                          className="h-full bg-violet-200 dark:bg-violet-800 rounded-full absolute left-0"
                          style={{ width: `${proj.initialFrequency * 100}%` }}
                        />
                        <div
                          className="h-full bg-violet-500 rounded-full absolute left-0 transition-all duration-1000"
                          style={{ width: `${proj.finalFrequency * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16">
                      <span className="text-xs text-muted">Futuro</span>
                      <p className="text-sm font-mono font-bold text-violet-600 dark:text-violet-400">{(proj.finalFrequency * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Generation-by-generation */}
                  <div className="flex items-center gap-1 mt-2 overflow-x-auto">
                    {proj.frequencies.map((freq, i) => (
                      <div key={i} className="flex items-center">
                        <div className="text-center min-w-[40px]">
                          <div
                            className="w-6 h-6 bg-violet-500 rounded-full mx-auto flex items-center justify-center"
                            style={{ opacity: 0.3 + (i / proj.frequencies.length) * 0.7 }}
                          >
                            <span className="text-[8px] text-white font-bold">{i === 0 ? '0' : `G${i}`}</span>
                          </div>
                          <span className="text-[9px] text-muted">{(freq * 100).toFixed(1)}%</span>
                        </div>
                        {i < proj.frequencies.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Ethical disclaimer */}
          <Card className="border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-title">Consideraciones Eticas</p>
                <div className="text-sm text-body mt-2 space-y-2">
                  <p>
                    Esta simulacion es educativa y explorativa. Los escenarios de intervencion genetica
                    plantean preguntas eticas profundas:
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-1 text-muted">
                    <li>Acceso equitativo a tecnologias geneticas</li>
                    <li>Diversidad genetica como fortaleza de la especie</li>
                    <li>Consentimiento de generaciones futuras</li>
                    <li>Efectos no anticipados de reducir la diversidad</li>
                    <li>La diferencia entre prevenir enfermedad y "mejorar" humanos</li>
                  </ul>
                  <p className="text-xs">
                    La decision de alterar el curso evolutivo humano es una de las mas trascendentales
                    que nuestra especie podria tomar. Debe hacerse con humildad, transparencia y consenso global.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Reset */}
          <div className="flex justify-center">
            <Button
              variant="light"
              icon={RotateCcw}
              onClick={() => setShowResults(false)}
            >
              Nueva simulacion
            </Button>
          </div>
        </>
      )}

      {/* Info */}
      {!showResults && (
        <div className="p-3 bg-surface-soft rounded-xl">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted">
              Las proyecciones son modelos simplificados basados en genetica de poblaciones.
              La evolucion real depende de muchos factores adicionales: migracion, deriva genetica,
              mutacion, y fuerzas sociales complejas.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
