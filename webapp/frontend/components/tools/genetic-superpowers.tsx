'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge, Grid, Col } from '@tremor/react'
import {
  Zap,
  Brain,
  Heart,
  Dumbbell,
  Timer,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  Trophy,
  Star,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

// Types
interface Superpower {
  id: string
  name: string
  nameEs: string
  category: 'memory' | 'endurance' | 'strength' | 'longevity' | 'speed'
  score: number // 0-100
  rarity: number // percentage of population
  variant: string
  gene: string
  description: string
  descriptionEs: string
  science: string
  scienceEs: string
  enhancement: string[]
  enhancementEs: string[]
  icon: typeof Brain
  color: string
}

// Demo superpowers data
const SUPERPOWERS: Superpower[] = [
  {
    id: 'warrior',
    name: 'Warrior Focus',
    nameEs: 'Enfoque Guerrero',
    category: 'memory',
    score: 85,
    rarity: 8,
    variant: 'rs4680 (Val/Met)',
    gene: 'COMT',
    description: 'You have the "Warrior" variant. Better performance under stress, enhanced focus when it matters most.',
    descriptionEs: 'Tienes la variante "Guerrero". Mejor rendimiento bajo estres, mayor enfoque cuando mas importa.',
    science: 'The COMT gene encodes an enzyme that breaks down dopamine. The Val variant results in faster dopamine clearance, leading to better cognitive performance under stress.',
    scienceEs: 'El gen COMT codifica una enzima que descompone la dopamina. La variante Val resulta en una eliminacion mas rapida de dopamina, lo que lleva a mejor rendimiento cognitivo bajo estres.',
    enhancement: ['Meditation enhances this trait', 'Avoid chronic stress', 'Regular sleep optimizes dopamine'],
    enhancementEs: ['La meditacion potencia este rasgo', 'Evita el estres cronico', 'El sueno regular optimiza la dopamina'],
    icon: Brain,
    color: 'purple',
  },
  {
    id: 'endurance',
    name: 'Marathon Runner',
    nameEs: 'Corredor de Maraton',
    category: 'endurance',
    score: 72,
    rarity: 15,
    variant: 'rs1815739 (CC)',
    gene: 'ACTN3',
    description: 'Your muscles are optimized for endurance activities. You excel at sustained effort over long periods.',
    descriptionEs: 'Tus musculos estan optimizados para actividades de resistencia. Sobresales en esfuerzo sostenido durante largos periodos.',
    science: 'The ACTN3 gene produces a protein found in fast-twitch muscle fibers. The CC genotype is associated with enhanced endurance performance.',
    scienceEs: 'El gen ACTN3 produce una proteina que se encuentra en las fibras musculares de contraccion rapida. El genotipo CC esta asociado con mayor rendimiento de resistencia.',
    enhancement: ['Aerobic training maximizes this', 'Zone 2 cardio is your sweet spot', 'High altitude training'],
    enhancementEs: ['El entrenamiento aerobico maximiza esto', 'El cardio zona 2 es tu punto dulce', 'Entrenamiento en altitud'],
    icon: Timer,
    color: 'green',
  },
  {
    id: 'longevity',
    name: 'Centenarian Gene',
    nameEs: 'Gen Centenario',
    category: 'longevity',
    score: 91,
    rarity: 5,
    variant: 'rs2802292 (TT)',
    gene: 'FOXO3',
    description: 'You carry the longevity variant found in centenarians worldwide. This gene is your ally against aging.',
    descriptionEs: 'Llevas la variante de longevidad encontrada en centenarios de todo el mundo. Este gen es tu aliado contra el envejecimiento.',
    science: 'FOXO3 is a master regulator of genes involved in stress resistance, metabolism, and cellular repair. The TT variant is significantly overrepresented in centenarians.',
    scienceEs: 'FOXO3 es un regulador maestro de genes involucrados en resistencia al estres, metabolismo y reparacion celular. La variante TT esta significativamente sobrerepresentada en centenarios.',
    enhancement: ['Fasting activates FOXO3', 'Cold exposure enhances it', 'Caloric restriction'],
    enhancementEs: ['El ayuno activa FOXO3', 'La exposicion al frio lo potencia', 'Restriccion calorica'],
    icon: Shield,
    color: 'blue',
  },
  {
    id: 'strength',
    name: 'Natural Strength',
    nameEs: 'Fuerza Natural',
    category: 'strength',
    score: 65,
    rarity: 22,
    variant: 'rs1800012 (GG)',
    gene: 'COL1A1',
    description: 'Your tendons and ligaments are naturally stronger, reducing injury risk during strength training.',
    descriptionEs: 'Tus tendones y ligamentos son naturalmente mas fuertes, reduciendo el riesgo de lesiones durante el entrenamiento de fuerza.',
    science: 'COL1A1 encodes type I collagen, a key component of tendons and ligaments. The GG variant produces stronger connective tissue.',
    scienceEs: 'COL1A1 codifica el colageno tipo I, un componente clave de tendones y ligamentos. La variante GG produce tejido conectivo mas fuerte.',
    enhancement: ['Progressive overload training', 'Vitamin C supports collagen', 'Adequate protein intake'],
    enhancementEs: ['Entrenamiento de sobrecarga progresiva', 'La vitamina C apoya el colageno', 'Ingesta adecuada de proteina'],
    icon: Dumbbell,
    color: 'orange',
  },
  {
    id: 'empathy',
    name: 'Super Empathy',
    nameEs: 'Super Empatia',
    category: 'memory',
    score: 78,
    rarity: 12,
    variant: 'rs53576 (GG)',
    gene: 'OXTR',
    description: 'Enhanced oxytocin sensitivity makes you naturally attuned to others emotions and social cues.',
    descriptionEs: 'La sensibilidad aumentada a la oxitocina te hace naturalmente sintonizado con las emociones de otros y las senales sociales.',
    science: 'The OXTR gene encodes the oxytocin receptor. The GG variant is associated with greater empathy, social memory, and stress resilience.',
    scienceEs: 'El gen OXTR codifica el receptor de oxitocina. La variante GG esta asociada con mayor empatia, memoria social y resiliencia al estres.',
    enhancement: ['Social bonding strengthens this', 'Physical touch releases oxytocin', 'Acts of kindness'],
    enhancementEs: ['El vinculo social fortalece esto', 'El contacto fisico libera oxitocina', 'Actos de bondad'],
    icon: Heart,
    color: 'pink',
  },
]

// Category icons and colors
const CATEGORY_CONFIG = {
  memory: { icon: Brain, color: 'purple', label: 'Memory & Focus', labelEs: 'Memoria y Enfoque' },
  endurance: { icon: Timer, color: 'green', label: 'Endurance', labelEs: 'Resistencia' },
  strength: { icon: Dumbbell, color: 'orange', label: 'Strength', labelEs: 'Fuerza' },
  longevity: { icon: Shield, color: 'blue', label: 'Longevity', labelEs: 'Longevidad' },
  speed: { icon: Zap, color: 'yellow', label: 'Speed', labelEs: 'Velocidad' },
}

export function GeneticSuperpowers() {
  const t = useTranslations('tools.superpowers')
  const [loading, setLoading] = useState(true)
  const [superpowers, setSuperpowers] = useState<Superpower[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [animatingId, setAnimatingId] = useState<string | null>(null)

  // Simulate loading and unlocking animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      setSuperpowers(SUPERPOWERS)

      // Unlock animation sequence
      SUPERPOWERS.forEach((sp, index) => {
        setTimeout(() => {
          setAnimatingId(sp.id)
          setTimeout(() => {
            setUnlockedIds((prev) => new Set([...Array.from(prev), sp.id]))
            setAnimatingId(null)
          }, 600)
        }, index * 800)
      })
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleShare = (superpower: Superpower) => {
    const text = `I discovered my genetic superpower: ${superpower.name}! I'm in the top ${superpower.rarity}% of the population. #AlphaGenome #GeneticSuperpowers`
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  // Calculate radar chart values
  const radarData = {
    memory: superpowers.filter((s) => s.category === 'memory').reduce((acc, s) => acc + s.score, 0) / Math.max(1, superpowers.filter((s) => s.category === 'memory').length),
    endurance: superpowers.filter((s) => s.category === 'endurance').reduce((acc, s) => acc + s.score, 0) / Math.max(1, superpowers.filter((s) => s.category === 'endurance').length),
    strength: superpowers.filter((s) => s.category === 'strength').reduce((acc, s) => acc + s.score, 0) / Math.max(1, superpowers.filter((s) => s.category === 'strength').length),
    longevity: superpowers.filter((s) => s.category === 'longevity').reduce((acc, s) => acc + s.score, 0) / Math.max(1, superpowers.filter((s) => s.category === 'longevity').length),
    speed: 45, // Placeholder
  }

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full animate-spin opacity-20"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
          </div>
          <Title>Scanning your genetic superpowers...</Title>
          <Text className="mt-2">Analyzing variants associated with exceptional traits</Text>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>{t('title')}</Title>
            <Text>{t('description')}</Text>
          </div>
        </div>
      </Card>

      {/* Radar Chart (simplified visual representation) */}
      <Card>
        <Title className="mb-4">Your Genetic Profile</Title>
        <div className="flex justify-center">
          <div className="relative w-64 h-64">
            {/* Pentagon background */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Background grid */}
              {[20, 40, 60, 80, 100].map((level) => (
                <polygon
                  key={level}
                  points={calculatePentagonPoints(100, 100, level * 0.8)}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Data polygon */}
              <polygon
                points={calculateDataPoints(100, 100, 80, radarData)}
                fill="rgba(147, 51, 234, 0.2)"
                stroke="rgb(147, 51, 234)"
                strokeWidth="2"
              />

              {/* Labels */}
              {Object.entries(CATEGORY_CONFIG).map(([key, config], index) => {
                const angle = (index * 72 - 90) * (Math.PI / 180)
                const x = 100 + Math.cos(angle) * 95
                const y = 100 + Math.sin(angle) * 95
                return (
                  <g key={key}>
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-gray-600 font-medium"
                    >
                      {config.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </Card>

      {/* Superpowers List */}
      <div className="space-y-4">
        <Title>Discovered Superpowers</Title>

        {superpowers.map((superpower) => {
          const isUnlocked = unlockedIds.has(superpower.id)
          const isAnimating = animatingId === superpower.id
          const isExpanded = expandedId === superpower.id
          const Icon = superpower.icon
          const categoryConfig = CATEGORY_CONFIG[superpower.category]

          return (
            <Card
              key={superpower.id}
              className={`
                transition-all duration-500 overflow-hidden
                ${isAnimating ? 'scale-105 shadow-xl ring-2 ring-purple-400' : ''}
                ${!isUnlocked && !isAnimating ? 'opacity-50 blur-sm' : ''}
              `}
            >
              {/* Unlock animation overlay */}
              {isAnimating && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 animate-pulse z-10 pointer-events-none">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 animate-spin" />
                      <span className="font-bold text-purple-700">{t('unlocked')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Main content */}
              <div
                onClick={() => isUnlocked && setExpandedId(isExpanded ? null : superpower.id)}
                className={`cursor-pointer ${isUnlocked ? '' : 'pointer-events-none'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${superpower.color}-100`}>
                      <Icon className={`w-6 h-6 text-${superpower.color}-600`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{superpower.name}</p>
                        {isUnlocked && (
                          <Badge color={superpower.color as any} size="xs">
                            {superpower.gene}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{superpower.variant}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isUnlocked && (
                      <>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-gray-800">{superpower.score}</span>
                          </div>
                          <p className="text-xs text-gray-500">Top {superpower.rarity}%</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {isUnlocked && (
                  <p className="mt-3 text-sm text-gray-600">{superpower.description}</p>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && isUnlocked && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Science section */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{t('seeScience')}</p>
                    <p className="text-sm text-gray-600">{superpower.science}</p>
                  </div>

                  {/* Enhancement tips */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-medium text-green-600 uppercase mb-2">{t('howToEnhance')}</p>
                    <ul className="space-y-1">
                      {superpower.enhancement.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Share button */}
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="xs"
                      icon={Share2}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(superpower)
                      }}
                    >
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Helper function to calculate pentagon points
function calculatePentagonPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = []
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    points.push(`${x},${y}`)
  }
  return points.join(' ')
}

// Helper function to calculate data polygon points
function calculateDataPoints(
  cx: number,
  cy: number,
  maxRadius: number,
  data: Record<string, number>
): string {
  const categories = ['memory', 'endurance', 'strength', 'longevity', 'speed']
  const points: string[] = []

  categories.forEach((cat, i) => {
    const value = data[cat] || 0
    const radius = (value / 100) * maxRadius
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    points.push(`${x},${y}`)
  })

  return points.join(' ')
}
