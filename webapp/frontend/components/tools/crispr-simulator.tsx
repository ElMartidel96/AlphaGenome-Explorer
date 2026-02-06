'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Title, Text, Button, Badge, Select, SelectItem } from '@tremor/react'
import {
  Scissors,
  Play,
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Dna,
  Zap,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

// Types
interface Gene {
  id: string
  name: string
  symbol: string
  chromosome: string
  description: string
  descriptionEs: string
  sequence: string // Sample sequence for visualization
  diseaseAssociation?: string
  diseaseAssociationEs?: string
}

interface EditResult {
  type: 'knockout' | 'correction' | 'insertion'
  proteinEffect: string
  proteinEffectEs: string
  cellularEffect: string
  cellularEffectEs: string
  organismEffect: string
  organismEffectEs: string
  offTargetRisk: 'low' | 'medium' | 'high'
  ethicalConsiderations: string[]
  ethicalConsiderationsEs: string[]
}

type SimulatorState = 'select' | 'design' | 'targeting' | 'cutting' | 'repairing' | 'result'

// Famous genes for CRISPR editing simulation
const GENES: Gene[] = [
  {
    id: 'brca1',
    name: 'BRCA1 DNA Repair Associated',
    symbol: 'BRCA1',
    chromosome: '17',
    description: 'Tumor suppressor gene. Mutations increase breast/ovarian cancer risk.',
    descriptionEs: 'Gen supresor de tumores. Mutaciones aumentan riesgo de cancer de mama/ovario.',
    sequence: 'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGATATAACCAAAAGGAGCCTACAAGAAAGTACGAGATTTAGTCAACTTGTTGAAGAGCTATTGAAAATCATTTGTGCTTTTCAGCTTGACACAGGTTTGGAGTATGCAAACAGCTATAATTTTGCAAAAAAGGAAAATAACTCTCCTGAACATCTAAAAGATGAAGTTTCTATCATCCAAAGTATGGGCTACAGAAACCGTGCCAAAAGACTTCTACAGAGTGAACCCGAAAATCCTTCCTTG',
    diseaseAssociation: 'Hereditary breast and ovarian cancer syndrome',
    diseaseAssociationEs: 'Sindrome de cancer hereditario de mama y ovario',
  },
  {
    id: 'cftr',
    name: 'Cystic Fibrosis Transmembrane Conductance Regulator',
    symbol: 'CFTR',
    chromosome: '7',
    description: 'Chloride channel gene. Mutations cause cystic fibrosis.',
    descriptionEs: 'Gen de canal de cloruro. Mutaciones causan fibrosis quistica.',
    sequence: 'ATGCAGAGGTCGCCTCTGGAAAAGGCCAGCGTTGTCTCCAAACTTTTTTTCAGCTGGACCAGACCAATTTTGAGGAAAGGATACAGACAGCGCCTGGAATTGTCAGACATATACCAAATCCCTTCTGTTGATTCTGCTGACAATCTATCTGAAAAATTGGAAAGAGAATGGGATAGAGAGCTGGCTTCAAAGAAAAATCCTAAACTCATTAATGCCCTTCGGCGATGTTTTTTCTGGAGATTTATGTTCTATGGAATCTTTTTATATTAGGACAGTGCTAAAATGCAACTGGACAAGAAAGCACTGAATAGAAATTTGACAGA',
    diseaseAssociation: 'Cystic fibrosis (deltaF508 mutation most common)',
    diseaseAssociationEs: 'Fibrosis quistica (mutacion deltaF508 mas comun)',
  },
  {
    id: 'hbb',
    name: 'Hemoglobin Subunit Beta',
    symbol: 'HBB',
    chromosome: '11',
    description: 'Beta-globin gene. Mutations cause sickle cell disease and beta-thalassemia.',
    descriptionEs: 'Gen de beta-globina. Mutaciones causan anemia falciforme y beta-talasemia.',
    sequence: 'ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCTGGACAACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACGTGGATCCTGAGAACTTCAGGCTCCTGGGCAACGTGCTGGTCTGTGTGCTGGCCCATCACTTTGGCAAAGAATTCACCCCACCAGTGCAGGCTGCCTATCAGAAAGTGGTGGCTGGTGTGGCTAATGCCCTGGCCCACAAGTATCACTAA',
    diseaseAssociation: 'Sickle cell disease, Beta-thalassemia',
    diseaseAssociationEs: 'Anemia falciforme, Beta-talasemia',
  },
  {
    id: 'dmd',
    name: 'Dystrophin',
    symbol: 'DMD',
    chromosome: 'X',
    description: 'Largest human gene. Mutations cause Duchenne muscular dystrophy.',
    descriptionEs: 'Gen humano mas grande. Mutaciones causan distrofia muscular de Duchenne.',
    sequence: 'ATGCTTTGGTGGGAAGAAGTAGAGGACTGTTATGAAAGAGAAGATGTTCAAAAGAAAACATTCACAAAATGGGTAAATGCACAATTTTCTAAGTTTGGGAAGCAGCATATTGAGAACCTCTTCAGTGACCTACAGGATGGGAGGCGCCTCCTAGACCTCCTCGAAGGCCTGACAGGGCAAAAACTGCCAAAAGAAAAAGGATCCACAAGAGTTCATGATGCCTCTATTGTTTTATTAATTACAGATACTTCTTTTATGATGCCAAGAAAGCATATTCTGATAAATTCACTTATTGTGTCTCTCCATATTCCTGTGATGTTCTTAAGTTTTTACCTGCTGATTTGGAAATCATTGCTAAGGAACCTGATGTTCAGCTTTATTATCAAAAAGAAGATG',
    diseaseAssociation: 'Duchenne muscular dystrophy',
    diseaseAssociationEs: 'Distrofia muscular de Duchenne',
  },
  {
    id: 'pah',
    name: 'Phenylalanine Hydroxylase',
    symbol: 'PAH',
    chromosome: '12',
    description: 'Converts phenylalanine to tyrosine. Mutations cause phenylketonuria (PKU).',
    descriptionEs: 'Convierte fenilalanina a tirosina. Mutaciones causan fenilcetonuria (PKU).',
    sequence: 'ATGTCCACTGCGGTCCTGGAAAACCCAGGCTTGGGCAGGAAACTCTCTGACTTTGGACAGGAAACAAGCTATATTGAAGACAACTGCAATCAAAATGGTGCCATATCACTGATCTTCTCACTCAAAGAAGAAGTTGGTGCATTGGCCAAAGTATTGCGCTTATTTGAGGAGAATGATGTAAACCTGACCCACATTGAATCTAGACCTTCTCGTTTAAAGAAAGATGAGTATGAATTTTTCACCCATTTGGATAAACGTAGCCTGCCTGCTCTGACAAACATCATCAAGATCTTGAGGCATGACATTGGTGCCACTGTCCATGAGCTTTCACGAGATAAGAAGAAAGACACAGTGCCCTGGTTCCCAAGAACCATTCAAGAGCTGGACAGATTTGCCAATCAGATTCTCAGCTATGGAGCGGAACTGGATGCTGACCACCCTGGTTTTAAAGATCCTGTGTACCGTGCAAGACGGAAGCAGTTTGCTGACATTGCCTACAACTACCGCCATGGGCAGCCCATCCCTCGAGTGGAATACATGGAGGAAGAAAAGAAAACATGGGGCACAGTGTTCAAGACTCTGAAGTCCTTGTATAAAACCCATGCTTGCTATGAGTACAATCACATTTTTCCACTTCTTGAAAAGTACTGTGGCTTCCATGAAGATAACATTCCCCAGCTGGAAGACGTTTCTCAGTTCCTGCAGACTTGCACTGGTTTCCGCCTCCGACCTGTGGCTGGCCTGCTTTCCTCTCGGGATTTCTTGGGTGGCCTGGCCTTCCGAGTCTTCCACTGCACACAGTACATCAGACATGGATCCAAGCCCATGTATACCCCCGAACCTGACATCTGCCATGAGCTGTTGGGACATGTGCCCTTGTTTTCAGATCGCAGCTTTGCCCAGTTTTCCCAGGAAATTGGCCTTGCCTCTCTGGGTGCACCTGATGAATACATTGAAAAGCTCGCCACAATTTACTGGTTTACTGTGGAGTTTGGGCTCTGCAAACAAGGAGACTCCATAAAGGCATATGGTGCTGGGCTCCTGTCATCCTTTGGTGAATTACAGTACTGCTTATCAGAGAAGCCAAAGCTTCTCCCCCTGGAGCTGGAGAAGACAGCCATCCAAAATTACACTGTCACGGAGTTCCAGCCCCTGTATTACGTGGCAGAGAGTTTTAATGATGCCAAGGAGAAAGTAAGGAACTTTGCTGCCACAATACCTCGGCCCTTCTCAGTTCGCTACGACCCATACACCCAAAGGATTGAGGTCTTGGACAATACCCAGCAGCTTAAGATTTTGGCTGATTCCATTAACAGTGAAATTGGAATCCTTTGCAGTGCCCTCCAGAAAAATAAACTTATTAAAGAGAGCATCTCTTAG',
    diseaseAssociation: 'Phenylketonuria (PKU)',
    diseaseAssociationEs: 'Fenilcetonuria (PKU)',
  },
]

// Base colors for DNA visualization
const BASE_COLORS: Record<string, string> = {
  A: 'bg-green-500 text-white',
  T: 'bg-red-500 text-white',
  G: 'bg-yellow-500 text-black',
  C: 'bg-blue-500 text-white',
}

const COMPLEMENTARY: Record<string, string> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
}

// PAM sequences for CRISPR-Cas9
const PAM_SEQUENCE = 'NGG'

export function CrisprSimulator() {
  const t = useTranslations()
  const [state, setState] = useState<SimulatorState>('select')
  const [selectedGene, setSelectedGene] = useState<Gene | null>(null)
  const [targetPosition, setTargetPosition] = useState<number>(50)
  const [guideRNA, setGuideRNA] = useState<string>('')
  const [editType, setEditType] = useState<'knockout' | 'correction'>('knockout')
  const [showEducation, setShowEducation] = useState(true)
  const [animationStep, setAnimationStep] = useState(0)
  const [result, setResult] = useState<EditResult | null>(null)

  // Generate guide RNA from target position
  useEffect(() => {
    if (selectedGene && targetPosition >= 0) {
      const seq = selectedGene.sequence.slice(targetPosition, targetPosition + 20)
      setGuideRNA(seq)
    }
  }, [selectedGene, targetPosition])

  // Animation sequence
  useEffect(() => {
    if (state === 'cutting') {
      const timer = setInterval(() => {
        setAnimationStep((prev) => {
          if (prev >= 5) {
            clearInterval(timer)
            setState('repairing')
            return prev
          }
          return prev + 1
        })
      }, 600)
      return () => clearInterval(timer)
    }

    if (state === 'repairing') {
      const timer = setTimeout(() => {
        generateResult()
        setState('result')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state])

  const generateResult = () => {
    if (!selectedGene) return

    const results: Record<string, EditResult> = {
      brca1: {
        type: editType,
        proteinEffect: editType === 'knockout'
          ? 'BRCA1 protein production eliminated. DNA repair pathway compromised.'
          : 'BRCA1 mutation corrected. Normal protein function restored.',
        proteinEffectEs: editType === 'knockout'
          ? 'Produccion de proteina BRCA1 eliminada. Via de reparacion de ADN comprometida.'
          : 'Mutacion de BRCA1 corregida. Funcion normal de proteina restaurada.',
        cellularEffect: editType === 'knockout'
          ? 'Cells unable to repair double-strand DNA breaks via homologous recombination.'
          : 'Cells regain ability to repair DNA damage properly.',
        cellularEffectEs: editType === 'knockout'
          ? 'Celulas incapaces de reparar roturas de doble cadena via recombinacion homologa.'
          : 'Celulas recuperan capacidad de reparar dano de ADN correctamente.',
        organismEffect: editType === 'knockout'
          ? 'Increased cancer susceptibility. Used in research to study cancer mechanisms.'
          : 'Reduced hereditary cancer risk. Potential therapeutic application.',
        organismEffectEs: editType === 'knockout'
          ? 'Mayor susceptibilidad al cancer. Usado en investigacion para estudiar mecanismos del cancer.'
          : 'Riesgo reducido de cancer hereditario. Aplicacion terapeutica potencial.',
        offTargetRisk: 'medium',
        ethicalConsiderations: [
          'Germline editing would affect future generations',
          'Somatic editing only affects the individual',
          'Clinical trials ongoing for cancer treatment',
        ],
        ethicalConsiderationsEs: [
          'Edicion germinal afectaria generaciones futuras',
          'Edicion somatica solo afecta al individuo',
          'Ensayos clinicos en curso para tratamiento de cancer',
        ],
      },
      cftr: {
        type: editType,
        proteinEffect: editType === 'knockout'
          ? 'CFTR chloride channel non-functional. Ion transport disrupted.'
          : 'deltaF508 mutation corrected. Chloride channel function restored.',
        proteinEffectEs: editType === 'knockout'
          ? 'Canal de cloruro CFTR no funcional. Transporte ionico interrumpido.'
          : 'Mutacion deltaF508 corregida. Funcion de canal de cloruro restaurada.',
        cellularEffect: editType === 'knockout'
          ? 'Epithelial cells cannot regulate chloride/water balance. Thick mucus production.'
          : 'Normal chloride transport restored in epithelial cells.',
        cellularEffectEs: editType === 'knockout'
          ? 'Celulas epiteliales no pueden regular balance de cloruro/agua. Produccion de moco espeso.'
          : 'Transporte normal de cloruro restaurado en celulas epiteliales.',
        organismEffect: editType === 'knockout'
          ? 'Cystic fibrosis phenotype: lung disease, pancreatic insufficiency.'
          : 'Potential cure for cystic fibrosis. FDA-approved trials underway.',
        organismEffectEs: editType === 'knockout'
          ? 'Fenotipo de fibrosis quistica: enfermedad pulmonar, insuficiencia pancreatica.'
          : 'Cura potencial para fibrosis quistica. Ensayos aprobados por FDA en curso.',
        offTargetRisk: 'low',
        ethicalConsiderations: [
          'Strong candidate for gene therapy',
          'Ex vivo editing of patient cells being tested',
          'Could eliminate disease from family line',
        ],
        ethicalConsiderationsEs: [
          'Fuerte candidato para terapia genica',
          'Edicion ex vivo de celulas de pacientes en prueba',
          'Podria eliminar enfermedad de linea familiar',
        ],
      },
      hbb: {
        type: editType,
        proteinEffect: editType === 'knockout'
          ? 'Beta-globin not produced. Hemoglobin assembly impaired.'
          : 'Sickle mutation (E6V) corrected. Normal hemoglobin produced.',
        proteinEffectEs: editType === 'knockout'
          ? 'Beta-globina no producida. Ensamblaje de hemoglobina afectado.'
          : 'Mutacion falciforme (E6V) corregida. Hemoglobina normal producida.',
        cellularEffect: editType === 'knockout'
          ? 'Red blood cells cannot carry oxygen efficiently.'
          : 'Red blood cells maintain normal shape and oxygen transport.',
        cellularEffectEs: editType === 'knockout'
          ? 'Globulos rojos no pueden transportar oxigeno eficientemente.'
          : 'Globulos rojos mantienen forma normal y transporte de oxigeno.',
        organismEffect: editType === 'knockout'
          ? 'Severe anemia, organ damage, shortened lifespan.'
          : 'CASGEVY approved 2023 - first CRISPR therapy for sickle cell!',
        organismEffectEs: editType === 'knockout'
          ? 'Anemia severa, dano de organos, esperanza de vida reducida.'
          : 'CASGEVY aprobado 2023 - primera terapia CRISPR para anemia falciforme!',
        offTargetRisk: 'low',
        ethicalConsiderations: [
          'First FDA-approved CRISPR therapy (2023)',
          'Ex vivo editing of patient stem cells',
          'High cost limits accessibility ($2M+ per treatment)',
        ],
        ethicalConsiderationsEs: [
          'Primera terapia CRISPR aprobada por FDA (2023)',
          'Edicion ex vivo de celulas madre del paciente',
          'Alto costo limita accesibilidad ($2M+ por tratamiento)',
        ],
      },
      dmd: {
        type: editType,
        proteinEffect: editType === 'knockout'
          ? 'Dystrophin completely absent. Muscle fiber integrity lost.'
          : 'Exon skipping restores reading frame. Shortened but functional dystrophin.',
        proteinEffectEs: editType === 'knockout'
          ? 'Distrofina completamente ausente. Integridad de fibra muscular perdida.'
          : 'Salto de exon restaura marco de lectura. Distrofina acortada pero funcional.',
        cellularEffect: editType === 'knockout'
          ? 'Muscle cells degenerate without structural support.'
          : 'Muscle cells stabilized with functional dystrophin.',
        cellularEffectEs: editType === 'knockout'
          ? 'Celulas musculares degeneran sin soporte estructural.'
          : 'Celulas musculares estabilizadas con distrofina funcional.',
        organismEffect: editType === 'knockout'
          ? 'Progressive muscle weakness, respiratory failure, early death.'
          : 'Slowed disease progression. Multiple clinical trials ongoing.',
        organismEffectEs: editType === 'knockout'
          ? 'Debilidad muscular progresiva, falla respiratoria, muerte temprana.'
          : 'Progresion de enfermedad ralentizada. Multiples ensayos clinicos en curso.',
        offTargetRisk: 'medium',
        ethicalConsiderations: [
          'Exon skipping is a unique CRISPR application',
          'Treatment must reach all muscle tissues',
          'Timing critical - earlier treatment better',
        ],
        ethicalConsiderationsEs: [
          'Salto de exon es aplicacion unica de CRISPR',
          'Tratamiento debe llegar a todos los tejidos musculares',
          'Tiempo critico - tratamiento temprano mejor',
        ],
      },
      pah: {
        type: editType,
        proteinEffect: editType === 'knockout'
          ? 'PAH enzyme non-functional. Phenylalanine cannot be metabolized.'
          : 'PAH activity restored. Normal phenylalanine metabolism.',
        proteinEffectEs: editType === 'knockout'
          ? 'Enzima PAH no funcional. Fenilalanina no puede metabolizarse.'
          : 'Actividad de PAH restaurada. Metabolismo normal de fenilalanina.',
        cellularEffect: editType === 'knockout'
          ? 'Toxic phenylalanine accumulation in cells.'
          : 'Cells can convert phenylalanine to tyrosine normally.',
        cellularEffectEs: editType === 'knockout'
          ? 'Acumulacion toxica de fenilalanina en celulas.'
          : 'Celulas pueden convertir fenilalanina a tirosina normalmente.',
        organismEffect: editType === 'knockout'
          ? 'Intellectual disability without strict diet. Lifelong dietary restriction required.'
          : 'Potential cure for PKU. No more dietary restrictions needed.',
        organismEffectEs: editType === 'knockout'
          ? 'Discapacidad intelectual sin dieta estricta. Restriccion dietetica de por vida requerida.'
          : 'Cura potencial para PKU. Sin mas restricciones dieteticas necesarias.',
        offTargetRisk: 'low',
        ethicalConsiderations: [
          'Liver-targeted delivery being developed',
          'Could replace lifelong dietary management',
          'Quality of life improvement significant',
        ],
        ethicalConsiderationsEs: [
          'Entrega dirigida al higado en desarrollo',
          'Podria reemplazar manejo dietetico de por vida',
          'Mejora de calidad de vida significativa',
        ],
      },
    }

    setResult(results[selectedGene.id] || results.brca1)
  }

  const handleSelectGene = (geneId: string) => {
    const gene = GENES.find((g) => g.id === geneId)
    if (gene) {
      setSelectedGene(gene)
      setState('design')
      setTargetPosition(Math.floor(gene.sequence.length / 4))
    }
  }

  const handleStartEdit = () => {
    setState('targeting')
    setTimeout(() => setState('cutting'), 1500)
    setAnimationStep(0)
  }

  const handleReset = () => {
    setState('select')
    setSelectedGene(null)
    setTargetPosition(50)
    setGuideRNA('')
    setResult(null)
    setAnimationStep(0)
  }

  // Render DNA sequence with highlighting
  const renderSequence = (sequence: string, start: number = 0, highlightStart?: number, highlightEnd?: number) => {
    const displaySeq = sequence.slice(start, start + 60)

    return (
      <div className="font-mono text-xs flex flex-wrap gap-0.5">
        {displaySeq.split('').map((base, idx) => {
          const absoluteIdx = start + idx
          const isHighlighted = highlightStart !== undefined &&
            highlightEnd !== undefined &&
            absoluteIdx >= highlightStart &&
            absoluteIdx < highlightEnd
          const isCutSite = state === 'cutting' &&
            absoluteIdx === targetPosition + 17 // Cas9 cuts 3bp from PAM

          return (
            <span
              key={idx}
              className={`
                w-5 h-5 flex items-center justify-center rounded-sm transition-all
                ${BASE_COLORS[base] || 'bg-gray-300'}
                ${isHighlighted ? 'ring-2 ring-purple-400 scale-110' : ''}
                ${isCutSite && animationStep >= 3 ? 'animate-pulse ring-2 ring-red-500' : ''}
              `}
            >
              {base}
            </span>
          )
        })}
      </div>
    )
  }

  // Gene Selection State
  if (state === 'select') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Scissors className="w-7 h-7 text-white" />
            </div>
            <div>
              <Title>CRISPR Gene Editing Simulator</Title>
              <Text>Learn how CRISPR-Cas9 gene editing works with interactive simulations</Text>
            </div>
          </div>
        </Card>

        {/* Educational Toggle */}
        <Card>
          <button
            onClick={() => setShowEducation(!showEducation)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 w-full"
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">What is CRISPR?</span>
            {showEducation ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          {showEducation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-3">
              <p className="text-sm text-gray-700">
                <strong>CRISPR-Cas9</strong> is a revolutionary gene-editing tool that works like molecular scissors.
                It uses a guide RNA to find a specific DNA sequence, then the Cas9 protein cuts the DNA at that location.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg">
                  <Target className="w-5 h-5 text-purple-500 mb-2" />
                  <p className="text-xs font-medium text-gray-800">1. Target</p>
                  <p className="text-xs text-gray-600">Guide RNA finds the DNA sequence</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <Scissors className="w-5 h-5 text-red-500 mb-2" />
                  <p className="text-xs font-medium text-gray-800">2. Cut</p>
                  <p className="text-xs text-gray-600">Cas9 protein cuts the DNA</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <Sparkles className="w-5 h-5 text-green-500 mb-2" />
                  <p className="text-xs font-medium text-gray-800">3. Repair</p>
                  <p className="text-xs text-gray-600">Cell repairs the break (with edits)</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Gene Selection */}
        <Card>
          <Title className="mb-4">Select a Gene to Edit</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GENES.map((gene) => (
              <div
                key={gene.id}
                onClick={() => handleSelectGene(gene.id)}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge color="purple">{gene.symbol}</Badge>
                  <Badge color="gray" size="xs">Chr {gene.chromosome}</Badge>
                </div>
                <p className="font-medium text-gray-800 text-sm">{gene.name}</p>
                <p className="text-xs text-gray-500 mt-1">{gene.description}</p>
                {gene.diseaseAssociation && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="w-3 h-3" />
                    {gene.diseaseAssociation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Educational Simulation Only</p>
              <p className="text-xs text-amber-700 mt-1">
                This is a simplified educational simulation. Real CRISPR editing involves complex laboratory procedures,
                safety protocols, and regulatory oversight. No actual genetic editing is performed.
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Design State
  if (state === 'design' && selectedGene) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge color="purple" size="lg">{selectedGene.symbol}</Badge>
              <div>
                <p className="font-medium text-gray-800">{selectedGene.name}</p>
                <p className="text-xs text-gray-500">Chromosome {selectedGene.chromosome}</p>
              </div>
            </div>
            <Button variant="secondary" size="xs" icon={RotateCcw} onClick={handleReset}>
              Change Gene
            </Button>
          </div>
        </Card>

        {/* DNA Sequence Viewer */}
        <Card>
          <Title className="mb-2">DNA Sequence</Title>
          <Text className="mb-4">Select target region for CRISPR editing (20bp guide + PAM)</Text>

          {/* Sequence display */}
          <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
            <p className="text-xs text-gray-400 mb-2">5' →</p>
            {renderSequence(selectedGene.sequence, Math.max(0, targetPosition - 20), targetPosition, targetPosition + 23)}
            <p className="text-xs text-gray-400 mt-2">→ 3'</p>

            {/* Complementary strand */}
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-2">3' ←</p>
              <div className="font-mono text-xs flex flex-wrap gap-0.5">
                {selectedGene.sequence.slice(Math.max(0, targetPosition - 20), Math.max(0, targetPosition - 20) + 60).split('').map((base, idx) => (
                  <span
                    key={idx}
                    className={`w-5 h-5 flex items-center justify-center rounded-sm ${BASE_COLORS[COMPLEMENTARY[base]] || 'bg-gray-300'}`}
                  >
                    {COMPLEMENTARY[base]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Target position slider */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">Target Position: {targetPosition}</label>
            <input
              type="range"
              min={0}
              max={selectedGene.sequence.length - 23}
              value={targetPosition}
              onChange={(e) => setTargetPosition(parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </Card>

        {/* Guide RNA */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <Title>Guide RNA (sgRNA)</Title>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">20bp guide sequence:</p>
            <div className="font-mono text-lg tracking-wider text-purple-700 font-bold">
              {guideRNA}
            </div>
            <p className="text-xs text-gray-500 mt-2">+ PAM sequence: <span className="font-mono font-bold">NGG</span></p>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <Info className="w-3 h-3 inline mr-1" />
              The guide RNA directs Cas9 to cut 3 base pairs upstream of the PAM sequence (NGG).
            </p>
          </div>
        </Card>

        {/* Edit Type Selection */}
        <Card>
          <Title className="mb-4">Select Edit Type</Title>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setEditType('knockout')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                editType === 'knockout' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Scissors className="w-6 h-6 text-red-500 mb-2" />
              <p className="font-medium text-gray-800">Gene Knockout</p>
              <p className="text-xs text-gray-500 mt-1">Disrupt gene function via NHEJ repair</p>
            </div>
            <div
              onClick={() => setEditType('correction')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                editType === 'correction' ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sparkles className="w-6 h-6 text-green-500 mb-2" />
              <p className="font-medium text-gray-800">Gene Correction</p>
              <p className="text-xs text-gray-500 mt-1">Fix mutation via HDR repair template</p>
            </div>
          </div>
        </Card>

        {/* Start Button */}
        <Button size="lg" icon={Play} onClick={handleStartEdit} className="w-full">
          Start CRISPR Editing Simulation
        </Button>
      </div>
    )
  }

  // Targeting/Cutting/Repairing Animation States
  if ((state === 'targeting' || state === 'cutting' || state === 'repairing') && selectedGene) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            {/* Animation */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              {/* DNA helix background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Dna className={`w-24 h-24 text-blue-300 ${state === 'cutting' ? 'animate-pulse' : ''}`} />
              </div>

              {/* Cas9 scissors */}
              {state === 'targeting' && (
                <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                  <div className="bg-purple-500 text-white p-3 rounded-full shadow-lg">
                    <Target className="w-8 h-8" />
                  </div>
                </div>
              )}

              {state === 'cutting' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`bg-red-500 text-white p-3 rounded-full shadow-lg ${animationStep >= 3 ? 'animate-ping' : 'animate-pulse'}`}>
                    <Scissors className="w-8 h-8" />
                  </div>
                </div>
              )}

              {state === 'repairing' && (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>
              )}
            </div>

            {/* Status text */}
            <Title>
              {state === 'targeting' && 'Targeting DNA sequence...'}
              {state === 'cutting' && 'Cas9 cutting DNA...'}
              {state === 'repairing' && 'Cell repairing DNA break...'}
            </Title>

            {/* Progress steps */}
            <div className="flex justify-center gap-2 mt-6">
              {['Target', 'Bind', 'Unwind', 'Cut', 'Release', 'Repair'].map((step, idx) => (
                <div
                  key={step}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    (state === 'targeting' && idx === 0) ||
                    (state === 'cutting' && idx <= animationStep) ||
                    (state === 'repairing' && idx <= 5)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>

            {/* Sequence visualization during cutting */}
            {state === 'cutting' && (
              <div className="mt-6 p-4 bg-gray-900 rounded-lg inline-block">
                <div className="font-mono text-sm">
                  {selectedGene.sequence.slice(targetPosition, targetPosition + 20).split('').map((base, idx) => (
                    <span
                      key={idx}
                      className={`
                        inline-block w-6 h-6 text-center rounded transition-all
                        ${BASE_COLORS[base]}
                        ${idx === 17 && animationStep >= 4 ? 'mx-2 border-2 border-red-500' : ''}
                      `}
                    >
                      {base}
                    </span>
                  ))}
                </div>
                {animationStep >= 4 && (
                  <div className="text-red-400 text-xs mt-2 animate-pulse">
                    ✂️ Double-strand break created!
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // Result State
  if (state === 'result' && selectedGene && result) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <Card className={`bg-gradient-to-r ${editType === 'knockout' ? 'from-red-50 to-orange-50' : 'from-green-50 to-teal-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${editType === 'knockout' ? 'bg-red-500' : 'bg-green-500'} rounded-xl flex items-center justify-center shadow-lg`}>
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <Title>CRISPR Editing Complete!</Title>
              <Text>
                {editType === 'knockout' ? 'Gene Knockout' : 'Gene Correction'} simulation for {selectedGene.symbol}
              </Text>
            </div>
          </div>
        </Card>

        {/* Consequences */}
        <Card>
          <Title className="mb-4">Predicted Consequences</Title>

          <div className="space-y-4">
            {/* Protein Level */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <p className="font-medium text-blue-800">Protein Level</p>
              </div>
              <p className="text-sm text-gray-700">{result.proteinEffect}</p>
            </div>

            {/* Cellular Level */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                <p className="font-medium text-purple-800">Cellular Level</p>
              </div>
              <p className="text-sm text-gray-700">{result.cellularEffect}</p>
            </div>

            {/* Organism Level */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">O</span>
                </div>
                <p className="font-medium text-green-800">Organism Level</p>
              </div>
              <p className="text-sm text-gray-700">{result.organismEffect}</p>
            </div>
          </div>
        </Card>

        {/* Off-target Risk */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title>Off-Target Risk Assessment</Title>
            <Badge
              color={result.offTargetRisk === 'low' ? 'green' : result.offTargetRisk === 'medium' ? 'yellow' : 'red'}
            >
              {result.offTargetRisk.toUpperCase()} RISK
            </Badge>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                result.offTargetRisk === 'low' ? 'bg-green-500 w-1/4' :
                result.offTargetRisk === 'medium' ? 'bg-yellow-500 w-2/4' :
                'bg-red-500 w-3/4'
              }`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Off-target effects occur when CRISPR cuts unintended sites in the genome.
            Guide RNA design and delivery method affect this risk.
          </p>
        </Card>

        {/* Ethical Considerations */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <Title>Ethical Considerations</Title>
          </div>
          <ul className="space-y-2">
            {result.ethicalConsiderations.map((consideration, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                {consideration}
              </li>
            ))}
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="secondary" icon={RotateCcw} onClick={handleReset} className="flex-1">
            Try Another Gene
          </Button>
          <Button icon={Eye} onClick={() => setEditType(editType === 'knockout' ? 'correction' : 'knockout')} className="flex-1">
            Try {editType === 'knockout' ? 'Correction' : 'Knockout'} Instead
          </Button>
        </div>
      </div>
    )
  }

  return null
}
