'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge } from '@tremor/react'
import {
  Pill,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
  Zap,
  Clock,
  FlaskConical,
  HeartPulse,
  Syringe,
  FileWarning,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

// Types
interface CYPEnzyme {
  id: string
  enzyme: string
  variant: string
  rsid: string
  metabolizerStatus: 'ultra-rapid' | 'normal' | 'intermediate' | 'poor'
  affectedDrugs: string[]
  description: string
  clinicalSignificance: string
}

interface DrugInteraction {
  id: string
  drugName: string
  drugClass: string
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW'
  gene: string
  metabolizerStatus: string
  recommendation: string
  alternativeDrugs: string[]
  mechanism: string
  dosageGuidance: string
}

interface DrugCategory {
  name: string
  icon: typeof Pill
  drugs: string[]
  generalNote: string
}

// Demo CYP enzyme profile data
const CYP_ENZYMES: CYPEnzyme[] = [
  {
    id: 'cyp2d6',
    enzyme: 'CYP2D6',
    variant: '*1/*4',
    rsid: 'rs3892097',
    metabolizerStatus: 'intermediate',
    affectedDrugs: ['Codeine', 'Tamoxifen', 'Fluoxetine', 'Tramadol', 'Metoprolol'],
    description: 'CYP2D6 metabolizes approximately 25% of clinically used drugs. Your intermediate metabolizer status means reduced enzyme activity.',
    clinicalSignificance: 'Prodrugs like codeine may have reduced efficacy due to decreased conversion to active metabolites. Active drugs may accumulate to higher levels.',
  },
  {
    id: 'cyp2c19',
    enzyme: 'CYP2C19',
    variant: '*2/*2',
    rsid: 'rs4244285',
    metabolizerStatus: 'poor',
    affectedDrugs: ['Clopidogrel', 'Omeprazole', 'Escitalopram', 'Voriconazole', 'Clobazam'],
    description: 'CYP2C19 is critical for activating the antiplatelet drug clopidogrel. Poor metabolizer status significantly impacts cardiovascular therapy.',
    clinicalSignificance: 'Clopidogrel is a prodrug requiring CYP2C19 activation. Poor metabolizers have substantially reduced antiplatelet effect, increasing thrombotic risk.',
  },
  {
    id: 'cyp3a4',
    enzyme: 'CYP3A4',
    variant: '*1/*1',
    rsid: 'rs35599367',
    metabolizerStatus: 'normal',
    affectedDrugs: ['Atorvastatin', 'Amlodipine', 'Cyclosporine', 'Midazolam', 'Tacrolimus'],
    description: 'CYP3A4 is the most abundant hepatic enzyme, metabolizing nearly 50% of all drugs. Your normal status indicates standard drug processing.',
    clinicalSignificance: 'Standard dosing guidelines apply for CYP3A4 substrates. Be cautious with grapefruit juice and other CYP3A4 inhibitors that could alter metabolism.',
  },
  {
    id: 'cyp2c9',
    enzyme: 'CYP2C9',
    variant: '*1/*2',
    rsid: 'rs1799853',
    metabolizerStatus: 'intermediate',
    affectedDrugs: ['Warfarin', 'Ibuprofen', 'Phenytoin', 'Celecoxib', 'Losartan'],
    description: 'CYP2C9 metabolizes many NSAIDs and the critical anticoagulant warfarin. Intermediate status requires careful dose titration.',
    clinicalSignificance: 'Warfarin sensitivity is increased. Initial doses should be reduced by 20-30% compared to standard. NSAID metabolism is slowed, increasing bleeding risk.',
  },
  {
    id: 'cyp1a2',
    enzyme: 'CYP1A2',
    variant: '*1F/*1F',
    rsid: 'rs762551',
    metabolizerStatus: 'ultra-rapid',
    affectedDrugs: ['Caffeine', 'Theophylline', 'Melatonin', 'Clozapine', 'Duloxetine'],
    description: 'CYP1A2 is induced by smoking and cruciferous vegetables. Ultra-rapid status means faster clearance of substrates.',
    clinicalSignificance: 'Caffeine is cleared rapidly, allowing higher tolerance. Therapeutic drugs like theophylline and clozapine may require higher doses to maintain efficacy.',
  },
]

// Drug interaction alerts
const DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    id: 'warfarin',
    drugName: 'Warfarin',
    drugClass: 'Anticoagulant',
    riskLevel: 'HIGH',
    gene: 'CYP2C9',
    metabolizerStatus: 'Intermediate Metabolizer',
    recommendation: 'Dose reduction required. Start at 50-75% of standard initial dose. Monitor INR frequently during initiation. Consider VKORC1 genotype for further refinement.',
    alternativeDrugs: ['Apixaban (Eliquis)', 'Rivaroxaban (Xarelto)', 'Dabigatran (Pradaxa)'],
    mechanism: 'CYP2C9 *1/*2 reduces S-warfarin clearance by ~30%, leading to supratherapeutic INR levels at standard doses.',
    dosageGuidance: 'Initial dose: 2-3 mg/day (vs standard 5 mg/day). Target INR 2.0-3.0 with weekly monitoring for first month.',
  },
  {
    id: 'clopidogrel',
    drugName: 'Clopidogrel (Plavix)',
    drugClass: 'Antiplatelet',
    riskLevel: 'HIGH',
    gene: 'CYP2C19',
    metabolizerStatus: 'Poor Metabolizer',
    recommendation: 'Consider alternative antiplatelet therapy. Clopidogrel is a prodrug that requires CYP2C19 activation. FDA boxed warning applies to poor metabolizers.',
    alternativeDrugs: ['Ticagrelor (Brilinta)', 'Prasugrel (Effient)'],
    mechanism: 'CYP2C19 *2/*2 abolishes conversion of clopidogrel to its active thiol metabolite, resulting in negligible antiplatelet effect.',
    dosageGuidance: 'Do NOT use standard or increased doses. Switch to ticagrelor 90mg BID or prasugrel 10mg daily (if no contraindications).',
  },
  {
    id: 'codeine',
    drugName: 'Codeine',
    drugClass: 'Opioid Analgesic',
    riskLevel: 'MODERATE',
    gene: 'CYP2D6',
    metabolizerStatus: 'Intermediate Metabolizer',
    recommendation: 'Reduced efficacy expected. Codeine requires CYP2D6 conversion to morphine. Consider alternative analgesics for adequate pain control.',
    alternativeDrugs: ['Morphine (direct)', 'Oxycodone', 'Non-opioid alternatives (NSAIDs, acetaminophen)'],
    mechanism: 'CYP2D6 *1/*4 reduces O-demethylation of codeine to morphine by approximately 50%, resulting in subtherapeutic analgesic effect.',
    dosageGuidance: 'If codeine is used, higher doses may be needed but ceiling effect limits utility. Prefer direct-acting opioids or non-opioid alternatives.',
  },
  {
    id: 'omeprazole',
    drugName: 'Omeprazole (Prilosec)',
    drugClass: 'Proton Pump Inhibitor',
    riskLevel: 'MODERATE',
    gene: 'CYP2C19',
    metabolizerStatus: 'Poor Metabolizer',
    recommendation: 'Dose reduction recommended. Poor metabolizers achieve 5-12x higher plasma concentrations. Increased efficacy but also increased risk of side effects.',
    alternativeDrugs: ['Pantoprazole (less CYP2C19 dependent)', 'H2 blockers (famotidine)'],
    mechanism: 'CYP2C19 *2/*2 dramatically reduces omeprazole clearance, leading to prolonged acid suppression and potential magnesium depletion with long-term use.',
    dosageGuidance: 'Use 50% of standard dose (10mg daily instead of 20mg). Monitor magnesium and B12 levels if used long-term. Consider pantoprazole as alternative.',
  },
  {
    id: 'atorvastatin',
    drugName: 'Atorvastatin (Lipitor)',
    drugClass: 'Statin (HMG-CoA Reductase Inhibitor)',
    riskLevel: 'LOW',
    gene: 'CYP3A4',
    metabolizerStatus: 'Normal Metabolizer',
    recommendation: 'Standard dosing appropriate. Your CYP3A4 normal metabolizer status indicates typical statin metabolism. Avoid grapefruit juice which inhibits CYP3A4.',
    alternativeDrugs: ['Rosuvastatin (less CYP3A4 dependent)', 'Pravastatin (minimal CYP metabolism)'],
    mechanism: 'CYP3A4 *1/*1 provides normal hydroxylation of atorvastatin. Drug-drug interactions with CYP3A4 inhibitors remain the primary concern.',
    dosageGuidance: 'Standard dosing: 10-80mg daily based on LDL targets. Monitor liver function tests. Avoid concomitant strong CYP3A4 inhibitors.',
  },
]

// Drug categories for overview
const DRUG_CATEGORIES: DrugCategory[] = [
  {
    name: 'Cardiovascular',
    icon: HeartPulse,
    drugs: ['Warfarin', 'Clopidogrel', 'Metoprolol', 'Losartan', 'Amlodipine'],
    generalNote: 'Multiple pharmacogenomic interactions identified. Consult cardiologist before starting therapy.',
  },
  {
    name: 'Pain Management',
    icon: Activity,
    drugs: ['Codeine', 'Tramadol', 'Ibuprofen', 'Celecoxib'],
    generalNote: 'Opioid prodrugs have reduced efficacy. NSAIDs require monitoring due to CYP2C9 status.',
  },
  {
    name: 'Psychiatry',
    icon: FlaskConical,
    drugs: ['Fluoxetine', 'Escitalopram', 'Clozapine', 'Duloxetine'],
    generalNote: 'SSRIs may accumulate. Start low and titrate slowly with therapeutic drug monitoring.',
  },
  {
    name: 'Gastrointestinal',
    icon: Pill,
    drugs: ['Omeprazole', 'Pantoprazole'],
    generalNote: 'PPIs are significantly affected by CYP2C19 poor metabolizer status. Dose adjustments recommended.',
  },
]

// Helper functions
function getMetabolizerColor(status: string): string {
  switch (status) {
    case 'ultra-rapid': return 'purple'
    case 'normal': return 'green'
    case 'intermediate': return 'amber'
    case 'poor': return 'red'
    default: return 'gray'
  }
}

function getMetabolizerLabel(status: string): string {
  switch (status) {
    case 'ultra-rapid': return 'Ultra-rapid Metabolizer'
    case 'normal': return 'Normal Metabolizer'
    case 'intermediate': return 'Intermediate Metabolizer'
    case 'poor': return 'Poor Metabolizer'
    default: return 'Unknown'
  }
}

function getMetabolizerBarWidth(status: string): string {
  switch (status) {
    case 'ultra-rapid': return 'w-full'
    case 'normal': return 'w-3/4'
    case 'intermediate': return 'w-1/2'
    case 'poor': return 'w-1/4'
    default: return 'w-0'
  }
}

function getMetabolizerBarColor(status: string): string {
  switch (status) {
    case 'ultra-rapid': return 'bg-purple-500'
    case 'normal': return 'bg-green-500'
    case 'intermediate': return 'bg-amber-500'
    case 'poor': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

function getRiskBgClass(risk: string): string {
  switch (risk) {
    case 'HIGH': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/40'
    case 'MODERATE': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40'
    case 'LOW': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40'
    default: return 'bg-surface-soft border-border'
  }
}

function getRiskIconColor(risk: string): string {
  switch (risk) {
    case 'HIGH': return 'text-red-600'
    case 'MODERATE': return 'text-amber-600'
    case 'LOW': return 'text-green-600'
    default: return 'text-subtle'
  }
}

function getRiskBadgeColor(risk: string): 'red' | 'amber' | 'green' | 'gray' {
  switch (risk) {
    case 'HIGH': return 'red'
    case 'MODERATE': return 'amber'
    case 'LOW': return 'green'
    default: return 'gray'
  }
}

export function Pharmacogenomics() {
  const t = useTranslations('tools.pharmacogenomics')
  const [loading, setLoading] = useState(true)
  const [expandedEnzymes, setExpandedEnzymes] = useState<Set<string>>(new Set())
  const [expandedDrugs, setExpandedDrugs] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const toggleEnzyme = (id: string) => {
    setExpandedEnzymes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleDrug = (id: string) => {
    setExpandedDrugs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const highRiskDrugs = DRUG_INTERACTIONS.filter(d => d.riskLevel === 'HIGH')
  const moderateRiskDrugs = DRUG_INTERACTIONS.filter(d => d.riskLevel === 'MODERATE')
  const lowRiskDrugs = DRUG_INTERACTIONS.filter(d => d.riskLevel === 'LOW')

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-spin opacity-20"></div>
            <div className="absolute inset-2 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Pill className="w-8 h-8 text-indigo-500 animate-pulse" />
            </div>
          </div>
          <Title>Analyzing your pharmacogenomic profile...</Title>
          <Text className="mt-2">Mapping CYP450 enzyme activity and drug interactions</Text>
        </div>
      </Card>
    )
  }

  return (
    <div role="region" aria-label="Pharmacogenomics" className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Pill className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>{t('title')}</Title>
            <Text>{t('description')}</Text>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="text-center p-4">
          <div className="w-10 h-10 mx-auto mb-2 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{highRiskDrugs.length}</p>
          <p className="text-xs text-muted">High Risk</p>
        </Card>
        <Card className="text-center p-4">
          <div className="w-10 h-10 mx-auto mb-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <ShieldQuestion className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{moderateRiskDrugs.length}</p>
          <p className="text-xs text-muted">Moderate Risk</p>
        </Card>
        <Card className="text-center p-4">
          <div className="w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{lowRiskDrugs.length}</p>
          <p className="text-xs text-muted">Low Risk</p>
        </Card>
        <Card className="text-center p-4">
          <div className="w-10 h-10 mx-auto mb-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{CYP_ENZYMES.length}</p>
          <p className="text-xs text-muted">Enzymes Analyzed</p>
        </Card>
      </div>

      {/* CYP450 Drug Metabolism Profile */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-indigo-600" />
          <Title className="text-indigo-700 dark:text-indigo-400">Drug Metabolism Profile (CYP450)</Title>
        </div>
        <Text className="mb-4 text-muted">
          Your cytochrome P450 enzyme activity determines how quickly you metabolize medications. Variations can lead to drug toxicity or treatment failure.
        </Text>

        <div className="space-y-3">
          {CYP_ENZYMES.map(enzyme => {
            const isExpanded = expandedEnzymes.has(enzyme.id)
            const statusColor = getMetabolizerColor(enzyme.metabolizerStatus)

            return (
              <div
                key={enzyme.id}
                className="p-4 bg-surface-soft rounded-xl border border-border cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
                onClick={() => toggleEnzyme(enzyme.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{enzyme.enzyme.replace('CYP', '')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-title">{enzyme.enzyme}</p>
                        <Badge color="indigo" size="xs">{enzyme.rsid}</Badge>
                        <Badge color={statusColor as any} size="xs">{getMetabolizerLabel(enzyme.metabolizerStatus)}</Badge>
                      </div>
                      <p className="text-xs text-muted mt-1">Genotype: {enzyme.variant}</p>
                      {/* Activity bar */}
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-500 ${getMetabolizerBarColor(enzyme.metabolizerStatus)} ${getMetabolizerBarWidth(enzyme.metabolizerStatus)}`}></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted">Poor</span>
                        <span className="text-[10px] text-muted">Normal</span>
                        <span className="text-[10px] text-muted">Ultra-rapid</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-subtle flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-subtle flex-shrink-0 ml-2" />
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <p className="text-sm text-body">{enzyme.description}</p>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Clinical Significance</p>
                      <p className="text-sm text-body">{enzyme.clinicalSignificance}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted mb-2">Affected Medications:</p>
                      <div className="flex flex-wrap gap-1">
                        {enzyme.affectedDrugs.map(drug => (
                          <Badge key={drug} color={statusColor as any} size="xs">{drug}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Drug Interaction Alerts */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <Title className="text-red-700 dark:text-red-400">Drug Interaction Alerts</Title>
        </div>
        <Text className="mb-4 text-muted">
          Critical drug-gene interactions identified from your pharmacogenomic profile. Share this report with your healthcare provider.
        </Text>

        {/* High Risk */}
        {highRiskDrugs.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <p className="font-semibold text-red-700 dark:text-red-400 text-sm">HIGH RISK - Action Required</p>
            </div>
            <div className="space-y-3">
              {highRiskDrugs.map(drug => {
                const isExpanded = expandedDrugs.has(drug.id)
                return (
                  <div
                    key={drug.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${getRiskBgClass(drug.riskLevel)} hover:opacity-90`}
                    onClick={() => toggleDrug(drug.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                          <FileWarning className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-title">{drug.drugName}</p>
                            <Badge color="red" size="xs">HIGH RISK</Badge>
                          </div>
                          <p className="text-xs text-muted">{drug.drugClass} - {drug.gene} ({drug.metabolizerStatus})</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-subtle" /> : <ChevronDown className="w-5 h-5 text-subtle" />}
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700/40 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Mechanism</p>
                          <p className="text-sm text-body">{drug.mechanism}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Clinical Recommendation</p>
                          <p className="text-sm text-body">{drug.recommendation}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Dosage Guidance</p>
                          <p className="text-sm text-body">{drug.dosageGuidance}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Alternative Medications</p>
                          <div className="flex flex-wrap gap-1">
                            {drug.alternativeDrugs.map(alt => (
                              <Badge key={alt} color="green" size="xs">{alt}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Moderate Risk */}
        {moderateRiskDrugs.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldQuestion className="w-4 h-4 text-amber-600" />
              <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">MODERATE RISK - Dose Adjustment May Be Needed</p>
            </div>
            <div className="space-y-3">
              {moderateRiskDrugs.map(drug => {
                const isExpanded = expandedDrugs.has(drug.id)
                return (
                  <div
                    key={drug.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${getRiskBgClass(drug.riskLevel)} hover:opacity-90`}
                    onClick={() => toggleDrug(drug.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-title">{drug.drugName}</p>
                            <Badge color="amber" size="xs">MODERATE</Badge>
                          </div>
                          <p className="text-xs text-muted">{drug.drugClass} - {drug.gene} ({drug.metabolizerStatus})</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-subtle" /> : <ChevronDown className="w-5 h-5 text-subtle" />}
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700/40 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">Mechanism</p>
                          <p className="text-sm text-body">{drug.mechanism}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">Clinical Recommendation</p>
                          <p className="text-sm text-body">{drug.recommendation}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">Dosage Guidance</p>
                          <p className="text-sm text-body">{drug.dosageGuidance}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">Alternative Medications</p>
                          <div className="flex flex-wrap gap-1">
                            {drug.alternativeDrugs.map(alt => (
                              <Badge key={alt} color="green" size="xs">{alt}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Low Risk */}
        {lowRiskDrugs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <p className="font-semibold text-green-700 dark:text-green-400 text-sm">LOW RISK - Standard Dosing Appropriate</p>
            </div>
            <div className="space-y-3">
              {lowRiskDrugs.map(drug => {
                const isExpanded = expandedDrugs.has(drug.id)
                return (
                  <div
                    key={drug.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${getRiskBgClass(drug.riskLevel)} hover:opacity-90`}
                    onClick={() => toggleDrug(drug.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-title">{drug.drugName}</p>
                            <Badge color="green" size="xs">LOW RISK</Badge>
                          </div>
                          <p className="text-xs text-muted">{drug.drugClass} - {drug.gene} ({drug.metabolizerStatus})</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-subtle" /> : <ChevronDown className="w-5 h-5 text-subtle" />}
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700/40 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Mechanism</p>
                          <p className="text-sm text-body">{drug.mechanism}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Clinical Recommendation</p>
                          <p className="text-sm text-body">{drug.recommendation}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Dosage Guidance</p>
                          <p className="text-sm text-body">{drug.dosageGuidance}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Alternative Medications</p>
                          <div className="flex flex-wrap gap-1">
                            {drug.alternativeDrugs.map(alt => (
                              <Badge key={alt} color="green" size="xs">{alt}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Drug Categories Overview */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Syringe className="w-5 h-5 text-accent" />
          <Title className="text-purple-700 dark:text-purple-400">Medication Categories</Title>
        </div>
        <Text className="mb-4 text-muted">
          Overview of how your pharmacogenomic profile affects different drug categories.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DRUG_CATEGORIES.map(category => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.name

            return (
              <div
                key={category.name}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                    : 'bg-surface-soft border-border hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                }`}
                onClick={() => setSelectedCategory(isSelected ? null : category.name)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="font-semibold text-title">{category.name}</p>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {category.drugs.map(drug => {
                    const interaction = DRUG_INTERACTIONS.find(d => d.drugName.startsWith(drug))
                    const color = interaction ? getRiskBadgeColor(interaction.riskLevel) : 'gray'
                    return (
                      <Badge key={drug} color={color} size="xs">{drug}</Badge>
                    )
                  })}
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700/40">
                    <p className="text-sm text-body">{category.generalNote}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="border-indigo-200 dark:border-indigo-700/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-title mb-1">Important Medical Disclaimer</p>
            <p className="text-sm text-muted">
              This pharmacogenomic report is for informational purposes only and does not constitute medical advice.
              Drug response is influenced by many factors beyond genetics, including age, weight, organ function,
              and concurrent medications. Always consult your healthcare provider or pharmacist before making any
              changes to your medication regimen. Pharmacogenomic testing should be performed by a certified laboratory.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
