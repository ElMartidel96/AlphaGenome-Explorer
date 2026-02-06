'use client'

import { useState } from 'react'
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
  Users,
  Heart,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  Plus,
  UserCircle,
  Baby,
  Shield,
  Dna,
  Activity,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

// Types for family members and conditions
interface FamilyMember {
  id: string
  relationship: 'self' | 'mother' | 'father' | 'sibling' | 'maternal_grandmother' | 'maternal_grandfather' | 'paternal_grandmother' | 'paternal_grandfather' | 'child'
  name: string
  sex: 'male' | 'female'
  alive: boolean
  conditions: string[]
  age?: number
  ageAtDeath?: number
}

interface HereditaryCondition {
  id: string
  name: string
  nameEs: string
  gene: string
  inheritance: 'autosomal_dominant' | 'autosomal_recessive' | 'x_linked' | 'multifactorial'
  baseRisk: number
  description: string
  descriptionEs: string
  screeningAge: number
  screenings: string[]
}

// Demo hereditary conditions
const HEREDITARY_CONDITIONS: HereditaryCondition[] = [
  {
    id: 'brca',
    name: 'Breast/Ovarian Cancer (BRCA)',
    nameEs: 'Cáncer de Mama/Ovario (BRCA)',
    gene: 'BRCA1/BRCA2',
    inheritance: 'autosomal_dominant',
    baseRisk: 0.12,
    description: 'Hereditary breast and ovarian cancer syndrome',
    descriptionEs: 'Síndrome de cáncer hereditario de mama y ovario',
    screeningAge: 25,
    screenings: ['Mammogram', 'MRI', 'CA-125', 'Genetic testing'],
  },
  {
    id: 'lynch',
    name: 'Lynch Syndrome (Colorectal)',
    nameEs: 'Síndrome de Lynch (Colorrectal)',
    gene: 'MLH1/MSH2/MSH6/PMS2',
    inheritance: 'autosomal_dominant',
    baseRisk: 0.05,
    description: 'Hereditary nonpolyposis colorectal cancer',
    descriptionEs: 'Cáncer colorrectal hereditario sin poliposis',
    screeningAge: 20,
    screenings: ['Colonoscopy', 'Genetic testing'],
  },
  {
    id: 'cf',
    name: 'Cystic Fibrosis',
    nameEs: 'Fibrosis Quística',
    gene: 'CFTR',
    inheritance: 'autosomal_recessive',
    baseRisk: 0.0004,
    description: 'Genetic disorder affecting lungs and digestive system',
    descriptionEs: 'Trastorno genético que afecta pulmones y sistema digestivo',
    screeningAge: 0,
    screenings: ['Sweat test', 'Genetic carrier screening'],
  },
  {
    id: 'hemophilia',
    name: 'Hemophilia',
    nameEs: 'Hemofilia',
    gene: 'F8/F9',
    inheritance: 'x_linked',
    baseRisk: 0.0001,
    description: 'Blood clotting disorder',
    descriptionEs: 'Trastorno de coagulación sanguínea',
    screeningAge: 0,
    screenings: ['Clotting factor tests', 'Genetic testing'],
  },
  {
    id: 't2d',
    name: 'Type 2 Diabetes',
    nameEs: 'Diabetes Tipo 2',
    gene: 'TCF7L2/PPARG/+',
    inheritance: 'multifactorial',
    baseRisk: 0.10,
    description: 'Complex genetic and lifestyle condition',
    descriptionEs: 'Condición compleja genética y de estilo de vida',
    screeningAge: 45,
    screenings: ['Fasting glucose', 'HbA1c', 'Lifestyle assessment'],
  },
  {
    id: 'heart',
    name: 'Coronary Heart Disease',
    nameEs: 'Enfermedad Coronaria',
    gene: 'LDLR/APOB/PCSK9',
    inheritance: 'multifactorial',
    baseRisk: 0.08,
    description: 'Complex cardiovascular condition',
    descriptionEs: 'Condición cardiovascular compleja',
    screeningAge: 40,
    screenings: ['Lipid panel', 'Blood pressure', 'Calcium score CT'],
  },
]

// Initial family members
const INITIAL_FAMILY: FamilyMember[] = [
  { id: 'self', relationship: 'self', name: 'You', sex: 'female', alive: true, conditions: [], age: 30 },
  { id: 'mother', relationship: 'mother', name: 'Mother', sex: 'female', alive: true, conditions: [], age: 58 },
  { id: 'father', relationship: 'father', name: 'Father', sex: 'male', alive: true, conditions: [], age: 60 },
]

export function FamilyRiskAssessment() {
  const t = useTranslations()
  const [step, setStep] = useState<'intro' | 'family' | 'conditions' | 'analysis' | 'results'>('intro')
  const [family, setFamily] = useState<FamilyMember[]>(INITIAL_FAMILY)
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [showPunnett, setShowPunnett] = useState<string | null>(null)
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Get locale-aware text
  const isSpanish = t('locale') === 'es'

  // Add family member
  const addFamilyMember = (relationship: FamilyMember['relationship']) => {
    const relationshipNames: Record<string, { en: string; es: string; sex: 'male' | 'female' }> = {
      sibling: { en: 'Sibling', es: 'Hermano/a', sex: 'female' },
      maternal_grandmother: { en: 'Maternal Grandmother', es: 'Abuela Materna', sex: 'female' },
      maternal_grandfather: { en: 'Maternal Grandfather', es: 'Abuelo Materno', sex: 'male' },
      paternal_grandmother: { en: 'Paternal Grandmother', es: 'Abuela Paterna', sex: 'female' },
      paternal_grandfather: { en: 'Paternal Grandfather', es: 'Abuelo Paterno', sex: 'male' },
      child: { en: 'Child', es: 'Hijo/a', sex: 'female' },
    }
    const info = relationshipNames[relationship] || { en: 'Member', es: 'Miembro', sex: 'female' }
    const newMember: FamilyMember = {
      id: `${relationship}_${Date.now()}`,
      relationship,
      name: isSpanish ? info.es : info.en,
      sex: info.sex,
      alive: true,
      conditions: [],
    }
    setFamily([...family, newMember])
  }

  // Toggle condition for a family member
  const toggleCondition = (memberId: string, conditionId: string) => {
    setFamily(family.map(member => {
      if (member.id === memberId) {
        const hasCondition = member.conditions.includes(conditionId)
        return {
          ...member,
          conditions: hasCondition
            ? member.conditions.filter(c => c !== conditionId)
            : [...member.conditions, conditionId],
        }
      }
      return member
    }))
  }

  // Calculate risk for a condition based on family history
  const calculateRisk = (conditionId: string): { risk: number; factors: string[]; inheritance: string } => {
    const condition = HEREDITARY_CONDITIONS.find(c => c.id === conditionId)
    if (!condition) return { risk: 0, factors: [], inheritance: '' }

    let risk = condition.baseRisk
    const factors: string[] = []

    // Count affected family members
    const affectedParents = family.filter(m =>
      (m.relationship === 'mother' || m.relationship === 'father') &&
      m.conditions.includes(conditionId)
    ).length

    const affectedGrandparents = family.filter(m =>
      m.relationship.includes('grandmother') || m.relationship.includes('grandfather')
    ).filter(m => m.conditions.includes(conditionId)).length

    const affectedSiblings = family.filter(m =>
      m.relationship === 'sibling' && m.conditions.includes(conditionId)
    ).length

    // Calculate risk based on inheritance pattern
    switch (condition.inheritance) {
      case 'autosomal_dominant':
        if (affectedParents >= 1) {
          risk = 0.50 // 50% if one parent affected
          factors.push(isSpanish ? 'Padre/Madre afectado: 50% probabilidad' : 'Parent affected: 50% probability')
        }
        if (affectedGrandparents >= 1 && affectedParents === 0) {
          risk = 0.25
          factors.push(isSpanish ? 'Abuelo afectado: 25% probabilidad' : 'Grandparent affected: 25% probability')
        }
        break

      case 'autosomal_recessive':
        if (affectedParents === 2) {
          risk = 1.0 // Both parents carriers = 100%
          factors.push(isSpanish ? 'Ambos padres portadores: 100%' : 'Both parents carriers: 100%')
        } else if (affectedSiblings >= 1) {
          risk = 0.25 // Sibling affected = 25% chance
          factors.push(isSpanish ? 'Hermano afectado: 25% probabilidad' : 'Sibling affected: 25% probability')
        } else if (affectedParents === 1) {
          risk = 0.50 // Carrier risk
          factors.push(isSpanish ? 'Un padre portador: 50% ser portador' : 'One parent carrier: 50% carrier risk')
        }
        break

      case 'x_linked':
        const self = family.find(m => m.relationship === 'self')
        if (self?.sex === 'male') {
          if (family.find(m => m.relationship === 'mother')?.conditions.includes(conditionId)) {
            risk = 0.50
            factors.push(isSpanish ? 'Madre portadora: 50% para hijos varones' : 'Mother carrier: 50% for male children')
          }
        } else {
          risk = 0.00 // Females rarely affected, usually carriers
          factors.push(isSpanish ? 'Mujeres usualmente portadoras' : 'Females usually carriers only')
        }
        break

      case 'multifactorial':
        // Increase risk based on number of affected relatives
        if (affectedParents >= 1) {
          risk = risk * 2.5
          factors.push(isSpanish ? 'Padre/Madre afectado: riesgo 2.5x' : 'Parent affected: 2.5x risk')
        }
        if (affectedGrandparents >= 2) {
          risk = risk * 1.5
          factors.push(isSpanish ? 'Múltiples abuelos: riesgo 1.5x' : 'Multiple grandparents: 1.5x risk')
        }
        if (affectedSiblings >= 1) {
          risk = risk * 2.0
          factors.push(isSpanish ? 'Hermano afectado: riesgo 2x' : 'Sibling affected: 2x risk')
        }
        risk = Math.min(risk, 0.85) // Cap at 85%
        break
    }

    return {
      risk: Math.min(risk, 1.0),
      factors,
      inheritance: condition.inheritance,
    }
  }

  // Run analysis
  const runAnalysis = () => {
    setStep('analysis')
    setAnalysisProgress(0)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setAnalysisComplete(true)
          setTimeout(() => setStep('results'), 500)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  // Punnett square component
  const PunnettSquare = ({ condition }: { condition: HereditaryCondition }) => {
    const isRecessive = condition.inheritance === 'autosomal_recessive'
    const isDominant = condition.inheritance === 'autosomal_dominant'

    // Assume one carrier parent, one non-carrier for demo
    const parent1 = isDominant ? ['A', 'a'] : ['C', 'c'] // Affected/Carrier
    const parent2 = isDominant ? ['a', 'a'] : ['C', 'c'] // Normal/Carrier

    return (
      <div className="bg-surface-soft rounded-lg p-4 mt-3">
        <p className="text-sm font-medium text-body mb-3">
          {isSpanish ? 'Cuadro de Punnett - Herencia' : 'Punnett Square - Inheritance'}
        </p>
        <div className="grid grid-cols-3 gap-1 max-w-[200px] text-center text-sm">
          <div className="bg-blue-100 p-2 rounded font-medium">&nbsp;</div>
          <div className="bg-blue-100 p-2 rounded font-medium">{parent2[0]}</div>
          <div className="bg-blue-100 p-2 rounded font-medium">{parent2[1]}</div>

          <div className="bg-pink-100 p-2 rounded font-medium">{parent1[0]}</div>
          <div className={`p-2 rounded ${isDominant || !isRecessive ? 'bg-red-100 text-red-800' : 'bg-green-100'}`}>
            {parent1[0]}{parent2[0]}
          </div>
          <div className={`p-2 rounded ${isDominant ? 'bg-red-100 text-red-800' : 'bg-yellow-100'}`}>
            {parent1[0]}{parent2[1]}
          </div>

          <div className="bg-pink-100 p-2 rounded font-medium">{parent1[1]}</div>
          <div className={`p-2 rounded ${isDominant ? 'bg-green-100' : 'bg-yellow-100'}`}>
            {parent1[1]}{parent2[0]}
          </div>
          <div className={`p-2 rounded ${isRecessive ? 'bg-red-100 text-red-800' : 'bg-green-100'}`}>
            {parent1[1]}{parent2[1]}
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-body">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span>{isSpanish ? 'Afectado' : 'Affected'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 rounded"></div>
            <span>{isSpanish ? 'Portador' : 'Carrier'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span>{isSpanish ? 'No afectado' : 'Unaffected'}</span>
          </div>
        </div>
      </div>
    )
  }

  // Intro step
  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-pink-600" />
            </div>
            <div className="flex-1">
              <Title>{t('tools.familyRisk.title')}</Title>
              <Text className="mt-1">
                {t('tools.familyRisk.description')}
              </Text>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-purple-700">
              <Dna className="w-5 h-5" />
              <span className="font-semibold">
                {isSpanish ? '¿Cómo funciona?' : 'How does it work?'}
              </span>
            </div>

            <div className="grid gap-3">
              {[
                {
                  icon: UserCircle,
                  title: isSpanish ? '1. Construye tu árbol familiar' : '1. Build your family tree',
                  desc: isSpanish ? 'Añade padres, abuelos, hermanos' : 'Add parents, grandparents, siblings',
                },
                {
                  icon: Heart,
                  title: isSpanish ? '2. Marca condiciones de salud' : '2. Mark health conditions',
                  desc: isSpanish ? 'Indica quién ha tenido cada condición' : 'Indicate who has had each condition',
                },
                {
                  icon: Activity,
                  title: isSpanish ? '3. Analiza patrones hereditarios' : '3. Analyze hereditary patterns',
                  desc: isSpanish ? 'Dominante, recesivo, ligado al X' : 'Dominant, recessive, X-linked',
                },
                {
                  icon: Shield,
                  title: isSpanish ? '4. Recibe recomendaciones' : '4. Get recommendations',
                  desc: isSpanish ? 'Chequeos preventivos personalizados' : 'Personalized preventive screenings',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-surface-soft rounded-lg">
                  <item.icon className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-title">{item.title}</p>
                    <p className="text-sm text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                {isSpanish ? 'Importante' : 'Important'}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {isSpanish
                  ? 'Esta herramienta es educativa. No reemplaza el consejo genético profesional. Consulta a un genetista para evaluaciones reales.'
                  : 'This tool is educational. It does not replace professional genetic counseling. Consult a geneticist for real evaluations.'}
              </p>
            </div>
          </div>
        </Card>

        <Button
          size="lg"
          icon={ChevronRight}
          onClick={() => setStep('family')}
          className="w-full"
        >
          {isSpanish ? 'Comenzar' : 'Get Started'}
        </Button>
      </div>
    )
  }

  // Family building step
  if (step === 'family') {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <UserCircle className="w-6 h-6 text-pink-600" />
              <Title>{isSpanish ? 'Tu Árbol Familiar' : 'Your Family Tree'}</Title>
            </div>
            <Badge color="blue">
              {isSpanish ? `${family.length} miembros` : `${family.length} members`}
            </Badge>
          </div>

          {/* Family members */}
          <div className="space-y-3">
            {family.map(member => (
              <div
                key={member.id}
                className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedMember === member.id
                    ? 'border-pink-500 bg-pink-soft'
                    : 'border-adaptive hover:border-pink-300'
                }`}
                onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.sex === 'female' ? 'bg-pink-100' : 'bg-blue-100'
                    }`}>
                      <UserCircle className={`w-6 h-6 ${
                        member.sex === 'female' ? 'text-pink-600' : 'text-info'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-title">{member.name}</p>
                      <p className="text-sm text-muted">
                        {member.relationship === 'self' && (isSpanish ? 'Tú' : 'You')}
                        {member.relationship === 'mother' && (isSpanish ? 'Madre' : 'Mother')}
                        {member.relationship === 'father' && (isSpanish ? 'Padre' : 'Father')}
                        {member.relationship === 'sibling' && (isSpanish ? 'Hermano/a' : 'Sibling')}
                        {member.relationship === 'maternal_grandmother' && (isSpanish ? 'Abuela Materna' : 'Maternal Grandmother')}
                        {member.relationship === 'maternal_grandfather' && (isSpanish ? 'Abuelo Materno' : 'Maternal Grandfather')}
                        {member.relationship === 'paternal_grandmother' && (isSpanish ? 'Abuela Paterna' : 'Paternal Grandmother')}
                        {member.relationship === 'paternal_grandfather' && (isSpanish ? 'Abuelo Paterno' : 'Paternal Grandfather')}
                        {member.relationship === 'child' && (isSpanish ? 'Hijo/a' : 'Child')}
                      </p>
                    </div>
                  </div>
                  {member.conditions.length > 0 && (
                    <Badge color="orange">
                      {member.conditions.length} {isSpanish ? 'condiciones' : 'conditions'}
                    </Badge>
                  )}
                </div>

                {/* Condition editing for selected member */}
                {selectedMember === member.id && (
                  <div className="mt-4 pt-4 border-t border-adaptive">
                    <p className="text-sm font-medium text-body mb-2">
                      {isSpanish ? 'Condiciones de salud:' : 'Health conditions:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {HEREDITARY_CONDITIONS.map(condition => (
                        <button
                          key={condition.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCondition(member.id, condition.id)
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            member.conditions.includes(condition.id)
                              ? 'bg-warning-muted0 text-white'
                              : 'bg-surface-muted text-body hover:bg-gray-200'
                          }`}
                        >
                          {isSpanish ? condition.nameEs : condition.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add family member buttons */}
          <div className="mt-4 pt-4 border-t border-adaptive">
            <p className="text-sm font-medium text-body mb-3">
              {isSpanish ? 'Añadir familiar:' : 'Add family member:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {!family.find(m => m.relationship === 'maternal_grandmother') && (
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Plus}
                  onClick={() => addFamilyMember('maternal_grandmother')}
                >
                  {isSpanish ? 'Abuela Materna' : 'Maternal Grandmother'}
                </Button>
              )}
              {!family.find(m => m.relationship === 'maternal_grandfather') && (
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Plus}
                  onClick={() => addFamilyMember('maternal_grandfather')}
                >
                  {isSpanish ? 'Abuelo Materno' : 'Maternal Grandfather'}
                </Button>
              )}
              {!family.find(m => m.relationship === 'paternal_grandmother') && (
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Plus}
                  onClick={() => addFamilyMember('paternal_grandmother')}
                >
                  {isSpanish ? 'Abuela Paterna' : 'Paternal Grandmother'}
                </Button>
              )}
              {!family.find(m => m.relationship === 'paternal_grandfather') && (
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Plus}
                  onClick={() => addFamilyMember('paternal_grandfather')}
                >
                  {isSpanish ? 'Abuelo Paterno' : 'Paternal Grandfather'}
                </Button>
              )}
              <Button
                size="xs"
                variant="secondary"
                icon={Plus}
                onClick={() => addFamilyMember('sibling')}
              >
                {isSpanish ? 'Hermano/a' : 'Sibling'}
              </Button>
              <Button
                size="xs"
                variant="secondary"
                icon={Plus}
                onClick={() => addFamilyMember('child')}
              >
                {isSpanish ? 'Hijo/a' : 'Child'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setStep('intro')}
          >
            {isSpanish ? 'Atrás' : 'Back'}
          </Button>
          <Button
            icon={ChevronRight}
            onClick={() => setStep('conditions')}
            className="flex-1"
          >
            {isSpanish ? 'Siguiente: Seleccionar Condiciones' : 'Next: Select Conditions'}
          </Button>
        </div>
      </div>
    )
  }

  // Conditions selection step
  if (step === 'conditions') {
    const familyConditions = new Set(family.flatMap(m => m.conditions))

    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <Title>{isSpanish ? 'Condiciones a Analizar' : 'Conditions to Analyze'}</Title>
          </div>

          <Text className="mb-4">
            {isSpanish
              ? 'Selecciona las condiciones hereditarias que deseas analizar en tu familia.'
              : 'Select the hereditary conditions you want to analyze in your family.'}
          </Text>

          <div className="space-y-3">
            {HEREDITARY_CONDITIONS.map(condition => {
              const isSelected = selectedConditions.includes(condition.id)
              const familyHas = familyConditions.has(condition.id)

              return (
                <div
                  key={condition.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-red-500 bg-danger-soft'
                      : familyHas
                        ? 'border-orange-300 bg-warning-muted'
                        : 'border-adaptive hover:border-adaptive'
                  }`}
                  onClick={() => {
                    setSelectedConditions(prev =>
                      isSelected
                        ? prev.filter(c => c !== condition.id)
                        : [...prev, condition.id]
                    )
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-title">
                          {isSpanish ? condition.nameEs : condition.name}
                        </p>
                        {familyHas && (
                          <Badge color="orange" size="xs">
                            {isSpanish ? 'En familia' : 'In family'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted mt-1">
                        <span className="font-mono text-xs bg-surface-muted px-1 rounded">
                          {condition.gene}
                        </span>
                        {' • '}
                        {condition.inheritance === 'autosomal_dominant' && (isSpanish ? 'Dominante' : 'Dominant')}
                        {condition.inheritance === 'autosomal_recessive' && (isSpanish ? 'Recesivo' : 'Recessive')}
                        {condition.inheritance === 'x_linked' && (isSpanish ? 'Ligado al X' : 'X-Linked')}
                        {condition.inheritance === 'multifactorial' && (isSpanish ? 'Multifactorial' : 'Multifactorial')}
                      </p>
                      <p className="text-sm text-body mt-2">
                        {isSpanish ? condition.descriptionEs : condition.description}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-red-500 bg-danger-soft0'
                        : 'border-adaptive'
                    }`}>
                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setStep('family')}
          >
            {isSpanish ? 'Atrás' : 'Back'}
          </Button>
          <Button
            icon={Activity}
            onClick={runAnalysis}
            disabled={selectedConditions.length === 0}
            className="flex-1"
          >
            {isSpanish
              ? `Analizar ${selectedConditions.length} Condiciones`
              : `Analyze ${selectedConditions.length} Conditions`}
          </Button>
        </div>
      </div>
    )
  }

  // Analysis progress step
  if (step === 'analysis') {
    return (
      <div className="space-y-6">
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Dna className="w-10 h-10 text-accent" />
          </div>
          <Title>
            {isSpanish ? 'Analizando Patrones Hereditarios...' : 'Analyzing Hereditary Patterns...'}
          </Title>
          <Text className="mt-2 mb-6">
            {isSpanish
              ? 'Calculando riesgos basados en tu historial familiar'
              : 'Calculating risks based on your family history'}
          </Text>
          <div className="max-w-md mx-auto">
            <ProgressBar value={analysisProgress} color="purple" className="mt-4" />
            <p className="text-sm text-muted mt-2">{analysisProgress}%</p>
          </div>

          {analysisProgress > 30 && (
            <div className="mt-6 text-sm text-body animate-fade-in">
              {isSpanish ? '✓ Árbol familiar procesado' : '✓ Family tree processed'}
            </div>
          )}
          {analysisProgress > 60 && (
            <div className="text-sm text-body animate-fade-in">
              {isSpanish ? '✓ Patrones de herencia identificados' : '✓ Inheritance patterns identified'}
            </div>
          )}
          {analysisProgress > 90 && (
            <div className="text-sm text-body animate-fade-in">
              {isSpanish ? '✓ Calculando probabilidades...' : '✓ Calculating probabilities...'}
            </div>
          )}
        </Card>
      </div>
    )
  }

  // Results step
  if (step === 'results') {
    const results = selectedConditions.map(conditionId => {
      const condition = HEREDITARY_CONDITIONS.find(c => c.id === conditionId)!
      const riskData = calculateRisk(conditionId)
      return { condition, ...riskData }
    }).sort((a, b) => b.risk - a.risk)

    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-success" />
            <div>
              <Title>{isSpanish ? 'Análisis Completado' : 'Analysis Complete'}</Title>
              <Text>
                {isSpanish
                  ? `Analizamos ${selectedConditions.length} condiciones en ${family.length} familiares`
                  : `Analyzed ${selectedConditions.length} conditions across ${family.length} family members`}
              </Text>
            </div>
          </div>
        </Card>

        {/* Risk results */}
        <div className="space-y-4">
          {results.map(({ condition, risk, factors, inheritance }) => {
            const riskLevel = risk > 0.3 ? 'high' : risk > 0.15 ? 'moderate' : 'low'
            const riskColor = riskLevel === 'high' ? 'red' : riskLevel === 'moderate' ? 'orange' : 'green'

            return (
              <Card key={condition.id}>
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedRisk(expandedRisk === condition.id ? null : condition.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-title">
                          {isSpanish ? condition.nameEs : condition.name}
                        </p>
                        <Badge color={riskColor}>
                          {riskLevel === 'high' && (isSpanish ? 'Alto' : 'High')}
                          {riskLevel === 'moderate' && (isSpanish ? 'Moderado' : 'Moderate')}
                          {riskLevel === 'low' && (isSpanish ? 'Bajo' : 'Low')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted mt-1">
                        <span className="font-mono text-xs bg-surface-muted px-1 rounded">
                          {condition.gene}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-2xl font-bold text-${riskColor}-600`}>
                          {(risk * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted">
                          {isSpanish ? 'Riesgo estimado' : 'Estimated risk'}
                        </p>
                      </div>
                      {expandedRisk === condition.id ? (
                        <ChevronUp className="w-5 h-5 text-subtle" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-subtle" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <ProgressBar value={risk * 100} color={riskColor} />
                  </div>
                </div>

                {/* Expanded details */}
                {expandedRisk === condition.id && (
                  <div className="mt-4 pt-4 border-t border-adaptive space-y-4">
                    {/* Risk factors */}
                    {factors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-body mb-2">
                          {isSpanish ? 'Factores de riesgo identificados:' : 'Identified risk factors:'}
                        </p>
                        <div className="space-y-1">
                          {factors.map((factor, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-body">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inheritance pattern */}
                    <div>
                      <p className="text-sm font-medium text-body mb-2">
                        {isSpanish ? 'Patrón de herencia:' : 'Inheritance pattern:'}
                      </p>
                      <Badge color="purple">
                        {inheritance === 'autosomal_dominant' && (isSpanish ? 'Autosómico Dominante' : 'Autosomal Dominant')}
                        {inheritance === 'autosomal_recessive' && (isSpanish ? 'Autosómico Recesivo' : 'Autosomal Recessive')}
                        {inheritance === 'x_linked' && (isSpanish ? 'Ligado al Cromosoma X' : 'X-Linked')}
                        {inheritance === 'multifactorial' && (isSpanish ? 'Multifactorial' : 'Multifactorial')}
                      </Badge>
                    </div>

                    {/* Punnett square for mendelian inheritance */}
                    {(inheritance === 'autosomal_dominant' || inheritance === 'autosomal_recessive') && (
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPunnett(showPunnett === condition.id ? null : condition.id)
                          }}
                          className="text-sm text-accent hover:text-purple-800 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          {showPunnett === condition.id
                            ? (isSpanish ? 'Ocultar Cuadro de Punnett' : 'Hide Punnett Square')
                            : (isSpanish ? 'Ver Cuadro de Punnett' : 'Show Punnett Square')
                          }
                        </button>
                        {showPunnett === condition.id && <PunnettSquare condition={condition} />}
                      </div>
                    )}

                    {/* Screening recommendations */}
                    <div className="bg-info-soft rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-info" />
                        <p className="font-medium text-blue-800">
                          {isSpanish ? 'Recomendaciones de Screening' : 'Screening Recommendations'}
                        </p>
                      </div>
                      <p className="text-sm text-blue-700 mb-2">
                        {isSpanish
                          ? `Comenzar a los ${condition.screeningAge} años:`
                          : `Start at age ${condition.screeningAge}:`}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {condition.screenings.map((screening, idx) => (
                          <Badge key={idx} color="blue" size="sm">
                            {screening}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Action buttons */}
        <Grid numItems={1} numItemsSm={2} className="gap-4">
          <Col>
            <Card className="h-full bg-success-soft cursor-pointer hover:bg-green-100 transition-colors">
              <div className="flex items-center gap-3">
                <Baby className="w-8 h-8 text-success" />
                <div>
                  <p className="font-medium text-green-800">
                    {isSpanish ? 'Planificación Familiar' : 'Family Planning'}
                  </p>
                  <p className="text-sm text-success">
                    {isSpanish ? 'Consultar con genetista' : 'Consult with geneticist'}
                  </p>
                </div>
              </div>
            </Card>
          </Col>
          <Col>
            <Card className="h-full bg-accent-soft cursor-pointer hover:bg-purple-100 transition-colors">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-accent" />
                <div>
                  <p className="font-medium text-purple-800">
                    {isSpanish ? 'Test Genético' : 'Genetic Testing'}
                  </p>
                  <p className="text-sm text-accent">
                    {isSpanish ? 'Confirmar portador' : 'Confirm carrier status'}
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Grid>

        {/* Disclaimer */}
        <Card className="bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                {isSpanish ? 'Aviso Importante' : 'Important Notice'}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {isSpanish
                  ? 'Estos cálculos son estimaciones educativas basadas en patrones generales de herencia. El riesgo real puede variar. Siempre consulta con un profesional de genética médica para asesoramiento personalizado.'
                  : 'These calculations are educational estimates based on general inheritance patterns. Actual risk may vary. Always consult with a medical genetics professional for personalized counseling.'}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setStep('intro')
              setFamily(INITIAL_FAMILY)
              setSelectedConditions([])
              setAnalysisComplete(false)
              setAnalysisProgress(0)
            }}
          >
            {isSpanish ? 'Nuevo Análisis' : 'New Analysis'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setStep('family')}
            className="flex-1"
          >
            {isSpanish ? 'Modificar Familia' : 'Modify Family'}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
