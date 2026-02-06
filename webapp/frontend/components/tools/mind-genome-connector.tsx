'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Brain,
  Moon,
  Activity,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  CheckCircle,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Flame,
  Heart,
  Coffee,
  Dumbbell,
  BookOpen,
  Info,
  Award,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

// Types
interface DailyCheckin {
  date: string
  sleep: number // 1-5
  stress: number // 1-5 (lower is better)
  focus: number // 1-5
  energy: number // 1-5
  mood: number // 1-5
}

interface NeurogenicGene {
  id: string
  symbol: string
  name: string
  trait: string
  traitEs: string
  status: 'strength' | 'opportunity' | 'neutral'
  score: number // 0-100
  description: string
  descriptionEs: string
  science: string
  scienceEs: string
}

interface MicroHabit {
  id: string
  name: string
  nameEs: string
  duration: string
  category: 'meditation' | 'exercise' | 'sleep' | 'cognitive' | 'nutrition'
  benefit: string
  benefitEs: string
  relatedGene: string
  completed: boolean
  streak: number
}

interface Achievement {
  id: string
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  icon: typeof Award
  unlocked: boolean
  progress: number
  target: number
}

// Demo neurogenic genes
const NEUROGENIC_GENES: NeurogenicGene[] = [
  {
    id: 'bdnf',
    symbol: 'BDNF',
    name: 'Brain-Derived Neurotrophic Factor',
    trait: 'Neuroplasticity & Learning',
    traitEs: 'Neuroplasticidad y Aprendizaje',
    status: 'strength',
    score: 82,
    description: 'Your variant supports efficient BDNF production, enhancing neuroplasticity and learning capacity.',
    descriptionEs: 'Tu variante apoya produccion eficiente de BDNF, mejorando neuroplasticidad y capacidad de aprendizaje.',
    science: 'The Val66Met polymorphism (rs6265) affects BDNF secretion. Val/Val carriers show better memory and learning.',
    scienceEs: 'El polimorfismo Val66Met (rs6265) afecta la secrecion de BDNF. Portadores Val/Val muestran mejor memoria y aprendizaje.',
  },
  {
    id: 'comt',
    symbol: 'COMT',
    name: 'Catechol-O-Methyltransferase',
    trait: 'Focus Under Pressure',
    traitEs: 'Enfoque Bajo Presion',
    status: 'strength',
    score: 78,
    description: 'Warrior variant - you perform better under stress with enhanced dopamine levels during challenges.',
    descriptionEs: 'Variante guerrero - rindes mejor bajo estres con niveles elevados de dopamina durante desafios.',
    science: 'Val158Met affects dopamine degradation speed. Val carriers clear dopamine faster, performing better under stress.',
    scienceEs: 'Val158Met afecta la velocidad de degradacion de dopamina. Portadores Val eliminan dopamina mas rapido, rindiendo mejor bajo estres.',
  },
  {
    id: 'drd2',
    symbol: 'DRD2',
    name: 'Dopamine Receptor D2',
    trait: 'Reward Processing',
    traitEs: 'Procesamiento de Recompensas',
    status: 'opportunity',
    score: 55,
    description: 'Reduced dopamine sensitivity may affect motivation. Structured rewards help maintain engagement.',
    descriptionEs: 'Sensibilidad reducida a dopamina puede afectar motivacion. Recompensas estructuradas ayudan a mantener compromiso.',
    science: 'Taq1A polymorphism affects D2 receptor density. A1 carriers may need more structured reward systems.',
    scienceEs: 'El polimorfismo Taq1A afecta la densidad de receptores D2. Portadores A1 pueden necesitar sistemas de recompensa mas estructurados.',
  },
  {
    id: 'clock',
    symbol: 'CLOCK',
    name: 'Circadian Locomotor Output Cycles Kaput',
    trait: 'Circadian Rhythm',
    traitEs: 'Ritmo Circadiano',
    status: 'neutral',
    score: 65,
    description: 'Evening chronotype tendency - you may naturally prefer later sleep/wake times.',
    descriptionEs: 'Tendencia a cronotipo vespertino - puedes preferir naturalmente horarios de sueno/despertar mas tarde.',
    science: 'CLOCK 3111T/C affects circadian preferences. C carriers tend toward evening chronotype.',
    scienceEs: 'CLOCK 3111T/C afecta preferencias circadianas. Portadores C tienden hacia cronotipo vespertino.',
  },
  {
    id: 'oxtr',
    symbol: 'OXTR',
    name: 'Oxytocin Receptor',
    trait: 'Social Connection',
    traitEs: 'Conexion Social',
    status: 'strength',
    score: 88,
    description: 'Enhanced oxytocin sensitivity supports strong social bonds and stress resilience through connection.',
    descriptionEs: 'Sensibilidad aumentada a oxitocina apoya vinculos sociales fuertes y resiliencia al estres a traves de conexion.',
    science: 'rs53576 GG genotype associated with greater empathy, social cognition, and stress buffering from relationships.',
    scienceEs: 'El genotipo GG de rs53576 esta asociado con mayor empatia, cognicion social y amortiguamiento del estres por relaciones.',
  },
]

// Demo micro-habits
const MICRO_HABITS: MicroHabit[] = [
  {
    id: 'morning-sunlight',
    name: 'Morning Sunlight',
    nameEs: 'Luz Solar Matutina',
    duration: '10 min',
    category: 'sleep',
    benefit: 'Resets circadian rhythm, boosts BDNF',
    benefitEs: 'Reinicia ritmo circadiano, aumenta BDNF',
    relatedGene: 'CLOCK',
    completed: false,
    streak: 12,
  },
  {
    id: 'focus-breathing',
    name: 'Box Breathing',
    nameEs: 'Respiracion Cuadrada',
    duration: '4 min',
    category: 'meditation',
    benefit: 'Activates parasympathetic, reduces cortisol',
    benefitEs: 'Activa sistema parasimpatico, reduce cortisol',
    relatedGene: 'COMT',
    completed: false,
    streak: 7,
  },
  {
    id: 'cold-exposure',
    name: 'Cold Shower Finish',
    nameEs: 'Terminar con Ducha Fria',
    duration: '2 min',
    category: 'exercise',
    benefit: 'Dopamine +250%, norepinephrine boost',
    benefitEs: 'Dopamina +250%, aumento de norepinefrina',
    relatedGene: 'DRD2',
    completed: true,
    streak: 5,
  },
  {
    id: 'gratitude',
    name: 'Gratitude Journal',
    nameEs: 'Diario de Gratitud',
    duration: '5 min',
    category: 'cognitive',
    benefit: 'Increases serotonin, strengthens social circuits',
    benefitEs: 'Aumenta serotonina, fortalece circuitos sociales',
    relatedGene: 'OXTR',
    completed: false,
    streak: 21,
  },
  {
    id: 'movement-snack',
    name: 'Movement Snack',
    nameEs: 'Snack de Movimiento',
    duration: '5 min',
    category: 'exercise',
    benefit: 'BDNF release, focus reset',
    benefitEs: 'Liberacion de BDNF, reinicio de enfoque',
    relatedGene: 'BDNF',
    completed: false,
    streak: 15,
  },
]

// Demo achievements
const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-week', name: 'First Week', nameEs: 'Primera Semana', description: 'Complete 7 days of check-ins', descriptionEs: 'Completa 7 dias de check-ins', icon: Calendar, unlocked: true, progress: 7, target: 7 },
  { id: 'habit-starter', name: 'Habit Starter', nameEs: 'Iniciador de Habitos', description: 'Start 3 micro-habits', descriptionEs: 'Inicia 3 micro-habitos', icon: Sparkles, unlocked: true, progress: 5, target: 3 },
  { id: 'streak-master', name: 'Streak Master', nameEs: 'Maestro de Rachas', description: 'Maintain a 21-day streak', descriptionEs: 'Mantener racha de 21 dias', icon: Flame, unlocked: true, progress: 21, target: 21 },
  { id: 'brain-optimizer', name: 'Brain Optimizer', nameEs: 'Optimizador Cerebral', description: 'Improve focus score by 20%', descriptionEs: 'Mejorar puntuacion de enfoque 20%', icon: Brain, unlocked: false, progress: 15, target: 20 },
]

// Category icons and colors
const HABIT_CATEGORIES = {
  meditation: { icon: Brain, color: 'purple', label: 'Meditation' },
  exercise: { icon: Dumbbell, color: 'green', label: 'Exercise' },
  sleep: { icon: Moon, color: 'blue', label: 'Sleep' },
  cognitive: { icon: BookOpen, color: 'orange', label: 'Cognitive' },
  nutrition: { icon: Coffee, color: 'amber', label: 'Nutrition' },
}

export function MindGenomeConnector() {
  const t = useTranslations()
  const [activeSection, setActiveSection] = useState<'checkin' | 'profile' | 'habits' | 'progress'>('checkin')
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null)
  const [habits, setHabits] = useState<MicroHabit[]>(MICRO_HABITS)
  const [expandedGene, setExpandedGene] = useState<string | null>(null)
  const [streak, setStreak] = useState(23)

  // Demo weekly data
  const weeklyData = [
    { day: 'Mon', sleep: 4, focus: 3, energy: 3 },
    { day: 'Tue', sleep: 3, focus: 4, energy: 4 },
    { day: 'Wed', sleep: 5, focus: 4, energy: 4 },
    { day: 'Thu', sleep: 4, focus: 5, energy: 5 },
    { day: 'Fri', sleep: 4, focus: 4, energy: 4 },
    { day: 'Sat', sleep: 5, focus: 3, energy: 5 },
    { day: 'Sun', sleep: 5, focus: 4, energy: 4 },
  ]

  // Handle check-in submission
  const handleCheckin = (field: keyof DailyCheckin, value: number) => {
    setTodayCheckin(prev => ({
      ...prev,
      date: new Date().toISOString(),
      [field]: value,
    } as DailyCheckin))
  }

  // Toggle habit completion
  const toggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const newCompleted = !h.completed
        if (newCompleted) {
          toast.success(`${h.name} completed! 🎉`)
        }
        return { ...h, completed: newCompleted }
      }
      return h
    }))
  }

  // Today's recommendation based on profile
  const getTodayRecommendation = () => {
    const hour = new Date().getHours()
    if (hour < 10) {
      return {
        title: 'Morning Optimization',
        titleEs: 'Optimizacion Matutina',
        text: 'Your CLOCK gene suggests morning sunlight exposure will help align your circadian rhythm. Try 10 min outside.',
        textEs: 'Tu gen CLOCK sugiere que la exposicion a luz solar matutina ayudara a alinear tu ritmo circadiano. Prueba 10 min afuera.',
        gene: 'CLOCK',
      }
    } else if (hour < 14) {
      return {
        title: 'Peak Focus Window',
        titleEs: 'Ventana de Enfoque Pico',
        text: 'Based on your COMT variant, this is your optimal time for challenging cognitive work. Minimize distractions.',
        textEs: 'Basado en tu variante COMT, este es tu momento optimo para trabajo cognitivo desafiante. Minimiza distracciones.',
        gene: 'COMT',
      }
    } else if (hour < 18) {
      return {
        title: 'Movement Break',
        titleEs: 'Pausa de Movimiento',
        text: 'Your BDNF profile benefits greatly from afternoon exercise. Even 15 min of movement boosts neuroplasticity.',
        textEs: 'Tu perfil BDNF se beneficia enormemente del ejercicio vespertino. Incluso 15 min de movimiento aumentan la neuroplasticidad.',
        gene: 'BDNF',
      }
    } else {
      return {
        title: 'Wind Down Protocol',
        titleEs: 'Protocolo de Relajacion',
        text: 'Your DRD2 variant benefits from structured evening routines. Start dimming lights and avoid screens.',
        textEs: 'Tu variante DRD2 se beneficia de rutinas nocturnas estructuradas. Comienza a atenuar luces y evita pantallas.',
        gene: 'DRD2',
      }
    }
  }

  const recommendation = getTodayRecommendation()

  // Render rating selector
  const RatingSelector = ({ label, value, onChange, icon: Icon }: {
    label: string
    value: number
    onChange: (v: number) => void
    icon: typeof Moon
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted" />
        <span className="text-sm font-medium text-body">{label}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg font-medium transition-all ${
              value === n
                ? 'bg-accent-soft0 text-white scale-110'
                : 'bg-surface-muted text-body hover:bg-gray-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <Title>Mind-Genome Connector</Title>
              <Text>Track habits and unlock your neuroplasticity potential</Text>
            </div>
          </div>

          {/* Streak badge */}
          <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-700">{streak}</span>
            <span className="text-sm text-orange-600">day streak</span>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2 p-1 bg-surface-muted rounded-lg">
        {[
          { id: 'checkin', label: 'Daily Check-in', icon: CheckCircle },
          { id: 'profile', label: 'Neurogenic Profile', icon: Brain },
          { id: 'habits', label: 'Micro-Habits', icon: Target },
          { id: 'progress', label: 'Progress', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeSection === tab.id
                ? 'bg-white shadow text-purple-700'
                : 'text-body hover:text-title'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Daily Check-in Section */}
      {activeSection === 'checkin' && (
        <div className="space-y-6">
          {/* Today's Recommendation */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm uppercase tracking-wide">Today's Recommendation</p>
                <p className="font-semibold text-lg mt-1">{recommendation.title}</p>
                <p className="text-white/90 text-sm mt-2">{recommendation.text}</p>
                <Badge className="mt-3 bg-white/20 text-white">{recommendation.gene}</Badge>
              </div>
            </div>
          </Card>

          {/* Check-in Form */}
          <Card>
            <Title className="mb-4">How are you feeling today?</Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RatingSelector
                label="Sleep Quality"
                value={todayCheckin?.sleep || 0}
                onChange={(v) => handleCheckin('sleep', v)}
                icon={Moon}
              />
              <RatingSelector
                label="Stress Level"
                value={todayCheckin?.stress || 0}
                onChange={(v) => handleCheckin('stress', v)}
                icon={Activity}
              />
              <RatingSelector
                label="Focus"
                value={todayCheckin?.focus || 0}
                onChange={(v) => handleCheckin('focus', v)}
                icon={Target}
              />
              <RatingSelector
                label="Energy"
                value={todayCheckin?.energy || 0}
                onChange={(v) => handleCheckin('energy', v)}
                icon={Zap}
              />
            </div>

            <div className="mt-6">
              <Button
                disabled={!todayCheckin?.sleep || !todayCheckin?.stress || !todayCheckin?.focus || !todayCheckin?.energy}
                onClick={() => toast.success('Check-in saved! Keep it up! 🌟')}
                className="w-full"
              >
                Save Today's Check-in
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Neurogenic Profile Section */}
      {activeSection === 'profile' && (
        <div className="space-y-4">
          <Card>
            <Title className="mb-4">Your Neurogenic Profile</Title>
            <Text>
              These genes influence neuroplasticity, learning, and cognitive performance.
              Understanding them helps personalize your optimization strategy.
            </Text>
          </Card>

          {NEUROGENIC_GENES.map(gene => {
            const isExpanded = expandedGene === gene.id
            return (
              <Card
                key={gene.id}
                className={`cursor-pointer transition-all ${isExpanded ? 'ring-2 ring-purple-400' : ''}`}
                onClick={() => setExpandedGene(isExpanded ? null : gene.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      gene.status === 'strength' ? 'bg-green-100' :
                      gene.status === 'opportunity' ? 'bg-amber-100' : 'bg-surface-muted'
                    }`}>
                      <span className={`text-lg font-bold ${
                        gene.status === 'strength' ? 'text-success' :
                        gene.status === 'opportunity' ? 'text-amber-600' : 'text-body'
                      }`}>
                        {gene.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-title">{gene.symbol}</p>
                        <Badge
                          color={gene.status === 'strength' ? 'green' : gene.status === 'opportunity' ? 'yellow' : 'gray'}
                          size="xs"
                        >
                          {gene.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">{gene.trait}</p>
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
                  <div className="mt-4 pt-4 border-t border-adaptive space-y-4">
                    <p className="text-sm text-body">{gene.description}</p>

                    <div className="p-3 bg-accent-soft rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-purple-500" />
                        <p className="text-xs font-medium text-purple-700 uppercase">The Science</p>
                      </div>
                      <p className="text-sm text-body">{gene.science}</p>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Micro-Habits Section */}
      {activeSection === 'habits' && (
        <div className="space-y-4">
          <Card>
            <Title className="mb-2">Personalized Micro-Habits</Title>
            <Text>Small actions aligned with your genetic profile for maximum impact.</Text>
          </Card>

          {habits.map(habit => {
            const category = HABIT_CATEGORIES[habit.category]
            const CategoryIcon = category.icon

            return (
              <Card key={habit.id} className={habit.completed ? 'bg-success-soft border-success' : ''}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      habit.completed
                        ? 'bg-success-soft0 text-white'
                        : `bg-${category.color}-100 text-${category.color}-600 hover:scale-110`
                    }`}
                  >
                    {habit.completed ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <CategoryIcon className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${habit.completed ? 'text-green-800 line-through' : 'text-title'}`}>
                        {habit.name}
                      </p>
                      <Badge color="gray" size="xs">{habit.duration}</Badge>
                    </div>
                    <p className="text-sm text-muted">{habit.benefit}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color="purple" size="xs">{habit.relatedGene}</Badge>
                      {habit.streak > 0 && (
                        <span className="text-xs text-orange-600 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> {habit.streak} day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Progress Section */}
      {activeSection === 'progress' && (
        <div className="space-y-6">
          {/* Weekly Overview */}
          <Card>
            <Title className="mb-4">Weekly Progress</Title>

            <div className="space-y-4">
              {/* Mini chart */}
              <div className="flex items-end justify-between h-32 gap-2">
                {weeklyData.map((day, idx) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full space-y-1">
                      <div
                        className="bg-purple-200 rounded-t"
                        style={{ height: `${day.focus * 12}px` }}
                        title={`Focus: ${day.focus}`}
                      />
                      <div
                        className="bg-blue-200 rounded"
                        style={{ height: `${day.sleep * 12}px` }}
                        title={`Sleep: ${day.sleep}`}
                      />
                      <div
                        className="bg-green-200 rounded-b"
                        style={{ height: `${day.energy * 12}px` }}
                        title={`Energy: ${day.energy}`}
                      />
                    </div>
                    <span className="text-xs text-muted">{day.day}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-200 rounded" />
                  <span className="text-xs text-muted">Focus</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-200 rounded" />
                  <span className="text-xs text-muted">Sleep</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-200 rounded" />
                  <span className="text-xs text-muted">Energy</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <Title className="mb-4">Achievements</Title>

            <div className="grid grid-cols-2 gap-4">
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
