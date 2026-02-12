'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Title,
  Text,
  Button,
  Badge,
  Grid,
  Col,
  AreaChart,
  ProgressBar,
} from '@tremor/react'
import {
  Globe2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Dna,
  Clock,
  TreeDeciduous,
  Bug,
  Bird,
  Fish,
  Rabbit,
  ChevronRight,
  Info,
  TrendingUp,
  Shuffle,
  Target,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

// Organism types for simulation
interface Organism {
  id: number
  trait: 'A' | 'B' // Two alleles
  fitness: number
}

// Simulation state
interface SimulationState {
  generation: number
  population: Organism[]
  history: { generation: number; traitA: number; traitB: number }[]
  environment: 'neutral' | 'favorsA' | 'favorsB'
  isRunning: boolean
}

// Evolution concepts
interface EvolutionConcept {
  id: string
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  icon: any
  color: string
}

const EVOLUTION_CONCEPTS: EvolutionConcept[] = [
  {
    id: 'natural-selection',
    name: 'Natural Selection',
    nameEs: 'Seleccion Natural',
    description: 'Organisms with advantageous traits survive and reproduce more',
    descriptionEs: 'Organismos con rasgos ventajosos sobreviven y se reproducen mas',
    icon: Target,
    color: 'green',
  },
  {
    id: 'genetic-drift',
    name: 'Genetic Drift',
    nameEs: 'Deriva Genetica',
    description: 'Random changes in allele frequency, especially in small populations',
    descriptionEs: 'Cambios aleatorios en frecuencia de alelos, especialmente en poblaciones pequenas',
    icon: Shuffle,
    color: 'purple',
  },
  {
    id: 'mutation',
    name: 'Mutation',
    nameEs: 'Mutacion',
    description: 'Random changes in DNA that create new traits',
    descriptionEs: 'Cambios aleatorios en ADN que crean nuevos rasgos',
    icon: Zap,
    color: 'orange',
  },
  {
    id: 'adaptation',
    name: 'Adaptation',
    nameEs: 'Adaptacion',
    description: 'Traits that help organisms survive in their environment',
    descriptionEs: 'Rasgos que ayudan a los organismos a sobrevivir en su ambiente',
    icon: TrendingUp,
    color: 'blue',
  },
]

// Phylogenetic tree data
const PHYLOGENETIC_DATA = {
  name: 'Life',
  nameEs: 'Vida',
  age: '4 billion years',
  children: [
    {
      name: 'Bacteria',
      nameEs: 'Bacterias',
      age: '3.5 billion years',
      icon: Bug,
    },
    {
      name: 'Eukaryotes',
      nameEs: 'Eucariotas',
      age: '2 billion years',
      children: [
        {
          name: 'Plants',
          nameEs: 'Plantas',
          age: '500 million years',
          icon: TreeDeciduous,
        },
        {
          name: 'Animals',
          nameEs: 'Animales',
          age: '600 million years',
          children: [
            { name: 'Fish', nameEs: 'Peces', age: '500 million years', icon: Fish },
            { name: 'Amphibians', nameEs: 'Anfibios', age: '370 million years', icon: Bug },
            { name: 'Reptiles', nameEs: 'Reptiles', age: '320 million years', icon: Bug },
            { name: 'Birds', nameEs: 'Aves', age: '150 million years', icon: Bird },
            {
              name: 'Mammals',
              nameEs: 'Mamiferos',
              age: '200 million years',
              icon: Rabbit,
              children: [
                { name: 'Primates', nameEs: 'Primates', age: '65 million years', icon: Bug },
                { name: 'Humans', nameEs: 'Humanos', age: '300,000 years', icon: Bug, highlight: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export function EvolutionSimulator() {
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState<'simulation' | 'concepts' | 'tree'>('simulation')
  const [simulation, setSimulation] = useState<SimulationState>({
    generation: 0,
    population: [],
    history: [],
    environment: 'neutral',
    isRunning: false,
  })
  const [populationSize, setPopulationSize] = useState(50)
  const [mutationRate, setMutationRate] = useState(0.01)
  const [speed, setSpeed] = useState(500) // ms between generations

  // Get locale-aware text
  const isSpanish = t('locale') === 'es'

  // Initialize population
  const initializePopulation = useCallback(() => {
    const pop: Organism[] = []
    for (let i = 0; i < populationSize; i++) {
      pop.push({
        id: i,
        trait: Math.random() < 0.5 ? 'A' : 'B',
        fitness: 1,
      })
    }
    setSimulation({
      generation: 0,
      population: pop,
      history: [{ generation: 0, traitA: 50, traitB: 50 }],
      environment: 'neutral',
      isRunning: false,
    })
  }, [populationSize])

  // Initialize on mount
  useEffect(() => {
    initializePopulation()
  }, [initializePopulation])

  // Calculate fitness based on environment
  const calculateFitness = (trait: 'A' | 'B', env: SimulationState['environment']): number => {
    if (env === 'neutral') return 1
    if (env === 'favorsA') return trait === 'A' ? 1.5 : 0.5
    if (env === 'favorsB') return trait === 'B' ? 1.5 : 0.5
    return 1
  }

  // Run one generation
  const runGeneration = useCallback(() => {
    setSimulation(prev => {
      if (!prev.isRunning) return prev

      const { population, environment, generation, history } = prev

      // Update fitness based on environment
      const popWithFitness = population.map(org => ({
        ...org,
        fitness: calculateFitness(org.trait, environment),
      }))

      // Natural selection - weighted random selection
      const totalFitness = popWithFitness.reduce((sum, org) => sum + org.fitness, 0)
      const newPop: Organism[] = []

      for (let i = 0; i < populationSize; i++) {
        // Roulette wheel selection
        let rand = Math.random() * totalFitness
        let selected: Organism | null = null

        for (const org of popWithFitness) {
          rand -= org.fitness
          if (rand <= 0) {
            selected = org
            break
          }
        }

        if (!selected) selected = popWithFitness[popWithFitness.length - 1]

        // Apply mutation
        let newTrait = selected.trait
        if (Math.random() < mutationRate) {
          newTrait = newTrait === 'A' ? 'B' : 'A'
        }

        newPop.push({
          id: i,
          trait: newTrait,
          fitness: 1,
        })
      }

      // Calculate new frequencies
      const traitACount = newPop.filter(o => o.trait === 'A').length
      const traitAPercent = (traitACount / populationSize) * 100

      const newHistory = [...history, {
        generation: generation + 1,
        traitA: traitAPercent,
        traitB: 100 - traitAPercent,
      }].slice(-50) // Keep last 50 generations

      return {
        ...prev,
        generation: generation + 1,
        population: newPop,
        history: newHistory,
      }
    })
  }, [populationSize, mutationRate])

  // Simulation loop
  useEffect(() => {
    if (!simulation.isRunning) return

    const timer = setTimeout(runGeneration, speed)
    return () => clearTimeout(timer)
  }, [simulation.isRunning, simulation.generation, runGeneration, speed])

  // Toggle simulation
  const toggleSimulation = () => {
    setSimulation(prev => ({ ...prev, isRunning: !prev.isRunning }))
  }

  // Reset simulation
  const resetSimulation = () => {
    initializePopulation()
  }

  // Change environment
  const changeEnvironment = (env: SimulationState['environment']) => {
    setSimulation(prev => ({ ...prev, environment: env }))
  }

  // Current trait frequencies
  const traitACount = simulation.population.filter(o => o.trait === 'A').length
  const traitAPercent = (traitACount / populationSize) * 100

  return (
    <div role="region" aria-label="Evolution Simulator" className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Globe2 className="w-8 h-8 text-success" />
          </div>
          <div className="flex-1">
            <Title>{t('tools.evolution.title')}</Title>
            <Text className="mt-1">
              {t('tools.evolution.description')}
            </Text>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'simulation' ? 'primary' : 'secondary'}
          size="xs"
          icon={Play}
          onClick={() => setActiveTab('simulation')}
        >
          {isSpanish ? 'Simulacion' : 'Simulation'}
        </Button>
        <Button
          variant={activeTab === 'concepts' ? 'primary' : 'secondary'}
          size="xs"
          icon={Dna}
          onClick={() => setActiveTab('concepts')}
        >
          {isSpanish ? 'Conceptos' : 'Concepts'}
        </Button>
        <Button
          variant={activeTab === 'tree' ? 'primary' : 'secondary'}
          size="xs"
          icon={TreeDeciduous}
          onClick={() => setActiveTab('tree')}
        >
          {isSpanish ? 'Arbol Filogenetico' : 'Phylogenetic Tree'}
        </Button>
      </div>

      {/* Simulation Tab */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          {/* Controls */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title>{isSpanish ? 'Seleccion Natural en Accion' : 'Natural Selection in Action'}</Title>
              <div className="flex items-center gap-2">
                <Badge color="blue">
                  {isSpanish ? 'Generacion' : 'Generation'} {simulation.generation}
                </Badge>
              </div>
            </div>

            {/* Environment selector */}
            <div className="mb-4">
              <p className="text-sm font-medium text-body mb-2">
                {isSpanish ? 'Ambiente:' : 'Environment:'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="xs"
                  variant={simulation.environment === 'neutral' ? 'primary' : 'secondary'}
                  onClick={() => changeEnvironment('neutral')}
                >
                  {isSpanish ? 'Neutral' : 'Neutral'}
                </Button>
                <Button
                  size="xs"
                  variant={simulation.environment === 'favorsA' ? 'primary' : 'secondary'}
                  onClick={() => changeEnvironment('favorsA')}
                  color="green"
                >
                  {isSpanish ? 'Favorece Rasgo A' : 'Favors Trait A'}
                </Button>
                <Button
                  size="xs"
                  variant={simulation.environment === 'favorsB' ? 'primary' : 'secondary'}
                  onClick={() => changeEnvironment('favorsB')}
                  color="blue"
                >
                  {isSpanish ? 'Favorece Rasgo B' : 'Favors Trait B'}
                </Button>
              </div>
            </div>

            {/* Population visualization */}
            <div className="mb-4">
              <p className="text-sm font-medium text-body mb-2">
                {isSpanish ? 'Poblacion:' : 'Population:'}
              </p>
              <div className="flex flex-wrap gap-1 p-4 bg-surface-soft rounded-xl max-h-32 overflow-hidden">
                {simulation.population.slice(0, 100).map((org, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      org.trait === 'A' ? 'bg-success-soft0' : 'bg-info-soft0'
                    }`}
                    title={`${isSpanish ? 'Organismo' : 'Organism'} ${idx + 1}: ${isSpanish ? 'Rasgo' : 'Trait'} ${org.trait}`}
                  />
                ))}
                {simulation.population.length > 100 && (
                  <span className="text-xs text-muted ml-2">
                    +{simulation.population.length - 100} {isSpanish ? 'mas' : 'more'}
                  </span>
                )}
              </div>
            </div>

            {/* Frequency bars */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success-soft0" />
                  {isSpanish ? 'Rasgo A' : 'Trait A'}
                </span>
                <span className="font-medium">{traitAPercent.toFixed(1)}%</span>
              </div>
              <ProgressBar value={traitAPercent} color="green" />

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-info-soft0" />
                  {isSpanish ? 'Rasgo B' : 'Trait B'}
                </span>
                <span className="font-medium">{(100 - traitAPercent).toFixed(1)}%</span>
              </div>
              <ProgressBar value={100 - traitAPercent} color="blue" />
            </div>

            {/* Control buttons */}
            <div className="flex gap-3">
              <Button
                icon={simulation.isRunning ? Pause : Play}
                onClick={toggleSimulation}
                color={simulation.isRunning ? 'orange' : 'green'}
              >
                {simulation.isRunning
                  ? (isSpanish ? 'Pausar' : 'Pause')
                  : (isSpanish ? 'Iniciar' : 'Start')
                }
              </Button>
              <Button
                variant="secondary"
                icon={RotateCcw}
                onClick={resetSimulation}
              >
                {isSpanish ? 'Reiniciar' : 'Reset'}
              </Button>
            </div>
          </Card>

          {/* History Chart */}
          <Card>
            <Title className="mb-4">
              {isSpanish ? 'Frecuencia de Rasgos en el Tiempo' : 'Trait Frequency Over Time'}
            </Title>
            {simulation.history.length > 1 ? (
              <AreaChart
                data={simulation.history}
                index="generation"
                categories={['traitA', 'traitB']}
                colors={['green', 'blue']}
                valueFormatter={(v) => `${v.toFixed(1)}%`}
                showLegend={true}
                className="h-60"
              />
            ) : (
              <div className="h-60 flex items-center justify-center bg-surface-soft rounded-xl">
                <p className="text-muted">
                  {isSpanish
                    ? 'Inicia la simulacion para ver datos'
                    : 'Start simulation to see data'}
                </p>
              </div>
            )}
          </Card>

          {/* Settings */}
          <Card>
            <Title className="mb-4">{isSpanish ? 'Configuracion' : 'Settings'}</Title>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-body">
                  {isSpanish ? 'Tamano de poblacion:' : 'Population size:'} {populationSize}
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={populationSize}
                  onChange={(e) => setPopulationSize(Number(e.target.value))}
                  className="w-full mt-2"
                  aria-label="Population size"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-body">
                  {isSpanish ? 'Tasa de mutacion:' : 'Mutation rate:'} {(mutationRate * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.005"
                  value={mutationRate}
                  onChange={(e) => setMutationRate(Number(e.target.value))}
                  className="w-full mt-2"
                  aria-label="Mutation rate"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-body">
                  {isSpanish ? 'Velocidad:' : 'Speed:'} {speed}ms
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full mt-2"
                  aria-label="Simulation speed"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Concepts Tab */}
      {activeTab === 'concepts' && (
        <div className="space-y-6">
          <Grid numItems={1} numItemsSm={2} className="gap-4">
            {EVOLUTION_CONCEPTS.map(concept => (
              <Col key={concept.id}>
                <Card className={`h-full bg-${concept.color}-50`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-${concept.color}-100 rounded-xl flex items-center justify-center`}>
                      <concept.icon className={`w-6 h-6 text-${concept.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-title">
                        {isSpanish ? concept.nameEs : concept.name}
                      </p>
                      <p className="text-sm text-body mt-1">
                        {isSpanish ? concept.descriptionEs : concept.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Grid>

          {/* Darwin Quote */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-success flex-shrink-0 mt-1" />
              <div>
                <p className="italic text-body">
                  {isSpanish
                    ? '"No es el mas fuerte de las especies el que sobrevive, ni el mas inteligente, sino el que mejor responde al cambio."'
                    : '"It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change."'}
                </p>
                <p className="text-sm text-muted mt-2">— Charles Darwin</p>
              </div>
            </div>
          </Card>

          {/* Key Facts */}
          <Card>
            <Title className="mb-4">{isSpanish ? 'Datos Clave' : 'Key Facts'}</Title>
            <div className="space-y-3">
              {[
                {
                  fact: 'Humans share 98.8% of DNA with chimpanzees',
                  factEs: 'Los humanos comparten 98.8% del ADN con los chimpances',
                },
                {
                  fact: 'All life on Earth shares a common ancestor from ~4 billion years ago',
                  factEs: 'Toda la vida en la Tierra comparte un ancestro comun de hace ~4 mil millones de anos',
                },
                {
                  fact: 'Evolution is not "survival of the fittest" but "survival of the fit enough"',
                  factEs: 'La evolucion no es "supervivencia del mas apto" sino "supervivencia del suficientemente apto"',
                },
                {
                  fact: 'Humans are still evolving - lactose tolerance evolved only 10,000 years ago',
                  factEs: 'Los humanos todavia evolucionan - la tolerancia a la lactosa evoluciono hace solo 10,000 anos',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-surface-soft rounded-xl">
                  <Dna className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-body">{isSpanish ? item.factEs : item.fact}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Phylogenetic Tree Tab */}
      {activeTab === 'tree' && (
        <Card>
          <Title className="mb-6">{isSpanish ? 'Arbol de la Vida' : 'Tree of Life'}</Title>

          <div className="relative overflow-x-auto">
            {/* Simple tree visualization */}
            <div className="min-w-[600px] p-4">
              {/* Root */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-4 h-4 rounded-full bg-success-soft0" />
                <div>
                  <span className="font-semibold">
                    {isSpanish ? PHYLOGENETIC_DATA.nameEs : PHYLOGENETIC_DATA.name}
                  </span>
                  <span className="text-sm text-muted ml-2">({PHYLOGENETIC_DATA.age})</span>
                </div>
              </div>

              {/* Level 1 */}
              <div className="ml-8 border-l-2 border-green-300 pl-6 space-y-4">
                {PHYLOGENETIC_DATA.children?.map((child1: any, idx1: number) => (
                  <div key={idx1}>
                    <div className="flex items-center gap-4 -ml-[25px] mb-2">
                      <div className="w-3 h-0.5 bg-green-300" />
                      <div className="w-4 h-4 rounded-full bg-info-soft0" />
                      <div>
                        <span className="font-semibold">
                          {isSpanish ? child1.nameEs : child1.name}
                        </span>
                        <span className="text-sm text-muted ml-2">({child1.age})</span>
                      </div>
                    </div>

                    {/* Level 2 */}
                    {child1.children && (
                      <div className="ml-8 border-l-2 border-info pl-6 space-y-3">
                        {child1.children.map((child2: any, idx2: number) => (
                          <div key={idx2}>
                            <div className="flex items-center gap-4 -ml-[25px] mb-2">
                              <div className="w-3 h-0.5 bg-blue-200" />
                              <div className={`w-4 h-4 rounded-full ${child2.highlight ? 'bg-yellow-400' : 'bg-purple-400'}`} />
                              <div>
                                <span className="font-medium">
                                  {isSpanish ? child2.nameEs : child2.name}
                                </span>
                                <span className="text-sm text-muted ml-2">({child2.age})</span>
                              </div>
                            </div>

                            {/* Level 3 */}
                            {child2.children && (
                              <div className="ml-8 border-l-2 border-purple-200 pl-6 space-y-2">
                                {child2.children.map((child3: any, idx3: number) => (
                                  <div key={idx3}>
                                    <div className="flex items-center gap-4 -ml-[25px] mb-1">
                                      <div className="w-3 h-0.5 bg-purple-200" />
                                      <div className={`w-3 h-3 rounded-full ${child3.highlight ? 'bg-yellow-400 ring-2 ring-yellow-300' : 'bg-orange-400'}`} />
                                      <div>
                                        <span className={`text-sm ${child3.highlight ? 'font-bold text-yellow-600' : ''}`}>
                                          {isSpanish ? child3.nameEs : child3.name}
                                        </span>
                                        <span className="text-xs text-muted ml-2">({child3.age})</span>
                                      </div>
                                    </div>

                                    {/* Level 4 */}
                                    {child3.children && (
                                      <div className="ml-6 border-l-2 border-orange-200 pl-4 space-y-1">
                                        {child3.children.map((child4: any, idx4: number) => (
                                          <div key={idx4} className="flex items-center gap-3 -ml-[21px]">
                                            <div className="w-2 h-0.5 bg-orange-200" />
                                            <div className={`w-2 h-2 rounded-full ${child4.highlight ? 'bg-yellow-400 ring-2 ring-yellow-300' : 'bg-gray-400'}`} />
                                            <span className={`text-xs ${child4.highlight ? 'font-bold text-yellow-600' : 'text-body'}`}>
                                              {isSpanish ? child4.nameEs : child4.name}
                                              <span className="text-subtle ml-1">({child4.age})</span>
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-warning-soft rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400" />
              <span className="text-sm font-medium text-yellow-800">
                {isSpanish ? 'Humanos - Tu posicion en el arbol de la vida' : 'Humans - Your position in the tree of life'}
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              {isSpanish
                ? 'Los humanos modernos (Homo sapiens) aparecieron hace aproximadamente 300,000 anos, una fraccion minuscula de los 4 mil millones de anos de la historia de la vida.'
                : 'Modern humans (Homo sapiens) appeared approximately 300,000 years ago, a tiny fraction of the 4 billion year history of life.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
