'use client'

import { useState, useMemo } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Bug,
  Leaf,
  Zap,
  Shield,
  Eye,
  Heart,
  Wind,
  Flame,
  Snowflake,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Trophy,
  Info,
  Sparkles,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

interface Gene {
  id: string
  name: string
  nameEs: string
  source: string
  sourceEs: string
  effect: string
  effectEs: string
  icon: typeof Bug
  category: 'visual' | 'defense' | 'metabolic' | 'structural'
  viabilityImpact: number // -20 to +10
  incompatibleWith: string[]
}

const AVAILABLE_GENES: Gene[] = [
  {
    id: 'bioluminescence',
    name: 'Bioluminescence',
    nameEs: 'Bioluminiscencia',
    source: 'Aequorea victoria (jellyfish)',
    sourceEs: 'Aequorea victoria (medusa)',
    effect: 'Produces green fluorescent protein (GFP)',
    effectEs: 'Produce proteina fluorescente verde (GFP)',
    icon: Sparkles,
    category: 'visual',
    viabilityImpact: -5,
    incompatibleWith: [],
  },
  {
    id: 'photosynthesis',
    name: 'Photosynthesis',
    nameEs: 'Fotosintesis',
    source: 'Arabidopsis thaliana (plant)',
    sourceEs: 'Arabidopsis thaliana (planta)',
    effect: 'Converts light into energy via chloroplasts',
    effectEs: 'Convierte luz en energia via cloroplastos',
    icon: Leaf,
    category: 'metabolic',
    viabilityImpact: -15,
    incompatibleWith: ['speed'],
  },
  {
    id: 'regeneration',
    name: 'Tissue Regeneration',
    nameEs: 'Regeneracion de Tejidos',
    source: 'Ambystoma mexicanum (axolotl)',
    sourceEs: 'Ambystoma mexicanum (ajolote)',
    effect: 'Regrows damaged limbs and organs',
    effectEs: 'Regenera extremidades y organos danados',
    icon: Heart,
    category: 'structural',
    viabilityImpact: 5,
    incompatibleWith: [],
  },
  {
    id: 'venom',
    name: 'Venom Production',
    nameEs: 'Produccion de Veneno',
    source: 'Dendrobatidae (poison dart frog)',
    sourceEs: 'Dendrobatidae (rana venenosa)',
    effect: 'Produces defensive toxins in skin glands',
    effectEs: 'Produce toxinas defensivas en glandulas cutaneas',
    icon: Shield,
    category: 'defense',
    viabilityImpact: -8,
    incompatibleWith: ['regeneration'],
  },
  {
    id: 'echolocation',
    name: 'Echolocation',
    nameEs: 'Ecolocalizacion',
    source: 'Rhinolophus ferrumequinum (bat)',
    sourceEs: 'Rhinolophus ferrumequinum (murcielago)',
    effect: 'Navigate using ultrasonic sound waves',
    effectEs: 'Navegar usando ondas ultrasonicas',
    icon: Wind,
    category: 'structural',
    viabilityImpact: -3,
    incompatibleWith: [],
  },
  {
    id: 'antifreeze',
    name: 'Antifreeze Proteins',
    nameEs: 'Proteinas Anticongelantes',
    source: 'Dissostichus mawsoni (Antarctic fish)',
    sourceEs: 'Dissostichus mawsoni (pez antartico)',
    effect: 'Survive sub-zero temperatures',
    effectEs: 'Sobrevivir a temperaturas bajo cero',
    icon: Snowflake,
    category: 'metabolic',
    viabilityImpact: 0,
    incompatibleWith: ['heat_resist'],
  },
  {
    id: 'heat_resist',
    name: 'Thermophilic Enzymes',
    nameEs: 'Enzimas Termofilicas',
    source: 'Thermus aquaticus (extremophile)',
    sourceEs: 'Thermus aquaticus (extremofilo)',
    effect: 'Proteins function at extreme heat',
    effectEs: 'Proteinas funcionan a calor extremo',
    icon: Flame,
    category: 'metabolic',
    viabilityImpact: -10,
    incompatibleWith: ['antifreeze'],
  },
  {
    id: 'night_vision',
    name: 'Enhanced Night Vision',
    nameEs: 'Vision Nocturna Mejorada',
    source: 'Tarsius syrichta (tarsier)',
    sourceEs: 'Tarsius syrichta (tarsero)',
    effect: 'See in near-total darkness',
    effectEs: 'Ver en oscuridad casi total',
    icon: Eye,
    category: 'visual',
    viabilityImpact: -2,
    incompatibleWith: [],
  },
  {
    id: 'speed',
    name: 'Fast-Twitch Muscle Fibers',
    nameEs: 'Fibras Musculares de Contraccion Rapida',
    source: 'Acinonyx jubatus (cheetah)',
    sourceEs: 'Acinonyx jubatus (guepardo)',
    effect: 'Enhanced speed and explosive power',
    effectEs: 'Velocidad mejorada y potencia explosiva',
    icon: Zap,
    category: 'structural',
    viabilityImpact: 0,
    incompatibleWith: ['photosynthesis'],
  },
  {
    id: 'silk',
    name: 'Silk Production',
    nameEs: 'Produccion de Seda',
    source: 'Nephila clavipes (spider)',
    sourceEs: 'Nephila clavipes (arana)',
    effect: 'Produce spider silk stronger than steel',
    effectEs: 'Producir seda de arana mas fuerte que el acero',
    icon: Bug,
    category: 'defense',
    viabilityImpact: -5,
    incompatibleWith: [],
  },
  {
    id: 'magnetoreception',
    name: 'Magnetoreception',
    nameEs: 'Magnetorecepcion',
    source: 'Columba livia (pigeon)',
    sourceEs: 'Columba livia (paloma)',
    effect: 'Sense Earths magnetic field for navigation',
    effectEs: 'Detectar el campo magnetico terrestre para navegacion',
    icon: Wind,
    category: 'structural',
    viabilityImpact: -1,
    incompatibleWith: [],
  },
  {
    id: 'electric',
    name: 'Electric Discharge',
    nameEs: 'Descarga Electrica',
    source: 'Electrophorus electricus (electric eel)',
    sourceEs: 'Electrophorus electricus (anguila electrica)',
    effect: 'Generate electric pulses for defense',
    effectEs: 'Generar pulsos electricos para defensa',
    icon: Zap,
    category: 'defense',
    viabilityImpact: -12,
    incompatibleWith: [],
  },
]

const CATEGORY_LABELS: Record<string, { en: string; es: string }> = {
  visual: { en: 'Visual', es: 'Visual' },
  defense: { en: 'Defense', es: 'Defensa' },
  metabolic: { en: 'Metabolic', es: 'Metabolico' },
  structural: { en: 'Structural', es: 'Estructural' },
}

export function OrganismDesigner() {
  const t = useTranslations()
  const [selectedGenes, setSelectedGenes] = useState<string[]>([])
  const [organismName, setOrganismName] = useState('')

  const toggleGene = (geneId: string) => {
    setSelectedGenes((prev) =>
      prev.includes(geneId) ? prev.filter((id) => id !== geneId) : [...prev, geneId]
    )
  }

  const viabilityScore = useMemo(() => {
    let score = 80 // base viability
    selectedGenes.forEach((geneId) => {
      const gene = AVAILABLE_GENES.find((g) => g.id === geneId)
      if (gene) score += gene.viabilityImpact
    })
    // Penalty for too many genes
    if (selectedGenes.length > 5) score -= (selectedGenes.length - 5) * 5
    return Math.max(0, Math.min(100, score))
  }, [selectedGenes])

  const incompatibilities = useMemo(() => {
    const issues: string[] = []
    selectedGenes.forEach((geneId) => {
      const gene = AVAILABLE_GENES.find((g) => g.id === geneId)
      if (gene) {
        gene.incompatibleWith.forEach((incompId) => {
          if (selectedGenes.includes(incompId)) {
            const other = AVAILABLE_GENES.find((g) => g.id === incompId)
            if (other) {
              const key = [gene.nameEs, other.nameEs].sort().join(' + ')
              if (!issues.includes(key)) issues.push(key)
            }
          }
        })
      }
    })
    return issues
  }, [selectedGenes])

  const viabilityColor = viabilityScore >= 60 ? 'green' : viabilityScore >= 30 ? 'amber' : 'red'

  const handleReset = () => {
    setSelectedGenes([])
    setOrganismName('')
  }

  const categories = ['visual', 'defense', 'metabolic', 'structural'] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bug className="w-8 h-8 text-emerald-500" />
          </div>
          <Title className="text-title">Disena un Organismo</Title>
          <Text className="text-body mt-2 max-w-lg mx-auto">
            Selecciona genes reales de distintas especies para crear un organismo hibrido.
            Observa como afectan la viabilidad y descubre incompatibilidades.
          </Text>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel: gene selection */}
        <div className="lg:col-span-2 space-y-4">
          {categories.map((category) => (
            <Card key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Badge color={category === 'visual' ? 'purple' : category === 'defense' ? 'red' : category === 'metabolic' ? 'green' : 'blue'}>
                  {CATEGORY_LABELS[category].es}
                </Badge>
              </div>
              <div className="space-y-2">
                {AVAILABLE_GENES.filter((g) => g.category === category).map((gene) => {
                  const isSelected = selectedGenes.includes(gene.id)
                  const hasIncompat = isSelected && gene.incompatibleWith.some((id) => selectedGenes.includes(id))
                  return (
                    <button
                      key={gene.id}
                      onClick={() => toggleGene(gene.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? hasIncompat
                            ? 'bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-700'
                            : 'bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700'
                          : 'bg-surface-soft border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-surface-muted'
                      }`}>
                        <gene.icon className={`w-5 h-5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-title text-sm">{gene.nameEs}</p>
                        <p className="text-xs text-muted truncate">{gene.sourceEs}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs font-medium ${gene.viabilityImpact > 0 ? 'text-green-600' : gene.viabilityImpact < -8 ? 'text-red-500' : 'text-amber-500'}`}>
                          {gene.viabilityImpact > 0 ? '+' : ''}{gene.viabilityImpact}%
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* Right panel: preview */}
        <div className="space-y-4">
          {/* Viability Score */}
          <Card>
            <Title className="text-title text-sm mb-3">Viabilidad del Organismo</Title>
            <div className="text-center mb-3">
              <span className={`text-4xl font-bold ${viabilityColor === 'green' ? 'text-green-600 dark:text-green-400' : viabilityColor === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {viabilityScore}%
              </span>
            </div>
            <ProgressBar value={viabilityScore} color={viabilityColor} />
            <Text className="text-xs text-muted mt-2 text-center">
              {viabilityScore >= 60 ? 'Organismo viable' : viabilityScore >= 30 ? 'Viabilidad cuestionable' : 'No viable'}
            </Text>
          </Card>

          {/* Selected genes summary */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <Title className="text-title text-sm">Genes Seleccionados</Title>
              <Badge color="emerald">{selectedGenes.length}/12</Badge>
            </div>
            {selectedGenes.length === 0 ? (
              <Text className="text-muted text-sm text-center py-4">
                Selecciona genes del panel izquierdo
              </Text>
            ) : (
              <div className="space-y-2">
                {selectedGenes.map((geneId) => {
                  const gene = AVAILABLE_GENES.find((g) => g.id === geneId)
                  if (!gene) return null
                  return (
                    <div key={geneId} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-body">{gene.nameEs}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Incompatibilities */}
          {incompatibilities.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <Title className="text-title text-sm">Incompatibilidades</Title>
              </div>
              <div className="space-y-2">
                {incompatibilities.map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              icon={Trophy}
              color="emerald"
              disabled={selectedGenes.length === 0}
              onClick={() => toast.success(`Organismo creado con ${selectedGenes.length} genes!`)}
            >
              Guardar Diseno
            </Button>
            <Button
              variant="light"
              icon={RotateCcw}
              onClick={handleReset}
            >
              Reiniciar
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-surface-soft rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted">
                Simulacion educativa. Los genes mostrados son reales pero la combinacion entre especies
                es una simplificacion con fines de aprendizaje.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
