'use client'

import { useState } from 'react'
import { Card, Title, Text, Button, Badge } from '@tremor/react'
import {
  TreePine,
  Search,
  GitBranch,
  Dna,
  ChevronRight,
  Info,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Species {
  id: string
  name: string
  nameEs: string
  commonName: string
  commonNameEs: string
  sharedDna: number
  kingdom: 'animal' | 'plant' | 'fungi' | 'bacteria'
  emoji: string
  notableGenes: string[]
  funFact: string
  funFactEs: string
  divergenceYears: string
}

const SPECIES_DATA: Species[] = [
  {
    id: 'chimp',
    name: 'Pan troglodytes',
    nameEs: 'Pan troglodytes',
    commonName: 'Chimpanzee',
    commonNameEs: 'Chimpance',
    sharedDna: 98.8,
    kingdom: 'animal',
    emoji: '🐒',
    notableGenes: ['FOXP2', 'HAR1', 'MYH16'],
    funFact: 'The 1.2% difference includes genes for brain development, jaw muscles, and immune response.',
    funFactEs: 'El 1.2% de diferencia incluye genes para desarrollo cerebral, musculos mandibulares y respuesta inmune.',
    divergenceYears: '6-7 million years ago',
  },
  {
    id: 'mouse',
    name: 'Mus musculus',
    nameEs: 'Mus musculus',
    commonName: 'Mouse',
    commonNameEs: 'Raton',
    sharedDna: 85,
    kingdom: 'animal',
    emoji: '🐭',
    notableGenes: ['p53', 'BRCA1', 'insulin'],
    funFact: '99% of mouse genes have a human equivalent, making them crucial for medical research.',
    funFactEs: 'El 99% de los genes del raton tienen un equivalente humano, haciendolos cruciales para investigacion medica.',
    divergenceYears: '75 million years ago',
  },
  {
    id: 'dog',
    name: 'Canis lupus familiaris',
    nameEs: 'Canis lupus familiaris',
    commonName: 'Dog',
    commonNameEs: 'Perro',
    sharedDna: 84,
    kingdom: 'animal',
    emoji: '🐕',
    notableGenes: ['OXTR', 'AMY2B', 'IGF1'],
    funFact: 'Dogs share many disease genes with humans, including cancer susceptibility genes.',
    funFactEs: 'Los perros comparten muchos genes de enfermedad con humanos, incluyendo genes de susceptibilidad al cancer.',
    divergenceYears: '85 million years ago',
  },
  {
    id: 'cat',
    name: 'Felis catus',
    nameEs: 'Felis catus',
    commonName: 'Cat',
    commonNameEs: 'Gato',
    sharedDna: 90,
    kingdom: 'animal',
    emoji: '🐱',
    notableGenes: ['Tas2r', 'FGF5', 'KIT'],
    funFact: 'Cats have lost the gene for sweet taste receptors during evolution.',
    funFactEs: 'Los gatos perdieron el gen para receptores del sabor dulce durante la evolucion.',
    divergenceYears: '85 million years ago',
  },
  {
    id: 'chicken',
    name: 'Gallus gallus',
    nameEs: 'Gallus gallus',
    commonName: 'Chicken',
    commonNameEs: 'Pollo',
    sharedDna: 60,
    kingdom: 'animal',
    emoji: '🐔',
    notableGenes: ['SHH', 'BMP4', 'FGF8'],
    funFact: 'Chickens still carry dormant genes for teeth from their dinosaur ancestors.',
    funFactEs: 'Los pollos aun portan genes latentes para dientes de sus ancestros dinosaurios.',
    divergenceYears: '310 million years ago',
  },
  {
    id: 'zebrafish',
    name: 'Danio rerio',
    nameEs: 'Danio rerio',
    commonName: 'Zebrafish',
    commonNameEs: 'Pez cebra',
    sharedDna: 70,
    kingdom: 'animal',
    emoji: '🐟',
    notableGenes: ['pax6', 'shh', 'tp53'],
    funFact: '70% of human genes have at least one zebrafish counterpart, and 84% of disease genes are found in zebrafish.',
    funFactEs: 'El 70% de los genes humanos tienen al menos un homologo en pez cebra, y el 84% de los genes de enfermedad se encuentran en el pez cebra.',
    divergenceYears: '440 million years ago',
  },
  {
    id: 'fruitfly',
    name: 'Drosophila melanogaster',
    nameEs: 'Drosophila melanogaster',
    commonName: 'Fruit Fly',
    commonNameEs: 'Mosca de la fruta',
    sharedDna: 60,
    kingdom: 'animal',
    emoji: '🪰',
    notableGenes: ['Hox', 'Notch', 'Toll'],
    funFact: '75% of human disease genes have equivalents in flies. Six Nobel Prizes have involved fruit fly research.',
    funFactEs: 'El 75% de los genes de enfermedad humana tienen equivalentes en moscas. Seis Premios Nobel han involucrado investigacion con moscas de la fruta.',
    divergenceYears: '600 million years ago',
  },
  {
    id: 'banana',
    name: 'Musa acuminata',
    nameEs: 'Musa acuminata',
    commonName: 'Banana',
    commonNameEs: 'Banana',
    sharedDna: 60,
    kingdom: 'plant',
    emoji: '🍌',
    notableGenes: ['RGA2', 'NPR1'],
    funFact: 'You share about 60% of your DNA with a banana! These are essential genes for cellular processes.',
    funFactEs: 'Compartes aproximadamente el 60% de tu ADN con una banana! Estos son genes esenciales para procesos celulares.',
    divergenceYears: '1.5 billion years ago',
  },
  {
    id: 'yeast',
    name: 'Saccharomyces cerevisiae',
    nameEs: 'Saccharomyces cerevisiae',
    commonName: 'Bakers Yeast',
    commonNameEs: 'Levadura de panaderia',
    sharedDna: 31,
    kingdom: 'fungi',
    emoji: '🍞',
    notableGenes: ['CDC28', 'RAD51', 'TOR1'],
    funFact: 'About 23% of yeast genes can be replaced by their human equivalent and still function.',
    funFactEs: 'Aproximadamente el 23% de los genes de levadura pueden ser reemplazados por su equivalente humano y aun funcionan.',
    divergenceYears: '1 billion years ago',
  },
  {
    id: 'dolphin',
    name: 'Tursiops truncatus',
    nameEs: 'Tursiops truncatus',
    commonName: 'Bottlenose Dolphin',
    commonNameEs: 'Delfin nariz de botella',
    sharedDna: 80,
    kingdom: 'animal',
    emoji: '🐬',
    notableGenes: ['ASPM', 'MCPH1', 'SLC6A4'],
    funFact: 'Dolphins have many brain development genes similar to humans, possibly explaining their intelligence.',
    funFactEs: 'Los delfines tienen muchos genes de desarrollo cerebral similares a los humanos, posiblemente explicando su inteligencia.',
    divergenceYears: '95 million years ago',
  },
  {
    id: 'elephant',
    name: 'Loxodonta africana',
    nameEs: 'Loxodonta africana',
    commonName: 'African Elephant',
    commonNameEs: 'Elefante africano',
    sharedDna: 80,
    kingdom: 'animal',
    emoji: '🐘',
    notableGenes: ['TP53', 'LIF6', 'APAF1'],
    funFact: 'Elephants have 20 copies of the p53 tumor suppressor gene (humans have 2), giving them very low cancer rates.',
    funFactEs: 'Los elefantes tienen 20 copias del gen supresor de tumores p53 (humanos tienen 2), dandoles tasas muy bajas de cancer.',
    divergenceYears: '100 million years ago',
  },
  {
    id: 'ecoli',
    name: 'Escherichia coli',
    nameEs: 'Escherichia coli',
    commonName: 'E. coli',
    commonNameEs: 'E. coli',
    sharedDna: 18,
    kingdom: 'bacteria',
    emoji: '🦠',
    notableGenes: ['recA', 'dnaB', 'rpoB'],
    funFact: 'Core DNA replication and repair genes are conserved from E. coli to humans across 3.5 billion years.',
    funFactEs: 'Los genes centrales de replicacion y reparacion del ADN estan conservados desde E. coli hasta humanos a traves de 3.5 mil millones de anos.',
    divergenceYears: '3.5 billion years ago',
  },
]

const KINGDOM_COLORS: Record<string, string> = {
  animal: 'blue',
  plant: 'green',
  fungi: 'amber',
  bacteria: 'purple',
}

export function TreeOfLife() {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)
  const [compareSpecies, setCompareSpecies] = useState<Species | null>(null)
  const [showCompare, setShowCompare] = useState(false)

  const filteredSpecies = SPECIES_DATA.filter(
    (s) =>
      s.commonNameEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.commonName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedSpecies = [...filteredSpecies].sort((a, b) => b.sharedDna - a.sharedDna)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TreePine className="w-8 h-8 text-green-500" />
          </div>
          <Title className="text-title">Arbol de la Vida Interactivo</Title>
          <Text className="text-body mt-2 max-w-lg mx-auto">
            Explora cuanto ADN compartes con otras especies. Descubre conexiones sorprendentes
            en el arbol evolutivo de la vida.
          </Text>
        </div>
      </Card>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar especie..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-soft border border-adaptive rounded-xl text-body text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Species list */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title className="text-title text-sm">Especies ({sortedSpecies.length})</Title>
              <Button
                size="xs"
                variant="light"
                icon={ArrowLeftRight}
                onClick={() => setShowCompare(!showCompare)}
              >
                {showCompare ? 'Ver lista' : 'Comparar 2'}
              </Button>
            </div>

            {showCompare ? (
              // Compare mode
              <div className="space-y-4">
                <Text className="text-sm text-muted">Selecciona dos especies para comparar:</Text>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-xs text-muted mb-2">Especie 1</Text>
                    <select
                      value={selectedSpecies?.id || ''}
                      onChange={(e) => setSelectedSpecies(SPECIES_DATA.find((s) => s.id === e.target.value) || null)}
                      className="w-full p-2 bg-surface-soft border border-adaptive rounded-lg text-body text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      {SPECIES_DATA.map((s) => (
                        <option key={s.id} value={s.id}>{s.emoji} {s.commonNameEs}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Text className="text-xs text-muted mb-2">Especie 2</Text>
                    <select
                      value={compareSpecies?.id || ''}
                      onChange={(e) => setCompareSpecies(SPECIES_DATA.find((s) => s.id === e.target.value) || null)}
                      className="w-full p-2 bg-surface-soft border border-adaptive rounded-lg text-body text-sm"
                    >
                      <option value="">Seleccionar...</option>
                      {SPECIES_DATA.map((s) => (
                        <option key={s.id} value={s.id}>{s.emoji} {s.commonNameEs}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedSpecies && compareSpecies && (
                  <div className="mt-4 p-4 bg-surface-soft rounded-xl">
                    <div className="text-center mb-4">
                      <span className="text-3xl">{selectedSpecies.emoji}</span>
                      <span className="text-xl text-muted mx-3">vs</span>
                      <span className="text-3xl">{compareSpecies.emoji}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="font-medium text-title">{selectedSpecies.commonNameEs}</p>
                        <p className="text-xs text-muted">{selectedSpecies.sharedDna}% con humano</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {Math.round(Math.min(selectedSpecies.sharedDna, compareSpecies.sharedDna) * 0.9)}%
                        </p>
                        <p className="text-xs text-muted">ADN compartido entre ellos</p>
                      </div>
                      <div>
                        <p className="font-medium text-title">{compareSpecies.commonNameEs}</p>
                        <p className="text-xs text-muted">{compareSpecies.sharedDna}% con humano</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // List mode
              <div className="space-y-2">
                {sortedSpecies.map((species) => (
                  <button
                    key={species.id}
                    onClick={() => setSelectedSpecies(species)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      selectedSpecies?.id === species.id
                        ? 'bg-green-50 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-700'
                        : 'bg-surface-soft border-2 border-transparent hover:border-green-200 dark:hover:border-green-800'
                    }`}
                  >
                    <span className="text-2xl">{species.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-title text-sm">{species.commonNameEs}</p>
                        <Badge color={KINGDOM_COLORS[species.kingdom] as any} size="xs">
                          {species.kingdom === 'animal' ? 'Animal' : species.kingdom === 'plant' ? 'Planta' : species.kingdom === 'fungi' ? 'Hongo' : 'Bacteria'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted italic">{species.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">{species.sharedDna}%</span>
                      <p className="text-xs text-muted">ADN compartido</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Details panel */}
        <div>
          {selectedSpecies ? (
            <Card>
              <div className="text-center mb-4">
                <span className="text-5xl">{selectedSpecies.emoji}</span>
                <Title className="text-title mt-3">{selectedSpecies.commonNameEs}</Title>
                <Text className="text-muted italic text-sm">{selectedSpecies.name}</Text>
              </div>

              <div className="space-y-4">
                {/* DNA percentage */}
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                  <Dna className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedSpecies.sharedDna}%</span>
                  <Text className="text-sm text-body mt-1">ADN compartido con humanos</Text>
                </div>

                {/* Divergence */}
                <div className="p-3 bg-surface-soft rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-title">Divergencia</span>
                  </div>
                  <p className="text-sm text-body">{selectedSpecies.divergenceYears}</p>
                </div>

                {/* Notable genes */}
                <div className="p-3 bg-surface-soft rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Dna className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-title">Genes Notables Compartidos</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSpecies.notableGenes.map((gene) => (
                      <Badge key={gene} color="purple" size="xs">{gene}</Badge>
                    ))}
                  </div>
                </div>

                {/* Fun fact */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-title">Dato Curioso</span>
                      <p className="text-sm text-body mt-1">{selectedSpecies.funFactEs}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <TreePine className="w-12 h-12 text-muted mx-auto mb-3" />
                <Text className="text-muted">Selecciona una especie para ver detalles</Text>
              </div>
            </Card>
          )}

          {/* Info box */}
          <div className="mt-4 p-3 bg-surface-soft rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted">
                Los porcentajes son aproximaciones basadas en analisis de homologia genomica.
                Los valores reales varian segun la metodologia de comparacion utilizada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
