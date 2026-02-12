'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge } from '@tremor/react'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  Activity,
  Syringe,
  Bug,
  Heart,
  Dna,
  Loader2,
  Eye,
  Zap,
  Lock,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
// Types
interface HLAAllele {
  id: string
  locus: string
  allele: string
  frequency: number
  description: string
  descriptionEs: string
  clinicalNote: string
  clinicalNoteEs: string
  antigenPresentation: 'strong' | 'moderate' | 'weak'
}

interface VaccineResponse {
  id: string
  vaccine: string
  vaccineEs: string
  response: 'strong' | 'moderate' | 'weak'
  confidence: number
  explanation: string
  explanationEs: string
  keyHLA: string
  boosterRecommendation: string
  boosterRecommendationEs: string
}

interface PathogenSusceptibility {
  id: string
  pathogen: string
  pathogenEs: string
  susceptibility: 'low' | 'moderate' | 'high'
  protectiveAllele: string
  hasProtectiveAllele: boolean
  explanation: string
  explanationEs: string
  globalPrevalence: string
  globalPrevalenceEs: string
}

interface AutoimmuneRisk {
  id: string
  condition: string
  conditionEs: string
  risk: 'low' | 'moderate' | 'high'
  associatedHLA: string
  userHasRiskAllele: boolean
  oddsRatio: number
  explanation: string
  explanationEs: string
  prevalence: string
  prevalenceEs: string
}

// Demo HLA genotype
const HLA_PROFILE: HLAAllele[] = [
  {
    id: 'hla-a',
    locus: 'HLA-A',
    allele: 'HLA-A*02:01',
    frequency: 0.29,
    description: 'Most common HLA-A allele worldwide. Presents a broad range of viral peptides effectively.',
    descriptionEs: 'Alelo HLA-A mas comun en el mundo. Presenta una amplia gama de peptidos virales eficazmente.',
    clinicalNote: 'Strong response to viral peptides from influenza, CMV, EBV, and HPV. Well-studied in cancer immunotherapy.',
    clinicalNoteEs: 'Respuesta fuerte a peptidos virales de influenza, CMV, EBV y VPH. Bien estudiado en inmunoterapia contra el cancer.',
    antigenPresentation: 'strong',
  },
  {
    id: 'hla-b',
    locus: 'HLA-B',
    allele: 'HLA-B*07:02',
    frequency: 0.12,
    description: 'Common in European populations. Good antigen presentation for many intracellular pathogens.',
    descriptionEs: 'Comun en poblaciones europeas. Buena presentacion de antigenos para muchos patogenos intracelulares.',
    clinicalNote: 'Associated with effective CMV and EBV control. Moderate HIV peptide binding. No major drug hypersensitivity associations.',
    clinicalNoteEs: 'Asociado con control efectivo de CMV y EBV. Union moderada a peptidos de VIH. Sin asociaciones mayores de hipersensibilidad a farmacos.',
    antigenPresentation: 'strong',
  },
  {
    id: 'hla-c',
    locus: 'HLA-C',
    allele: 'HLA-C*07:01',
    frequency: 0.15,
    description: 'Key regulator of Natural Killer cell activity through KIR receptor interactions.',
    descriptionEs: 'Regulador clave de la actividad de celulas Natural Killer a traves de interacciones con receptores KIR.',
    clinicalNote: 'C1 group ligand for KIR2DL2/KIR2DL3. Modulates NK cell education and missing-self recognition. Important in pregnancy immune tolerance.',
    clinicalNoteEs: 'Ligando del grupo C1 para KIR2DL2/KIR2DL3. Modula la educacion de celulas NK y el reconocimiento de missing-self. Importante en la tolerancia inmune del embarazo.',
    antigenPresentation: 'moderate',
  },
  {
    id: 'hla-drb1',
    locus: 'HLA-DRB1',
    allele: 'HLA-DRB1*15:01',
    frequency: 0.14,
    description: 'Class II MHC allele associated with MS risk but provides strong pathogen defense.',
    descriptionEs: 'Alelo MHC de clase II asociado con riesgo de EM pero proporciona fuerte defensa contra patogenos.',
    clinicalNote: 'Risk allele for multiple sclerosis (OR ~3.0). However, excellent at presenting mycobacterial and viral antigens. Strong T-helper cell activation.',
    clinicalNoteEs: 'Alelo de riesgo para esclerosis multiple (OR ~3.0). Sin embargo, excelente para presentar antigenos micobacterianos y virales. Fuerte activacion de celulas T helper.',
    antigenPresentation: 'strong',
  },
  {
    id: 'hla-dqb1',
    locus: 'HLA-DQB1',
    allele: 'HLA-DQB1*06:02',
    frequency: 0.10,
    description: 'Associated with narcolepsy risk but enhances immune surveillance capabilities.',
    descriptionEs: 'Asociado con riesgo de narcolepsia pero mejora las capacidades de vigilancia inmune.',
    clinicalNote: 'Strongest genetic risk factor for narcolepsy type 1 (OR ~250). Paradoxically, associated with enhanced CD4+ T cell responses to many pathogens. Protective against type 1 diabetes.',
    clinicalNoteEs: 'Factor de riesgo genetico mas fuerte para narcolepsia tipo 1 (OR ~250). Paradojicamente, asociado con respuestas mejoradas de celulas T CD4+ contra muchos patogenos. Protector contra diabetes tipo 1.',
    antigenPresentation: 'strong',
  },
]

// Demo vaccine responses
const VACCINE_RESPONSES: VaccineResponse[] = [
  {
    id: 'flu',
    vaccine: 'Influenza (Seasonal Flu)',
    vaccineEs: 'Influenza (Gripe Estacional)',
    response: 'strong',
    confidence: 91,
    explanation: 'HLA-A*02:01 binds influenza matrix protein (M1) and nucleoprotein epitopes with high affinity. Your HLA-B*07:02 adds breadth to the anti-flu repertoire.',
    explanationEs: 'HLA-A*02:01 se une a la proteina de matriz de influenza (M1) y epitopos de nucleoproteina con alta afinidad. Tu HLA-B*07:02 anade amplitud al repertorio anti-gripe.',
    keyHLA: 'HLA-A*02:01',
    boosterRecommendation: 'Annual vaccination recommended — your strong response means good protection each season.',
    boosterRecommendationEs: 'Vacunacion anual recomendada — tu respuesta fuerte significa buena proteccion cada temporada.',
  },
  {
    id: 'covid',
    vaccine: 'COVID-19 mRNA',
    vaccineEs: 'COVID-19 ARNm',
    response: 'strong',
    confidence: 88,
    explanation: 'mRNA vaccines generate broad spike protein epitopes. HLA-A*02:01 binds multiple SARS-CoV-2 spike peptides. DRB1*15:01 activates robust CD4+ T cell help for antibody production.',
    explanationEs: 'Las vacunas ARNm generan epitopos amplios de la proteina spike. HLA-A*02:01 se une a multiples peptidos spike del SARS-CoV-2. DRB1*15:01 activa ayuda robusta de celulas T CD4+ para la produccion de anticuerpos.',
    keyHLA: 'HLA-A*02:01, HLA-DRB1*15:01',
    boosterRecommendation: 'Standard booster schedule sufficient. Your genotype predicts durable T cell memory.',
    boosterRecommendationEs: 'Esquema de refuerzo estandar suficiente. Tu genotipo predice memoria duradera de celulas T.',
  },
  {
    id: 'hepb',
    vaccine: 'Hepatitis B',
    vaccineEs: 'Hepatitis B',
    response: 'moderate',
    confidence: 75,
    explanation: 'HLA-DRB1*15:01 is associated with lower antibody response to Hepatitis B vaccine in some studies. However, your HLA-DQB1*06:02 partially compensates with enhanced CD4+ activation.',
    explanationEs: 'HLA-DRB1*15:01 esta asociado con menor respuesta de anticuerpos a la vacuna de Hepatitis B en algunos estudios. Sin embargo, tu HLA-DQB1*06:02 compensa parcialmente con activacion mejorada de CD4+.',
    keyHLA: 'HLA-DRB1*15:01',
    boosterRecommendation: 'Consider checking anti-HBs titers after vaccination. A booster dose may be needed if titers are <10 mIU/mL.',
    boosterRecommendationEs: 'Considera verificar titulos anti-HBs despues de la vacunacion. Puede necesitarse una dosis de refuerzo si los titulos son <10 mIU/mL.',
  },
  {
    id: 'hpv',
    vaccine: 'HPV (Human Papillomavirus)',
    vaccineEs: 'VPH (Virus del Papiloma Humano)',
    response: 'strong',
    confidence: 93,
    explanation: 'HLA-A*02:01 is excellent at presenting HPV E6 and E7 oncoprotein peptides. This is the most studied HLA allele in HPV immunology and is associated with enhanced viral clearance.',
    explanationEs: 'HLA-A*02:01 es excelente para presentar peptidos de oncoproteinas E6 y E7 del VPH. Es el alelo HLA mas estudiado en inmunologia del VPH y esta asociado con mejor eliminacion viral.',
    keyHLA: 'HLA-A*02:01',
    boosterRecommendation: 'Standard 2-3 dose schedule provides excellent protection for your genotype.',
    boosterRecommendationEs: 'El esquema estandar de 2-3 dosis proporciona excelente proteccion para tu genotipo.',
  },
  {
    id: 'mmr',
    vaccine: 'MMR (Measles, Mumps, Rubella)',
    vaccineEs: 'SRP (Sarampion, Rubeola, Paperas)',
    response: 'strong',
    confidence: 86,
    explanation: 'Broad HLA coverage across Class I (A*02:01, B*07:02) and Class II (DRB1*15:01) enables robust responses to all three live attenuated viruses in the MMR vaccine.',
    explanationEs: 'Amplia cobertura HLA a traves de Clase I (A*02:01, B*07:02) y Clase II (DRB1*15:01) permite respuestas robustas a los tres virus vivos atenuados en la vacuna SRP.',
    keyHLA: 'HLA-A*02:01, HLA-B*07:02, HLA-DRB1*15:01',
    boosterRecommendation: 'Standard 2-dose childhood schedule. Lifelong immunity expected with your HLA type.',
    boosterRecommendationEs: 'Esquema infantil estandar de 2 dosis. Se espera inmunidad de por vida con tu tipo HLA.',
  },
]

// Demo pathogen susceptibility
const PATHOGEN_SUSCEPTIBILITY: PathogenSusceptibility[] = [
  {
    id: 'hiv',
    pathogen: 'HIV (Human Immunodeficiency Virus)',
    pathogenEs: 'VIH (Virus de Inmunodeficiencia Humana)',
    susceptibility: 'moderate',
    protectiveAllele: 'HLA-B*57:01',
    hasProtectiveAllele: false,
    explanation: 'The highly protective HLA-B*57:01 allele is not present in your genotype. However, HLA-B*07:02 provides moderate HIV peptide binding. Your susceptibility is near population average.',
    explanationEs: 'El alelo altamente protector HLA-B*57:01 no esta presente en tu genotipo. Sin embargo, HLA-B*07:02 proporciona union moderada a peptidos del VIH. Tu susceptibilidad esta cerca del promedio poblacional.',
    globalPrevalence: '38 million people living with HIV worldwide',
    globalPrevalenceEs: '38 millones de personas viviendo con VIH en el mundo',
  },
  {
    id: 'malaria',
    pathogen: 'Malaria (Plasmodium falciparum)',
    pathogenEs: 'Malaria (Plasmodium falciparum)',
    susceptibility: 'moderate',
    protectiveAllele: 'HLA-B*53:01',
    hasProtectiveAllele: false,
    explanation: 'HLA-B*53:01, the most protective allele against severe malaria, is absent. Your HLA type offers standard immune clearance of infected erythrocytes with no enhanced protection.',
    explanationEs: 'HLA-B*53:01, el alelo mas protector contra malaria severa, esta ausente. Tu tipo HLA ofrece eliminacion inmune estandar de eritrocitos infectados sin proteccion adicional.',
    globalPrevalence: '247 million cases annually, mostly in Sub-Saharan Africa',
    globalPrevalenceEs: '247 millones de casos anuales, mayormente en Africa subsahariana',
  },
  {
    id: 'tb',
    pathogen: 'Tuberculosis (Mycobacterium tuberculosis)',
    pathogenEs: 'Tuberculosis (Mycobacterium tuberculosis)',
    susceptibility: 'low',
    protectiveAllele: 'HLA-DRB1*15:01',
    hasProtectiveAllele: true,
    explanation: 'Your HLA-DRB1*15:01 is actually well-suited for presenting mycobacterial antigens to CD4+ T cells. This provides enhanced immune surveillance against TB, though it was historically also associated with susceptibility in some populations.',
    explanationEs: 'Tu HLA-DRB1*15:01 es en realidad adecuado para presentar antigenos micobacterianos a celulas T CD4+. Esto proporciona vigilancia inmune mejorada contra TB, aunque historicamente tambien se asocio con susceptibilidad en algunas poblaciones.',
    globalPrevalence: '10.6 million new cases annually',
    globalPrevalenceEs: '10.6 millones de casos nuevos anualmente',
  },
  {
    id: 'ebv',
    pathogen: 'Epstein-Barr Virus (EBV)',
    pathogenEs: 'Virus de Epstein-Barr (VEB)',
    susceptibility: 'low',
    protectiveAllele: 'HLA-A*02:01',
    hasProtectiveAllele: true,
    explanation: 'HLA-A*02:01 presents EBV lytic and latent antigens effectively, enabling strong cytotoxic T cell responses. This helps control EBV reactivation and reduces associated lymphoma risk.',
    explanationEs: 'HLA-A*02:01 presenta antigenos liticos y latentes del VEB eficazmente, permitiendo respuestas fuertes de celulas T citotoxicas. Esto ayuda a controlar la reactivacion del VEB y reduce el riesgo asociado de linfoma.',
    globalPrevalence: '95% of adults infected worldwide — mostly asymptomatic',
    globalPrevalenceEs: '95% de adultos infectados en el mundo — mayormente asintomaticos',
  },
]

// Demo autoimmune risks
const AUTOIMMUNE_RISKS: AutoimmuneRisk[] = [
  {
    id: 't1d',
    condition: 'Type 1 Diabetes',
    conditionEs: 'Diabetes Tipo 1',
    risk: 'low',
    associatedHLA: 'HLA-DR3 (DRB1*03:01) / HLA-DR4 (DRB1*04:01)',
    userHasRiskAllele: false,
    oddsRatio: 0.8,
    explanation: 'The highest risk genotype is DR3/DR4 heterozygous (OR ~16). Your DRB1*15:01 is not a risk allele. In fact, DQB1*06:02 is considered protective against T1D (OR ~0.02).',
    explanationEs: 'El genotipo de mayor riesgo es DR3/DR4 heterocigoto (OR ~16). Tu DRB1*15:01 no es un alelo de riesgo. De hecho, DQB1*06:02 se considera protector contra DT1 (OR ~0.02).',
    prevalence: '~1 in 300 lifetime risk in general population',
    prevalenceEs: '~1 en 300 riesgo de por vida en la poblacion general',
  },
  {
    id: 'celiac',
    condition: 'Celiac Disease',
    conditionEs: 'Enfermedad Celiaca',
    risk: 'low',
    associatedHLA: 'HLA-DQ2.5 (DQA1*05:01/DQB1*02:01) / HLA-DQ8 (DQB1*03:02)',
    userHasRiskAllele: false,
    oddsRatio: 0.5,
    explanation: 'Celiac disease requires HLA-DQ2.5 or HLA-DQ8, which are absent from your genotype. Without these alleles, celiac disease is essentially excluded — they are present in >99% of celiac patients.',
    explanationEs: 'La enfermedad celiaca requiere HLA-DQ2.5 o HLA-DQ8, que estan ausentes de tu genotipo. Sin estos alelos, la enfermedad celiaca esta esencialmente excluida — estan presentes en >99% de los pacientes celiacos.',
    prevalence: '~1 in 100 worldwide',
    prevalenceEs: '~1 en 100 a nivel mundial',
  },
  {
    id: 'as',
    condition: 'Ankylosing Spondylitis',
    conditionEs: 'Espondilitis Anquilosante',
    risk: 'low',
    associatedHLA: 'HLA-B*27',
    userHasRiskAllele: false,
    oddsRatio: 0.9,
    explanation: 'HLA-B*27 is the strongest genetic risk factor (OR ~70). Your HLA-B*07:02 is not associated with AS risk. Without B*27, lifetime risk is very low (<0.1%).',
    explanationEs: 'HLA-B*27 es el factor de riesgo genetico mas fuerte (OR ~70). Tu HLA-B*07:02 no esta asociado con riesgo de EA. Sin B*27, el riesgo de por vida es muy bajo (<0.1%).',
    prevalence: '~0.1-0.5% general population, up to 5-6% in B*27 carriers',
    prevalenceEs: '~0.1-0.5% poblacion general, hasta 5-6% en portadores de B*27',
  },
  {
    id: 'ms',
    condition: 'Multiple Sclerosis',
    conditionEs: 'Esclerosis Multiple',
    risk: 'moderate',
    associatedHLA: 'HLA-DRB1*15:01',
    userHasRiskAllele: true,
    oddsRatio: 3.08,
    explanation: 'Your HLA-DRB1*15:01 is the strongest genetic risk factor for MS (OR ~3.0). About 60% of MS patients carry this allele vs 25% of controls. However, absolute risk remains low (~0.3% lifetime with this allele).',
    explanationEs: 'Tu HLA-DRB1*15:01 es el factor de riesgo genetico mas fuerte para EM (OR ~3.0). Aproximadamente el 60% de los pacientes con EM portan este alelo vs 25% de los controles. Sin embargo, el riesgo absoluto sigue siendo bajo (~0.3% de por vida con este alelo).',
    prevalence: '~0.1% general population; ~0.3% with DRB1*15:01',
    prevalenceEs: '~0.1% poblacion general; ~0.3% con DRB1*15:01',
  },
  {
    id: 'narcolepsy',
    condition: 'Narcolepsy Type 1',
    conditionEs: 'Narcolepsia Tipo 1',
    risk: 'moderate',
    associatedHLA: 'HLA-DQB1*06:02',
    userHasRiskAllele: true,
    oddsRatio: 251,
    explanation: 'DQB1*06:02 is present in >98% of narcolepsy type 1 patients (OR ~250). However, 15-25% of the general population carries this allele and lifetime narcolepsy risk remains very low (~0.05%) due to requirement for additional triggers (e.g., infections, autoimmune process targeting hypocretin neurons).',
    explanationEs: 'DQB1*06:02 esta presente en >98% de los pacientes con narcolepsia tipo 1 (OR ~250). Sin embargo, 15-25% de la poblacion general porta este alelo y el riesgo de narcolepsia de por vida sigue siendo muy bajo (~0.05%) debido al requerimiento de desencadenantes adicionales (ej. infecciones, proceso autoinmune dirigido a neuronas de hipocretina).',
    prevalence: '~0.02-0.05% general population',
    prevalenceEs: '~0.02-0.05% poblacion general',
  },
]

export function ImmuneResponsePredictor() {
  const t = useTranslations('tools.immuneResponse')
  const [loading, setLoading] = useState(true)
  const [expandedHLA, setExpandedHLA] = useState<string | null>(null)
  const [expandedVaccine, setExpandedVaccine] = useState<string | null>(null)
  const [expandedPathogen, setExpandedPathogen] = useState<string | null>(null)
  const [expandedAutoimmune, setExpandedAutoimmune] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'hla' | 'vaccines' | 'pathogens' | 'autoimmune'>('hla')

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const getResponseColor = (response: string): string => {
    switch (response) {
      case 'strong': case 'low': return 'green'
      case 'moderate': return 'amber'
      case 'weak': case 'high': return 'red'
      default: return 'gray'
    }
  }

  const getResponseLabel = (response: string): string => {
    switch (response) {
      case 'strong': return 'FUERTE'
      case 'moderate': return 'MODERADA'
      case 'weak': return 'DEBIL'
      default: return response.toUpperCase()
    }
  }

  const getSusceptibilityLabel = (level: string): string => {
    switch (level) {
      case 'low': return 'BAJA'
      case 'moderate': return 'MODERADA'
      case 'high': return 'ALTA'
      default: return level.toUpperCase()
    }
  }

  const getRiskLabel = (risk: string): string => {
    switch (risk) {
      case 'low': return 'BAJO'
      case 'moderate': return 'MODERADO'
      case 'high': return 'ALTO'
      default: return risk.toUpperCase()
    }
  }

  const getResponseIcon = (response: string) => {
    switch (response) {
      case 'strong': case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'moderate': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'weak': case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getPresentationColor = (level: string) => {
    switch (level) {
      case 'strong': return 'green'
      case 'moderate': return 'amber'
      case 'weak': return 'red'
      default: return 'gray'
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full animate-spin opacity-20"></div>
            <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <Title className="text-title">Analizando tu perfil inmunologico...</Title>
          <Text className="text-body mt-2">Evaluando genotipos HLA y prediciendo respuestas inmunes</Text>
        </div>
      </Card>
    )
  }

  return (
    <div role="region" aria-label="Immune Response Predictor" className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950/20 dark:via-rose-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title className="text-title">{t('title')}</Title>
            <Text className="text-body">{t('description')}</Text>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Badge color="red" size="sm">
            {HLA_PROFILE.length} alelos HLA analizados
          </Badge>
          <Badge color="rose" size="sm">
            {VACCINE_RESPONSES.filter((v) => v.response === 'strong').length}/{VACCINE_RESPONSES.length} respuestas fuertes a vacunas
          </Badge>
        </div>
      </Card>

      {/* Section navigation */}
      <div className="flex gap-2 overflow-x-auto">
        <Button
          size="xs"
          variant={activeSection === 'hla' ? 'primary' : 'secondary'}
          icon={Dna}
          onClick={() => setActiveSection('hla')}
        >
          Perfil HLA
        </Button>
        <Button
          size="xs"
          variant={activeSection === 'vaccines' ? 'primary' : 'secondary'}
          icon={Syringe}
          onClick={() => setActiveSection('vaccines')}
        >
          Vacunas
        </Button>
        <Button
          size="xs"
          variant={activeSection === 'pathogens' ? 'primary' : 'secondary'}
          icon={Bug}
          onClick={() => setActiveSection('pathogens')}
        >
          Patogenos
        </Button>
        <Button
          size="xs"
          variant={activeSection === 'autoimmune' ? 'primary' : 'secondary'}
          icon={Activity}
          onClick={() => setActiveSection('autoimmune')}
        >
          Autoinmunidad
        </Button>
      </div>

      {/* === HLA PROFILE SECTION === */}
      {activeSection === 'hla' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Dna className="w-5 h-5 text-red-500" />
            <Title className="text-title">Tu Perfil de Genotipo HLA</Title>
          </div>
          <Text className="text-muted mb-4">
            El sistema HLA (Antigeno Leucocitario Humano) es el complejo genetico mas polimorfico del genoma humano.
            Determina como tu sistema inmune reconoce y responde a patogenos.
          </Text>
          <div className="space-y-3">
            {HLA_PROFILE.map((hla) => {
              const isExpanded = expandedHLA === hla.id
              return (
                <div key={hla.id} className="border border-adaptive rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedHLA(isExpanded ? null : hla.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-surface-soft transition-colors text-left"
                  >
                    <div className={`w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Shield className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-title">{hla.allele}</span>
                        <Badge color={getPresentationColor(hla.antigenPresentation)} size="xs">
                          {hla.antigenPresentation === 'strong' ? 'Fuerte' : hla.antigenPresentation === 'moderate' ? 'Moderada' : 'Debil'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">{hla.locus} — Frecuencia: {(hla.frequency * 100).toFixed(0)}%</p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-adaptive space-y-3 mt-3">
                      <p className="text-sm text-body">{hla.descriptionEs}</p>
                      <div className="p-3 bg-surface-soft rounded-xl">
                        <p className="text-xs font-medium text-muted uppercase mb-1">Nota Clinica</p>
                        <p className="text-sm text-body">{hla.clinicalNoteEs}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted" />
                        <span className="text-xs text-muted">Presentacion de antigenos: </span>
                        <Badge color={getPresentationColor(hla.antigenPresentation)} size="xs">
                          {hla.antigenPresentation === 'strong' ? 'Alta eficiencia' : hla.antigenPresentation === 'moderate' ? 'Eficiencia moderada' : 'Baja eficiencia'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* === VACCINE RESPONSE SECTION === */}
      {activeSection === 'vaccines' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Syringe className="w-5 h-5 text-blue-500" />
            <Title className="text-title">Predicciones de Respuesta a Vacunas</Title>
          </div>
          <Text className="text-muted mb-4">
            Basado en tu genotipo HLA, predecimos la fuerza de tu respuesta inmune a diferentes vacunas.
          </Text>
          <div className="space-y-3">
            {VACCINE_RESPONSES.map((vaccine) => {
              const isExpanded = expandedVaccine === vaccine.id
              return (
                <div key={vaccine.id} className="border border-adaptive rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedVaccine(isExpanded ? null : vaccine.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-surface-soft transition-colors text-left"
                  >
                    {getResponseIcon(vaccine.response)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-title">{vaccine.vaccineEs}</span>
                        <Badge color={getResponseColor(vaccine.response)} size="xs">
                          {getResponseLabel(vaccine.response)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">HLA clave: {vaccine.keyHLA}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-bold ${vaccine.response === 'strong' ? 'text-green-600 dark:text-green-400' : vaccine.response === 'moderate' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                        {vaccine.confidence}%
                      </span>
                      <p className="text-xs text-muted">confianza</p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-adaptive space-y-3 mt-3">
                      <p className="text-sm text-body">{vaccine.explanationEs}</p>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase mb-1">Recomendacion de Refuerzo</p>
                        <p className="text-sm text-body">{vaccine.boosterRecommendationEs}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              <p className="font-semibold text-title">Resumen de Respuesta Vacunal</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {VACCINE_RESPONSES.filter((v) => v.response === 'strong').length}
                </span>
                <p className="text-xs text-muted">Respuesta Fuerte</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {VACCINE_RESPONSES.filter((v) => v.response === 'moderate').length}
                </span>
                <p className="text-xs text-muted">Respuesta Moderada</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {VACCINE_RESPONSES.filter((v) => v.response === 'weak').length}
                </span>
                <p className="text-xs text-muted">Respuesta Debil</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* === PATHOGEN SUSCEPTIBILITY SECTION === */}
      {activeSection === 'pathogens' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bug className="w-5 h-5 text-purple-500" />
            <Title className="text-title">Susceptibilidad a Patogenos</Title>
          </div>
          <Text className="text-muted mb-4">
            Ciertos alelos HLA confieren resistencia o susceptibilidad a patogenos especificos. Evaluamos tu perfil.
          </Text>
          <div className="space-y-3">
            {PATHOGEN_SUSCEPTIBILITY.map((pathogen) => {
              const isExpanded = expandedPathogen === pathogen.id
              return (
                <div key={pathogen.id} className="border border-adaptive rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedPathogen(isExpanded ? null : pathogen.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-surface-soft transition-colors text-left"
                  >
                    {getResponseIcon(pathogen.susceptibility === 'low' ? 'strong' : pathogen.susceptibility === 'moderate' ? 'moderate' : 'weak')}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-title">{pathogen.pathogenEs}</span>
                        <Badge color={getResponseColor(pathogen.susceptibility)} size="xs">
                          Susceptibilidad {getSusceptibilityLabel(pathogen.susceptibility)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">
                        Alelo protector: {pathogen.protectiveAllele}
                        {pathogen.hasProtectiveAllele ? ' (lo tienes)' : ' (ausente)'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {pathogen.hasProtectiveAllele ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-adaptive space-y-3 mt-3">
                      <p className="text-sm text-body">{pathogen.explanationEs}</p>
                      <div className="p-3 bg-surface-soft rounded-xl">
                        <p className="text-xs font-medium text-muted uppercase mb-1">Prevalencia Global</p>
                        <p className="text-sm text-body">{pathogen.globalPrevalenceEs}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted" />
                        <span className="text-xs text-muted">Alelo protector: </span>
                        <Badge color={pathogen.hasProtectiveAllele ? 'green' : 'gray'} size="xs">
                          {pathogen.protectiveAllele} — {pathogen.hasProtectiveAllele ? 'Presente en tu genoma' : 'No detectado'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* === AUTOIMMUNE RISK SECTION === */}
      {activeSection === 'autoimmune' && (
        <>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-rose-500" />
              <Title className="text-title">Riesgo Autoinmune</Title>
            </div>
            <Text className="text-muted mb-4">
              Muchas enfermedades autoinmunes tienen fuertes asociaciones con alelos HLA especificos.
              Evaluamos tu riesgo relativo basado en tu genotipo.
            </Text>
            <div className="space-y-3">
              {AUTOIMMUNE_RISKS.map((condition) => {
                const isExpanded = expandedAutoimmune === condition.id
                return (
                  <div key={condition.id} className="border border-adaptive rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedAutoimmune(isExpanded ? null : condition.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-surface-soft transition-colors text-left"
                    >
                      {getResponseIcon(condition.risk === 'low' ? 'strong' : condition.risk === 'moderate' ? 'moderate' : 'weak')}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-title">{condition.conditionEs}</span>
                          <Badge color={getResponseColor(condition.risk)} size="xs">
                            Riesgo {getRiskLabel(condition.risk)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted">HLA asociado: {condition.associatedHLA}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {condition.userHasRiskAllele ? (
                          <Badge color="amber" size="xs">Presente</Badge>
                        ) : (
                          <Badge color="green" size="xs">Ausente</Badge>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-adaptive space-y-3 mt-3">
                        <p className="text-sm text-body">{condition.explanationEs}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-surface-soft rounded-xl">
                            <p className="text-xs font-medium text-muted uppercase mb-1">Odds Ratio</p>
                            <p className="text-lg font-bold text-title">{condition.oddsRatio}x</p>
                            <p className="text-xs text-muted">
                              {condition.oddsRatio > 1 ? 'Mayor que promedio' : 'Menor que promedio'}
                            </p>
                          </div>
                          <div className="p-3 bg-surface-soft rounded-xl">
                            <p className="text-xs font-medium text-muted uppercase mb-1">Prevalencia</p>
                            <p className="text-sm text-body">{condition.prevalenceEs}</p>
                          </div>
                        </div>
                        {condition.userHasRiskAllele && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase">Nota</p>
                            </div>
                            <p className="text-sm text-body">
                              Portas el alelo de riesgo {condition.associatedHLA}. Recuerda que tener el alelo de riesgo
                              no significa que desarrollaras la enfermedad — la mayoria de portadores nunca lo hacen.
                              Factores ambientales juegan un rol crucial.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Overall autoimmune summary */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="font-semibold text-title">Resumen de Riesgo Autoinmune</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {AUTOIMMUNE_RISKS.filter((a) => a.risk === 'low').length}
                </span>
                <p className="text-xs text-muted">Riesgo Bajo</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {AUTOIMMUNE_RISKS.filter((a) => a.risk === 'moderate').length}
                </span>
                <p className="text-xs text-muted">Riesgo Moderado</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {AUTOIMMUNE_RISKS.filter((a) => a.risk === 'high').length}
                </span>
                <p className="text-xs text-muted">Riesgo Alto</p>
              </div>
            </div>
            <p className="text-sm text-body">
              Tu perfil HLA muestra riesgo moderado para esclerosis multiple y narcolepsia tipo 1 debido a
              DRB1*15:01 y DQB1*06:02. Sin embargo, DQB1*06:02 es protector contra diabetes tipo 1, y
              la ausencia de DQ2.5/DQ8 esencialmente excluye enfermedad celiaca.
            </p>
          </Card>
        </>
      )}

      {/* AlphaGenome Integration Note */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-title">Prediccion AlphaGenome</p>
            <p className="text-sm text-body mt-1">
              AlphaGenome analiza las regiones regulatorias alrededor de tus genes HLA para predecir niveles de expresion
              en diferentes tejidos inmunes. Los alelos con mayor expresion en celulas presentadoras de antigenos
              generalmente producen respuestas inmunes mas robustas.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge color="purple" size="xs">Expresion en timo: Alta</Badge>
              <Badge color="purple" size="xs">Expresion en bazo: Alta</Badge>
              <Badge color="indigo" size="xs">Expresion en ganglios: Moderada</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-surface-soft">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-body">
              <strong>Aviso importante:</strong> Estas predicciones son educativas e informativas. Las asociaciones HLA
              son probabilisticas, no deterministas. La respuesta inmune real depende de multiples factores
              incluyendo edad, estado de salud, medicamentos e historia de exposicion. Consulta siempre
              con un profesional de salud para decisiones medicas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
