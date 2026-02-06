'use client'

import { useState } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Heart,
  Upload,
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  Baby,
  Trash2,
  Phone,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  Lock,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

type AnalysisStep = 'upload' | 'analyzing' | 'results'

interface CarrierCondition {
  id: string
  name: string
  nameEs: string
  geneA: string
  geneB: string
  riskLevel: 'high' | 'moderate' | 'low'
  carrierFrequency: string
  description: string
  descriptionEs: string
  inheritancePattern: string
}

interface CompatibilityResult {
  complementaryVariants: number
  sharedProtectiveVariants: number
  carrierConditions: CarrierCondition[]
  overallScore: number
  positiveHighlights: {
    title: string
    titleEs: string
    description: string
    descriptionEs: string
    icon: 'heart' | 'shield' | 'sparkles'
  }[]
}

const DEMO_RESULT: CompatibilityResult = {
  complementaryVariants: 47,
  sharedProtectiveVariants: 12,
  overallScore: 92,
  carrierConditions: [
    {
      id: 'cf',
      name: 'Cystic Fibrosis',
      nameEs: 'Fibrosis Quistica',
      geneA: 'CFTR (carrier)',
      geneB: 'CFTR (non-carrier)',
      riskLevel: 'low',
      carrierFrequency: '1 in 25',
      description: 'Person A carries one copy of CFTR variant. Person B does not carry it. Risk to offspring is very low.',
      descriptionEs: 'Persona A porta una copia de variante CFTR. Persona B no la porta. El riesgo para descendencia es muy bajo.',
      inheritancePattern: 'Autosomal Recessive',
    },
    {
      id: 'sca',
      name: 'Sickle Cell Anemia',
      nameEs: 'Anemia Falciforme',
      geneA: 'HBB (non-carrier)',
      geneB: 'HBB (carrier)',
      riskLevel: 'low',
      carrierFrequency: '1 in 12',
      description: 'Person B carries sickle cell trait. Person A does not carry it. Risk to offspring is very low.',
      descriptionEs: 'Persona B porta rasgo falciforme. Persona A no lo porta. El riesgo para descendencia es muy bajo.',
      inheritancePattern: 'Autosomal Recessive',
    },
  ],
  positiveHighlights: [
    {
      title: 'Immune Diversity',
      titleEs: 'Diversidad Inmunologica',
      description: 'Your HLA genes are highly complementary, which means potential offspring could have a robust and diverse immune system.',
      descriptionEs: 'Sus genes HLA son altamente complementarios, lo que significa que la descendencia potencial podria tener un sistema inmune robusto y diverso.',
      icon: 'shield',
    },
    {
      title: 'Metabolic Strengths',
      titleEs: 'Fortalezas Metabolicas',
      description: 'Combined metabolic gene profiles suggest excellent nutrient processing capabilities for potential offspring.',
      descriptionEs: 'Los perfiles de genes metabolicos combinados sugieren excelentes capacidades de procesamiento de nutrientes para la descendencia potencial.',
      icon: 'sparkles',
    },
    {
      title: 'Cardiovascular Protection',
      titleEs: 'Proteccion Cardiovascular',
      description: 'Both carry protective variants in APOE and PCSK9, associated with lower cardiovascular risk.',
      descriptionEs: 'Ambos portan variantes protectoras en APOE y PCSK9, asociadas con menor riesgo cardiovascular.',
      icon: 'heart',
    },
  ],
}

export function CoupleCompatibility() {
  const t = useTranslations()
  const [step, setStep] = useState<AnalysisStep>('upload')
  const [personACode, setPersonACode] = useState('')
  const [personBCode, setPersonBCode] = useState('')
  const [showAnonymousInfo, setShowAnonymousInfo] = useState(false)
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null)

  const handleAnalyze = () => {
    setStep('analyzing')
    setTimeout(() => {
      setResult(DEMO_RESULT)
      setStep('results')
      toast.success('Analisis completado!')
    }, 3000)
  }

  const handleDemo = () => {
    setPersonACode('ANON-A7X9K2')
    setPersonBCode('ANON-B3M5P8')
    handleAnalyze()
  }

  const handleDeleteData = () => {
    setStep('upload')
    setPersonACode('')
    setPersonBCode('')
    setResult(null)
    toast.success('Todos los datos han sido eliminados')
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'red'
      case 'moderate': return 'amber'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'moderate': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />
      default: return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  if (step === 'analyzing') {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Heart className="w-10 h-10 text-pink-500" />
          </div>
          <Title className="text-title">Analizando compatibilidad genetica...</Title>
          <Text className="text-body mt-2">Comparando variantes de forma anonima y segura</Text>
          <div className="max-w-xs mx-auto mt-6">
            <ProgressBar value={65} color="pink" className="mt-2" />
          </div>
        </div>
      </Card>
    )
  }

  if (step === 'results' && result) {
    return (
      <div className="space-y-6">
        {/* Header with score */}
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200 dark:border-pink-800">
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-pink-500" />
            </div>
            <Title className="text-title text-2xl">Compatibilidad Genetica</Title>
            <div className="mt-4">
              <span className="text-5xl font-bold text-pink-600 dark:text-pink-400">{result.overallScore}%</span>
              <Text className="text-body mt-1">Indice de Complementariedad</Text>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center">
                <span className="text-2xl font-bold text-info">{result.complementaryVariants}</span>
                <Text className="text-xs text-muted">Variantes complementarias</Text>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{result.sharedProtectiveVariants}</span>
                <Text className="text-xs text-muted">Variantes protectoras compartidas</Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Positive highlights FIRST */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <Title className="text-title">Lo Positivo Primero</Title>
          </div>
          <div className="space-y-4">
            {result.positiveHighlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-soft rounded-xl">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  {highlight.icon === 'heart' && <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {highlight.icon === 'shield' && <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {highlight.icon === 'sparkles' && <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />}
                </div>
                <div>
                  <p className="font-semibold text-title">{highlight.titleEs}</p>
                  <p className="text-sm text-body mt-1">{highlight.descriptionEs}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Carrier conditions - traffic light */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Baby className="w-5 h-5 text-blue-500" />
            <Title className="text-title">Condiciones Portadoras</Title>
            <Badge color="blue" size="xs">{result.carrierConditions.length} detectadas</Badge>
          </div>
          <div className="space-y-3">
            {result.carrierConditions.map((condition) => (
              <div key={condition.id} className="border border-adaptive rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedCondition(expandedCondition === condition.id ? null : condition.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-surface-soft transition-colors text-left"
                >
                  {getRiskIcon(condition.riskLevel)}
                  <div className="flex-1">
                    <span className="font-medium text-title">{condition.nameEs}</span>
                    <Badge color={getRiskColor(condition.riskLevel)} size="xs" className="ml-2">
                      {condition.riskLevel === 'high' ? 'Alto' : condition.riskLevel === 'moderate' ? 'Moderado' : 'Bajo'}
                    </Badge>
                  </div>
                  {expandedCondition === condition.id ? (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted" />
                  )}
                </button>
                {expandedCondition === condition.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-adaptive">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
                      <div>
                        <span className="text-muted">Persona A:</span>
                        <span className="ml-1 text-body">{condition.geneA}</span>
                      </div>
                      <div>
                        <span className="text-muted">Persona B:</span>
                        <span className="ml-1 text-body">{condition.geneB}</span>
                      </div>
                      <div>
                        <span className="text-muted">Herencia:</span>
                        <span className="ml-1 text-body">{condition.inheritancePattern}</span>
                      </div>
                      <div>
                        <span className="text-muted">Frecuencia portadora:</span>
                        <span className="ml-1 text-body">{condition.carrierFrequency}</span>
                      </div>
                    </div>
                    <p className="text-sm text-body mt-3">{condition.descriptionEs}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Genetic counselor link */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-semibold text-title">Consulta con un Consejero Genetico</p>
              <p className="text-sm text-body mt-1">
                Para una interpretacion profesional de estos resultados, te recomendamos consultar con un consejero genetico certificado.
              </p>
              <Button size="xs" variant="light" className="mt-2">
                Buscar consejero cerca de mi
              </Button>
            </div>
          </div>
        </Card>

        {/* Delete data button */}
        <div className="flex justify-center">
          <Button
            variant="light"
            color="red"
            icon={Trash2}
            onClick={handleDeleteData}
          >
            Borrar todos mis datos
          </Button>
        </div>
      </div>
    )
  }

  // Upload step
  return (
    <div className="space-y-6">
      <Card>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <Title className="text-title">Compatibilidad de Pareja - Amor Informado</Title>
          <Text className="text-body mt-2 max-w-lg mx-auto">
            Compara perfiles geneticos de forma anonima para explorar la complementariedad genetica.
            Enfocado en lo positivo, con informacion responsable sobre condiciones portadoras.
          </Text>
        </div>

        {/* Anonymous mode info */}
        <div className="bg-surface-soft rounded-xl p-4 mb-6">
          <button
            onClick={() => setShowAnonymousInfo(!showAnonymousInfo)}
            className="flex items-center gap-2 w-full text-left"
          >
            <Lock className="w-5 h-5 text-green-500" />
            <span className="font-medium text-title flex-1">Modo Anonimo Activado</span>
            {showAnonymousInfo ? <EyeOff className="w-4 h-4 text-muted" /> : <Eye className="w-4 h-4 text-muted" />}
          </button>
          {showAnonymousInfo && (
            <div className="mt-3 text-sm text-body space-y-2">
              <p>Cada persona recibe un codigo anonimo. Los datos geneticos nunca se vinculan a nombres reales.</p>
              <p>Los resultados se procesan en tu navegador y puedes borrarlos en cualquier momento.</p>
              <p>No almacenamos datos en ningun servidor.</p>
            </div>
          )}
        </div>

        {/* Upload zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Person A */}
          <div className="border-2 border-dashed border-pink-300 dark:border-pink-700 rounded-xl p-6 text-center hover:border-pink-500 transition-colors">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-pink-500" />
            </div>
            <p className="font-medium text-title">Persona A</p>
            <p className="text-sm text-muted mt-1">Sube archivo genetico</p>
            {personACode && (
              <Badge color="pink" className="mt-2">{personACode}</Badge>
            )}
          </div>

          {/* Person B */}
          <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="font-medium text-title">Persona B</p>
            <p className="text-sm text-muted mt-1">Sube archivo genetico</p>
            {personBCode && (
              <Badge color="indigo" className="mt-2">{personBCode}</Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 mt-6">
          <Button
            icon={Heart}
            color="pink"
            disabled={!personACode || !personBCode}
            onClick={handleAnalyze}
          >
            Analizar Compatibilidad
          </Button>
          <Button
            variant="light"
            size="xs"
            icon={Sparkles}
            onClick={handleDemo}
          >
            Probar con datos demo
          </Button>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-surface-soft">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-body">
              <strong>Aviso importante:</strong> Este analisis es educativo e informativo. No constituye consejo medico.
              La compatibilidad genetica es solo una parte de la historia; factores ambientales, emocionales y sociales
              son igualmente importantes en una relacion.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
