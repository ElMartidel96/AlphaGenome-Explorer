'use client'

import { useState } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Pill,
  Search,
  Target,
  ExternalLink,
  FlaskConical,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Info,
  BookOpen,
  TrendingUp,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DrugTarget {
  id: string
  gene: string
  fullName: string
  fullNameEs: string
  tractabilityScore: number // 1-10
  category: 'kinase' | 'receptor' | 'enzyme' | 'ion_channel' | 'transporter'
  pipelineStatus: 'preclinical' | 'phase1' | 'phase2' | 'phase3' | 'approved'
  indication: string
  indicationEs: string
  compounds: { name: string; phase: string; company: string }[]
  publications: number
  description: string
  descriptionEs: string
}

const DRUG_TARGETS: DrugTarget[] = [
  {
    id: 'egfr',
    gene: 'EGFR',
    fullName: 'Epidermal Growth Factor Receptor',
    fullNameEs: 'Receptor del Factor de Crecimiento Epidermico',
    tractabilityScore: 9,
    category: 'receptor',
    pipelineStatus: 'approved',
    indication: 'Non-small cell lung cancer, colorectal cancer',
    indicationEs: 'Cancer de pulmon de celulas no pequenas, cancer colorrectal',
    compounds: [
      { name: 'Erlotinib', phase: 'Approved', company: 'Roche' },
      { name: 'Gefitinib', phase: 'Approved', company: 'AstraZeneca' },
      { name: 'Osimertinib', phase: 'Approved', company: 'AstraZeneca' },
    ],
    publications: 45000,
    description: 'Transmembrane receptor tyrosine kinase. Mutations drive cell proliferation in many cancers.',
    descriptionEs: 'Receptor tirosina quinasa transmembrana. Las mutaciones impulsan la proliferacion celular en muchos canceres.',
  },
  {
    id: 'braf',
    gene: 'BRAF',
    fullName: 'B-Raf Proto-Oncogene',
    fullNameEs: 'Proto-Oncogen B-Raf',
    tractabilityScore: 8,
    category: 'kinase',
    pipelineStatus: 'approved',
    indication: 'Melanoma, thyroid cancer',
    indicationEs: 'Melanoma, cancer de tiroides',
    compounds: [
      { name: 'Vemurafenib', phase: 'Approved', company: 'Roche' },
      { name: 'Dabrafenib', phase: 'Approved', company: 'Novartis' },
      { name: 'Encorafenib', phase: 'Approved', company: 'Pfizer' },
    ],
    publications: 12000,
    description: 'Serine/threonine kinase in RAS/MAPK pathway. V600E mutation found in ~50% of melanomas.',
    descriptionEs: 'Serina/treonina quinasa en via RAS/MAPK. Mutacion V600E encontrada en ~50% de melanomas.',
  },
  {
    id: 'her2',
    gene: 'ERBB2 (HER2)',
    fullName: 'Human Epidermal Growth Factor Receptor 2',
    fullNameEs: 'Receptor 2 del Factor de Crecimiento Epidermico Humano',
    tractabilityScore: 9,
    category: 'receptor',
    pipelineStatus: 'approved',
    indication: 'Breast cancer, gastric cancer',
    indicationEs: 'Cancer de mama, cancer gastrico',
    compounds: [
      { name: 'Trastuzumab', phase: 'Approved', company: 'Roche' },
      { name: 'Pertuzumab', phase: 'Approved', company: 'Roche' },
      { name: 'T-DXd', phase: 'Approved', company: 'Daiichi/AstraZeneca' },
    ],
    publications: 30000,
    description: 'Receptor tyrosine kinase amplified in ~20% of breast cancers. Target of antibody therapies.',
    descriptionEs: 'Receptor tirosina quinasa amplificado en ~20% de canceres de mama. Blanco de terapias de anticuerpos.',
  },
  {
    id: 'bcr_abl',
    gene: 'BCR-ABL1',
    fullName: 'BCR-ABL Fusion Kinase',
    fullNameEs: 'Quinasa de Fusion BCR-ABL',
    tractabilityScore: 10,
    category: 'kinase',
    pipelineStatus: 'approved',
    indication: 'Chronic myeloid leukemia',
    indicationEs: 'Leucemia mieloide cronica',
    compounds: [
      { name: 'Imatinib', phase: 'Approved', company: 'Novartis' },
      { name: 'Dasatinib', phase: 'Approved', company: 'BMS' },
      { name: 'Asciminib', phase: 'Approved', company: 'Novartis' },
    ],
    publications: 18000,
    description: 'Philadelphia chromosome fusion protein. Imatinib transformed CML from fatal to manageable disease.',
    descriptionEs: 'Proteina de fusion del cromosoma Filadelfia. Imatinib transformo la LMC de enfermedad fatal a manejable.',
  },
  {
    id: 'pd1',
    gene: 'PDCD1 (PD-1)',
    fullName: 'Programmed Cell Death Protein 1',
    fullNameEs: 'Proteina de Muerte Celular Programada 1',
    tractabilityScore: 9,
    category: 'receptor',
    pipelineStatus: 'approved',
    indication: 'Multiple cancers (immune checkpoint)',
    indicationEs: 'Multiples canceres (checkpoint inmunologico)',
    compounds: [
      { name: 'Pembrolizumab', phase: 'Approved', company: 'Merck' },
      { name: 'Nivolumab', phase: 'Approved', company: 'BMS' },
    ],
    publications: 25000,
    description: 'Immune checkpoint receptor. Blocking PD-1 unleashes T-cell anti-tumor responses.',
    descriptionEs: 'Receptor de checkpoint inmunologico. Bloquear PD-1 libera respuestas antitumorales de celulas T.',
  },
  {
    id: 'pcsk9',
    gene: 'PCSK9',
    fullName: 'Proprotein Convertase Subtilisin/Kexin Type 9',
    fullNameEs: 'Proproteina Convertasa Subtilisina/Kexina Tipo 9',
    tractabilityScore: 8,
    category: 'enzyme',
    pipelineStatus: 'approved',
    indication: 'Hypercholesterolemia, cardiovascular disease',
    indicationEs: 'Hipercolesterolemia, enfermedad cardiovascular',
    compounds: [
      { name: 'Evolocumab', phase: 'Approved', company: 'Amgen' },
      { name: 'Alirocumab', phase: 'Approved', company: 'Regeneron' },
      { name: 'Inclisiran', phase: 'Approved', company: 'Novartis' },
    ],
    publications: 5000,
    description: 'Serine protease that degrades LDL receptors. Loss-of-function variants protect against heart disease.',
    descriptionEs: 'Serina proteasa que degrada receptores de LDL. Variantes de perdida de funcion protegen contra enfermedad cardiaca.',
  },
  {
    id: 'kras',
    gene: 'KRAS',
    fullName: 'Kirsten Rat Sarcoma Viral Oncogene',
    fullNameEs: 'Oncogen Viral del Sarcoma de Rata Kirsten',
    tractabilityScore: 6,
    category: 'enzyme',
    pipelineStatus: 'approved',
    indication: 'Lung cancer, pancreatic cancer',
    indicationEs: 'Cancer de pulmon, cancer pancreatico',
    compounds: [
      { name: 'Sotorasib', phase: 'Approved', company: 'Amgen' },
      { name: 'Adagrasib', phase: 'Approved', company: 'Mirati' },
    ],
    publications: 20000,
    description: 'Previously considered "undruggable" for 40 years. G12C mutation now targetable with covalent inhibitors.',
    descriptionEs: 'Previamente considerado "no farmacable" por 40 anos. Mutacion G12C ahora targeteable con inhibidores covalentes.',
  },
  {
    id: 'sglt2',
    gene: 'SLC5A2 (SGLT2)',
    fullName: 'Sodium-Glucose Cotransporter 2',
    fullNameEs: 'Cotransportador Sodio-Glucosa 2',
    tractabilityScore: 8,
    category: 'transporter',
    pipelineStatus: 'approved',
    indication: 'Type 2 diabetes, heart failure',
    indicationEs: 'Diabetes tipo 2, insuficiencia cardiaca',
    compounds: [
      { name: 'Empagliflozin', phase: 'Approved', company: 'Boehringer' },
      { name: 'Dapagliflozin', phase: 'Approved', company: 'AstraZeneca' },
    ],
    publications: 8000,
    description: 'Kidney glucose transporter. Inhibitors originally for diabetes, now also approved for heart failure.',
    descriptionEs: 'Transportador de glucosa renal. Inhibidores originalmente para diabetes, ahora tambien aprobados para insuficiencia cardiaca.',
  },
  {
    id: 'nav17',
    gene: 'SCN9A (Nav1.7)',
    fullName: 'Sodium Voltage-Gated Channel Alpha Subunit 9',
    fullNameEs: 'Canal de Sodio Voltaje-Dependiente Subunidad Alpha 9',
    tractabilityScore: 5,
    category: 'ion_channel',
    pipelineStatus: 'phase2',
    indication: 'Chronic pain',
    indicationEs: 'Dolor cronico',
    compounds: [
      { name: 'VX-150', phase: 'Phase 2', company: 'Vertex' },
      { name: 'BIIB-095', phase: 'Phase 1', company: 'Biogen' },
    ],
    publications: 3000,
    description: 'Pain signaling channel. People with loss-of-function mutations feel no pain. Could replace opioids.',
    descriptionEs: 'Canal de senalizacion del dolor. Personas con mutaciones de perdida de funcion no sienten dolor. Podria reemplazar opioides.',
  },
  {
    id: 'ttr',
    gene: 'TTR',
    fullName: 'Transthyretin',
    fullNameEs: 'Transtiretina',
    tractabilityScore: 7,
    category: 'enzyme',
    pipelineStatus: 'approved',
    indication: 'Hereditary transthyretin amyloidosis',
    indicationEs: 'Amiloidosis por transtiretina hereditaria',
    compounds: [
      { name: 'Patisiran (RNAi)', phase: 'Approved', company: 'Alnylam' },
      { name: 'Tafamidis', phase: 'Approved', company: 'Pfizer' },
    ],
    publications: 2500,
    description: 'Misfolded TTR causes amyloid deposits. First RNAi therapy (patisiran) approved for this target.',
    descriptionEs: 'TTR mal plegada causa depositos amiloides. Primera terapia de ARNi (patisiran) aprobada para este blanco.',
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  kinase: 'Quinasa',
  receptor: 'Receptor',
  enzyme: 'Enzima',
  ion_channel: 'Canal Ionico',
  transporter: 'Transportador',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  preclinical: { label: 'Preclinico', color: 'gray' },
  phase1: { label: 'Fase 1', color: 'blue' },
  phase2: { label: 'Fase 2', color: 'indigo' },
  phase3: { label: 'Fase 3', color: 'purple' },
  approved: { label: 'Aprobado', color: 'green' },
}

export function DrugTargetFinder() {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTarget, setSelectedTarget] = useState<DrugTarget | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filtered = DRUG_TARGETS
    .filter((dt) => categoryFilter === 'all' || dt.category === categoryFilter)
    .filter((dt) =>
      dt.gene.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dt.fullNameEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dt.indicationEs.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-purple-500" />
          </div>
          <Title className="text-title">Descubridor de Targets de Drogas</Title>
          <Text className="text-body mt-2 max-w-lg mx-auto">
            Explora genes druggable con scores de tractabilidad, estado del pipeline farmaceutico
            y compuestos en desarrollo.
          </Text>
        </div>
      </Card>

      {/* Search & filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por gen, nombre o indicacion..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-soft border border-adaptive rounded-xl text-body text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2.5 bg-surface-soft border border-adaptive rounded-xl text-body text-sm"
          >
            <option value="all">Todas las categorias</option>
            <option value="kinase">Quinasas</option>
            <option value="receptor">Receptores</option>
            <option value="enzyme">Enzimas</option>
            <option value="ion_channel">Canales Ionicos</option>
            <option value="transporter">Transportadores</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target cards */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((target) => (
            <Card
              key={target.id}
              className={`cursor-pointer transition-all ${
                selectedTarget?.id === target.id
                  ? 'ring-2 ring-purple-500 dark:ring-purple-400'
                  : 'hover:ring-1 hover:ring-purple-300 dark:hover:ring-purple-700'
              }`}
              onClick={() => setSelectedTarget(target)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-title">{target.gene}</span>
                    <Badge color={STATUS_LABELS[target.pipelineStatus].color as any} size="xs">
                      {STATUS_LABELS[target.pipelineStatus].label}
                    </Badge>
                    <Badge color="gray" size="xs">{CATEGORY_LABELS[target.category]}</Badge>
                  </div>
                  <p className="text-sm text-body mt-1">{target.fullNameEs}</p>
                  <p className="text-xs text-muted mt-1">{target.indicationEs}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-purple-500" />
                      <span className="text-xs font-medium text-title">Tractabilidad: {target.tractabilityScore}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-muted">{target.compounds.length} compuestos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-muted">{target.publications.toLocaleString()} publicaciones</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Details panel */}
        <div>
          {selectedTarget ? (
            <div className="space-y-4">
              <Card>
                <Title className="text-title">{selectedTarget.gene}</Title>
                <Text className="text-muted text-sm italic">{selectedTarget.fullNameEs}</Text>
                <p className="text-sm text-body mt-3">{selectedTarget.descriptionEs}</p>

                {/* Tractability */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Tractabilidad</span>
                    <span className="font-medium text-title">{selectedTarget.tractabilityScore}/10</span>
                  </div>
                  <ProgressBar value={selectedTarget.tractabilityScore * 10} color="purple" />
                </div>
              </Card>

              {/* Compounds */}
              <Card>
                <Title className="text-title text-sm mb-3">Compuestos en Desarrollo</Title>
                <div className="space-y-2">
                  {selectedTarget.compounds.map((compound, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-surface-soft rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-title">{compound.name}</p>
                        <p className="text-xs text-muted">{compound.company}</p>
                      </div>
                      <Badge color={compound.phase === 'Approved' ? 'green' : 'blue'} size="xs">
                        {compound.phase}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="p-3 bg-surface-soft rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted">
                    Datos basados en informacion publica de ensayos clinicos y literatura cientifica.
                    No constituye recomendacion medica.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <Pill className="w-12 h-12 text-muted mx-auto mb-3" />
                <Text className="text-muted">Selecciona un target para ver detalles</Text>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
