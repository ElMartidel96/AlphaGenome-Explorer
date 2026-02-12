'use client'

import { useState } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Scissors,
  Search,
  Dna,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

interface Isoform {
  id: string
  name: string
  exons: { start: number; end: number; included: boolean }[]
  probability: number
  proteinLength: number
  functionalImpact: string
  functionalImpactEs: string
}

interface GeneData {
  id: string
  symbol: string
  fullName: string
  fullNameEs: string
  chromosome: string
  totalExons: number
  isoforms: Isoform[]
  variant?: {
    position: string
    ref: string
    alt: string
    effect: string
    effectEs: string
    deltaPsi: number
  }
}

const DEMO_GENES: GeneData[] = [
  {
    id: 'brca1',
    symbol: 'BRCA1',
    fullName: 'Breast Cancer 1, DNA Repair Associated',
    fullNameEs: 'Cancer de Mama 1, Asociado a Reparacion de ADN',
    chromosome: 'chr17',
    totalExons: 24,
    isoforms: [
      {
        id: 'brca1-full',
        name: 'BRCA1-001 (Full length)',
        exons: Array.from({ length: 24 }, (_, i) => ({ start: i * 100, end: (i + 1) * 100 - 10, included: true })),
        probability: 0.72,
        proteinLength: 1863,
        functionalImpact: 'Full DNA repair function',
        functionalImpactEs: 'Funcion de reparacion de ADN completa',
      },
      {
        id: 'brca1-d11',
        name: 'BRCA1-delta11q',
        exons: Array.from({ length: 24 }, (_, i) => ({ start: i * 100, end: (i + 1) * 100 - 10, included: i !== 10 })),
        probability: 0.18,
        proteinLength: 1317,
        functionalImpact: 'Partial DNA repair, embryonic development',
        functionalImpactEs: 'Reparacion parcial de ADN, desarrollo embrionario',
      },
      {
        id: 'brca1-d9-10',
        name: 'BRCA1-delta9-10',
        exons: Array.from({ length: 24 }, (_, i) => ({ start: i * 100, end: (i + 1) * 100 - 10, included: i !== 8 && i !== 9 })),
        probability: 0.10,
        proteinLength: 1100,
        functionalImpact: 'Reduced repair capacity',
        functionalImpactEs: 'Capacidad de reparacion reducida',
      },
    ],
    variant: {
      position: '41276044',
      ref: 'G',
      alt: 'A',
      effect: 'Weakens splice donor at exon 11, increasing delta11q isoform',
      effectEs: 'Debilita donor de splicing en exon 11, aumentando isoforma delta11q',
      deltaPsi: 0.25,
    },
  },
  {
    id: 'tp53',
    symbol: 'TP53',
    fullName: 'Tumor Protein P53',
    fullNameEs: 'Proteina Tumoral P53',
    chromosome: 'chr17',
    totalExons: 11,
    isoforms: [
      {
        id: 'tp53-alpha',
        name: 'TP53-alpha (Full length)',
        exons: Array.from({ length: 11 }, (_, i) => ({ start: i * 80, end: (i + 1) * 80 - 10, included: true })),
        probability: 0.65,
        proteinLength: 393,
        functionalImpact: 'Full tumor suppressor activity',
        functionalImpactEs: 'Actividad supresora de tumores completa',
      },
      {
        id: 'tp53-beta',
        name: 'TP53-beta',
        exons: Array.from({ length: 11 }, (_, i) => ({ start: i * 80, end: (i + 1) * 80 - 10, included: i < 9 })),
        probability: 0.20,
        proteinLength: 341,
        functionalImpact: 'Modified C-terminus, altered regulation',
        functionalImpactEs: 'C-terminal modificado, regulacion alterada',
      },
      {
        id: 'tp53-delta40',
        name: 'TP53-delta40',
        exons: Array.from({ length: 11 }, (_, i) => ({ start: i * 80, end: (i + 1) * 80 - 10, included: i !== 1 })),
        probability: 0.15,
        proteinLength: 353,
        functionalImpact: 'Missing transactivation domain, dominant negative',
        functionalImpactEs: 'Sin dominio de transactivacion, dominante negativo',
      },
    ],
    variant: {
      position: '7578406',
      ref: 'C',
      alt: 'T',
      effect: 'Creates cryptic splice site in exon 6, producing truncated protein',
      effectEs: 'Crea sitio de splicing criptico en exon 6, produciendo proteina truncada',
      deltaPsi: 0.35,
    },
  },
  {
    id: 'cftr',
    symbol: 'CFTR',
    fullName: 'Cystic Fibrosis Transmembrane Conductance Regulator',
    fullNameEs: 'Regulador de Conductancia Transmembrana de Fibrosis Quistica',
    chromosome: 'chr7',
    totalExons: 27,
    isoforms: [
      {
        id: 'cftr-full',
        name: 'CFTR-001 (Full length)',
        exons: Array.from({ length: 27 }, (_, i) => ({ start: i * 60, end: (i + 1) * 60 - 8, included: true })),
        probability: 0.80,
        proteinLength: 1480,
        functionalImpact: 'Full chloride channel function',
        functionalImpactEs: 'Funcion completa de canal de cloruro',
      },
      {
        id: 'cftr-d9',
        name: 'CFTR-delta9',
        exons: Array.from({ length: 27 }, (_, i) => ({ start: i * 60, end: (i + 1) * 60 - 8, included: i !== 8 })),
        probability: 0.12,
        proteinLength: 1380,
        functionalImpact: 'Reduced channel activity (~50%)',
        functionalImpactEs: 'Actividad de canal reducida (~50%)',
      },
      {
        id: 'cftr-d14b',
        name: 'CFTR-delta14b-17b',
        exons: Array.from({ length: 27 }, (_, i) => ({ start: i * 60, end: (i + 1) * 60 - 8, included: !(i >= 13 && i <= 16) })),
        probability: 0.08,
        proteinLength: 1200,
        functionalImpact: 'Non-functional channel, disease-causing',
        functionalImpactEs: 'Canal no funcional, causante de enfermedad',
      },
    ],
    variant: {
      position: '117548628',
      ref: 'A',
      alt: 'G',
      effect: 'Disrupts branch point before exon 9, increasing exon skipping',
      effectEs: 'Interrumpe punto de ramificacion antes del exon 9, aumentando salto de exon',
      deltaPsi: 0.18,
    },
  },
]

export function SplicingPredictor() {
  const t = useTranslations()
  const [selectedGene, setSelectedGene] = useState<GeneData | null>(null)
  const [showVariantEffect, setShowVariantEffect] = useState(false)
  const [expandedIsoform, setExpandedIsoform] = useState<string | null>(null)

  const handleSelectGene = (gene: GeneData) => {
    setSelectedGene(gene)
    setShowVariantEffect(false)
    setExpandedIsoform(null)
  }

  return (
    <div role="region" aria-label="Splicing Predictor" className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-cyan-500" />
          </div>
          <Title className="text-title">Predictor de Splicing Alternativo</Title>
          <Text className="text-body mt-2 max-w-lg mx-auto">
            Visualiza isoformas de ARN, probabilidades de splicing y el impacto de variantes
            en los patrones de empalme alternativo.
          </Text>
        </div>
      </Card>

      {/* Gene selection */}
      <Card>
        <Title className="text-title text-sm mb-3">Selecciona un Gen Demo</Title>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_GENES.map((gene) => (
            <button
              key={gene.id}
              aria-label={`Select gene ${gene.symbol}`}
              onClick={() => handleSelectGene(gene)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedGene?.id === gene.id
                  ? 'bg-cyan-50 dark:bg-cyan-950/20 border-2 border-cyan-300 dark:border-cyan-700'
                  : 'bg-surface-soft border-2 border-transparent hover:border-cyan-200 dark:hover:border-cyan-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Dna className="w-5 h-5 text-cyan-500" />
                <span className="font-bold text-title">{gene.symbol}</span>
                <Badge color="gray" size="xs">{gene.chromosome}</Badge>
              </div>
              <p className="text-xs text-muted mt-1">{gene.fullNameEs}</p>
              <p className="text-xs text-muted mt-1">{gene.totalExons} exones | {gene.isoforms.length} isoformas</p>
            </button>
          ))}
        </div>
      </Card>

      {selectedGene && (
        <>
          {/* Exon/intron diagram */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title className="text-title text-sm">
                Estructura de {selectedGene.symbol} ({selectedGene.totalExons} exones)
              </Title>
              <Button
                size="xs"
                variant={showVariantEffect ? 'primary' : 'light'}
                icon={Zap}
                onClick={() => {
                  setShowVariantEffect(!showVariantEffect)
                  if (!showVariantEffect) {
                    toast.success(`Mostrando efecto de variante en ${selectedGene.symbol}`)
                  }
                }}
              >
                {showVariantEffect ? 'Efecto activo' : 'Simular variante'}
              </Button>
            </div>

            {/* Simple exon diagram */}
            <div className="p-4 bg-surface-soft rounded-xl overflow-x-auto">
              <div className="flex items-center gap-0.5 min-w-[500px]">
                {Array.from({ length: selectedGene.totalExons }, (_, i) => (
                  <div key={i} className="flex items-center">
                    {/* Exon block */}
                    <div
                      className={`h-8 rounded flex items-center justify-center text-xs font-mono ${
                        showVariantEffect && selectedGene.variant && i === Math.floor(selectedGene.totalExons / 2)
                          ? 'bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-2 border-red-400'
                          : 'bg-cyan-200 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300'
                      }`}
                      style={{ width: `${Math.max(24, 600 / selectedGene.totalExons - 4)}px` }}
                    >
                      {selectedGene.totalExons <= 15 ? i + 1 : ''}
                    </div>
                    {/* Intron line */}
                    {i < selectedGene.totalExons - 1 && (
                      <div className="h-0.5 w-2 bg-gray-300 dark:bg-gray-600" />
                    )}
                  </div>
                ))}
              </div>
              {showVariantEffect && selectedGene.variant && (
                <div className="mt-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-600 dark:text-red-400">
                    {selectedGene.variant.position}: {selectedGene.variant.ref}{'>'}{selectedGene.variant.alt} - {selectedGene.variant.effectEs}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Isoforms */}
          <Card>
            <Title className="text-title text-sm mb-4">Isoformas de ARN</Title>
            <div className="space-y-3">
              {selectedGene.isoforms.map((isoform) => {
                const adjustedProb = showVariantEffect && selectedGene.variant
                  ? Math.max(0.05, Math.min(0.95, isoform.probability + (isoform.id.includes('full') ? -selectedGene.variant.deltaPsi : selectedGene.variant.deltaPsi / 2)))
                  : isoform.probability

                return (
                  <div key={isoform.id} className="border border-adaptive rounded-xl overflow-hidden">
                    <button
                      aria-label={`Toggle isoform ${isoform.name}`}
                      onClick={() => setExpandedIsoform(expandedIsoform === isoform.id ? null : isoform.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-surface-soft transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-title text-sm">{isoform.name}</span>
                          {showVariantEffect && adjustedProb !== isoform.probability && (
                            <Badge color={adjustedProb > isoform.probability ? 'red' : 'green'} size="xs">
                              {adjustedProb > isoform.probability ? '↑' : '↓'} Alterada
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted">{isoform.proteinLength} aa</span>
                          <span className="text-xs text-muted">{isoform.exons.filter((e) => e.included).length} exones</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 w-20">
                        <span className={`text-lg font-bold ${
                          adjustedProb > 0.5 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500'
                        }`}>
                          {(adjustedProb * 100).toFixed(0)}%
                        </span>
                      </div>
                      {expandedIsoform === isoform.id ? (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted" />
                      )}
                    </button>
                    {expandedIsoform === isoform.id && (
                      <div className="px-4 pb-4 border-t border-adaptive">
                        <div className="mt-3">
                          <ProgressBar value={adjustedProb * 100} color="cyan" />
                        </div>
                        {/* Mini exon diagram */}
                        <div className="flex items-center gap-px mt-3 overflow-x-auto">
                          {isoform.exons.map((exon, i) => (
                            <div
                              key={i}
                              className={`h-4 rounded-sm ${
                                exon.included
                                  ? 'bg-cyan-300 dark:bg-cyan-700'
                                  : 'bg-gray-200 dark:bg-gray-700 opacity-30'
                              }`}
                              style={{ width: `${Math.max(8, 400 / isoform.exons.length - 2)}px` }}
                              title={`Exon ${i + 1}: ${exon.included ? 'Included' : 'Skipped'}`}
                            />
                          ))}
                        </div>
                        <div className="mt-3 p-2 bg-surface-soft rounded-xl">
                          <p className="text-xs text-body">
                            <strong>Impacto:</strong> {isoform.functionalImpactEs}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Variant effect summary */}
          {showVariantEffect && selectedGene.variant && (
            <Card className="border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-title">Resumen del Efecto de la Variante</p>
                  <p className="text-sm text-body mt-1">{selectedGene.variant.effectEs}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge color="amber">ΔΨ = {selectedGene.variant.deltaPsi.toFixed(2)}</Badge>
                    <span className="text-xs text-muted">
                      Cambio en probabilidad de inclusion de exon
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-surface-soft rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted">
                Las probabilidades de splicing son estimaciones basadas en datos de referencia.
                Los valores reales varian segun tejido, contexto celular y condiciones experimentales.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
