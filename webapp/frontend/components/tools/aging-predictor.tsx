'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Heart,
  Clock,
  Dumbbell,
  Moon,
  Utensils,
  Wine,
  Cigarette,
  Brain,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  Target,
  Sparkles,
  Activity,
  Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

// Types
interface LongevityGene {
  id: string
  symbol: string
  name: string
  effect: 'protective' | 'risk' | 'neutral'
  score: number
  description: string
  descriptionEs: string
  modifiable: boolean
  interventions?: string[]
  interventionsEs?: string[]
}

interface LifestyleFactor {
  id: string
  name: string
  nameEs: string
  icon: typeof Dumbbell
  value: number // 0-100
  impact: number // years added/subtracted
  description: string
  descriptionEs: string
  recommendations: string[]
  recommendationsEs: string[]
}

interface Scenario {
  id: string
  name: string
  nameEs: string
  changes: Record<string, number>
  projectedImpact: number
}

// Demo longevity genes
const LONGEVITY_GENES: LongevityGene[] = [
  {
    id: 'foxo3',
    symbol: 'FOXO3',
    name: 'Forkhead Box O3',
    effect: 'protective',
    score: 92,
    description: 'You carry the longevity variant found in centenarians worldwide. This master regulator protects against aging.',
    descriptionEs: 'Llevas la variante de longevidad encontrada en centenarios de todo el mundo. Este regulador maestro protege contra el envejecimiento.',
    modifiable: false,
  },
  {
    id: 'apoe',
    symbol: 'APOE',
    name: 'Apolipoprotein E',
    effect: 'protective',
    score: 85,
    description: 'APOE3/3 genotype - associated with normal aging trajectory without elevated Alzheimer risk.',
    descriptionEs: 'Genotipo APOE3/3 - asociado con trayectoria de envejecimiento normal sin riesgo elevado de Alzheimer.',
    modifiable: false,
  },
  {
    id: 'sirt1',
    symbol: 'SIRT1',
    name: 'Sirtuin 1',
    effect: 'neutral',
    score: 68,
    description: 'Standard sirtuin activity. Can be enhanced through caloric restriction and exercise.',
    descriptionEs: 'Actividad estandar de sirtuina. Puede mejorarse a traves de restriccion calorica y ejercicio.',
    modifiable: true,
    interventions: ['Intermittent fasting', 'Regular exercise', 'Resveratrol-rich foods'],
    interventionsEs: ['Ayuno intermitente', 'Ejercicio regular', 'Alimentos ricos en resveratrol'],
  },
  {
    id: 'tert',
    symbol: 'TERT',
    name: 'Telomerase Reverse Transcriptase',
    effect: 'risk',
    score: 45,
    description: 'Lower telomerase activity variant. Focus on lifestyle factors that preserve telomere length.',
    descriptionEs: 'Variante con menor actividad de telomerasa. Enfocate en factores de estilo de vida que preserven la longitud de telomeros.',
    modifiable: true,
    interventions: ['Stress management', 'Regular aerobic exercise', 'Quality sleep', 'Omega-3 rich diet'],
    interventionsEs: ['Manejo del estres', 'Ejercicio aerobico regular', 'Sueno de calidad', 'Dieta rica en Omega-3'],
  },
  {
    id: 'mthfr',
    symbol: 'MTHFR',
    name: 'Methylenetetrahydrofolate Reductase',
    effect: 'neutral',
    score: 58,
    description: 'Heterozygous variant - reduced folate metabolism. B-vitamin supplementation may help.',
    descriptionEs: 'Variante heterocigota - metabolismo de folato reducido. Suplementacion de vitaminas B puede ayudar.',
    modifiable: true,
    interventions: ['Methylated B vitamins', 'Leafy greens', 'Avoid alcohol excess'],
    interventionsEs: ['Vitaminas B metiladas', 'Verduras de hoja verde', 'Evitar exceso de alcohol'],
  },
]

// Lifestyle factors with default values
const DEFAULT_LIFESTYLE: LifestyleFactor[] = [
  {
    id: 'exercise',
    name: 'Physical Activity',
    nameEs: 'Actividad Fisica',
    icon: Dumbbell,
    value: 60,
    impact: 2.5,
    description: 'Regular exercise adds years to life and life to years',
    descriptionEs: 'El ejercicio regular agrega anos a la vida y vida a los anos',
    recommendations: ['150+ min moderate activity/week', 'Strength training 2x/week', 'Daily movement breaks'],
    recommendationsEs: ['150+ min actividad moderada/semana', 'Entrenamiento de fuerza 2x/semana', 'Pausas de movimiento diarias'],
  },
  {
    id: 'sleep',
    name: 'Sleep Quality',
    nameEs: 'Calidad de Sueno',
    icon: Moon,
    value: 70,
    impact: 1.8,
    description: 'Quality sleep is essential for cellular repair and longevity',
    descriptionEs: 'El sueno de calidad es esencial para la reparacion celular y longevidad',
    recommendations: ['7-9 hours consistently', 'Regular sleep schedule', 'Dark, cool bedroom'],
    recommendationsEs: ['7-9 horas consistentemente', 'Horario de sueno regular', 'Habitacion oscura y fresca'],
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    nameEs: 'Nutricion',
    icon: Utensils,
    value: 55,
    impact: 2.0,
    description: 'What you eat directly affects cellular aging processes',
    descriptionEs: 'Lo que comes afecta directamente los procesos de envejecimiento celular',
    recommendations: ['Mediterranean-style diet', 'Reduce processed foods', 'Adequate protein intake'],
    recommendationsEs: ['Dieta estilo mediterranea', 'Reducir alimentos procesados', 'Ingesta adecuada de proteina'],
  },
  {
    id: 'stress',
    name: 'Stress Management',
    nameEs: 'Manejo del Estres',
    icon: Brain,
    value: 45,
    impact: 1.5,
    description: 'Chronic stress accelerates cellular aging and telomere shortening',
    descriptionEs: 'El estres cronico acelera el envejecimiento celular y acortamiento de telomeros',
    recommendations: ['Daily meditation practice', 'Regular nature exposure', 'Strong social connections'],
    recommendationsEs: ['Practica diaria de meditacion', 'Exposicion regular a naturaleza', 'Conexiones sociales fuertes'],
  },
  {
    id: 'alcohol',
    name: 'Alcohol Intake',
    nameEs: 'Consumo de Alcohol',
    icon: Wine,
    value: 75,
    impact: 1.2,
    description: 'Moderate to no alcohol consumption is optimal for longevity',
    descriptionEs: 'Consumo de alcohol moderado a nulo es optimo para longevidad',
    recommendations: ['Limit to 1 drink/day max', 'Alcohol-free days weekly', 'Consider elimination'],
    recommendationsEs: ['Limitar a 1 bebida/dia max', 'Dias sin alcohol semanales', 'Considerar eliminacion'],
  },
  {
    id: 'smoking',
    name: 'Tobacco Use',
    nameEs: 'Uso de Tabaco',
    icon: Cigarette,
    value: 100,
    impact: 5.0,
    description: 'Non-smoking is one of the biggest factors for longevity',
    descriptionEs: 'No fumar es uno de los mayores factores para longevidad',
    recommendations: ['Never smoke', 'Avoid secondhand smoke', 'Help others quit'],
    recommendationsEs: ['Nunca fumar', 'Evitar humo de segunda mano', 'Ayudar a otros a dejar'],
  },
]

// Preset scenarios
const SCENARIOS: Scenario[] = [
  {
    id: 'current',
    name: 'Current Habits',
    nameEs: 'Habitos Actuales',
    changes: {},
    projectedImpact: 0,
  },
  {
    id: 'optimized',
    name: 'Fully Optimized',
    nameEs: 'Totalmente Optimizado',
    changes: { exercise: 95, sleep: 90, nutrition: 90, stress: 85, alcohol: 90, smoking: 100 },
    projectedImpact: 8.5,
  },
  {
    id: 'exercise-focus',
    name: 'Exercise Focus',
    nameEs: 'Enfoque en Ejercicio',
    changes: { exercise: 90 },
    projectedImpact: 3.2,
  },
  {
    id: 'sleep-improvement',
    name: 'Sleep Improvement',
    nameEs: 'Mejora de Sueno',
    changes: { sleep: 85 },
    projectedImpact: 2.1,
  },
]

export function AgingPredictor() {
  const t = useTranslations()
  const [chronologicalAge, setChronologicalAge] = useState(35)
  const [lifestyle, setLifestyle] = useState<LifestyleFactor[]>(DEFAULT_LIFESTYLE)
  const [expandedGene, setExpandedGene] = useState<string | null>(null)
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null)
  const [activeScenario, setActiveScenario] = useState<string>('current')

  // Calculate biological age based on lifestyle and genes
  const calculateBiologicalAge = (lifestyleFactors: LifestyleFactor[]) => {
    let baseAge = chronologicalAge

    // Gene contributions
    const geneContribution = LONGEVITY_GENES.reduce((acc, gene) => {
      if (gene.effect === 'protective') return acc - (gene.score - 50) / 50
      if (gene.effect === 'risk') return acc + (50 - gene.score) / 25
      return acc
    }, 0)

    // Lifestyle contributions
    const lifestyleContribution = lifestyleFactors.reduce((acc, factor) => {
      const deviation = (factor.value - 70) / 30 // Normalized deviation from "average"
      return acc - (deviation * factor.impact)
    }, 0)

    return Math.round(baseAge + geneContribution + lifestyleContribution)
  }

  const biologicalAge = calculateBiologicalAge(lifestyle)
  const ageDifference = chronologicalAge - biologicalAge

  // Apply scenario
  const applyScenario = (scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId)
    if (!scenario) return

    setActiveScenario(scenarioId)

    if (scenarioId === 'current') {
      setLifestyle(DEFAULT_LIFESTYLE)
    } else {
      setLifestyle(prev => prev.map(factor => ({
        ...factor,
        value: scenario.changes[factor.id] ?? factor.value,
      })))
    }
  }

  // Update single lifestyle factor
  const updateLifestyleFactor = (factorId: string, newValue: number) => {
    setActiveScenario('current')
    setLifestyle(prev => prev.map(factor =>
      factor.id === factorId ? { ...factor, value: newValue } : factor
    ))
  }

  // Get color based on score/value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>Aging Predictor</Title>
            <Text>Discover your biological age and optimize for longevity</Text>
          </div>
        </div>
      </Card>

      {/* Age Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chronological Age */}
        <Card>
          <div className="text-center">
            <p className="text-sm text-muted uppercase tracking-wide">Chronological Age</p>
            <div className="mt-2">
              <input
                type="number"
                value={chronologicalAge}
                onChange={(e) => setChronologicalAge(parseInt(e.target.value) || 35)}
                className="text-4xl font-bold text-title w-20 text-center border-b-2 border-adaptive focus:border-blue-500 focus:outline-none bg-transparent"
                min={18}
                max={100}
              />
              <span className="text-xl text-muted ml-2">years</span>
            </div>
            <p className="text-xs text-subtle mt-2">Your calendar age</p>
          </div>
        </Card>

        {/* Biological Age */}
        <Card className={`${ageDifference > 0 ? 'bg-success-soft border-success' : ageDifference < 0 ? 'bg-danger-soft border-danger' : ''}`}>
          <div className="text-center">
            <p className="text-sm text-muted uppercase tracking-wide">Biological Age</p>
            <p className={`text-5xl font-bold mt-2 ${
              ageDifference > 0 ? 'text-success' : ageDifference < 0 ? 'text-danger' : 'text-title'
            }`}>
              {biologicalAge}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {ageDifference > 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-success">{ageDifference} years younger</span>
                </>
              ) : ageDifference < 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-danger">{Math.abs(ageDifference)} years older</span>
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

        {/* Longevity Score */}
        <Card>
          <div className="text-center">
            <p className="text-sm text-muted uppercase tracking-wide">Longevity Score</p>
            <p className="text-5xl font-bold text-accent mt-2">
              {Math.round((lifestyle.reduce((acc, f) => acc + f.value, 0) / lifestyle.length +
                LONGEVITY_GENES.reduce((acc, g) => acc + g.score, 0) / LONGEVITY_GENES.length) / 2)}
            </p>
            <p className="text-xs text-subtle mt-2">Combined genetic + lifestyle</p>
          </div>
        </Card>
      </div>

      {/* Scenario Simulator */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <Title>Scenario Simulator</Title>
        </div>
        <Text className="mb-4">See how lifestyle changes could impact your biological age</Text>

        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => applyScenario(scenario.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeScenario === scenario.id
                  ? 'bg-accent-soft0 text-white'
                  : 'bg-surface-muted text-body hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {scenario.name}
              {scenario.projectedImpact > 0 && (
                <span className="ml-2 text-xs opacity-75">+{scenario.projectedImpact} yrs</span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Lifestyle Factors */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-500" />
          <Title>Modifiable Factors</Title>
        </div>
        <Text className="mb-6">Adjust these factors to see projected impact on your biological age</Text>

        <div className="space-y-6">
          {lifestyle.map(factor => {
            const Icon = factor.icon
            const isExpanded = expandedFactor === factor.id

            return (
              <div key={factor.id} className="space-y-2">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedFactor(isExpanded ? null : factor.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      factor.value >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
                      factor.value >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        factor.value >= 80 ? 'text-success' :
                        factor.value >= 60 ? 'text-yellow-600' : 'text-danger'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-title">{factor.name}</p>
                      <p className="text-xs text-muted">
                        Impact: up to {factor.impact} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-body">{factor.value}%</span>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-subtle" /> : <ChevronRight className="w-5 h-5 text-subtle" />}
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={factor.value}
                  onChange={(e) => updateLifestyleFactor(factor.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-xl appearance-none cursor-pointer accent-purple-500"
                />

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-3 p-4 bg-surface-soft rounded-xl space-y-3">
                    <p className="text-sm text-body">{factor.description}</p>
                    <div>
                      <p className="text-xs font-medium text-muted uppercase mb-2">Recommendations</p>
                      <ul className="space-y-1">
                        {factor.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-body flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-success-soft0 rounded-full"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Longevity Genes */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-500" />
          <Title>Your Longevity Genes</Title>
        </div>
        <Text className="mb-6">Genetic factors that influence your aging trajectory</Text>

        <div className="space-y-4">
          {LONGEVITY_GENES.map(gene => {
            const isExpanded = expandedGene === gene.id

            return (
              <div
                key={gene.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  gene.effect === 'protective' ? 'border-success bg-success-soft/50' :
                  gene.effect === 'risk' ? 'border-danger bg-danger-soft/50' :
                  'border-adaptive bg-surface-soft/50'
                }`}
                onClick={() => setExpandedGene(isExpanded ? null : gene.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      gene.effect === 'protective' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      gene.effect === 'risk' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-surface-muted text-body'
                    }`}>
                      {gene.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-title">{gene.symbol}</p>
                        <Badge
                          color={gene.effect === 'protective' ? 'green' : gene.effect === 'risk' ? 'red' : 'gray'}
                          size="xs"
                        >
                          {gene.effect}
                        </Badge>
                        {gene.modifiable && (
                          <Badge color="purple" size="xs">modifiable</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted">{gene.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-title">{gene.score}</p>
                      <p className="text-xs text-muted">score</p>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-subtle" /> : <ChevronRight className="w-5 h-5 text-subtle" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-adaptive space-y-3">
                    <p className="text-sm text-body">{gene.description}</p>

                    {gene.interventions && (
                      <div className="p-3 bg-accent-soft rounded-xl">
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase mb-2">
                          <Zap className="w-3 h-3 inline mr-1" />
                          Ways to Optimize
                        </p>
                        <ul className="space-y-1">
                          {gene.interventions.map((intervention, idx) => (
                            <li key={idx} className="text-sm text-body flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent-soft0 rounded-full"></span>
                              {intervention}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Action Plan */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Your Personalized Longevity Plan</p>
            <p className="text-white/80 text-sm mt-1">
              Based on your genetic profile, focus on: stress management, exercise consistency, and sleep optimization.
              These align with your TERT and CLOCK variants for maximum impact.
            </p>
          </div>
          <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            View Full Plan
          </Button>
        </div>
      </Card>
    </div>
  )
}
