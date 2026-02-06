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
  Search,
  Fingerprint,
  Dna,
  UserCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  AlertTriangle,
  Info,
  Eye,
  Lock,
  Unlock,
  Star,
  Target,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

// DNA Profile marker type
interface DnaMarker {
  locus: string
  allele1: number
  allele2: number
}

// Suspect type
interface Suspect {
  id: string
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  profile: DnaMarker[]
  isGuilty: boolean
}

// Case type
interface Case {
  id: string
  title: string
  titleEs: string
  description: string
  descriptionEs: string
  difficulty: 'easy' | 'medium' | 'hard'
  crimeSceneProfile: DnaMarker[]
  suspects: Suspect[]
  hint: string
  hintEs: string
  explanation: string
  explanationEs: string
}

// DNA STR loci used in forensics
const STR_LOCI = ['D3S1358', 'vWA', 'FGA', 'D8S1179', 'D21S11', 'D18S51', 'D5S818', 'D13S317']

// Generate random DNA profile
const generateProfile = (seed?: number): DnaMarker[] => {
  let currentSeed = seed ?? 0
  const random = seed !== undefined
    ? () => ((currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
    : Math.random
  return STR_LOCI.slice(0, 6).map(locus => ({
    locus,
    allele1: Math.floor(random() * 10) + 10,
    allele2: Math.floor(random() * 10) + 10,
  }))
}

// Cases data
const CASES: Case[] = [
  {
    id: 'case-1',
    title: 'The Museum Theft',
    titleEs: 'El Robo del Museo',
    description: 'A valuable artifact was stolen from the city museum. Blood was found on broken glass at the scene.',
    descriptionEs: 'Un artefacto valioso fue robado del museo de la ciudad. Se encontro sangre en vidrio roto en la escena.',
    difficulty: 'easy',
    crimeSceneProfile: [
      { locus: 'D3S1358', allele1: 15, allele2: 16 },
      { locus: 'vWA', allele1: 17, allele2: 18 },
      { locus: 'FGA', allele1: 22, allele2: 24 },
      { locus: 'D8S1179', allele1: 13, allele2: 13 },
      { locus: 'D21S11', allele1: 29, allele2: 31 },
      { locus: 'D18S51', allele1: 15, allele2: 18 },
    ],
    suspects: [
      {
        id: 's1',
        name: 'Alex Rivera',
        nameEs: 'Alex Rivera',
        description: 'Former museum security guard',
        descriptionEs: 'Ex guardia de seguridad del museo',
        profile: [
          { locus: 'D3S1358', allele1: 14, allele2: 17 },
          { locus: 'vWA', allele1: 16, allele2: 19 },
          { locus: 'FGA', allele1: 21, allele2: 23 },
          { locus: 'D8S1179', allele1: 12, allele2: 14 },
          { locus: 'D21S11', allele1: 28, allele2: 30 },
          { locus: 'D18S51', allele1: 14, allele2: 17 },
        ],
        isGuilty: false,
      },
      {
        id: 's2',
        name: 'Jordan Chen',
        nameEs: 'Jordan Chen',
        description: 'Artifact collector with debts',
        descriptionEs: 'Coleccionista de artefactos con deudas',
        profile: [
          { locus: 'D3S1358', allele1: 15, allele2: 16 },
          { locus: 'vWA', allele1: 17, allele2: 18 },
          { locus: 'FGA', allele1: 22, allele2: 24 },
          { locus: 'D8S1179', allele1: 13, allele2: 13 },
          { locus: 'D21S11', allele1: 29, allele2: 31 },
          { locus: 'D18S51', allele1: 15, allele2: 18 },
        ],
        isGuilty: true,
      },
      {
        id: 's3',
        name: 'Sam Torres',
        nameEs: 'Sam Torres',
        description: 'Museum night janitor',
        descriptionEs: 'Conserje nocturno del museo',
        profile: [
          { locus: 'D3S1358', allele1: 16, allele2: 18 },
          { locus: 'vWA', allele1: 15, allele2: 17 },
          { locus: 'FGA', allele1: 20, allele2: 25 },
          { locus: 'D8S1179', allele1: 11, allele2: 15 },
          { locus: 'D21S11', allele1: 30, allele2: 32 },
          { locus: 'D18S51', allele1: 16, allele2: 19 },
        ],
        isGuilty: false,
      },
    ],
    hint: 'Look carefully at each locus - the guilty suspect will have an exact match at ALL loci.',
    hintEs: 'Mira cuidadosamente cada locus - el sospechoso culpable tendra una coincidencia exacta en TODOS los loci.',
    explanation: 'Jordan Chen\'s DNA profile matches exactly at all 6 loci. The probability of this match occurring by chance is approximately 1 in 10 trillion!',
    explanationEs: 'El perfil de ADN de Jordan Chen coincide exactamente en los 6 loci. La probabilidad de esta coincidencia por casualidad es aproximadamente 1 en 10 billones!',
  },
  {
    id: 'case-2',
    title: 'The Missing Heirloom',
    titleEs: 'La Reliquia Perdida',
    description: 'A family heirloom disappeared during a reunion. Hair was found in the empty jewelry box.',
    descriptionEs: 'Una reliquia familiar desaparecio durante una reunion. Se encontro cabello en la caja de joyas vacia.',
    difficulty: 'medium',
    crimeSceneProfile: [
      { locus: 'D3S1358', allele1: 14, allele2: 15 },
      { locus: 'vWA', allele1: 16, allele2: 17 },
      { locus: 'FGA', allele1: 21, allele2: 23 },
      { locus: 'D8S1179', allele1: 12, allele2: 14 },
      { locus: 'D21S11', allele1: 28, allele2: 30 },
      { locus: 'D18S51', allele1: 13, allele2: 16 },
    ],
    suspects: [
      {
        id: 's1',
        name: 'Cousin Maria',
        nameEs: 'Prima Maria',
        description: 'Recently lost her job',
        descriptionEs: 'Recientemente perdio su trabajo',
        profile: [
          { locus: 'D3S1358', allele1: 14, allele2: 16 },
          { locus: 'vWA', allele1: 15, allele2: 17 },
          { locus: 'FGA', allele1: 20, allele2: 22 },
          { locus: 'D8S1179', allele1: 13, allele2: 15 },
          { locus: 'D21S11', allele1: 27, allele2: 29 },
          { locus: 'D18S51', allele1: 14, allele2: 17 },
        ],
        isGuilty: false,
      },
      {
        id: 's2',
        name: 'Uncle Roberto',
        nameEs: 'Tio Roberto',
        description: 'Has gambling debts',
        descriptionEs: 'Tiene deudas de juego',
        profile: [
          { locus: 'D3S1358', allele1: 15, allele2: 17 },
          { locus: 'vWA', allele1: 16, allele2: 18 },
          { locus: 'FGA', allele1: 22, allele2: 24 },
          { locus: 'D8S1179', allele1: 11, allele2: 13 },
          { locus: 'D21S11', allele1: 29, allele2: 31 },
          { locus: 'D18S51', allele1: 12, allele2: 15 },
        ],
        isGuilty: false,
      },
      {
        id: 's3',
        name: 'Nephew Diego',
        nameEs: 'Sobrino Diego',
        description: 'College student needing money',
        descriptionEs: 'Estudiante universitario necesitando dinero',
        profile: [
          { locus: 'D3S1358', allele1: 14, allele2: 15 },
          { locus: 'vWA', allele1: 16, allele2: 17 },
          { locus: 'FGA', allele1: 21, allele2: 23 },
          { locus: 'D8S1179', allele1: 12, allele2: 14 },
          { locus: 'D21S11', allele1: 28, allele2: 30 },
          { locus: 'D18S51', allele1: 13, allele2: 16 },
        ],
        isGuilty: true,
      },
      {
        id: 's4',
        name: 'Aunt Carmen',
        nameEs: 'Tia Carmen',
        description: 'Jealous of the heirloom\'s owner',
        descriptionEs: 'Celosa de la duena de la reliquia',
        profile: [
          { locus: 'D3S1358', allele1: 13, allele2: 14 },
          { locus: 'vWA', allele1: 17, allele2: 19 },
          { locus: 'FGA', allele1: 20, allele2: 21 },
          { locus: 'D8S1179', allele1: 14, allele2: 16 },
          { locus: 'D21S11', allele1: 26, allele2: 28 },
          { locus: 'D18S51', allele1: 15, allele2: 18 },
        ],
        isGuilty: false,
      },
    ],
    hint: 'Remember: each person has TWO alleles per locus, inherited from each parent.',
    hintEs: 'Recuerda: cada persona tiene DOS alelos por locus, heredados de cada padre.',
    explanation: 'Nephew Diego\'s profile is a perfect match. Notice how some family members share SOME alleles (they\'re related!) but only Diego matches ALL of them.',
    explanationEs: 'El perfil del sobrino Diego es una coincidencia perfecta. Nota como algunos familiares comparten ALGUNOS alelos (estan relacionados!) pero solo Diego coincide en TODOS.',
  },
]

export function GeneticDetective() {
  const t = useTranslations()
  const [activeCase, setActiveCase] = useState<Case | null>(null)
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null)
  const [showEvidence, setShowEvidence] = useState(false)
  const [accusation, setAccusation] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [solvedCases, setSolvedCases] = useState<string[]>([])
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null)

  // Get locale-aware text
  const isSpanish = t('locale') === 'es'

  // Check if profiles match
  const profilesMatch = (profile1: DnaMarker[], profile2: DnaMarker[]): boolean => {
    return profile1.every((marker, idx) => {
      const other = profile2[idx]
      return (
        (marker.allele1 === other.allele1 && marker.allele2 === other.allele2) ||
        (marker.allele1 === other.allele2 && marker.allele2 === other.allele1)
      )
    })
  }

  // Count matching loci
  const countMatches = (profile1: DnaMarker[], profile2: DnaMarker[]): number => {
    return profile1.filter((marker, idx) => {
      const other = profile2[idx]
      return (
        (marker.allele1 === other.allele1 && marker.allele2 === other.allele2) ||
        (marker.allele1 === other.allele2 && marker.allele2 === other.allele1)
      )
    }).length
  }

  // Make accusation
  const makeAccusation = (suspectId: string) => {
    setAccusation(suspectId)
    const suspect = activeCase?.suspects.find(s => s.id === suspectId)
    if (suspect?.isGuilty && activeCase && !solvedCases.includes(activeCase.id)) {
      setSolvedCases([...solvedCases, activeCase.id])
    }
  }

  // Reset case
  const resetCase = () => {
    setSelectedSuspect(null)
    setShowEvidence(false)
    setAccusation(null)
    setShowHint(false)
    setExpandedProfile(null)
  }

  // Case selection view
  if (!activeCase) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <Search className="w-8 h-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <Title>{t('tools.detective.title')}</Title>
              <Text className="mt-1">
                {t('tools.detective.description')}
              </Text>
            </div>
            {solvedCases.length > 0 && (
              <Badge color="green" size="lg">
                {solvedCases.length}/{CASES.length} {isSpanish ? 'resueltos' : 'solved'}
              </Badge>
            )}
          </div>
        </Card>

        {/* How DNA Fingerprinting Works */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Fingerprint className="w-6 h-6 text-purple-500" />
            <Title>{isSpanish ? 'Como Funciona la Huella de ADN' : 'How DNA Fingerprinting Works'}</Title>
          </div>
          <div className="grid gap-4">
            {[
              {
                step: 1,
                title: isSpanish ? 'Recolectar ADN' : 'Collect DNA',
                desc: isSpanish ? 'Sangre, cabello, saliva de la escena del crimen' : 'Blood, hair, saliva from the crime scene',
              },
              {
                step: 2,
                title: isSpanish ? 'Amplificar con PCR' : 'Amplify with PCR',
                desc: isSpanish ? 'Hacer millones de copias de regiones especificas' : 'Make millions of copies of specific regions',
              },
              {
                step: 3,
                title: isSpanish ? 'Analizar STRs' : 'Analyze STRs',
                desc: isSpanish ? 'Medir la longitud de secuencias repetitivas' : 'Measure the length of repetitive sequences',
              },
              {
                step: 4,
                title: isSpanish ? 'Comparar Perfiles' : 'Compare Profiles',
                desc: isSpanish ? 'Coincidir con sospechosos - una coincidencia perfecta = 1 en billones' : 'Match against suspects - perfect match = 1 in trillions',
              },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-purple-600">{item.step}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Case Selection */}
        <Title>{isSpanish ? 'Selecciona un Caso' : 'Select a Case'}</Title>
        <Grid numItems={1} numItemsSm={2} className="gap-4">
          {CASES.map(c => {
            const isSolved = solvedCases.includes(c.id)
            return (
              <Col key={c.id}>
                <Card
                  className={`h-full cursor-pointer transition-all hover:shadow-lg ${
                    isSolved ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => {
                    setActiveCase(c)
                    resetCase()
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isSolved ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                      <Badge
                        color={c.difficulty === 'easy' ? 'green' : c.difficulty === 'medium' ? 'yellow' : 'red'}
                      >
                        {c.difficulty === 'easy' && (isSpanish ? 'Facil' : 'Easy')}
                        {c.difficulty === 'medium' && (isSpanish ? 'Medio' : 'Medium')}
                        {c.difficulty === 'hard' && (isSpanish ? 'Dificil' : 'Hard')}
                      </Badge>
                    </div>
                    <Badge color="gray">{c.suspects.length} {isSpanish ? 'sospechosos' : 'suspects'}</Badge>
                  </div>
                  <p className="font-semibold text-gray-800 mb-2">
                    {isSpanish ? c.titleEs : c.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isSpanish ? c.descriptionEs : c.description}
                  </p>
                </Card>
              </Col>
            )
          })}
        </Grid>

        {/* Achievements */}
        {solvedCases.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-yellow-500" />
              <Title>{isSpanish ? 'Logros de Detective' : 'Detective Achievements'}</Title>
            </div>
            <div className="flex flex-wrap gap-3">
              {solvedCases.length >= 1 && (
                <Badge color="green" size="lg">
                  <Star className="w-4 h-4 mr-1" />
                  {isSpanish ? 'Primer Caso' : 'First Case'}
                </Badge>
              )}
              {solvedCases.length >= 2 && (
                <Badge color="blue" size="lg">
                  <Star className="w-4 h-4 mr-1" />
                  {isSpanish ? 'Detective Junior' : 'Junior Detective'}
                </Badge>
              )}
              {solvedCases.length >= CASES.length && (
                <Badge color="purple" size="lg">
                  <Star className="w-4 h-4 mr-1" />
                  {isSpanish ? 'Maestro Forense' : 'Forensic Master'}
                </Badge>
              )}
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Active case view
  const guilty = activeCase.suspects.find(s => s.isGuilty)
  const isCorrect = accusation === guilty?.id

  return (
    <div className="space-y-6">
      {/* Case Header */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <div>
            <Badge color={activeCase.difficulty === 'easy' ? 'green' : activeCase.difficulty === 'medium' ? 'yellow' : 'red'} className="mb-2">
              {activeCase.difficulty === 'easy' && (isSpanish ? 'Facil' : 'Easy')}
              {activeCase.difficulty === 'medium' && (isSpanish ? 'Medio' : 'Medium')}
              {activeCase.difficulty === 'hard' && (isSpanish ? 'Dificil' : 'Hard')}
            </Badge>
            <Title>{isSpanish ? activeCase.titleEs : activeCase.title}</Title>
            <Text className="mt-1">{isSpanish ? activeCase.descriptionEs : activeCase.description}</Text>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setActiveCase(null)
              resetCase()
            }}
          >
            {isSpanish ? 'Volver' : 'Back'}
          </Button>
        </div>
      </Card>

      {/* Result Display */}
      {accusation && (
        <Card className={isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}>
          <div className="flex items-center gap-4">
            {isCorrect ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
            <div className="flex-1">
              <Title className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                {isCorrect
                  ? (isSpanish ? 'Caso Resuelto!' : 'Case Solved!')
                  : (isSpanish ? 'Sospechoso Incorrecto' : 'Wrong Suspect')
                }
              </Title>
              <p className="text-sm mt-2">
                {isSpanish ? activeCase.explanationEs : activeCase.explanation}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => setAccusation(null)}>
              {isSpanish ? 'Intentar de Nuevo' : 'Try Again'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setActiveCase(null)
                resetCase()
              }}
            >
              {isSpanish ? 'Otro Caso' : 'Another Case'}
            </Button>
          </div>
        </Card>
      )}

      {!accusation && (
        <>
          {/* Crime Scene Evidence */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-6 h-6 text-red-500" />
                <Title>{isSpanish ? 'Evidencia de la Escena del Crimen' : 'Crime Scene Evidence'}</Title>
              </div>
              <Button
                variant="light"
                size="xs"
                onClick={() => setShowEvidence(!showEvidence)}
                icon={showEvidence ? ChevronUp : ChevronDown}
              >
                {showEvidence
                  ? (isSpanish ? 'Ocultar Perfil' : 'Hide Profile')
                  : (isSpanish ? 'Ver Perfil de ADN' : 'View DNA Profile')
                }
              </Button>
            </div>

            {showEvidence && (
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-gray-600">Locus</th>
                      <th className="text-center py-2 px-4 font-medium text-gray-600">
                        {isSpanish ? 'Alelo 1' : 'Allele 1'}
                      </th>
                      <th className="text-center py-2 pl-4 font-medium text-gray-600">
                        {isSpanish ? 'Alelo 2' : 'Allele 2'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCase.crimeSceneProfile.map(marker => (
                      <tr key={marker.locus} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-mono text-red-600">{marker.locus}</td>
                        <td className="py-2 px-4 text-center font-mono font-bold">{marker.allele1}</td>
                        <td className="py-2 pl-4 text-center font-mono font-bold">{marker.allele2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Suspects */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <UserCircle className="w-6 h-6 text-blue-500" />
              <Title>{isSpanish ? 'Sospechosos' : 'Suspects'}</Title>
            </div>

            <div className="space-y-4">
              {activeCase.suspects.map(suspect => {
                const matches = countMatches(activeCase.crimeSceneProfile, suspect.profile)
                const isExpanded = expandedProfile === suspect.id
                const isSelected = selectedSuspect === suspect.id

                return (
                  <div
                    key={suspect.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedSuspect(isSelected ? null : suspect.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserCircle className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {isSpanish ? suspect.nameEs : suspect.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {isSpanish ? suspect.descriptionEs : suspect.description}
                          </p>
                        </div>
                      </div>
                      {showEvidence && (
                        <Badge color={matches === 6 ? 'green' : matches >= 4 ? 'yellow' : 'gray'}>
                          {matches}/6 {isSpanish ? 'coincidencias' : 'matches'}
                        </Badge>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <button
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedProfile(isExpanded ? null : suspect.id)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            {isExpanded
                              ? (isSpanish ? 'Ocultar Perfil' : 'Hide Profile')
                              : (isSpanish ? 'Ver Perfil de ADN' : 'View DNA Profile')
                            }
                          </button>
                          <Button
                            size="xs"
                            icon={Target}
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation()
                              makeAccusation(suspect.id)
                            }}
                          >
                            {isSpanish ? 'Acusar' : 'Accuse'}
                          </Button>
                        </div>

                        {isExpanded && (
                          <div className="bg-white rounded-lg p-3 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-1 pr-4 font-medium text-gray-600">Locus</th>
                                  <th className="text-center py-1 px-2 font-medium text-gray-600">
                                    {isSpanish ? 'Escena' : 'Scene'}
                                  </th>
                                  <th className="text-center py-1 px-2 font-medium text-gray-600">
                                    {isSpanish ? 'Sospechoso' : 'Suspect'}
                                  </th>
                                  <th className="text-center py-1 pl-2 font-medium text-gray-600">?</th>
                                </tr>
                              </thead>
                              <tbody>
                                {suspect.profile.map((marker, idx) => {
                                  const scene = activeCase.crimeSceneProfile[idx]
                                  const isMatch =
                                    (marker.allele1 === scene.allele1 && marker.allele2 === scene.allele2) ||
                                    (marker.allele1 === scene.allele2 && marker.allele2 === scene.allele1)

                                  return (
                                    <tr key={marker.locus} className="border-b last:border-0">
                                      <td className="py-1 pr-4 font-mono text-xs">{marker.locus}</td>
                                      <td className="py-1 px-2 text-center font-mono text-xs text-red-600">
                                        {scene.allele1}/{scene.allele2}
                                      </td>
                                      <td className="py-1 px-2 text-center font-mono text-xs text-blue-600">
                                        {marker.allele1}/{marker.allele2}
                                      </td>
                                      <td className="py-1 pl-2 text-center">
                                        {isMatch ? (
                                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                                        ) : (
                                          <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Hint */}
          <Card className="bg-blue-50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <button
                  className="font-medium text-blue-800 hover:underline"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint
                    ? (isSpanish ? 'Ocultar Pista' : 'Hide Hint')
                    : (isSpanish ? 'Necesitas una Pista?' : 'Need a Hint?')
                  }
                </button>
                {showHint && (
                  <p className="text-sm text-blue-700 mt-2">
                    {isSpanish ? activeCase.hintEs : activeCase.hint}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
