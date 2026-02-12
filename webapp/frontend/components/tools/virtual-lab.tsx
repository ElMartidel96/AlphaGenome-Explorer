'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Title,
  Text,
  Button,
  Badge,
  Grid,
  Col,
  ProgressBar,
} from '@tremor/react'
import {
  FlaskConical,
  Beaker,
  Microscope,
  Dna,
  Play,
  RotateCcw,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Thermometer,
  Clock,
  Zap,
  Award,
  Scissors,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

// Lab experiment types
type ExperimentType = 'dna-extraction' | 'pcr' | 'gel-electrophoresis' | 'restriction-digest'

interface ExperimentStep {
  id: string
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  duration: number // seconds
  animation?: string
}

interface Experiment {
  id: ExperimentType
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  icon: any
  color: string
  steps: ExperimentStep[]
  funFact: string
  funFactEs: string
}

// Lab experiments data
const EXPERIMENTS: Experiment[] = [
  {
    id: 'dna-extraction',
    name: 'DNA Extraction',
    nameEs: 'Extraccion de ADN',
    description: 'Extract DNA from cells using common household items',
    descriptionEs: 'Extrae ADN de celulas usando articulos comunes del hogar',
    icon: Beaker,
    color: 'green',
    steps: [
      {
        id: 'collect',
        name: 'Collect Sample',
        nameEs: 'Recolectar Muestra',
        description: 'Swab the inside of your cheek to collect cheek cells',
        descriptionEs: 'Usa un hisopo dentro de tu mejilla para recolectar celulas',
        duration: 3,
      },
      {
        id: 'lyse',
        name: 'Cell Lysis',
        nameEs: 'Lisis Celular',
        description: 'Add soap solution to break open cell membranes',
        descriptionEs: 'Agrega solucion de jabon para romper las membranas celulares',
        duration: 5,
      },
      {
        id: 'salt',
        name: 'Add Salt',
        nameEs: 'Agregar Sal',
        description: 'Salt helps DNA clump together by neutralizing its negative charge',
        descriptionEs: 'La sal ayuda al ADN a agruparse neutralizando su carga negativa',
        duration: 3,
      },
      {
        id: 'alcohol',
        name: 'Precipitate DNA',
        nameEs: 'Precipitar ADN',
        description: 'Add cold alcohol - DNA rises to the top as white threads!',
        descriptionEs: 'Agrega alcohol frio - El ADN sube como hilos blancos!',
        duration: 8,
        animation: 'dna-rise',
      },
      {
        id: 'collect-dna',
        name: 'Collect DNA',
        nameEs: 'Recolectar ADN',
        description: 'Use a wooden stick to spool the DNA threads',
        descriptionEs: 'Usa un palillo de madera para enrollar los hilos de ADN',
        duration: 4,
      },
    ],
    funFact: 'The DNA in all of your cells, if stretched end to end, would reach the sun and back over 600 times!',
    funFactEs: 'El ADN de todas tus celulas, si se estirara de punta a punta, llegaria al sol y volveria mas de 600 veces!',
  },
  {
    id: 'pcr',
    name: 'PCR (Polymerase Chain Reaction)',
    nameEs: 'PCR (Reaccion en Cadena de la Polimerasa)',
    description: 'Amplify a specific DNA sequence millions of times',
    descriptionEs: 'Amplifica una secuencia especifica de ADN millones de veces',
    icon: Thermometer,
    color: 'red',
    steps: [
      {
        id: 'denature',
        name: 'Denaturation (95°C)',
        nameEs: 'Desnaturalizacion (95°C)',
        description: 'Heat separates the double-stranded DNA into single strands',
        descriptionEs: 'El calor separa el ADN de doble cadena en cadenas simples',
        duration: 4,
        animation: 'heat',
      },
      {
        id: 'anneal',
        name: 'Annealing (55°C)',
        nameEs: 'Alineamiento (55°C)',
        description: 'Primers attach to complementary sequences on single-stranded DNA',
        descriptionEs: 'Los primers se unen a secuencias complementarias en el ADN',
        duration: 4,
        animation: 'cool',
      },
      {
        id: 'extend',
        name: 'Extension (72°C)',
        nameEs: 'Extension (72°C)',
        description: 'DNA polymerase builds new strands from the primers',
        descriptionEs: 'La ADN polimerasa construye nuevas cadenas desde los primers',
        duration: 5,
        animation: 'extend',
      },
      {
        id: 'cycle',
        name: 'Repeat Cycle',
        nameEs: 'Repetir Ciclo',
        description: 'Each cycle doubles the DNA amount - 30 cycles = 1 billion copies!',
        descriptionEs: 'Cada ciclo duplica el ADN - 30 ciclos = mil millones de copias!',
        duration: 6,
      },
    ],
    funFact: 'PCR was invented by Kary Mullis in 1983 while driving on Highway 128 in California. He won the Nobel Prize for it!',
    funFactEs: 'La PCR fue inventada por Kary Mullis en 1983 mientras conducia en la Autopista 128 en California. Gano el Premio Nobel por ello!',
  },
  {
    id: 'gel-electrophoresis',
    name: 'Gel Electrophoresis',
    nameEs: 'Electroforesis en Gel',
    description: 'Separate DNA fragments by size using electric current',
    descriptionEs: 'Separa fragmentos de ADN por tamano usando corriente electrica',
    icon: Zap,
    color: 'blue',
    steps: [
      {
        id: 'prepare',
        name: 'Prepare Gel',
        nameEs: 'Preparar Gel',
        description: 'Pour hot agarose solution into the mold and let it solidify',
        descriptionEs: 'Vierte solucion de agarosa caliente en el molde y deja solidificar',
        duration: 5,
      },
      {
        id: 'load',
        name: 'Load Samples',
        nameEs: 'Cargar Muestras',
        description: 'Carefully pipette DNA samples into the wells',
        descriptionEs: 'Pipetea cuidadosamente las muestras de ADN en los pozos',
        duration: 4,
      },
      {
        id: 'run',
        name: 'Run Electric Current',
        nameEs: 'Aplicar Corriente',
        description: 'DNA is negatively charged, so it moves toward the positive electrode',
        descriptionEs: 'El ADN tiene carga negativa, asi que se mueve hacia el electrodo positivo',
        duration: 8,
        animation: 'electrophoresis',
      },
      {
        id: 'stain',
        name: 'Stain & Visualize',
        nameEs: 'Tenir y Visualizar',
        description: 'UV light reveals the DNA bands - smaller fragments travel further!',
        descriptionEs: 'La luz UV revela las bandas de ADN - fragmentos mas pequenos viajan mas lejos!',
        duration: 4,
        animation: 'uv-reveal',
      },
    ],
    funFact: 'Gel electrophoresis is used in forensic DNA analysis to match crime scene evidence to suspects.',
    funFactEs: 'La electroforesis en gel se usa en analisis forense de ADN para comparar evidencia de escenas del crimen con sospechosos.',
  },
  {
    id: 'restriction-digest',
    name: 'Restriction Enzyme Digest',
    nameEs: 'Digestion con Enzimas de Restriccion',
    description: 'Cut DNA at specific sequences using molecular scissors',
    descriptionEs: 'Corta el ADN en secuencias especificas usando tijeras moleculares',
    icon: Scissors,
    color: 'purple',
    steps: [
      {
        id: 'select',
        name: 'Select Enzyme',
        nameEs: 'Seleccionar Enzima',
        description: 'Choose EcoRI - it cuts at GAATTC sequences',
        descriptionEs: 'Elige EcoRI - corta en secuencias GAATTC',
        duration: 3,
      },
      {
        id: 'mix',
        name: 'Mix Reaction',
        nameEs: 'Mezclar Reaccion',
        description: 'Combine DNA, enzyme, and buffer in a tube',
        descriptionEs: 'Combina ADN, enzima y buffer en un tubo',
        duration: 4,
      },
      {
        id: 'incubate',
        name: 'Incubate (37°C)',
        nameEs: 'Incubar (37°C)',
        description: 'Keep warm for 1 hour - the enzyme finds and cuts all GAATTC sites',
        descriptionEs: 'Mantener caliente 1 hora - la enzima encuentra y corta todos los sitios GAATTC',
        duration: 6,
        animation: 'cut',
      },
      {
        id: 'analyze',
        name: 'Analyze Fragments',
        nameEs: 'Analizar Fragmentos',
        description: 'Run on gel to see the DNA cut into specific-sized pieces',
        descriptionEs: 'Corre en gel para ver el ADN cortado en piezas de tamano especifico',
        duration: 4,
      },
    ],
    funFact: 'Restriction enzymes are natural bacterial defenses against viruses. Scientists have discovered over 3,000 different types!',
    funFactEs: 'Las enzimas de restriccion son defensas naturales de bacterias contra virus. Los cientificos han descubierto mas de 3,000 tipos diferentes!',
  },
]

export function VirtualLab() {
  const t = useTranslations()
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentType | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [stepProgress, setStepProgress] = useState(0)
  const [completedExperiments, setCompletedExperiments] = useState<ExperimentType[]>([])
  const [showResults, setShowResults] = useState(false)

  // Get locale-aware text
  const isSpanish = t('locale') === 'es'

  const experiment = selectedExperiment
    ? EXPERIMENTS.find(e => e.id === selectedExperiment)
    : null

  // Run experiment step
  useEffect(() => {
    if (!isRunning || !experiment) return

    const step = experiment.steps[currentStep]
    if (!step) return

    const totalDuration = step.duration * 1000 // Convert to ms
    const interval = 100 // Update every 100ms
    const increment = (interval / totalDuration) * 100

    const timer = setInterval(() => {
      setStepProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          // Move to next step or finish
          if (currentStep < experiment.steps.length - 1) {
            setTimeout(() => {
              setCurrentStep(prev => prev + 1)
              setStepProgress(0)
            }, 500)
          } else {
            // Experiment complete
            setIsRunning(false)
            setShowResults(true)
            if (!completedExperiments.includes(selectedExperiment!)) {
              setCompletedExperiments([...completedExperiments, selectedExperiment!])
            }
          }
          return 100
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isRunning, currentStep, experiment, selectedExperiment, completedExperiments])

  // Reset experiment
  const resetExperiment = () => {
    setCurrentStep(0)
    setStepProgress(0)
    setIsRunning(false)
    setShowResults(false)
  }

  // Start experiment
  const startExperiment = () => {
    resetExperiment()
    setIsRunning(true)
  }

  // Experiment selection view
  if (!selectedExperiment) {
    return (
      <div role="region" aria-label="Virtual Lab" className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1">
              <Title>{t('tools.virtualLab.title')}</Title>
              <Text className="mt-1">
                {t('tools.virtualLab.description')}
              </Text>
            </div>
            {completedExperiments.length > 0 && (
              <Badge color="green" size="lg">
                {completedExperiments.length}/4 {isSpanish ? 'completados' : 'completed'}
              </Badge>
            )}
          </div>
        </Card>

        {/* Safety Notice */}
        <Card className="bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                {isSpanish ? 'Seguridad en el Laboratorio' : 'Lab Safety'}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {isSpanish
                  ? 'En un laboratorio real, siempre usa bata, guantes y gafas de seguridad. Nunca comas ni bebas en el laboratorio.'
                  : 'In a real lab, always wear a lab coat, gloves, and safety goggles. Never eat or drink in the laboratory.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Experiment Selection */}
        <Grid numItems={1} numItemsSm={2} className="gap-4">
          {EXPERIMENTS.map(exp => {
            const isCompleted = completedExperiments.includes(exp.id)
            return (
              <Col key={exp.id}>
                <Card
                  className={`h-full cursor-pointer transition-all hover:shadow-lg ${
                    isCompleted ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => setSelectedExperiment(exp.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-${exp.color}-100 rounded-xl flex items-center justify-center`}>
                      <exp.icon className={`w-6 h-6 text-${exp.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-title">
                          {isSpanish ? exp.nameEs : exp.name}
                        </p>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted mt-1">
                        {isSpanish ? exp.descriptionEs : exp.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge color="gray" size="sm">
                          {exp.steps.length} {isSpanish ? 'pasos' : 'steps'}
                        </Badge>
                        <Badge color="gray" size="sm">
                          ~{exp.steps.reduce((a, s) => a + s.duration, 0)}s
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Grid>

        {/* Achievements */}
        {completedExperiments.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-yellow-500" />
              <Title>{isSpanish ? 'Logros de Laboratorio' : 'Lab Achievements'}</Title>
            </div>
            <div className="flex flex-wrap gap-3">
              {completedExperiments.length >= 1 && (
                <Badge color="green" size="lg">
                  {isSpanish ? 'Primer Experimento' : 'First Experiment'}
                </Badge>
              )}
              {completedExperiments.length >= 2 && (
                <Badge color="blue" size="lg">
                  {isSpanish ? 'Cientifico en Entrenamiento' : 'Scientist in Training'}
                </Badge>
              )}
              {completedExperiments.length >= 4 && (
                <Badge color="purple" size="lg">
                  {isSpanish ? 'Maestro del Laboratorio' : 'Lab Master'}
                </Badge>
              )}
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Experiment view
  return (
    <div role="region" aria-label="Virtual Lab" className="space-y-6">
      {/* Header */}
      <Card className={`bg-gradient-to-br from-${experiment?.color}-50 to-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-${experiment?.color}-100 rounded-xl flex items-center justify-center`}>
              {experiment && <experiment.icon className={`w-6 h-6 text-${experiment.color}-600`} />}
            </div>
            <div>
              <Title>{isSpanish ? experiment?.nameEs : experiment?.name}</Title>
              <Text>{isSpanish ? experiment?.descriptionEs : experiment?.description}</Text>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedExperiment(null)
              resetExperiment()
            }}
          >
            {isSpanish ? 'Volver' : 'Back'}
          </Button>
        </div>
      </Card>

      {/* Results View */}
      {showResults ? (
        <div className="space-y-6">
          <Card className="bg-success-soft text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <Title>{isSpanish ? 'Experimento Completado!' : 'Experiment Complete!'}</Title>
            <Text className="mt-2">
              {isSpanish
                ? 'Has completado exitosamente todos los pasos del experimento.'
                : 'You have successfully completed all steps of the experiment.'}
            </Text>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-title">
                  {isSpanish ? 'Dato Curioso' : 'Fun Fact'}
                </p>
                <p className="text-body mt-1">
                  {isSpanish ? experiment?.funFactEs : experiment?.funFact}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={resetExperiment}
              icon={RotateCcw}
            >
              {isSpanish ? 'Repetir Experimento' : 'Repeat Experiment'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedExperiment(null)
                resetExperiment()
              }}
            >
              {isSpanish ? 'Elegir Otro' : 'Choose Another'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Overview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title>{isSpanish ? 'Progreso del Experimento' : 'Experiment Progress'}</Title>
              <Badge color="blue">
                {isSpanish ? 'Paso' : 'Step'} {currentStep + 1}/{experiment?.steps.length}
              </Badge>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-6">
              {experiment?.steps.map((step, idx) => (
                <div key={step.id} className="flex-1">
                  <div
                    className={`h-2 rounded-full ${
                      idx < currentStep
                        ? 'bg-success-soft0'
                        : idx === currentStep
                          ? 'bg-info-soft0'
                          : 'bg-gray-200'
                    }`}
                  >
                    {idx === currentStep && isRunning && (
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${stepProgress}%` }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Step Details */}
            {experiment && (
              <div className="bg-surface-soft rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isRunning ? 'bg-blue-100 dark:bg-blue-900/30 animate-pulse' : 'bg-gray-200 dark:bg-slate-700'
                  }`}>
                    <span className="text-lg font-bold text-body">{currentStep + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-title">
                      {isSpanish
                        ? experiment.steps[currentStep].nameEs
                        : experiment.steps[currentStep].name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Clock className="w-4 h-4" />
                      <span>~{experiment.steps[currentStep].duration}s</span>
                    </div>
                  </div>
                </div>

                <p className="text-body mb-4">
                  {isSpanish
                    ? experiment.steps[currentStep].descriptionEs
                    : experiment.steps[currentStep].description}
                </p>

                {isRunning && (
                  <ProgressBar value={stepProgress} color="blue" className="mt-4" />
                )}

                {/* Visualization Area */}
                <div className="mt-6 h-40 bg-white rounded-xl border-2 border-dashed border-adaptive flex items-center justify-center">
                  {isRunning ? (
                    <div className="text-center">
                      {/* Simple animations based on step */}
                      {experiment.steps[currentStep].animation === 'dna-rise' && (
                        <div className="space-y-1">
                          <div className="w-2 h-2 bg-white border border-gray-400 rounded-full mx-auto animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-white border border-gray-400 rounded-full mx-auto animate-bounce" style={{ animationDelay: '100ms' }} />
                          <div className="w-2 h-2 bg-white border border-gray-400 rounded-full mx-auto animate-bounce" style={{ animationDelay: '200ms' }} />
                          <p className="text-sm text-muted mt-2">
                            {isSpanish ? 'ADN precipitando...' : 'DNA precipitating...'}
                          </p>
                        </div>
                      )}
                      {experiment.steps[currentStep].animation === 'heat' && (
                        <div className="text-center">
                          <Thermometer className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
                          <p className="text-2xl font-bold text-red-500 mt-2">95°C</p>
                          <p className="text-sm text-muted">
                            {isSpanish ? 'Calentando...' : 'Heating...'}
                          </p>
                        </div>
                      )}
                      {experiment.steps[currentStep].animation === 'cool' && (
                        <div className="text-center">
                          <Thermometer className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
                          <p className="text-2xl font-bold text-blue-500 mt-2">55°C</p>
                          <p className="text-sm text-muted">
                            {isSpanish ? 'Enfriando...' : 'Cooling...'}
                          </p>
                        </div>
                      )}
                      {experiment.steps[currentStep].animation === 'electrophoresis' && (
                        <div className="w-full max-w-xs mx-auto">
                          <div className="h-20 bg-gradient-to-b from-gray-100 to-blue-100 rounded relative overflow-hidden">
                            <div className="absolute top-2 left-4 w-2 h-2 bg-info-soft0 rounded animate-bounce" style={{ animationDuration: '2s' }} />
                            <div className="absolute top-2 left-8 w-2 h-3 bg-info-soft0 rounded animate-bounce" style={{ animationDuration: '2.5s' }} />
                            <div className="absolute top-2 left-12 w-2 h-1 bg-info-soft0 rounded animate-bounce" style={{ animationDuration: '1.5s' }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted mt-1">
                            <span>- {isSpanish ? 'Negativo' : 'Negative'}</span>
                            <span>+ {isSpanish ? 'Positivo' : 'Positive'}</span>
                          </div>
                        </div>
                      )}
                      {experiment.steps[currentStep].animation === 'uv-reveal' && (
                        <div className="text-center">
                          <div className="w-24 h-16 bg-purple-900 mx-auto rounded flex items-center justify-center">
                            <div className="space-y-1">
                              <div className="w-12 h-1 bg-green-400" />
                              <div className="w-8 h-1 bg-green-400" />
                              <div className="w-16 h-1 bg-green-400" />
                            </div>
                          </div>
                          <p className="text-sm text-accent mt-2">
                            {isSpanish ? 'Luz UV revelando bandas' : 'UV light revealing bands'}
                          </p>
                        </div>
                      )}
                      {experiment.steps[currentStep].animation === 'cut' && (
                        <div className="text-center">
                          <Scissors className="w-12 h-12 text-purple-500 mx-auto animate-pulse" />
                          <p className="text-sm text-muted mt-2">
                            {isSpanish ? 'Cortando en GAATTC...' : 'Cutting at GAATTC...'}
                          </p>
                        </div>
                      )}
                      {!experiment.steps[currentStep].animation && (
                        <div className="text-center">
                          <Microscope className="w-12 h-12 text-subtle mx-auto animate-pulse" />
                          <p className="text-sm text-muted mt-2">
                            {isSpanish ? 'Procesando...' : 'Processing...'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-subtle">
                      <Microscope className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">
                        {isSpanish
                          ? 'Presiona "Iniciar" para comenzar'
                          : 'Press "Start" to begin'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isRunning ? (
              <Button
                icon={Play}
                onClick={startExperiment}
                className="flex-1"
              >
                {currentStep === 0
                  ? (isSpanish ? 'Iniciar Experimento' : 'Start Experiment')
                  : (isSpanish ? 'Continuar' : 'Continue')
                }
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setIsRunning(false)}
                className="flex-1"
              >
                {isSpanish ? 'Pausar' : 'Pause'}
              </Button>
            )}
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={resetExperiment}
            >
              {isSpanish ? 'Reiniciar' : 'Reset'}
            </Button>
          </div>

          {/* Steps List */}
          <Card>
            <Title className="mb-4">{isSpanish ? 'Todos los Pasos' : 'All Steps'}</Title>
            <div className="space-y-3">
              {experiment?.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    idx < currentStep
                      ? 'bg-success-soft'
                      : idx === currentStep
                        ? 'bg-info-soft ring-2 ring-blue-500'
                        : 'bg-surface-soft'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    idx < currentStep
                      ? 'bg-success-soft0 text-white'
                      : idx === currentStep
                        ? 'bg-info-soft0 text-white'
                        : 'bg-gray-300 text-body'
                  }`}>
                    {idx < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      idx <= currentStep ? 'text-title' : 'text-subtle'
                    }`}>
                      {isSpanish ? step.nameEs : step.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted">
                    <Clock className="w-4 h-4" />
                    <span>{step.duration}s</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
