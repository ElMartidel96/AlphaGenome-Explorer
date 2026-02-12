'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge } from '@tremor/react'
import {
  Syringe,
  Dna,
  Shield,
  Heart,
  Eye,
  Brain,
  ChevronRight,
  ChevronDown,
  Info,
  FlaskConical,
  Target,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  FileCheck,
  Microscope,
  Pill,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
// Types
interface GeneTherapy {
  id: string
  brandName: string
  genericName: string
  targetGene: string
  condition: string
  manufacturer: string
  approvalYear: number
  approvalBody: string
  mechanism: 'gene_replacement' | 'gene_editing' | 'gene_silencing'
  vector: string
  description: string
  patientExplanation: string
  alphaGenomePrediction: {
    expressionChange: number // percentage
    variantEffect: string
    confidence: number // 0-100
  }
  userRelevance: {
    carriesVariant: boolean
    variantId: string
    riskLevel: 'high' | 'moderate' | 'low' | 'none'
    explanation: string
  }
  color: string
  bgColor: string
  darkBgColor: string
  icon: typeof Eye
}

interface PipelineTherapy {
  id: string
  name: string
  targetGene: string
  condition: string
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Pre-clinical'
  sponsor: string
  approach: string
  expectedApproval: string
  description: string
}

interface TherapyStep {
  step: number
  title: string
  description: string
  icon: typeof FlaskConical
}

// Approved gene therapies catalog
const APPROVED_THERAPIES: GeneTherapy[] = [
  {
    id: 'luxturna',
    brandName: 'Luxturna',
    genericName: 'voretigene neparvovec-rzyl',
    targetGene: 'RPE65',
    condition: 'Inherited Retinal Dystrophy (Leber Congenital Amaurosis)',
    manufacturer: 'Spark Therapeutics',
    approvalYear: 2017,
    approvalBody: 'FDA',
    mechanism: 'gene_replacement',
    vector: 'AAV2 (adeno-associated virus)',
    description: 'Luxturna delivers a functional copy of the RPE65 gene directly into retinal cells via subretinal injection. RPE65 encodes retinal pigment epithelium-specific 65 kDa protein, essential for the visual cycle that converts light into electrical signals.',
    patientExplanation: 'Your retina needs RPE65 protein to convert light into vision. If this gene is broken, the protein is not made and vision progressively deteriorates. Luxturna delivers a working copy of the gene into the cells of your retina, allowing them to produce RPE65 and restore the visual cycle.',
    alphaGenomePrediction: {
      expressionChange: -94,
      variantEffect: 'Loss-of-function variant in RPE65 exon 7 predicted to abolish protein production',
      confidence: 97,
    },
    userRelevance: {
      carriesVariant: false,
      variantId: 'rs62636299',
      riskLevel: 'none',
      explanation: 'You do not carry pathogenic RPE65 variants. Your retinal pigment epithelium gene function is predicted to be normal.',
    },
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100',
    darkBgColor: 'dark:bg-blue-900/30',
    icon: Eye,
  },
  {
    id: 'zolgensma',
    brandName: 'Zolgensma',
    genericName: 'onasemnogene abeparvovec-xioi',
    targetGene: 'SMN1',
    condition: 'Spinal Muscular Atrophy (SMA Type 1)',
    manufacturer: 'Novartis Gene Therapies',
    approvalYear: 2019,
    approvalBody: 'FDA',
    mechanism: 'gene_replacement',
    vector: 'AAV9 (crosses blood-brain barrier)',
    description: 'Zolgensma delivers a functional SMN1 gene via IV infusion using AAV9 vector, which can cross the blood-brain barrier to reach motor neurons. SMN1 encodes survival motor neuron protein, critical for motor neuron health and muscle function.',
    patientExplanation: 'Motor neurons need SMN protein to survive and control muscles. In SMA, the SMN1 gene is deleted or broken, causing motor neurons to die. Zolgensma delivers a working SMN1 gene throughout the body via a single IV infusion, helping motor neurons survive and muscles grow stronger.',
    alphaGenomePrediction: {
      expressionChange: -100,
      variantEffect: 'Homozygous deletion of SMN1 exon 7 — complete loss of SMN protein production',
      confidence: 99,
    },
    userRelevance: {
      carriesVariant: true,
      variantId: 'rs1554286067',
      riskLevel: 'low',
      explanation: 'You are a heterozygous carrier of one SMN1 deletion (1 of 2 copies). This means you are a carrier but not affected. Your SMN protein levels are adequate. Relevant for family planning — if your partner also carries a deletion, each child would have a 25% risk of SMA.',
    },
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100',
    darkBgColor: 'dark:bg-emerald-900/30',
    icon: Activity,
  },
  {
    id: 'casgevy',
    brandName: 'Casgevy',
    genericName: 'exagamglogene autotemcel',
    targetGene: 'BCL11A enhancer',
    condition: 'Sickle Cell Disease / Transfusion-dependent Beta-thalassemia',
    manufacturer: 'Vertex Pharmaceuticals / CRISPR Therapeutics',
    approvalYear: 2023,
    approvalBody: 'FDA',
    mechanism: 'gene_editing',
    vector: 'Ex vivo CRISPR-Cas9 (patient stem cells)',
    description: 'Casgevy uses CRISPR-Cas9 to edit the BCL11A enhancer in patient hematopoietic stem cells. This reactivates fetal hemoglobin (HbF) production, which compensates for defective adult hemoglobin. It is the first CRISPR-based therapy approved by the FDA.',
    patientExplanation: 'Your body makes adult hemoglobin (HbA) that carries oxygen in blood. In sickle cell disease, HbA is malformed and causes cells to sickle. Casgevy edits your own stem cells to switch back to making fetal hemoglobin (HbF), which works perfectly and does not sickle. Your edited cells are then transplanted back into your body.',
    alphaGenomePrediction: {
      expressionChange: 85,
      variantEffect: 'BCL11A enhancer edit predicted to reactivate HbF expression by 85% in erythroid lineage',
      confidence: 94,
    },
    userRelevance: {
      carriesVariant: false,
      variantId: 'rs334 (HBB E6V)',
      riskLevel: 'none',
      explanation: 'You do not carry the sickle cell variant (HBB E6V). Your beta-globin gene produces normal adult hemoglobin.',
    },
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-900/30',
    icon: Heart,
  },
  {
    id: 'hemgenix',
    brandName: 'Hemgenix',
    genericName: 'etranacogene dezaparvovec-drlb',
    targetGene: 'Factor IX (F9)',
    condition: 'Hemophilia B (Factor IX deficiency)',
    manufacturer: 'CSL Behring',
    approvalYear: 2022,
    approvalBody: 'FDA',
    mechanism: 'gene_replacement',
    vector: 'AAV5 (liver-targeted)',
    description: 'Hemgenix delivers a functional Factor IX gene (Padua variant with enhanced activity) to liver cells using AAV5 vector. The liver then produces Factor IX protein, restoring the coagulation cascade and reducing or eliminating bleeding episodes.',
    patientExplanation: 'Your blood needs Factor IX protein to clot properly. In hemophilia B, the F9 gene is faulty and the protein is not made in sufficient quantities. Hemgenix delivers an enhanced version of this gene to your liver cells, which then produce Factor IX on their own — potentially eliminating the need for regular infusions.',
    alphaGenomePrediction: {
      expressionChange: -78,
      variantEffect: 'Missense variant in F9 catalytic domain predicted to reduce clotting factor activity to <2%',
      confidence: 92,
    },
    userRelevance: {
      carriesVariant: false,
      variantId: 'rs137852833',
      riskLevel: 'none',
      explanation: 'You do not carry pathogenic F9 variants. Your Factor IX production and coagulation cascade are predicted to function normally.',
    },
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100',
    darkBgColor: 'dark:bg-purple-900/30',
    icon: Shield,
  },
  {
    id: 'elevidys',
    brandName: 'Elevidys',
    genericName: 'delandistrogene moxeparvovec-rokl',
    targetGene: 'Dystrophin (DMD)',
    condition: 'Duchenne Muscular Dystrophy',
    manufacturer: 'Sarepta Therapeutics',
    approvalYear: 2023,
    approvalBody: 'FDA',
    mechanism: 'gene_replacement',
    vector: 'AAVrh74 (muscle-targeted)',
    description: 'Elevidys delivers a micro-dystrophin gene — a shortened but functional version of the enormous DMD gene (largest human gene at 2.4 Mb). The AAVrh74 vector targets skeletal and cardiac muscle, producing micro-dystrophin that stabilizes muscle cell membranes.',
    patientExplanation: 'Muscles need dystrophin protein to stay strong and protected during movement. In Duchenne, the dystrophin gene is broken and muscles gradually weaken. The full gene is too large to fit in a delivery vehicle, so Elevidys delivers a miniaturized working version (micro-dystrophin) that still protects your muscles from damage.',
    alphaGenomePrediction: {
      expressionChange: -100,
      variantEffect: 'Frameshift deletion in DMD exons 45-52 predicted to completely abolish dystrophin production',
      confidence: 98,
    },
    userRelevance: {
      carriesVariant: false,
      variantId: 'DMD exon deletion',
      riskLevel: 'none',
      explanation: 'You do not carry pathogenic DMD variants. Your dystrophin gene is predicted to produce full-length protein normally.',
    },
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100',
    darkBgColor: 'dark:bg-amber-900/30',
    icon: Dna,
  },
]

// Gene therapy pipeline
const PIPELINE_THERAPIES: PipelineTherapy[] = [
  {
    id: 'beta-thal-crispr',
    name: 'CTX001 for Beta-thalassemia',
    targetGene: 'BCL11A / HBB locus',
    condition: 'Beta-thalassemia major',
    phase: 'Phase III',
    sponsor: 'CRISPR Therapeutics / Vertex',
    approach: 'CRISPR-Cas9 editing of BCL11A enhancer in autologous HSCs',
    expectedApproval: '2024-2025 (following Casgevy precedent)',
    description: 'Same CRISPR approach as Casgevy, specifically for transfusion-dependent beta-thalassemia. Reactivates fetal hemoglobin to compensate for defective beta-globin chains.',
  },
  {
    id: 'car-t-solid',
    name: 'CRISPR-enhanced CAR-T',
    targetGene: 'PD-1 / TRAC / B2M knockout',
    condition: 'Solid tumors (various cancers)',
    phase: 'Phase I',
    sponsor: 'Multiple (Intellia, Caribou, CRISPR Tx)',
    approach: 'Multiplex CRISPR editing of T-cells: knockout PD-1 checkpoint, insert tumor-specific CAR, remove alloreactivity markers',
    expectedApproval: '2027-2029 (early stage)',
    description: 'Next-generation CAR-T therapy using CRISPR to simultaneously edit multiple genes in T-cells, creating allogeneic (off-the-shelf) cancer-fighting cells that resist immune exhaustion.',
  },
  {
    id: 'base-edit-scd',
    name: 'BEAM-101 for Sickle Cell',
    targetGene: 'HBG1/HBG2 promoter',
    condition: 'Sickle cell disease',
    phase: 'Phase I',
    sponsor: 'Beam Therapeutics',
    approach: 'Base editing (no DNA double-strand breaks) to create HPFH-like mutations that reactivate fetal hemoglobin',
    expectedApproval: '2026-2028',
    description: 'Uses precision base editing instead of CRISPR cutting to make single-letter DNA changes that naturally reactivate fetal hemoglobin, potentially safer than traditional CRISPR approaches.',
  },
  {
    id: 'aav-htt',
    name: 'AMT-130 for Huntington\'s',
    targetGene: 'HTT (huntingtin)',
    condition: 'Huntington\'s disease',
    phase: 'Phase II',
    sponsor: 'uniQure',
    approach: 'AAV5-delivered microRNA to silence mutant huntingtin in the striatum via stereotactic injection',
    expectedApproval: '2027-2029',
    description: 'Delivers gene-silencing microRNA directly to brain regions affected by Huntington\'s, reducing production of the toxic mutant huntingtin protein that causes neurodegeneration.',
  },
]

// How gene therapy works - step by step
const THERAPY_STEPS: TherapyStep[] = [
  {
    step: 1,
    title: 'Identify the Faulty Gene',
    description: 'Genetic testing and AlphaGenome analysis identify the specific gene mutation causing disease. The variant\'s effect on protein production is quantified.',
    icon: Microscope,
  },
  {
    step: 2,
    title: 'Design the Therapeutic Gene',
    description: 'Scientists engineer a functional copy of the gene (or a CRISPR guide to edit it). The therapeutic gene is packaged into a delivery vehicle, usually an adeno-associated virus (AAV).',
    icon: FlaskConical,
  },
  {
    step: 3,
    title: 'Deliver to Target Cells',
    description: 'The therapy is administered — via IV infusion, direct injection into tissue, or ex vivo (editing patient cells outside the body and returning them). The vector delivers the gene to the right cells.',
    icon: Syringe,
  },
  {
    step: 4,
    title: 'Gene Expression Begins',
    description: 'Target cells begin reading the new gene and producing the missing or corrected protein. AlphaGenome can predict how effectively the therapeutic gene will be expressed in different tissues.',
    icon: Dna,
  },
  {
    step: 5,
    title: 'Monitor and Follow Up',
    description: 'Patients are monitored for therapeutic response and any immune reactions. Many gene therapies aim to be one-time treatments, though durability varies by approach and disease.',
    icon: FileCheck,
  },
]

export function GeneTherapyCompanion() {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTherapy, setExpandedTherapy] = useState<string | null>(null)
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>(null)
  const [showSteps, setShowSteps] = useState(false)
  const [activeTab, setActiveTab] = useState<'approved' | 'pipeline' | 'howItWorks'>('approved')

  // Loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const getMechanismBadge = (mechanism: string) => {
    switch (mechanism) {
      case 'gene_replacement': return { label: 'Gene Replacement', color: 'blue' as const }
      case 'gene_editing': return { label: 'CRISPR Editing', color: 'purple' as const }
      case 'gene_silencing': return { label: 'Gene Silencing', color: 'amber' as const }
      default: return { label: mechanism, color: 'gray' as const }
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high': return { label: 'High Relevance', color: 'red' as const }
      case 'moderate': return { label: 'Moderate Relevance', color: 'yellow' as const }
      case 'low': return { label: 'Carrier', color: 'blue' as const }
      case 'none': return { label: 'Not Relevant', color: 'gray' as const }
      default: return { label: risk, color: 'gray' as const }
    }
  }

  const getPhaseColor = (phase: string) => {
    if (phase === 'Phase III') return 'green'
    if (phase === 'Phase II') return 'blue'
    if (phase === 'Phase I') return 'yellow'
    return 'gray'
  }

  // Loading screen
  if (isLoading) {
    return (
      <div role="region" aria-label="Gene Therapy Companion" className="space-y-6">
        <Card className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg">
              <Syringe className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <Title>{t('tools.geneTherapy.title')}</Title>
              <Text>{t('tools.geneTherapy.description')}</Text>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-violet-200 dark:border-violet-800 rounded-full animate-spin border-t-violet-500" />
              <Syringe className="w-8 h-8 text-violet-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-body font-medium">Analyzing gene therapy relevance...</p>
            <p className="text-muted text-sm">Cross-referencing your variants with approved therapies</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div role="region" aria-label="Gene Therapy Companion" className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg">
            <Syringe className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>{t('tools.geneTherapy.title')}</Title>
            <Text>{t('tools.geneTherapy.description')}</Text>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'approved' as const, label: 'Approved Therapies', icon: CheckCircle2 },
            { id: 'pipeline' as const, label: 'Clinical Pipeline', icon: FlaskConical },
            { id: 'howItWorks' as const, label: 'How Gene Therapy Works', icon: Microscope },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                aria-label={tab.label}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-violet-500 text-white'
                    : 'bg-surface-muted text-body hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Approved Therapies Tab */}
      {activeTab === 'approved' && (
        <>
          {/* Quick relevance summary */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-violet-500" />
              <Title>Your Genetic Relevance</Title>
            </div>
            <Text className="mb-4">
              AlphaGenome analyzed your variants against all FDA-approved gene therapies. Here is your personal relevance profile.
            </Text>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {APPROVED_THERAPIES.map(therapy => {
                const risk = getRiskBadge(therapy.userRelevance.riskLevel)
                return (
                  <div
                    key={therapy.id}
                    className={`p-3 rounded-xl text-center cursor-pointer transition-all border-2 ${
                      therapy.userRelevance.carriesVariant
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20'
                        : 'border-adaptive bg-surface-soft/50'
                    }`}
                    onClick={() => setExpandedTherapy(expandedTherapy === therapy.id ? null : therapy.id)}
                  >
                    <p className="text-xs font-bold text-title">{therapy.brandName}</p>
                    <p className="text-xs text-muted mt-1">{therapy.targetGene}</p>
                    <Badge color={risk.color} size="xs" className="mt-2">{risk.label}</Badge>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Therapy Cards */}
          <div className="space-y-4">
            {APPROVED_THERAPIES.map(therapy => {
              const Icon = therapy.icon
              const isExpanded = expandedTherapy === therapy.id
              const mechanismBadge = getMechanismBadge(therapy.mechanism)
              const riskBadge = getRiskBadge(therapy.userRelevance.riskLevel)

              return (
                <Card
                  key={therapy.id}
                  className={`transition-all cursor-pointer ${
                    therapy.userRelevance.carriesVariant
                      ? 'border-2 border-blue-300 dark:border-blue-700'
                      : ''
                  }`}
                >
                  <div
                    className="flex items-center justify-between"
                    onClick={() => setExpandedTherapy(isExpanded ? null : therapy.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${therapy.bgColor} ${therapy.darkBgColor}`}>
                        <Icon className={`w-6 h-6 ${therapy.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-title">{therapy.brandName}</p>
                          <Badge color={mechanismBadge.color} size="xs">{mechanismBadge.label}</Badge>
                          <Badge color={riskBadge.color} size="xs">{riskBadge.label}</Badge>
                        </div>
                        <p className="text-sm text-muted">{therapy.condition}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Dna className="w-3 h-3" /> {therapy.targetGene}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {therapy.manufacturer}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileCheck className="w-3 h-3" /> {therapy.approvalBody} {therapy.approvalYear}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-subtle" /> : <ChevronRight className="w-5 h-5 text-subtle" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 space-y-4">
                      {/* Scientific description */}
                      <div className="p-4 bg-surface-soft rounded-xl space-y-3">
                        <p className="text-xs font-medium text-muted uppercase">
                          <FlaskConical className="w-3 h-3 inline mr-1" />
                          Scientific Mechanism
                        </p>
                        <p className="text-sm text-body">{therapy.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span>Vector: <strong className="text-title">{therapy.vector}</strong></span>
                        </div>
                      </div>

                      {/* Patient-friendly explanation */}
                      <div className="p-4 bg-violet-50/50 dark:bg-violet-950/20 rounded-xl border border-violet-200 dark:border-violet-800 space-y-2">
                        <p className="text-xs font-medium text-violet-700 dark:text-violet-400 uppercase">
                          <Info className="w-3 h-3 inline mr-1" />
                          Patient-Friendly Explanation
                        </p>
                        <p className="text-sm text-body">{therapy.patientExplanation}</p>
                      </div>

                      {/* AlphaGenome Prediction */}
                      <div className="p-4 bg-surface-muted rounded-xl space-y-3">
                        <p className="text-xs font-medium text-muted uppercase">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          AlphaGenome Prediction for {therapy.targetGene}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-surface-soft rounded-lg text-center">
                            <p className="text-xs text-muted">Expression Change</p>
                            <p className={`text-xl font-bold ${
                              therapy.alphaGenomePrediction.expressionChange < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {therapy.alphaGenomePrediction.expressionChange > 0 ? '+' : ''}{therapy.alphaGenomePrediction.expressionChange}%
                            </p>
                          </div>
                          <div className="p-3 bg-surface-soft rounded-lg text-center">
                            <p className="text-xs text-muted">Prediction Confidence</p>
                            <p className="text-xl font-bold text-title">{therapy.alphaGenomePrediction.confidence}%</p>
                          </div>
                          <div className="p-3 bg-surface-soft rounded-lg text-center">
                            <p className="text-xs text-muted">Your Risk Level</p>
                            <Badge color={riskBadge.color} size="sm">{riskBadge.label}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted">{therapy.alphaGenomePrediction.variantEffect}</p>
                      </div>

                      {/* Your Genetic Relevance */}
                      <div className={`p-4 rounded-xl border-2 ${
                        therapy.userRelevance.carriesVariant
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20'
                          : 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {therapy.userRelevance.carriesVariant ? (
                            <AlertTriangle className="w-4 h-4 text-blue-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          <p className="text-sm font-semibold text-title">
                            {therapy.userRelevance.carriesVariant ? 'Variant Detected' : 'No Pathogenic Variants'}
                          </p>
                          <Badge color="gray" size="xs">{therapy.userRelevance.variantId}</Badge>
                        </div>
                        <p className="text-sm text-body">{therapy.userRelevance.explanation}</p>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-5 h-5 text-violet-500" />
            <Title>Gene Therapy Pipeline</Title>
          </div>
          <Text className="mb-6">
            Upcoming gene therapies currently in clinical trials. These represent the cutting edge of genomic medicine.
          </Text>

          <div className="space-y-4">
            {PIPELINE_THERAPIES.map(therapy => {
              const isExpanded = expandedPipeline === therapy.id

              return (
                <div
                  key={therapy.id}
                  className="p-4 rounded-xl border-2 border-adaptive bg-surface-soft/50 transition-all cursor-pointer"
                  onClick={() => setExpandedPipeline(isExpanded ? null : therapy.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100 dark:bg-violet-900/30">
                        <FlaskConical className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-title">{therapy.name}</p>
                          <Badge color={getPhaseColor(therapy.phase) as any} size="xs">{therapy.phase}</Badge>
                        </div>
                        <p className="text-sm text-muted">{therapy.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-muted">Target</p>
                        <p className="text-sm font-medium text-title">{therapy.targetGene}</p>
                      </div>
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-subtle" /> : <ChevronRight className="w-5 h-5 text-subtle" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-adaptive space-y-3">
                      <p className="text-sm text-body">{therapy.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-surface-muted rounded-lg">
                          <p className="text-xs text-muted">Approach</p>
                          <p className="text-sm text-body mt-1">{therapy.approach}</p>
                        </div>
                        <div className="p-3 bg-surface-muted rounded-lg">
                          <p className="text-xs text-muted">Sponsor</p>
                          <p className="text-sm text-title font-medium mt-1">{therapy.sponsor}</p>
                        </div>
                        <div className="p-3 bg-surface-muted rounded-lg">
                          <p className="text-xs text-muted">Expected Approval</p>
                          <p className="text-sm text-title font-medium mt-1">{therapy.expectedApproval}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* How It Works Tab */}
      {activeTab === 'howItWorks' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Microscope className="w-5 h-5 text-violet-500" />
            <Title>How Gene Therapy Works</Title>
          </div>
          <Text className="mb-6">
            A step-by-step visual guide to understanding how gene therapy corrects genetic diseases at the molecular level.
          </Text>

          <div className="space-y-6">
            {THERAPY_STEPS.map((step, index) => {
              const Icon = step.icon
              const isLast = index === THERAPY_STEPS.length - 1

              return (
                <div key={step.step} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {step.step}
                    </div>
                    {!isLast && (
                      <div className="w-0.5 flex-1 bg-violet-200 dark:bg-violet-800 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
                    <div className="p-4 rounded-xl bg-surface-soft border-2 border-adaptive">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-violet-500" />
                        <p className="font-semibold text-title">{step.title}</p>
                      </div>
                      <p className="text-sm text-body">{step.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Gene therapy approaches comparison */}
          <div className="mt-8 pt-6 border-t border-adaptive">
            <p className="font-semibold text-title mb-4">Gene Therapy Approaches Compared</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-medium text-title">Gene Replacement</p>
                </div>
                <p className="text-sm text-body">
                  Delivers a functional copy of the gene using a viral vector (usually AAV). The original broken gene remains, but cells now have a working copy.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge color="blue" size="xs">Luxturna</Badge>
                  <Badge color="blue" size="xs">Zolgensma</Badge>
                  <Badge color="blue" size="xs">Hemgenix</Badge>
                  <Badge color="blue" size="xs">Elevidys</Badge>
                </div>
              </div>

              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="font-medium text-title">Gene Editing (CRISPR)</p>
                </div>
                <p className="text-sm text-body">
                  Directly edits the DNA sequence using CRISPR-Cas9. Can knock out harmful genes, correct mutations, or modify regulatory regions.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge color="purple" size="xs">Casgevy</Badge>
                  <Badge color="purple" size="xs">BEAM-101</Badge>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="font-medium text-title">Gene Silencing</p>
                </div>
                <p className="text-sm text-body">
                  Delivers RNA interference (RNAi) or antisense oligonucleotides to silence expression of a toxic gene without modifying DNA sequence.
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge color="amber" size="xs">AMT-130</Badge>
                  <Badge color="amber" size="xs">Patisiran</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Your Gene Therapy Summary</p>
            <p className="text-white/80 text-sm mt-1">
              Of {APPROVED_THERAPIES.length} FDA-approved gene therapies analyzed, you are a carrier for {APPROVED_THERAPIES.filter(t => t.userRelevance.carriesVariant).length} relevant variant (SMN1 — relevant to Zolgensma for SMA).
              This is informational for family planning. No approved therapies are currently indicated for you. As new therapies enter the pipeline, AlphaGenome will update your relevance profile.
            </p>
          </div>
          <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            Full Report
          </Button>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-muted mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-muted">
              <strong className="text-title">Medical Disclaimer:</strong> Gene therapy information is provided for educational purposes.
              Therapy eligibility requires clinical genetic testing, confirmed diagnosis, and physician evaluation.
              AlphaGenome predictions are computational estimates and do not replace diagnostic testing.
              Therapy availability, pricing, and eligibility criteria vary by country and institution. Always consult a genetics specialist for medical decisions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
