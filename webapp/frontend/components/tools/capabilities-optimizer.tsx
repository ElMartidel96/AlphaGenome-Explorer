'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Brain,
  Target,
  Zap,
  Trophy,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
  Star,
  BookOpen,
  Dumbbell,
  Moon,
  Coffee,
  Heart,
  Focus,
  Info,
  Award,
  Sparkles,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

// Types
interface CognitiveGene {
  id: string
  symbol: string
  trait: string
  traitEs: string
  category: 'memory' | 'focus' | 'learning' | 'processing' | 'creativity'
  score: number
  strength: boolean
  description: string
  descriptionEs: string
}

interface Intervention {
  id: string
  name: string
  nameEs: string
  category: 'exercise' | 'sleep' | 'nutrition' | 'cognitive' | 'stress'
  duration: string
  frequency: string
  impact: string
  impactEs: string
  evidenceLevel: 'strong' | 'moderate' | 'emerging'
  relatedGenes: string[]
}

interface QuickTest {
  id: string
  name: string
  nameEs: string
  type: 'focus' | 'memory' | 'processing'
  duration: string
  description: string
  descriptionEs: string
}

interface Achievement {
  id: string
  name: string
  nameEs: string
  icon: typeof Award
  description: string
  descriptionEs: string
  unlocked: boolean
  progress: number
  target: number
}

// Demo cognitive genes
const COGNITIVE_GENES: CognitiveGene[] = [
  {
    id: 'bdnf',
    symbol: 'BDNF',
    trait: 'Learning & Memory',
    traitEs: 'Aprendizaje y Memoria',
    category: 'memory',
    score: 85,
    strength: true,
    description: 'Val/Val variant - optimal BDNF secretion supports enhanced learning and memory consolidation.',
    descriptionEs: 'Variante Val/Val - secrecion optima de BDNF apoya aprendizaje mejorado y consolidacion de memoria.',
  },
  {
    id: 'kibra',
    symbol: 'KIBRA',
    trait: 'Episodic Memory',
    traitEs: 'Memoria Episodica',
    category: 'memory',
    score: 78,
    strength: true,
    description: 'T-allele carrier - associated with better episodic memory performance.',
    descriptionEs: 'Portador de alelo T - asociado con mejor rendimiento de memoria episodica.',
  },
  {
    id: 'comt',
    symbol: 'COMT',
    trait: 'Sustained Focus',
    traitEs: 'Enfoque Sostenido',
    category: 'focus',
    score: 72,
    strength: true,
    description: 'Warrior variant - better cognitive performance under stress with faster dopamine clearance.',
    descriptionEs: 'Variante guerrero - mejor rendimiento cognitivo bajo estres con eliminacion de dopamina mas rapida.',
  },
  {
    id: 'drd2',
    symbol: 'DRD2',
    trait: 'Reward Learning',
    traitEs: 'Aprendizaje por Recompensa',
    category: 'learning',
    score: 58,
    strength: false,
    description: 'A1 carrier - may benefit from structured reward systems and gamification.',
    descriptionEs: 'Portador A1 - puede beneficiarse de sistemas de recompensa estructurados y gamificacion.',
  },
  {
    id: 'apoe',
    symbol: 'APOE',
    trait: 'Cognitive Aging',
    traitEs: 'Envejecimiento Cognitivo',
    category: 'processing',
    score: 82,
    strength: true,
    description: 'APOE3/3 - normal cognitive aging trajectory with good brain lipid transport.',
    descriptionEs: 'APOE3/3 - trayectoria de envejecimiento cognitivo normal con buen transporte de lipidos cerebrales.',
  },
  {
    id: 'chrm2',
    symbol: 'CHRM2',
    trait: 'Processing Speed',
    traitEs: 'Velocidad de Procesamiento',
    category: 'processing',
    score: 65,
    strength: false,
    description: 'May benefit from cholinergic support - eggs, fish, and cognitive training.',
    descriptionEs: 'Puede beneficiarse de soporte colinergico - huevos, pescado y entrenamiento cognitivo.',
  },
]

// Evidence-based interventions
const INTERVENTIONS: Intervention[] = [
  {
    id: 'hiit',
    name: 'High-Intensity Interval Training',
    nameEs: 'Entrenamiento de Intervalos de Alta Intensidad',
    category: 'exercise',
    duration: '20-30 min',
    frequency: '3x/week',
    impact: 'BDNF increase up to 200-300%, improved executive function',
    impactEs: 'Aumento de BDNF hasta 200-300%, funcion ejecutiva mejorada',
    evidenceLevel: 'strong',
    relatedGenes: ['BDNF', 'KIBRA'],
  },
  {
    id: 'sleep-optimization',
    name: 'Sleep Optimization Protocol',
    nameEs: 'Protocolo de Optimizacion de Sueno',
    category: 'sleep',
    duration: '7-9 hours',
    frequency: 'Daily',
    impact: 'Memory consolidation, synaptic pruning, cognitive recovery',
    impactEs: 'Consolidacion de memoria, poda sinaptica, recuperacion cognitiva',
    evidenceLevel: 'strong',
    relatedGenes: ['BDNF', 'APOE'],
  },
  {
    id: 'dual-n-back',
    name: 'Dual N-Back Training',
    nameEs: 'Entrenamiento Dual N-Back',
    category: 'cognitive',
    duration: '15-20 min',
    frequency: '5x/week',
    impact: 'Working memory improvement, fluid intelligence gains',
    impactEs: 'Mejora de memoria de trabajo, ganancias en inteligencia fluida',
    evidenceLevel: 'moderate',
    relatedGenes: ['COMT', 'DRD2'],
  },
  {
    id: 'omega3',
    name: 'Omega-3 Supplementation',
    nameEs: 'Suplementacion de Omega-3',
    category: 'nutrition',
    duration: '2g EPA+DHA',
    frequency: 'Daily',
    impact: 'Neuronal membrane health, anti-inflammatory, mood support',
    impactEs: 'Salud de membrana neuronal, antiinflamatorio, soporte de animo',
    evidenceLevel: 'strong',
    relatedGenes: ['APOE', 'CHRM2'],
  },
  {
    id: 'meditation',
    name: 'Focused Attention Meditation',
    nameEs: 'Meditacion de Atencion Enfocada',
    category: 'stress',
    duration: '15 min',
    frequency: 'Daily',
    impact: 'Improved attention, stress reduction, gray matter changes',
    impactEs: 'Atencion mejorada, reduccion de estres, cambios en materia gris',
    evidenceLevel: 'strong',
    relatedGenes: ['COMT', 'BDNF'],
  },
  {
    id: 'cold-exposure',
    name: 'Cold Exposure',
    nameEs: 'Exposicion al Frio',
    category: 'stress',
    duration: '2-3 min',
    frequency: 'Daily',
    impact: 'Dopamine +250%, norepinephrine boost, focus enhancement',
    impactEs: 'Dopamina +250%, aumento de norepinefrina, mejora de enfoque',
    evidenceLevel: 'moderate',
    relatedGenes: ['DRD2', 'COMT'],
  },
]

// Quick cognitive tests
const QUICK_TESTS: QuickTest[] = [
  {
    id: 'focus-test',
    name: 'Focus Challenge',
    nameEs: 'Desafio de Enfoque',
    type: 'focus',
    duration: '2 min',
    description: 'Track a moving target while ignoring distractors',
    descriptionEs: 'Sigue un objetivo en movimiento mientras ignoras distractores',
  },
  {
    id: 'memory-test',
    name: 'Sequence Memory',
    nameEs: 'Memoria de Secuencia',
    type: 'memory',
    duration: '3 min',
    description: 'Remember and reproduce increasingly long sequences',
    descriptionEs: 'Recuerda y reproduce secuencias cada vez mas largas',
  },
  {
    id: 'processing-test',
    name: 'Pattern Match',
    nameEs: 'Coincidencia de Patrones',
    type: 'processing',
    duration: '2 min',
    description: 'Match symbols as quickly as possible',
    descriptionEs: 'Empareja simbolos lo mas rapido posible',
  },
]

// Demo achievements
const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-test', name: 'First Assessment', nameEs: 'Primera Evaluacion', icon: Target, description: 'Complete your first cognitive test', descriptionEs: 'Completa tu primer test cognitivo', unlocked: true, progress: 1, target: 1 },
  { id: 'week-streak', name: 'Weekly Warrior', nameEs: 'Guerrero Semanal', icon: Zap, description: 'Complete all interventions for a week', descriptionEs: 'Completa todas las intervenciones por una semana', unlocked: false, progress: 5, target: 7 },
  { id: 'improvement', name: '10% Improvement', nameEs: '10% de Mejora', icon: TrendingUp, description: 'Improve any score by 10%', descriptionEs: 'Mejora cualquier puntuacion en 10%', unlocked: true, progress: 12, target: 10 },
  { id: 'master', name: 'Cognitive Master', nameEs: 'Maestro Cognitivo', icon: Trophy, description: 'Reach 80+ in all categories', descriptionEs: 'Alcanza 80+ en todas las categorias', unlocked: false, progress: 3, target: 5 },
]

// Category config
const CATEGORY_CONFIG = {
  memory: { icon: Brain, color: 'purple', label: 'Memory' },
  focus: { icon: Target, color: 'blue', label: 'Focus' },
  learning: { icon: BookOpen, color: 'green', label: 'Learning' },
  processing: { icon: Zap, color: 'orange', label: 'Processing' },
  creativity: { icon: Sparkles, color: 'pink', label: 'Creativity' },
}

const INTERVENTION_ICONS = {
  exercise: Dumbbell,
  sleep: Moon,
  nutrition: Coffee,
  cognitive: Brain,
  stress: Heart,
}

export function CapabilitiesOptimizer() {
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState<'profile' | 'program' | 'tests' | 'progress'>('profile')
  const [expandedGene, setExpandedGene] = useState<string | null>(null)
  const [selectedIntervention, setSelectedIntervention] = useState<string | null>(null)
  const [testInProgress, setTestInProgress] = useState<string | null>(null)
  const [testScore, setTestScore] = useState<number | null>(null)

  // Calculate overall scores by category
  const categoryScores = Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
    const genes = COGNITIVE_GENES.filter(g => g.category === key)
    const avgScore = genes.length > 0
      ? Math.round(genes.reduce((acc, g) => acc + g.score, 0) / genes.length)
      : 0
    return { category: key, ...config, score: avgScore }
  })

  // Demo weekly progress
  const weeklyProgress = [
    { day: 'Mon', focus: 72, memory: 68, energy: 75 },
    { day: 'Tue', focus: 75, memory: 70, energy: 72 },
    { day: 'Wed', focus: 78, memory: 73, energy: 78 },
    { day: 'Thu', focus: 74, memory: 75, energy: 80 },
    { day: 'Fri', focus: 80, memory: 78, energy: 76 },
    { day: 'Sat', focus: 82, memory: 80, energy: 82 },
    { day: 'Sun', focus: 79, memory: 79, energy: 84 },
  ]

  // Simulate test
  const startTest = (testId: string) => {
    setTestInProgress(testId)
    setTestScore(null)

    // Simulate test completion after delay
    setTimeout(() => {
      const score = 65 + Math.floor(Math.random() * 25) // Random score 65-90
      setTestScore(score)
      setTestInProgress(null)
      toast.success(`Test completed! Score: ${score}`)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>Capabilities Optimizer</Title>
            <Text>Optimize cognitive performance with evidence-based interventions</Text>
          </div>
        </div>
      </Card>

      {/* Overall Score Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categoryScores.map(({ category, icon: Icon, color, label, score }) => (
          <Card key={category} className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 text-${color}-500`} />
              <span className="text-xs font-medium text-body">{label}</span>
            </div>
            <p className={`text-2xl font-bold text-${color}-600`}>{score}</p>
            <ProgressBar value={score} color={color as any} className="mt-2" />
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 p-1 bg-surface-muted rounded-xl">
        {[
          { id: 'profile', label: 'Cognitive Profile', icon: Brain },
          { id: 'program', label: 'Weekly Program', icon: BookOpen },
          { id: 'tests', label: 'Quick Tests', icon: Target },
          { id: 'progress', label: 'Progress', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white shadow text-blue-700'
                : 'text-body hover:text-title'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Cognitive Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <Card>
            <Title className="mb-2">Your Cognitive Profile</Title>
            <Text>
              These genes influence various aspects of cognitive function. Understanding your profile
              helps personalize your optimization strategy.
            </Text>
          </Card>

          {COGNITIVE_GENES.map(gene => {
            const config = CATEGORY_CONFIG[gene.category]
            const Icon = config.icon
            const isExpanded = expandedGene === gene.id

            return (
              <Card
                key={gene.id}
                className={`cursor-pointer transition-all ${
                  gene.strength ? 'border-l-4 border-green-500' : 'border-l-4 border-amber-500'
                }`}
                onClick={() => setExpandedGene(isExpanded ? null : gene.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${config.color}-100`}>
                      <Icon className={`w-6 h-6 text-${config.color}-600`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-title">{gene.symbol}</p>
                        <Badge color={gene.strength ? 'green' : 'yellow'} size="xs">
                          {gene.strength ? 'Strength' : 'Opportunity'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">{gene.trait}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-title">{gene.score}</p>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-subtle" /> : <ChevronRight className="w-5 h-5 text-subtle" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-adaptive">
                    <p className="text-sm text-body">{gene.description}</p>
                  </div>
                )}
              </Card>
            )
          })}

          {/* Disclaimer */}
          <Card className="bg-info-soft border-info">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Profile of Tendencies</p>
                <p className="text-xs text-blue-700 mt-1">
                  This profile shows genetic tendencies, not guarantees. Cognitive abilities are influenced
                  by many factors including environment, education, and lifestyle. Use this as a guide,
                  not a limitation.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Weekly Program Tab */}
      {activeTab === 'program' && (
        <div className="space-y-4">
          <Card>
            <Title className="mb-2">Your Weekly Program</Title>
            <Text>Evidence-based interventions personalized to your genetic profile.</Text>
          </Card>

          {INTERVENTIONS.map(intervention => {
            const Icon = INTERVENTION_ICONS[intervention.category]
            const isSelected = selectedIntervention === intervention.id

            return (
              <Card
                key={intervention.id}
                className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => setSelectedIntervention(isSelected ? null : intervention.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-muted rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-body" />
                    </div>
                    <div>
                      <p className="font-semibold text-title">{intervention.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color="gray" size="xs">{intervention.duration}</Badge>
                        <Badge color="gray" size="xs">{intervention.frequency}</Badge>
                        <Badge
                          color={intervention.evidenceLevel === 'strong' ? 'green' : intervention.evidenceLevel === 'moderate' ? 'yellow' : 'gray'}
                          size="xs"
                        >
                          {intervention.evidenceLevel} evidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isSelected ? <ChevronDown className="w-5 h-5 text-subtle" /> : <ChevronRight className="w-5 h-5 text-subtle" />}
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-adaptive space-y-3">
                    <div className="p-3 bg-success-soft rounded-xl">
                      <p className="text-xs font-medium text-green-700 uppercase mb-1">Expected Impact</p>
                      <p className="text-sm text-body">{intervention.impact}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted uppercase mb-2">Related Genes</p>
                      <div className="flex gap-2">
                        {intervention.relatedGenes.map(gene => (
                          <Badge key={gene} color="purple" size="xs">{gene}</Badge>
                        ))}
                      </div>
                    </div>

                    <Button size="xs" icon={CheckCircle}>Mark as Completed Today</Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Quick Tests Tab */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <Card>
            <Title className="mb-2">Quick Assessment Tests</Title>
            <Text>Brief cognitive tests to track your performance over time.</Text>
          </Card>

          {QUICK_TESTS.map(test => {
            const isRunning = testInProgress === test.id

            return (
              <Card key={test.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      test.type === 'focus' ? 'bg-blue-100' :
                      test.type === 'memory' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {test.type === 'focus' && <Target className="w-6 h-6 text-info" />}
                      {test.type === 'memory' && <Brain className="w-6 h-6 text-accent" />}
                      {test.type === 'processing' && <Zap className="w-6 h-6 text-orange-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-title">{test.name}</p>
                      <p className="text-sm text-muted">{test.description}</p>
                      <Badge color="gray" size="xs" className="mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />{test.duration}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {testScore && testInProgress === null && (
                      <div className="text-right">
                        <p className="text-xl font-bold text-title">{testScore}</p>
                        <p className="text-xs text-muted">Last score</p>
                      </div>
                    )}
                    <Button
                      size="xs"
                      icon={isRunning ? RefreshCw : Play}
                      disabled={isRunning}
                      onClick={() => startTest(test.id)}
                      className={isRunning ? 'animate-pulse' : ''}
                    >
                      {isRunning ? 'Testing...' : 'Start'}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* Weekly Chart */}
          <Card>
            <Title className="mb-4">Weekly Progress</Title>

            <div className="flex items-end justify-between h-40 gap-2">
              {weeklyProgress.map((day, idx) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full space-y-1">
                    <div
                      className="bg-blue-200 rounded-t"
                      style={{ height: `${(day.focus / 100) * 80}px` }}
                      title={`Focus: ${day.focus}`}
                    />
                    <div
                      className="bg-purple-200 rounded"
                      style={{ height: `${(day.memory / 100) * 80}px` }}
                      title={`Memory: ${day.memory}`}
                    />
                    <div
                      className="bg-green-200 rounded-b"
                      style={{ height: `${(day.energy / 100) * 80}px` }}
                      title={`Energy: ${day.energy}`}
                    />
                  </div>
                  <span className="text-xs text-muted">{day.day}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-200 rounded" />
                <span className="text-xs text-muted">Focus</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-200 rounded" />
                <span className="text-xs text-muted">Memory</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-200 rounded" />
                <span className="text-xs text-muted">Energy</span>
              </div>
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <Title className="mb-4">Achievements</Title>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map(achievement => {
                const Icon = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 ${
                      achievement.unlocked
                        ? 'border-yellow-300 bg-warning-soft'
                        : 'border-adaptive bg-surface-soft opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-muted'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-title">{achievement.name}</p>
                        <p className="text-xs text-muted">{achievement.description}</p>
                      </div>
                    </div>
                    {!achievement.unlocked && (
                      <div className="mt-3">
                        <ProgressBar value={(achievement.progress / achievement.target) * 100} color="gray" />
                        <p className="text-xs text-muted mt-1">{achievement.progress}/{achievement.target}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
