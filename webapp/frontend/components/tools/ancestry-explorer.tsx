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
  DonutChart,
} from '@tremor/react'
import {
  Globe2,
  Map,
  Clock,
  Dna,
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  MapPin,
  Navigation,
  Compass,
  History,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

// Ancestry regions with colors
interface AncestryRegion {
  id: string
  name: string
  nameEs: string
  percentage: number
  color: string
  subregions: { name: string; nameEs: string; percentage: number }[]
  description: string
  descriptionEs: string
  traits: string[]
  traitsEs: string[]
}

// Haplogroup data
interface Haplogroup {
  type: 'maternal' | 'paternal'
  name: string
  origin: string
  originEs: string
  age: string
  description: string
  descriptionEs: string
  famousMembers?: string[]
}

// Migration path
interface MigrationPath {
  from: string
  to: string
  years: string
  description: string
  descriptionEs: string
}

// Demo ancestry data
const DEMO_ANCESTRY: AncestryRegion[] = [
  {
    id: 'europe',
    name: 'European',
    nameEs: 'Europeo',
    percentage: 45,
    color: '#3B82F6',
    subregions: [
      { name: 'Iberian Peninsula', nameEs: 'Peninsula Iberica', percentage: 25 },
      { name: 'British & Irish', nameEs: 'Britanico e Irlandes', percentage: 12 },
      { name: 'Italian', nameEs: 'Italiano', percentage: 8 },
    ],
    description: 'Your European ancestry traces back thousands of years to populations that spread across the continent after the last Ice Age.',
    descriptionEs: 'Tu ascendencia europea se remonta miles de anos a poblaciones que se extendieron por el continente despues de la ultima Era de Hielo.',
    traits: ['Lactose tolerance', 'Light skin adaptation', 'Blue/green eye variants'],
    traitsEs: ['Tolerancia a lactosa', 'Adaptacion de piel clara', 'Variantes de ojos azules/verdes'],
  },
  {
    id: 'americas',
    name: 'Indigenous American',
    nameEs: 'Indigena Americano',
    percentage: 30,
    color: '#10B981',
    subregions: [
      { name: 'Mexico & Central America', nameEs: 'Mexico y Centroamerica', percentage: 22 },
      { name: 'Andean', nameEs: 'Andino', percentage: 8 },
    ],
    description: 'Your Indigenous American ancestry connects you to the first peoples who crossed the Bering land bridge over 15,000 years ago.',
    descriptionEs: 'Tu ascendencia indigena americana te conecta con los primeros pueblos que cruzaron el puente terrestre de Bering hace mas de 15,000 anos.',
    traits: ['High altitude adaptation', 'Unique dental patterns', 'Certain metabolic traits'],
    traitsEs: ['Adaptacion a alta altitud', 'Patrones dentales unicos', 'Ciertos rasgos metabolicos'],
  },
  {
    id: 'africa',
    name: 'African',
    nameEs: 'Africano',
    percentage: 15,
    color: '#F59E0B',
    subregions: [
      { name: 'West African', nameEs: 'Africa Occidental', percentage: 12 },
      { name: 'North African', nameEs: 'Africa del Norte', percentage: 3 },
    ],
    description: 'Africa is the cradle of humanity. All human ancestry ultimately traces back to African origins.',
    descriptionEs: 'Africa es la cuna de la humanidad. Toda la ascendencia humana se remonta ultimamente a origenes africanos.',
    traits: ['Malaria resistance variants', 'Fast-twitch muscle fibers', 'Diverse immune responses'],
    traitsEs: ['Variantes de resistencia a malaria', 'Fibras musculares de contraccion rapida', 'Respuestas inmunes diversas'],
  },
  {
    id: 'middleeast',
    name: 'Middle Eastern',
    nameEs: 'Medio Oriente',
    percentage: 7,
    color: '#EC4899',
    subregions: [
      { name: 'Levantine', nameEs: 'Levantino', percentage: 5 },
      { name: 'Arabian Peninsula', nameEs: 'Peninsula Arabiga', percentage: 2 },
    ],
    description: 'The Middle East was the crossroads of ancient civilizations and the birthplace of agriculture.',
    descriptionEs: 'El Medio Oriente fue el cruce de civilizaciones antiguas y el lugar de nacimiento de la agricultura.',
    traits: ['Heat tolerance', 'Desert adaptation', 'Agricultural gene variants'],
    traitsEs: ['Tolerancia al calor', 'Adaptacion al desierto', 'Variantes geneticas agricolas'],
  },
  {
    id: 'asia',
    name: 'East Asian',
    nameEs: 'Asia Oriental',
    percentage: 3,
    color: '#8B5CF6',
    subregions: [
      { name: 'Chinese', nameEs: 'Chino', percentage: 2 },
      { name: 'Southeast Asian', nameEs: 'Sudeste Asiatico', percentage: 1 },
    ],
    description: 'East Asian populations developed unique adaptations over tens of thousands of years.',
    descriptionEs: 'Las poblaciones de Asia Oriental desarrollaron adaptaciones unicas durante decenas de miles de anos.',
    traits: ['Alcohol flush reaction', 'Earwax type', 'Hair structure'],
    traitsEs: ['Reaccion de rubor al alcohol', 'Tipo de cerumen', 'Estructura del cabello'],
  },
]

// Demo haplogroups
const DEMO_HAPLOGROUPS: Haplogroup[] = [
  {
    type: 'maternal',
    name: 'H1',
    origin: 'Western Europe',
    originEs: 'Europa Occidental',
    age: '~20,000 years',
    description: 'The most common maternal haplogroup in Western Europe, originating during the last Ice Age.',
    descriptionEs: 'El haplogrupo materno mas comun en Europa Occidental, originado durante la ultima Era de Hielo.',
    famousMembers: ['Marie Antoinette', 'Napoleon Bonaparte (through mother)'],
  },
  {
    type: 'paternal',
    name: 'R1b',
    origin: 'Western Europe',
    originEs: 'Europa Occidental',
    age: '~18,000 years',
    description: 'The most common paternal lineage in Western Europe, spread with Bronze Age migrations.',
    descriptionEs: 'El linaje paterno mas comun en Europa Occidental, se extendio con las migraciones de la Edad de Bronce.',
    famousMembers: ['King Tutankhamun', 'Genghis Khan descendants'],
  },
]

// Demo migration paths
const DEMO_MIGRATIONS: MigrationPath[] = [
  {
    from: 'Africa',
    to: 'Middle East',
    years: '70,000 - 50,000 years ago',
    description: 'The first humans left Africa through the Levant corridor',
    descriptionEs: 'Los primeros humanos dejaron Africa a traves del corredor del Levante',
  },
  {
    from: 'Middle East',
    to: 'Europe',
    years: '45,000 - 40,000 years ago',
    description: 'Early humans spread across Europe, eventually replacing Neanderthals',
    descriptionEs: 'Los primeros humanos se extendieron por Europa, eventualmente reemplazando a los Neandertales',
  },
  {
    from: 'Asia',
    to: 'Americas',
    years: '20,000 - 15,000 years ago',
    description: 'Crossing the Bering land bridge during the Ice Age',
    descriptionEs: 'Cruzando el puente terrestre de Bering durante la Era de Hielo',
  },
  {
    from: 'Europe',
    to: 'Americas',
    years: '500 years ago',
    description: 'Colonial period migration and mixing',
    descriptionEs: 'Migracion y mezcla del periodo colonial',
  },
]

// Ancient DNA percentages
const ANCIENT_DNA = {
  neanderthal: 2.3,
  denisovan: 0.1,
}

export function AncestryExplorer() {
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState<'composition' | 'timeline' | 'haplogroups' | 'ancient'>('composition')
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null)
  const [showMigrations, setShowMigrations] = useState(false)

  // Get locale-aware text
  const isSpanish = t('locale') === 'es'

  // Chart data for donut
  const chartData = DEMO_ANCESTRY.map(region => ({
    name: isSpanish ? region.nameEs : region.name,
    value: region.percentage,
    color: region.color,
  }))

  return (
    <div role="region" aria-label="Ancestry Explorer" className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
            <Globe2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <Title>{t('tools.ancestors.title')}</Title>
            <Text className="mt-1">
              {t('tools.ancestors.description')}
            </Text>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'composition' ? 'primary' : 'secondary'}
          size="xs"
          icon={Map}
          onClick={() => setActiveTab('composition')}
        >
          {isSpanish ? 'Composicion' : 'Composition'}
        </Button>
        <Button
          variant={activeTab === 'timeline' ? 'primary' : 'secondary'}
          size="xs"
          icon={Clock}
          onClick={() => setActiveTab('timeline')}
        >
          {isSpanish ? 'Linea de Tiempo' : 'Timeline'}
        </Button>
        <Button
          variant={activeTab === 'haplogroups' ? 'primary' : 'secondary'}
          size="xs"
          icon={Dna}
          onClick={() => setActiveTab('haplogroups')}
        >
          {isSpanish ? 'Haplogrupos' : 'Haplogroups'}
        </Button>
        <Button
          variant={activeTab === 'ancient' ? 'primary' : 'secondary'}
          size="xs"
          icon={History}
          onClick={() => setActiveTab('ancient')}
        >
          {isSpanish ? 'ADN Antiguo' : 'Ancient DNA'}
        </Button>
      </div>

      {/* Composition Tab */}
      {activeTab === 'composition' && (
        <div className="space-y-6">
          <Grid numItems={1} numItemsMd={2} className="gap-6">
            {/* Donut Chart */}
            <Col>
              <Card>
                <Title className="mb-4">
                  {isSpanish ? 'Tu Composicion Ancestral' : 'Your Ancestral Composition'}
                </Title>
                <DonutChart
                  data={chartData}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value}%`}
                  colors={['blue', 'green', 'amber', 'pink', 'violet']}
                  className="h-60"
                />
              </Card>
            </Col>

            {/* World Map Placeholder */}
            <Col>
              <Card className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <Title>{isSpanish ? 'Mapa Mundial' : 'World Map'}</Title>
                  <Button
                    variant="light"
                    size="xs"
                    icon={Navigation}
                    onClick={() => setShowMigrations(!showMigrations)}
                  >
                    {showMigrations
                      ? (isSpanish ? 'Ocultar Migraciones' : 'Hide Migrations')
                      : (isSpanish ? 'Ver Migraciones' : 'Show Migrations')
                    }
                  </Button>
                </div>
                {/* SVG World Map Visualization */}
                <div className="relative h-48 bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl overflow-hidden">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    {/* Simplified continents */}
                    {/* Africa */}
                    <ellipse cx="200" cy="110" rx="35" ry="50" fill="#F59E0B" opacity="0.7" />
                    {/* Europe */}
                    <ellipse cx="200" cy="50" rx="40" ry="25" fill="#3B82F6" opacity="0.7" />
                    {/* Asia */}
                    <ellipse cx="280" cy="70" rx="60" ry="40" fill="#8B5CF6" opacity="0.5" />
                    {/* Americas */}
                    <ellipse cx="80" cy="90" rx="40" ry="70" fill="#10B981" opacity="0.7" />
                    {/* Middle East */}
                    <ellipse cx="230" cy="80" rx="15" ry="20" fill="#EC4899" opacity="0.7" />

                    {/* Migration arrows */}
                    {showMigrations && (
                      <>
                        {/* Africa to Middle East */}
                        <line x1="200" y1="90" x2="220" y2="80" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow)" />
                        {/* Middle East to Europe */}
                        <line x1="220" y1="75" x2="200" y2="55" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow)" />
                        {/* Asia to Americas */}
                        <path d="M 260 50 Q 180 20 100 50" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrow)" />
                        {/* Europe to Americas */}
                        <line x1="170" y1="50" x2="110" y2="70" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" markerEnd="url(#arrow)" />

                        <defs>
                          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill="#666" />
                          </marker>
                        </defs>
                      </>
                    )}

                    {/* Labels */}
                    <text x="200" y="120" textAnchor="middle" fontSize="8" fill="#666">Africa</text>
                    <text x="200" y="45" textAnchor="middle" fontSize="8" fill="#666">Europe</text>
                    <text x="280" y="60" textAnchor="middle" fontSize="8" fill="#666">Asia</text>
                    <text x="80" y="90" textAnchor="middle" fontSize="8" fill="#666">Americas</text>
                  </svg>
                </div>
                <p className="text-xs text-muted mt-2 text-center">
                  {isSpanish
                    ? 'Visualizacion simplificada - Haz clic para ver migraciones'
                    : 'Simplified visualization - Click to show migrations'}
                </p>
              </Card>
            </Col>
          </Grid>

          {/* Ancestry breakdown */}
          <Card>
            <Title className="mb-4">
              {isSpanish ? 'Desglose por Region' : 'Regional Breakdown'}
            </Title>
            <div className="space-y-4">
              {DEMO_ANCESTRY.map(region => (
                <div key={region.id} className="space-y-2">
                  <div
                    className="flex items-center justify-between cursor-pointer hover:bg-surface-soft p-2 rounded-xl transition-colors"
                    onClick={() => setExpandedRegion(expandedRegion === region.id ? null : region.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: region.color }}
                      />
                      <span className="font-medium text-title">
                        {isSpanish ? region.nameEs : region.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-title">{region.percentage}%</span>
                      {expandedRegion === region.id ? (
                        <ChevronUp className="w-4 h-4 text-subtle" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-subtle" />
                      )}
                    </div>
                  </div>
                  <ProgressBar value={region.percentage} color="blue" className="h-2" />

                  {/* Expanded details */}
                  {expandedRegion === region.id && (
                    <div className="mt-3 ml-7 space-y-3 animate-fade-in">
                      {/* Subregions */}
                      <div className="space-y-2">
                        {region.subregions.map((sub, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-body">
                              {isSpanish ? sub.nameEs : sub.name}
                            </span>
                            <span className="text-title font-medium">{sub.percentage}%</span>
                          </div>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-body bg-surface-soft p-3 rounded-xl">
                        {isSpanish ? region.descriptionEs : region.description}
                      </p>

                      {/* Traits */}
                      <div>
                        <p className="text-sm font-medium text-body mb-2">
                          {isSpanish ? 'Rasgos Asociados:' : 'Associated Traits:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(isSpanish ? region.traitsEs : region.traits).map((trait, idx) => (
                            <Badge key={idx} color="blue" size="sm">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <Card>
          <Title className="mb-6">
            {isSpanish ? 'Linea de Tiempo de Migraciones' : 'Migration Timeline'}
          </Title>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-purple-500" />

            <div className="space-y-8">
              {DEMO_MIGRATIONS.map((migration, idx) => (
                <div key={idx} className="relative flex gap-6 ml-4">
                  {/* Timeline dot */}
                  <div className="absolute -left-4 w-8 h-8 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center z-10">
                    <Compass className="w-4 h-4 text-blue-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 ml-8 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge color="blue">{migration.years}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-semibold text-title mb-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <span>{migration.from}</span>
                      <ChevronRight className="w-5 h-5 text-subtle" />
                      <MapPin className="w-5 h-5 text-green-500" />
                      <span>{migration.to}</span>
                    </div>
                    <p className="text-body">
                      {isSpanish ? migration.descriptionEs : migration.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Haplogroups Tab */}
      {activeTab === 'haplogroups' && (
        <div className="space-y-6">
          <Card className="bg-info-soft">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-info mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">
                  {isSpanish ? '¿Que son los haplogrupos?' : 'What are haplogroups?'}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {isSpanish
                    ? 'Los haplogrupos son marcadores geneticos que rastrean tu linaje materno (ADN mitocondrial) y paterno (cromosoma Y). Son como "apellidos geneticos" que se transmiten de generacion en generacion.'
                    : 'Haplogroups are genetic markers that trace your maternal (mitochondrial DNA) and paternal (Y chromosome) lineage. They\'re like genetic "surnames" passed down through generations.'}
                </p>
              </div>
            </div>
          </Card>

          <Grid numItems={1} numItemsSm={2} className="gap-6">
            {DEMO_HAPLOGROUPS.map((haplo, idx) => (
              <Col key={idx}>
                <Card className={`h-full ${haplo.type === 'maternal' ? 'bg-pink-soft' : 'bg-info-soft'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      haplo.type === 'maternal' ? 'bg-pink-200' : 'bg-blue-200'
                    }`}>
                      <Dna className={`w-6 h-6 ${haplo.type === 'maternal' ? 'text-pink-600' : 'text-info'}`} />
                    </div>
                    <div>
                      <Badge color={haplo.type === 'maternal' ? 'pink' : 'blue'}>
                        {haplo.type === 'maternal'
                          ? (isSpanish ? 'Linea Materna' : 'Maternal Line')
                          : (isSpanish ? 'Linea Paterna' : 'Paternal Line')
                        }
                      </Badge>
                      <p className="text-2xl font-bold text-title mt-1">{haplo.name}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-subtle" />
                      <span className="text-body">
                        {isSpanish ? 'Origen:' : 'Origin:'}{' '}
                        <span className="font-medium text-title">
                          {isSpanish ? haplo.originEs : haplo.origin}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-subtle" />
                      <span className="text-body">
                        {isSpanish ? 'Edad:' : 'Age:'}{' '}
                        <span className="font-medium text-title">{haplo.age}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-body mt-4 p-3 bg-white/50 rounded-xl">
                    {isSpanish ? haplo.descriptionEs : haplo.description}
                  </p>

                  {haplo.famousMembers && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-body mb-2">
                        {isSpanish ? 'Miembros Famosos:' : 'Famous Members:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {haplo.famousMembers.map((member, mIdx) => (
                          <Badge key={mIdx} color="gray" size="sm">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Grid>
        </div>
      )}

      {/* Ancient DNA Tab */}
      {activeTab === 'ancient' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-amber-200 rounded-xl flex items-center justify-center">
                <History className="w-8 h-8 text-amber-700" />
              </div>
              <div>
                <Title>{isSpanish ? 'Tu Herencia Antigua' : 'Your Ancient Heritage'}</Title>
                <Text className="mt-1">
                  {isSpanish
                    ? 'ADN heredado de especies humanas antiguas que se mezclaron con nuestros ancestros'
                    : 'DNA inherited from ancient human species that interbred with our ancestors'}
                </Text>
              </div>
            </div>
          </Card>

          <Grid numItems={1} numItemsSm={2} className="gap-6">
            {/* Neanderthal Card */}
            <Col>
              <Card className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted">
                      {isSpanish ? 'ADN Neandertal' : 'Neanderthal DNA'}
                    </p>
                    <p className="text-4xl font-bold text-amber-600">{ANCIENT_DNA.neanderthal}%</p>
                  </div>
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <ProgressBar value={ANCIENT_DNA.neanderthal * 20} color="amber" />
                <p className="text-sm text-body mt-4">
                  {isSpanish
                    ? 'Los Neandertales vivieron en Europa y Asia occidental hace 400,000-40,000 anos. Tu ADN Neandertal puede influir en tu sistema inmune, piel y cabello.'
                    : 'Neanderthals lived in Europe and western Asia from 400,000-40,000 years ago. Your Neanderthal DNA may influence your immune system, skin, and hair.'}
                </p>

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                    {isSpanish ? 'Posibles rasgos heredados:' : 'Possible inherited traits:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      isSpanish ? 'Respuesta inmune' : 'Immune response',
                      isSpanish ? 'Tipo de cabello' : 'Hair type',
                      isSpanish ? 'Tono de piel' : 'Skin tone',
                      isSpanish ? 'Patron de sueno' : 'Sleep pattern',
                    ].map((trait, idx) => (
                      <Badge key={idx} color="amber" size="sm">{trait}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Col>

            {/* Denisovan Card */}
            <Col>
              <Card className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted">
                      {isSpanish ? 'ADN Denisovano' : 'Denisovan DNA'}
                    </p>
                    <p className="text-4xl font-bold text-accent">{ANCIENT_DNA.denisovan}%</p>
                  </div>
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <ProgressBar value={ANCIENT_DNA.denisovan * 200} color="purple" />
                <p className="text-sm text-body mt-4">
                  {isSpanish
                    ? 'Los Denisovanos son primos misteriosos de los Neandertales, conocidos principalmente por ADN encontrado en una cueva en Siberia. Dejaron mas huella genetica en poblaciones asiaticas y oceanicas.'
                    : 'Denisovans are mysterious cousins of Neanderthals, known mainly from DNA found in a Siberian cave. They left more genetic imprint in Asian and Oceanian populations.'}
                </p>

                <div className="mt-4 p-3 bg-accent-soft rounded-xl">
                  <p className="text-sm font-medium text-purple-800 mb-2">
                    {isSpanish ? 'Posibles rasgos heredados:' : 'Possible inherited traits:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      isSpanish ? 'Adaptacion altitud' : 'Altitude adaptation',
                      isSpanish ? 'Sistema inmune' : 'Immune system',
                      isSpanish ? 'Metabolismo' : 'Metabolism',
                    ].map((trait, idx) => (
                      <Badge key={idx} color="purple" size="sm">{trait}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Col>
          </Grid>

          {/* Fun comparison */}
          <Card>
            <Title className="mb-4">
              {isSpanish ? '¿Como te comparas?' : 'How do you compare?'}
            </Title>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-body">
                    {isSpanish ? 'Promedio europeo' : 'European average'}
                  </span>
                  <span className="text-sm font-medium">2.0% Neanderthal</span>
                </div>
                <ProgressBar value={40} color="gray" className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-body">
                    {isSpanish ? 'Tu resultado' : 'Your result'}
                  </span>
                  <span className="text-sm font-medium text-amber-600">{ANCIENT_DNA.neanderthal}% Neanderthal</span>
                </div>
                <ProgressBar value={46} color="amber" className="h-2" />
              </div>
              <p className="text-sm text-muted text-center mt-4">
                {isSpanish
                  ? `Tu ADN Neandertal esta ${ANCIENT_DNA.neanderthal > 2.0 ? 'por encima' : 'cerca'} del promedio europeo`
                  : `Your Neanderthal DNA is ${ANCIENT_DNA.neanderthal > 2.0 ? 'above' : 'near'} the European average`}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Disclaimer */}
      <Card className="bg-surface-soft border border-adaptive">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-muted mt-0.5" />
          <div>
            <p className="font-medium text-body">
              {isSpanish ? 'Nota Educativa' : 'Educational Note'}
            </p>
            <p className="text-sm text-body mt-1">
              {isSpanish
                ? 'Estos datos son una demostracion educativa. Los resultados de ascendencia reales requieren pruebas de ADN profesionales y pueden variar segun la base de datos de referencia utilizada.'
                : 'This data is an educational demonstration. Real ancestry results require professional DNA testing and may vary based on the reference database used.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
