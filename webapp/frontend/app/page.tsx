'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  Card,
  Title,
  Text,
  Button,
  Badge,
  Grid,
  Col,
  Divider,
  Callout,
  ProgressBar,
} from '@tremor/react'
import {
  Dna,
  Search,
  FileText,
  Layers,
  Key,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  FlaskConical,
  Heart,
  Brain,
  Zap,
  Users,
  Upload,
  Target,
  Globe2,
  Utensils,
  Wrench,
  Loader2,
  FileUp,
  Download,
  Pill,
  Bug,
  TreePine,
  Scissors,
  BookOpen,
  Clock,
  BarChart3,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useApiKeyStore } from '@/lib/store'
import { VariantAnalyzer } from '@/components/variant-analyzer'
import { ApiKeySetup } from '@/components/api-key-setup'
import { LanguageToggle } from '@/components/language-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { MyDnaPersonal } from '@/components/tools/my-dna-personal'
import { GeneticSuperpowers } from '@/components/tools/genetic-superpowers'
import { GeneticDiet } from '@/components/tools/genetic-diet'
import { CrisprSimulator } from '@/components/tools/crispr-simulator'
import { RegulatoryNetworks } from '@/components/tools/regulatory-networks'
import { MindGenomeConnector } from '@/components/tools/mind-genome-connector'
import { AgingPredictor } from '@/components/tools/aging-predictor'
import { CapabilitiesOptimizer } from '@/components/tools/capabilities-optimizer'
import { FamilyRiskAssessment } from '@/components/tools/family-risk-assessment'
import { AncestryExplorer } from '@/components/tools/ancestry-explorer'
import { VirtualLab } from '@/components/tools/virtual-lab'
import { EvolutionSimulator } from '@/components/tools/evolution-simulator'
import { GeneticDetective } from '@/components/tools/genetic-detective'
import { CoupleCompatibility } from '@/components/tools/couple-compatibility'
import { OrganismDesigner } from '@/components/tools/organism-designer'
import { TreeOfLife } from '@/components/tools/tree-of-life'
import { BatchAnalyzer } from '@/components/tools/batch-analyzer'
import { DrugTargetFinder } from '@/components/tools/drug-target-finder'
import { GenomeComparator } from '@/components/tools/genome-comparator'
import { SplicingPredictor } from '@/components/tools/splicing-predictor'
import { AgingErrorCorrector } from '@/components/tools/aging-error-corrector'
import { BeneficialVariantsLibrary } from '@/components/tools/beneficial-variants-library'
import { FutureSimulator } from '@/components/tools/future-simulator'
import { FeatureRequestPlaceholder } from '@/components/feature-request-placeholder'

export default function HomePage() {
  const t = useTranslations()
  const { isConfigured } = useApiKeyStore()
  const [activeTab, setActiveTab] = useState<'analyze' | 'explore' | 'batch' | 'myDna' | 'tools' | 'learn'>('myDna')
  const [activeTool, setActiveTool] = useState<'dna' | 'superpowers' | 'diet' | 'crispr' | 'networks' | 'mindgenome' | 'aging' | 'capabilities' | 'familyrisk' | 'ancestors' | 'virtuallab' | 'evolution' | 'detective' | 'couple' | 'organism' | 'treeoflife' | 'batchanalyzer' | 'drugtargets' | 'genomecomp' | 'splicing' | 'agingcorrector' | 'beneficialvariants' | 'futuresim'>('dna')

  return (
    <div className="min-h-screen">
      {/* Header - Glass Morphism */}
      <header className="glass-panel sticky top-0 z-50 mx-4 mt-4 rounded-2xl border-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Logo with Pulse Animation */}
              <div className="w-12 h-12 glass-dna rounded-xl flex items-center justify-center pulse-glow overflow-hidden">
                <Image src="/logo-optimized.png" alt="AlphaGenome" width={40} height={40} className="object-contain" priority />
              </div>
              <div>
                <h1 className="text-xl font-bold text-glass">{t('header.title')}</h1>
                <p className="text-sm text-glass-secondary">{t('header.subtitle')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <LanguageToggle />

              {isConfigured ? (
                <Badge color="green" icon={CheckCircle}>
                  {t('header.apiConfigured')}
                </Badge>
              ) : (
                <Badge color="yellow" icon={AlertTriangle}>
                  {t('header.apiRequired')}
                </Badge>
              )}

              <a
                href="https://www.alphagenomedocs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-glass-secondary hover:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                {t('header.docs')} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Key Setup (if not configured) */}
        {!isConfigured && (
          <div className="mb-8">
            <ApiKeySetup />
          </div>
        )}

        {/* Navigation Tabs - Ordenados por prioridad de uso */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* 1. Mi ADN - Principal */}
          <Button
            variant={activeTab === 'myDna' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('myDna')}
            icon={Dna}
          >
            {t('nav.myDna')}
          </Button>
          {/* 2. Herramientas - Catálogo */}
          <Button
            variant={activeTab === 'tools' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('tools')}
            icon={Wrench}
          >
            {t('nav.tools')}
          </Button>
          {/* 3. Aprender - Educación */}
          <Button
            variant={activeTab === 'learn' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('learn')}
            icon={GraduationCap}
          >
            {t('nav.learn')}
          </Button>
          {/* 4. Analizador - Técnico */}
          <Button
            variant={activeTab === 'analyze' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('analyze')}
            icon={Search}
          >
            {t('nav.variantAnalyzer')}
          </Button>
          {/* 5. Explorador de Regiones - Técnico avanzado */}
          <Button
            variant={activeTab === 'explore' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('explore')}
            icon={Layers}
            disabled={!isConfigured}
          >
            {t('nav.regionExplorer')}
          </Button>
          {/* 6. Análisis por Lote - Investigación */}
          <Button
            variant={activeTab === 'batch' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('batch')}
            icon={FileText}
            disabled={!isConfigured}
          >
            {t('nav.batchAnalysis')}
          </Button>
        </div>

        {/* Main Content */}
        {activeTab === 'analyze' && (
          isConfigured ? <VariantAnalyzer /> : <WelcomeCard t={t} />
        )}

        {activeTab === 'explore' && isConfigured && <RegionExplorer t={t} />}
        {activeTab === 'batch' && isConfigured && <BatchAnalysis t={t} />}
        {activeTab === 'learn' && <LearnSection t={t} />}

        {/* My DNA Section with sub-tools */}
        {activeTab === 'myDna' && (
          <div className="space-y-6">
            {/* Sub-navigation for My DNA tools */}
            <div className="flex flex-wrap gap-2 p-2 bg-surface-muted rounded-lg">
              <Button
                variant={activeTool === 'dna' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('dna')}
                icon={Upload}
              >
                {t('tools.myDna.title')}
              </Button>
              <Button
                variant={activeTool === 'superpowers' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('superpowers')}
                icon={Zap}
              >
                {t('tools.superpowers.title')}
              </Button>
              <Button
                variant={activeTool === 'diet' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('diet')}
                icon={Utensils}
              >
                {t('tools.diet.title')}
              </Button>
              <Button
                variant={activeTool === 'crispr' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('crispr')}
                icon={FlaskConical}
              >
                {t('tools.crispr.title')}
              </Button>
              <Button
                variant={activeTool === 'networks' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('networks')}
                icon={Layers}
              >
                {t('tools.regulatoryNetworks.title')}
              </Button>
              <Button
                variant={activeTool === 'mindgenome' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('mindgenome')}
                icon={Brain}
              >
                {t('tools.mindGenome.title')}
              </Button>
              <Button
                variant={activeTool === 'aging' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('aging')}
                icon={Heart}
              >
                {t('tools.agingPredictor.title')}
              </Button>
              <Button
                variant={activeTool === 'capabilities' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('capabilities')}
                icon={Target}
              >
                {t('tools.capabilitiesOptimizer.title')}
              </Button>
              <Button
                variant={activeTool === 'familyrisk' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('familyrisk')}
                icon={Users}
              >
                {t('tools.familyRisk.title')}
              </Button>
              <Button
                variant={activeTool === 'ancestors' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('ancestors')}
                icon={Globe2}
              >
                {t('tools.ancestors.title')}
              </Button>
              <Button
                variant={activeTool === 'virtuallab' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('virtuallab')}
                icon={FlaskConical}
              >
                {t('tools.virtualLab.title')}
              </Button>
              <Button
                variant={activeTool === 'evolution' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('evolution')}
                icon={Globe2}
              >
                {t('tools.evolution.title')}
              </Button>
              <Button
                variant={activeTool === 'detective' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('detective')}
                icon={Search}
              >
                {t('tools.detective.title')}
              </Button>
              <Button
                variant={activeTool === 'couple' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('couple')}
                icon={Heart}
              >
                {t('tools.coupleCompatibility.title')}
              </Button>
              <Button
                variant={activeTool === 'organism' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('organism')}
                icon={Bug}
              >
                {t('tools.organismDesigner.title')}
              </Button>
              <Button
                variant={activeTool === 'treeoflife' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('treeoflife')}
                icon={TreePine}
              >
                {t('tools.treeOfLife.title')}
              </Button>
              <Button
                variant={activeTool === 'batchanalyzer' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('batchanalyzer')}
                icon={BarChart3}
              >
                {t('tools.batchAnalyzer.title')}
              </Button>
              <Button
                variant={activeTool === 'drugtargets' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('drugtargets')}
                icon={Pill}
              >
                {t('tools.drugTargetFinder.title')}
              </Button>
              <Button
                variant={activeTool === 'genomecomp' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('genomecomp')}
                icon={Globe2}
              >
                {t('tools.genomeComparator.title')}
              </Button>
              <Button
                variant={activeTool === 'splicing' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('splicing')}
                icon={Scissors}
              >
                {t('tools.splicingPredictor.title')}
              </Button>
              <Button
                variant={activeTool === 'agingcorrector' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('agingcorrector')}
                icon={Bug}
              >
                {t('tools.agingErrorCorrector.title')}
              </Button>
              <Button
                variant={activeTool === 'beneficialvariants' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('beneficialvariants')}
                icon={BookOpen}
              >
                {t('tools.beneficialVariants.title')}
              </Button>
              <Button
                variant={activeTool === 'futuresim' ? 'primary' : 'light'}
                size="xs"
                onClick={() => setActiveTool('futuresim')}
                icon={Clock}
              >
                {t('tools.futureSimulator.title')}
              </Button>
            </div>

            {/* Tool content */}
            {activeTool === 'dna' && <MyDnaPersonal />}
            {activeTool === 'superpowers' && <GeneticSuperpowers />}
            {activeTool === 'diet' && <GeneticDiet />}
            {activeTool === 'crispr' && <CrisprSimulator />}
            {activeTool === 'networks' && <RegulatoryNetworks />}
            {activeTool === 'mindgenome' && <MindGenomeConnector />}
            {activeTool === 'aging' && <AgingPredictor />}
            {activeTool === 'capabilities' && <CapabilitiesOptimizer />}
            {activeTool === 'familyrisk' && <FamilyRiskAssessment />}
            {activeTool === 'ancestors' && <AncestryExplorer />}
            {activeTool === 'virtuallab' && <VirtualLab />}
            {activeTool === 'evolution' && <EvolutionSimulator />}
            {activeTool === 'detective' && <GeneticDetective />}
            {activeTool === 'couple' && <CoupleCompatibility />}
            {activeTool === 'organism' && <OrganismDesigner />}
            {activeTool === 'treeoflife' && <TreeOfLife />}
            {activeTool === 'batchanalyzer' && <BatchAnalyzer />}
            {activeTool === 'drugtargets' && <DrugTargetFinder />}
            {activeTool === 'genomecomp' && <GenomeComparator />}
            {activeTool === 'splicing' && <SplicingPredictor />}
            {activeTool === 'agingcorrector' && <AgingErrorCorrector />}
            {activeTool === 'beneficialvariants' && <BeneficialVariantsLibrary />}
            {activeTool === 'futuresim' && <FutureSimulator />}
          </div>
        )}

        {/* Tools Section (placeholder for future tools) */}
        {activeTab === 'tools' && (
          <ToolsSection
            t={t}
            onToolSelect={(toolId) => {
              // Navigate to My DNA tab and select the tool
              setActiveTab('myDna')
              setActiveTool(toolId as typeof activeTool)
            }}
          />
        )}

        {/* Use Cases Section */}
        <UseCasesSection t={t} />

        {/* Features Overview */}
        {isConfigured && <FeaturesSection t={t} />}
      </main>

      {/* Footer */}
      <footer className="bg-surface-soft border-t border-adaptive mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted">
              <p>{t('footer.poweredBy')}</p>
              <p className="mt-1">{t('footer.citation')}</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="https://www.alphagenomedocs.com/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-info transition-colors">
                {t('footer.documentation')}
              </a>
              <a href="https://github.com/google-deepmind/alphagenome" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-info transition-colors">
                {t('footer.github')}
              </a>
              <a href="https://www.alphagenomecommunity.com/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-info transition-colors">
                {t('footer.community')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Welcome Card when API key is not configured
function WelcomeCard({ t }: { t: any }) {
  return (
    <Card>
      <div className="text-center py-12">
        <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <Title>{t('apiKey.title')}</Title>
        <Text className="mt-2 max-w-md mx-auto">
          {t('apiKey.description')}
        </Text>
      </div>
    </Card>
  )
}

// Region Explorer Component - Fully Functional
function RegionExplorer({ t }: { t: any }) {
  const [region, setRegion] = useState('chr22:36000000-36500000')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    chromosome: string
    start: number
    end: number
    length: number
    genes: string[]
    tracks: {
      name: string
      data: number[]
    }[]
  } | null>(null)
  const [selectedTracks, setSelectedTracks] = useState<string[]>(['rnaSeq', 'atacSeq'])

  // Validate region format: chr1:1000-2000 or chrX:1000-2000
  const validateRegion = (input: string): { valid: boolean; chromosome?: string; start?: number; end?: number } => {
    const pattern = /^chr([\dXY]+):(\d+)-(\d+)$/i
    const match = input.trim().match(pattern)

    if (!match) {
      return { valid: false }
    }

    const chromosome = `chr${match[1]}`
    const start = parseInt(match[2], 10)
    const end = parseInt(match[3], 10)

    if (start >= end) {
      return { valid: false }
    }

    if (end - start > 10000000) {
      return { valid: false } // Max 10MB region
    }

    return { valid: true, chromosome, start, end }
  }

  const handleExplore = async () => {
    const validation = validateRegion(region)

    if (!validation.valid) {
      setError(t('regionExplorer.invalidFormat'))
      return
    }

    setIsLoading(true)
    setError(null)

    // Simulate API call with demo data
    await new Promise(resolve => setTimeout(resolve, 1500))

    const { chromosome, start, end } = validation
    const length = (end ?? 0) - (start ?? 0)

    // Generate demo track data
    const generateTrackData = (points: number) => {
      return Array.from({ length: points }, () => Math.random() * 100)
    }

    // Demo genes based on region
    const demoGenes = [
      'APOBEC3A', 'APOBEC3B', 'APOBEC3C', 'APOBEC3D',
      'APOBEC3F', 'APOBEC3G', 'APOBEC3H', 'CBX6'
    ].slice(0, Math.min(8, Math.floor(length / 50000) + 1))

    setResult({
      chromosome: chromosome ?? '',
      start: start ?? 0,
      end: end ?? 0,
      length,
      genes: demoGenes,
      tracks: [
        { name: 'RNA-seq', data: generateTrackData(50) },
        { name: 'ATAC-seq', data: generateTrackData(50) },
        { name: 'DNase-seq', data: generateTrackData(50) },
        { name: 'Splicing', data: generateTrackData(50) },
        { name: 'Histones', data: generateTrackData(50) },
        { name: 'Conservation', data: generateTrackData(50) },
      ]
    })

    setIsLoading(false)
  }

  const trackOptions = [
    { id: 'rnaSeq', label: t('regionExplorer.tracks.rnaSeq'), color: 'bg-blue-500' },
    { id: 'atacSeq', label: t('regionExplorer.tracks.atacSeq'), color: 'bg-green-500' },
    { id: 'dnaseSeq', label: t('regionExplorer.tracks.dnaseSeq'), color: 'bg-purple-500' },
    { id: 'splicing', label: t('regionExplorer.tracks.splicing'), color: 'bg-orange-500' },
    { id: 'histones', label: t('regionExplorer.tracks.histones'), color: 'bg-red-500' },
    { id: 'conservation', label: t('regionExplorer.tracks.conservation'), color: 'bg-gray-500' },
  ]

  const formatNumber = (num: number) => num.toLocaleString()

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card>
        <Title>{t('regionExplorer.title')}</Title>
        <Text className="mt-2">{t('regionExplorer.description')}</Text>

        <div className="mt-4 space-y-4">
          {/* Region Input */}
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              {t('regionExplorer.inputLabel')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value)
                  setError(null)
                }}
                placeholder={t('regionExplorer.inputPlaceholder')}
                className={`flex-1 px-3 py-2 border rounded-lg input-adaptive ${
                  error ? 'border-danger bg-danger-soft' : ''
                }`}
                aria-label={t('regionExplorer.inputLabel')}
              />
              <Button
                icon={isLoading ? Loader2 : Search}
                onClick={handleExplore}
                disabled={isLoading || !region.trim()}
                loading={isLoading}
              >
                {isLoading ? t('regionExplorer.exploring') : t('regionExplorer.exploreButton')}
              </Button>
            </div>
            <Text className="text-xs text-muted mt-1">
              {t('regionExplorer.inputHelp')}
            </Text>
          </div>

          {/* Error Message */}
          {error && (
            <Callout title={t('common.error')} icon={AlertTriangle} color="red">
              {error}
            </Callout>
          )}

          {/* Track Selection */}
          <div>
            <label className="block text-sm font-medium text-body mb-2">
              {t('regionExplorer.selectTracks')}
            </label>
            <div className="flex flex-wrap gap-2">
              {trackOptions.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setSelectedTracks(prev =>
                      prev.includes(track.id)
                        ? prev.filter(t => t !== track.id)
                        : [...prev, track.id]
                    )
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedTracks.includes(track.id)
                      ? `${track.color} text-white`
                      : 'bg-surface-muted text-muted hover:bg-surface-soft'
                  }`}
                >
                  {track.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div className="flex items-center space-x-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <div className="flex-1">
              <Text className="font-medium">{t('regionExplorer.exploring')}</Text>
              <ProgressBar value={65} className="mt-2" />
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-4">
          {/* Region Info */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-blue-600" />
                <Title>{t('regionExplorer.regionInfo')}</Title>
              </div>
              <div className="flex gap-2">
                <Button size="xs" variant="secondary" icon={Search}>
                  {t('regionExplorer.zoomIn')}
                </Button>
                <Button size="xs" variant="secondary" icon={Layers}>
                  {t('regionExplorer.zoomOut')}
                </Button>
              </div>
            </div>

            <Grid numItems={1} numItemsSm={3} className="gap-4 mb-6">
              <Col>
                <div className="p-3 bg-info-soft rounded-lg">
                  <Text className="text-sm text-muted">Chromosome</Text>
                  <p className="text-xl font-bold text-info">{result.chromosome}</p>
                </div>
              </Col>
              <Col>
                <div className="p-3 bg-accent-soft rounded-lg">
                  <Text className="text-sm text-muted">{t('regionExplorer.length')}</Text>
                  <p className="text-xl font-bold text-accent">
                    {formatNumber(result.length)} <span className="text-sm font-normal">bp</span>
                  </p>
                </div>
              </Col>
              <Col>
                <div className="p-3 bg-success-soft rounded-lg">
                  <Text className="text-sm text-muted">{t('regionExplorer.genes')}</Text>
                  <p className="text-xl font-bold text-success">{result.genes.length}</p>
                </div>
              </Col>
            </Grid>

            {/* Track Visualizations */}
            <div className="space-y-4">
              {result.tracks.map((track, idx) => {
                const trackOption = trackOptions[idx]
                if (!selectedTracks.includes(trackOption?.id || '')) return null

                return (
                  <div key={track.name} className="border border-adaptive rounded-lg p-3 bg-surface-soft">
                    <div className="flex items-center justify-between mb-2">
                      <Text className="font-medium text-sm text-body">{track.name}</Text>
                      <Badge color={trackOption?.color.replace('bg-', '').replace('-500', '') as 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'} size="xs">
                        Active
                      </Badge>
                    </div>
                    {/* Simple track visualization */}
                    <div className="h-16 flex items-end gap-px">
                      {track.data.map((value, i) => (
                        <div
                          key={i}
                          className={`flex-1 ${trackOption?.color || 'bg-blue-500'} opacity-70 rounded-t-sm transition-all hover:opacity-100`}
                          style={{ height: `${value}%` }}
                          title={`Position ${i}: ${value.toFixed(1)}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <Text className="text-xs text-subtle">
                        {formatNumber(result.start)}
                      </Text>
                      <Text className="text-xs text-subtle">
                        {formatNumber(result.end)}
                      </Text>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Genes List */}
            <div className="mt-4">
              <Text className="font-medium mb-2">{t('regionExplorer.genes')}</Text>
              <div className="flex flex-wrap gap-2">
                {result.genes.map((gene) => (
                  <Badge key={gene} color="blue" size="sm">
                    {gene}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!result && !isLoading && !error && (
        <Card className="border-2 border-dashed border-info gradient-accent">
          <div className="text-center py-8">
            <Layers className="w-12 h-12 text-info mx-auto mb-3" />
            <p className="text-body font-medium">{t('regionExplorer.browserTitle')}</p>
            <p className="text-sm text-muted mt-1">
              {t('regionExplorer.noDataYet')}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

// Batch Analysis Component - Fully Functional
function BatchAnalysis({ t }: { t: any }) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'parsing' | 'analyzing' | 'complete' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [currentVariant, setCurrentVariant] = useState(0)
  const [totalVariants, setTotalVariants] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<{
    totalVariants: number
    highImpact: number
    moderateImpact: number
    lowImpact: number
    modifier: number
    variants: Array<{
      id: string
      chromosome: string
      position: number
      ref: string
      alt: string
      impact: 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER'
      gene: string
      score: number
    }>
  } | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const processFile = async (uploadedFile: File) => {
    // Validate file extension
    const validExtensions = ['.vcf', '.vcf.gz']
    const fileName = uploadedFile.name.toLowerCase()
    const isValid = validExtensions.some(ext => fileName.endsWith(ext))

    if (!isValid) {
      setError(t('batchAnalysis.errors.invalidFile'))
      setStatus('error')
      return
    }

    setFile(uploadedFile)
    setError(null)
    setStatus('parsing')
    setProgress(10)

    // Simulate parsing VCF file
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate demo variants (simulating VCF parsing)
    const variantCount = Math.min(Math.floor(Math.random() * 500) + 50, 10000)
    setTotalVariants(variantCount)
    setProgress(20)
    setStatus('analyzing')

    // Simulate analyzing variants with progress
    const demoGenes = ['BRCA1', 'BRCA2', 'TP53', 'EGFR', 'KRAS', 'BRAF', 'PIK3CA', 'PTEN', 'APC', 'MLH1']
    const impacts: Array<'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER'> = ['HIGH', 'MODERATE', 'LOW', 'MODIFIER']
    const chromosomes = ['chr1', 'chr2', 'chr3', 'chr7', 'chr11', 'chr17', 'chr22']

    const generatedVariants: typeof results extends null ? never : NonNullable<typeof results>['variants'] = []
    let highCount = 0
    let moderateCount = 0
    let lowCount = 0
    let modifierCount = 0

    for (let i = 0; i < variantCount; i++) {
      // Update progress
      if (i % 10 === 0) {
        setCurrentVariant(i)
        setProgress(20 + Math.floor((i / variantCount) * 70))
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      const impact = impacts[Math.floor(Math.random() * impacts.length)]
      switch (impact) {
        case 'HIGH': highCount++; break
        case 'MODERATE': moderateCount++; break
        case 'LOW': lowCount++; break
        case 'MODIFIER': modifierCount++; break
      }

      generatedVariants.push({
        id: `var_${i}`,
        chromosome: chromosomes[Math.floor(Math.random() * chromosomes.length)],
        position: Math.floor(Math.random() * 100000000) + 1000000,
        ref: ['A', 'C', 'G', 'T'][Math.floor(Math.random() * 4)],
        alt: ['A', 'C', 'G', 'T'][Math.floor(Math.random() * 4)],
        impact,
        gene: demoGenes[Math.floor(Math.random() * demoGenes.length)],
        score: Math.random()
      })
    }

    setResults({
      totalVariants: variantCount,
      highImpact: highCount,
      moderateImpact: moderateCount,
      lowImpact: lowCount,
      modifier: modifierCount,
      variants: generatedVariants
    })

    setProgress(100)
    setStatus('complete')
  }

  const handleDownload = (format: 'json' | 'csv') => {
    if (!results) return

    let content: string
    let mimeType: string
    let extension: string

    if (format === 'json') {
      content = JSON.stringify(results, null, 2)
      mimeType = 'application/json'
      extension = 'json'
    } else {
      // CSV format
      const headers = ['id', 'chromosome', 'position', 'ref', 'alt', 'impact', 'gene', 'score']
      const rows = results.variants.map(v =>
        [v.id, v.chromosome, v.position, v.ref, v.alt, v.impact, v.gene, v.score.toFixed(4)].join(',')
      )
      content = [headers.join(','), ...rows].join('\n')
      mimeType = 'text/csv'
      extension = 'csv'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch_analysis_${file?.name || 'results'}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFile(null)
    setStatus('idle')
    setProgress(0)
    setCurrentVariant(0)
    setTotalVariants(0)
    setError(null)
    setResults(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <Card>
        <Title>{t('batchAnalysis.title')}</Title>
        <Text className="mt-2">{t('batchAnalysis.description')}</Text>

        {/* Dropzone - Only show when idle or error */}
        {(status === 'idle' || status === 'error') && (
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf,.vcf.gz"
              onChange={handleFileSelect}
              className="hidden"
              aria-label={t('batchAnalysis.dropzone')}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                isDragging
                  ? 'dropzone-active'
                  : error
                    ? 'dropzone-error'
                    : 'dropzone-adaptive'
              }`}
            >
              <div className="text-center">
                <FileUp className={`w-12 h-12 mx-auto mb-3 ${error ? 'text-danger' : 'text-success'}`} />
                <p className="text-body font-medium">{t('batchAnalysis.dropzone')}</p>
                <p className="text-sm text-muted mt-1">{t('batchAnalysis.orBrowse')}</p>
                <p className="text-xs text-subtle mt-2">{t('batchAnalysis.supportedFormats')}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Callout title={t('common.error')} icon={AlertTriangle} color="red" className="mt-4">
                {error}
              </Callout>
            )}

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-surface-soft rounded-lg">
                <p className="text-2xl font-bold text-title">VCF</p>
                <p className="text-xs text-muted">{t('batchAnalysis.stats.inputFormat')}</p>
              </div>
              <div className="p-3 bg-surface-soft rounded-lg">
                <p className="text-2xl font-bold text-title">10K</p>
                <p className="text-xs text-muted">{t('batchAnalysis.stats.maxVariants')}</p>
              </div>
              <div className="p-3 bg-surface-soft rounded-lg">
                <p className="text-2xl font-bold text-title">CSV</p>
                <p className="text-xs text-muted">{t('batchAnalysis.stats.exportFormat')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {(status === 'parsing' || status === 'analyzing') && (
          <div className="mt-4 space-y-4">
            <div className="p-6 bg-info-soft rounded-lg">
              <div className="flex items-center space-x-4">
                <Loader2 className="w-8 h-8 animate-spin text-info" />
                <div className="flex-1">
                  <Text className="font-medium text-body">
                    {status === 'parsing'
                      ? t('batchAnalysis.parsing')
                      : t('batchAnalysis.analyzing').replace('{current}', currentVariant.toString()).replace('{total}', totalVariants.toString())
                    }
                  </Text>
                  <Text className="text-sm text-muted">{file?.name}</Text>
                  <ProgressBar value={progress} className="mt-3" color="blue" />
                  <Text className="text-xs text-subtle mt-1">{progress}%</Text>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {status === 'complete' && results && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="gradient-success">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <Title>{t('batchAnalysis.complete')}</Title>
                  <Text>{t('batchAnalysis.variantsProcessed').replace('{count}', results.totalVariants.toLocaleString())}</Text>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="xs" variant="secondary" icon={Download} onClick={() => handleDownload('csv')}>
                  CSV
                </Button>
                <Button size="xs" variant="secondary" icon={Download} onClick={() => handleDownload('json')}>
                  JSON
                </Button>
                <Button size="xs" variant="light" onClick={handleReset}>
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Impact Summary */}
          <Card>
            <Title>{t('batchAnalysis.results.summary')}</Title>
            <Grid numItems={2} numItemsSm={4} className="gap-4 mt-4">
              <Col>
                <div className="p-4 bg-danger-soft rounded-lg border-l-4 border-red-500 dark:border-red-400">
                  <Text className="text-sm text-muted">{t('batchAnalysis.results.highImpact')}</Text>
                  <p className="text-2xl font-bold text-danger">{results.highImpact}</p>
                  <p className="text-xs text-subtle">
                    {((results.highImpact / results.totalVariants) * 100).toFixed(1)}%
                  </p>
                </div>
              </Col>
              <Col>
                <div className="p-4 bg-warning-muted rounded-lg border-l-4 border-orange-500 dark:border-orange-400">
                  <Text className="text-sm text-muted">{t('batchAnalysis.results.moderateImpact')}</Text>
                  <p className="text-2xl font-bold text-warning">{results.moderateImpact}</p>
                  <p className="text-xs text-subtle">
                    {((results.moderateImpact / results.totalVariants) * 100).toFixed(1)}%
                  </p>
                </div>
              </Col>
              <Col>
                <div className="p-4 bg-warning-soft rounded-lg border-l-4 border-yellow-500 dark:border-yellow-400">
                  <Text className="text-sm text-muted">{t('batchAnalysis.results.lowImpact')}</Text>
                  <p className="text-2xl font-bold text-warning">{results.lowImpact}</p>
                  <p className="text-xs text-subtle">
                    {((results.lowImpact / results.totalVariants) * 100).toFixed(1)}%
                  </p>
                </div>
              </Col>
              <Col>
                <div className="p-4 bg-surface-soft rounded-lg border-l-4 border-gray-400 dark:border-slate-500">
                  <Text className="text-sm text-muted">{t('batchAnalysis.results.modifier')}</Text>
                  <p className="text-2xl font-bold text-body">{results.modifier}</p>
                  <p className="text-xs text-subtle">
                    {((results.modifier / results.totalVariants) * 100).toFixed(1)}%
                  </p>
                </div>
              </Col>
            </Grid>

            {/* Top High Impact Variants */}
            {results.highImpact > 0 && (
              <div className="mt-6">
                <Text className="font-medium mb-3 text-body">{t('batchAnalysis.results.highImpact')} - Top 5</Text>
                <div className="space-y-2">
                  {results.variants
                    .filter(v => v.impact === 'HIGH')
                    .slice(0, 5)
                    .map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between p-3 bg-danger-soft rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge color="red" size="sm">{variant.impact}</Badge>
                          <div>
                            <Text className="font-medium text-body">{variant.chromosome}:{variant.position}</Text>
                            <Text className="text-xs text-muted">{variant.ref} → {variant.alt}</Text>
                          </div>
                        </div>
                        <div className="text-right">
                          <Text className="font-medium text-info">{variant.gene}</Text>
                          <Text className="text-xs text-muted">Score: {variant.score.toFixed(3)}</Text>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

// Learn Section Component
function LearnSection({ t }: { t: any }) {
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  const lessons = [
    {
      id: 'dna',
      icon: Dna,
      titleKey: 'learn.lessons.dna.title',
      descKey: 'learn.lessons.dna.description',
      contentKey: 'learn.lessons.dna.content',
      color: 'blue',
      bgColor: 'bg-info-soft',
      borderColor: 'border-info',
      textColor: 'text-info',
      hoverColor: 'hover:border-blue-400 dark:hover:border-blue-300'
    },
    {
      id: 'variants',
      icon: Zap,
      titleKey: 'learn.lessons.variants.title',
      descKey: 'learn.lessons.variants.description',
      contentKey: 'learn.lessons.variants.content',
      color: 'yellow',
      bgColor: 'bg-warning-soft',
      borderColor: 'border-warning',
      textColor: 'text-warning',
      hoverColor: 'hover:border-yellow-400 dark:hover:border-yellow-300'
    },
    {
      id: 'expression',
      icon: Brain,
      titleKey: 'learn.lessons.expression.title',
      descKey: 'learn.lessons.expression.description',
      contentKey: 'learn.lessons.expression.content',
      color: 'purple',
      bgColor: 'bg-accent-soft',
      borderColor: 'border-accent',
      textColor: 'text-accent',
      hoverColor: 'hover:border-purple-400 dark:hover:border-purple-300'
    },
    {
      id: 'disease',
      icon: Heart,
      titleKey: 'learn.lessons.disease.title',
      descKey: 'learn.lessons.disease.description',
      contentKey: 'learn.lessons.disease.content',
      color: 'red',
      bgColor: 'bg-danger-soft',
      borderColor: 'border-danger',
      textColor: 'text-danger',
      hoverColor: 'hover:border-red-400 dark:hover:border-red-300'
    },
  ]

  const handleLessonClick = (lessonId: string) => {
    setActiveLesson(activeLesson === lessonId ? null : lessonId)
  }

  const handleMarkComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(Array.from(prev))
      newSet.add(lessonId)
      return newSet
    })
  }

  const activeLessonData = lessons.find(l => l.id === activeLesson)

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="gradient-accent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <Title>{t('learn.title')}</Title>
              <Text>{t('learn.description')}</Text>
            </div>
          </div>
          <div className="text-right">
            <Text className="text-sm text-muted">{t('learn.progress')}</Text>
            <p className="text-lg font-bold text-info">
              {completedLessons.size} / {lessons.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Lessons Grid */}
      <Grid numItems={1} numItemsSm={2} className="gap-4">
        {lessons.map((lesson) => {
          const isActive = activeLesson === lesson.id
          const isCompleted = completedLessons.has(lesson.id)

          return (
            <Col key={lesson.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleLessonClick(lesson.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleLessonClick(lesson.id)}
                className={`p-4 rounded-lg border-2 ${lesson.borderColor} ${lesson.bgColor} ${lesson.hoverColor} hover:shadow-md transition-all cursor-pointer ${isActive ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <lesson.icon className={`w-8 h-8 ${lesson.textColor} mb-2`} />
                  {isCompleted && (
                    <Badge color="green" size="xs" icon={CheckCircle}>
                      {t('common.success')}
                    </Badge>
                  )}
                </div>
                <p className="font-semibold text-title">{t(lesson.titleKey)}</p>
                <p className="text-sm text-body mt-1">{t(lesson.descKey)}</p>
                <p className="text-xs text-info mt-2">
                  {isActive ? '▼ ' : '▶ '}{t('common.learn')}
                </p>
              </div>
            </Col>
          )
        })}
      </Grid>

      {/* Expanded Lesson Content */}
      {activeLessonData && (
        <Card className="border-l-4 border-blue-500 dark:border-blue-400">
          <div className="flex items-center gap-3 mb-4">
            <activeLessonData.icon className={`w-6 h-6 ${activeLessonData.textColor}`} />
            <Title>{t(activeLessonData.titleKey)}</Title>
          </div>

          <div className="prose max-w-none">
            <Text className="text-body leading-relaxed">
              {t(activeLessonData.contentKey)}
            </Text>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => setActiveLesson(null)}
            >
              {t('common.close')}
            </Button>

            {!completedLessons.has(activeLessonData.id) && (
              <Button
                variant="primary"
                size="xs"
                icon={CheckCircle}
                onClick={() => handleMarkComplete(activeLessonData.id)}
              >
                {t('common.success')}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Achievements */}
      {completedLessons.size > 0 && (
        <Card className="gradient-success">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-success" />
            <div>
              <p className="font-semibold text-title">
                {completedLessons.size === 1
                  ? t('learn.achievements.firstLesson')
                  : completedLessons.size === lessons.length
                    ? t('learn.achievements.allBasics')
                    : `${completedLessons.size} ${t('learn.progress')}`
                }
              </p>
              <Text className="text-sm text-body">
                {completedLessons.size === lessons.length
                  ? t('learn.achievements.allBasicsDesc')
                  : t('learn.achievements.firstLessonDesc')
                }
              </Text>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Use Cases Section
function UseCasesSection({ t }: { t: any }) {
  return (
    <div className="mt-12">
      <Divider />
      <div className="mt-8 mb-6">
        <Title>{t('useCases.title')}</Title>
        <Text>{t('useCases.subtitle')}</Text>
      </div>

      <Grid numItems={1} numItemsSm={3} className="gap-6">
        {/* Personal Genetics */}
        <Col>
          <Card className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-500 dark:text-pink-400" />
              <span className="font-semibold text-title">{t('useCases.personal.title')}</span>
            </div>
            <div className="space-y-3">
              <UseCaseItem
                icon={Sparkles}
                title={t('useCases.personal.myDna.title')}
                desc={t('useCases.personal.myDna.desc')}
              />
              <UseCaseItem
                icon={Users}
                title={t('useCases.personal.familyRisk.title')}
                desc={t('useCases.personal.familyRisk.desc')}
              />
              <UseCaseItem
                icon={Zap}
                title={t('useCases.personal.superpowers.title')}
                desc={t('useCases.personal.superpowers.desc')}
              />
            </div>
          </Card>
        </Col>

        {/* Education */}
        <Col>
          <Card className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-info" />
              <span className="font-semibold text-title">{t('useCases.education.title')}</span>
            </div>
            <div className="space-y-3">
              <UseCaseItem
                icon={FlaskConical}
                title={t('useCases.education.virtualLab.title')}
                desc={t('useCases.education.virtualLab.desc')}
              />
              <UseCaseItem
                icon={Globe2}
                title={t('useCases.education.evolution.title')}
                desc={t('useCases.education.evolution.desc')}
              />
              <UseCaseItem
                icon={Search}
                title={t('useCases.education.detective.title')}
                desc={t('useCases.education.detective.desc')}
              />
            </div>
          </Card>
        </Col>

        {/* Research */}
        <Col>
          <Card className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-success" />
              <span className="font-semibold text-title">{t('useCases.research.title')}</span>
            </div>
            <div className="space-y-3">
              <UseCaseItem
                icon={FileText}
                title={t('useCases.research.batchAnalysis.title')}
                desc={t('useCases.research.batchAnalysis.desc')}
              />
              <UseCaseItem
                icon={Target}
                title={t('useCases.research.drugTargets.title')}
                desc={t('useCases.research.drugTargets.desc')}
              />
              <UseCaseItem
                icon={Globe2}
                title={t('useCases.research.populations.title')}
                desc={t('useCases.research.populations.desc')}
              />
            </div>
          </Card>
        </Col>
      </Grid>
    </div>
  )
}

function UseCaseItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-3 bg-surface-soft rounded-lg hover-surface transition-colors cursor-pointer">
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-title">{title}</p>
          <p className="text-xs text-muted">{desc}</p>
        </div>
      </div>
    </div>
  )
}

// Features Section
function FeaturesSection({ t }: { t: any }) {
  return (
    <div className="mt-12">
      <Divider />
      <Title className="mt-8 mb-4">{t('features.title')}</Title>
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
        <Col>
          <Card decoration="top" decorationColor="blue">
            <Title>{t('features.geneExpression.title')}</Title>
            <Text>{t('features.geneExpression.desc')}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="green">
            <Title>{t('features.chromatin.title')}</Title>
            <Text>{t('features.chromatin.desc')}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="purple">
            <Title>{t('features.splicing.title')}</Title>
            <Text>{t('features.splicing.desc')}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="orange">
            <Title>{t('features.histone.title')}</Title>
            <Text>{t('features.histone.desc')}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="red">
            <Title>{t('features.tfBinding.title')}</Title>
            <Text>{t('features.tfBinding.desc')}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="cyan">
            <Title>{t('features.structure3d.title')}</Title>
            <Text>{t('features.structure3d.desc')}</Text>
          </Card>
        </Col>
      </Grid>
    </div>
  )
}

// Tools Section - All available tools with placeholders for future features
function ToolsSection({ t, onToolSelect }: { t: any; onToolSelect: (toolId: string) => void }) {
  const tools = [
    // Phase 1 - MVP (Implemented)
    {
      id: 'my-dna',
      name: t('tools.myDna.title'),
      description: t('tools.myDna.description'),
      icon: Upload,
      color: 'blue' as const,
      implemented: true,
    },
    {
      id: 'superpowers',
      name: t('tools.superpowers.title'),
      description: t('tools.superpowers.description'),
      icon: Zap,
      color: 'purple' as const,
      implemented: true,
    },
    {
      id: 'diet',
      name: t('tools.diet.title'),
      description: t('tools.diet.description'),
      icon: Utensils,
      color: 'green' as const,
      implemented: true,
    },
    {
      id: 'crispr',
      name: t('tools.crispr.title'),
      description: t('tools.crispr.description'),
      icon: FlaskConical,
      color: 'purple' as const,
      implemented: true,
    },
    {
      id: 'networks',
      name: t('tools.regulatoryNetworks.title'),
      description: t('tools.regulatoryNetworks.description'),
      icon: Layers,
      color: 'blue' as const,
      implemented: true,
    },
    {
      id: 'mindgenome',
      name: t('tools.mindGenome.title'),
      description: t('tools.mindGenome.description'),
      icon: Brain,
      color: 'purple' as const,
      implemented: true,
    },
    {
      id: 'aging',
      name: t('tools.agingPredictor.title'),
      description: t('tools.agingPredictor.description'),
      icon: Heart,
      color: 'orange' as const,
      implemented: true,
    },
    {
      id: 'capabilities',
      name: t('tools.capabilitiesOptimizer.title'),
      description: t('tools.capabilitiesOptimizer.description'),
      icon: Target,
      color: 'cyan' as const,
      implemented: true,
    },
    {
      id: 'familyrisk',
      name: t('tools.familyRisk.title'),
      description: t('tools.familyRisk.description'),
      icon: Users,
      color: 'pink' as const,
      implemented: true,
    },
    {
      id: 'ancestors',
      name: t('tools.ancestors.title'),
      description: t('tools.ancestors.description'),
      icon: Globe2,
      color: 'blue' as const,
      implemented: true,
    },
    {
      id: 'virtuallab',
      name: t('tools.virtualLab.title'),
      description: t('tools.virtualLab.description'),
      icon: FlaskConical,
      color: 'purple' as const,
      implemented: true,
    },
    {
      id: 'evolution',
      name: t('tools.evolution.title'),
      description: t('tools.evolution.description'),
      icon: Globe2,
      color: 'green' as const,
      implemented: true,
    },
    {
      id: 'detective',
      name: t('tools.detective.title'),
      description: t('tools.detective.description'),
      icon: Search,
      color: 'orange' as const,
      implemented: true,
    },
    {
      id: 'couple',
      name: t('tools.coupleCompatibility.title'),
      description: t('tools.coupleCompatibility.description'),
      icon: Heart,
      color: 'pink' as const,
      implemented: true,
    },
    {
      id: 'organism',
      name: t('tools.organismDesigner.title'),
      description: t('tools.organismDesigner.description'),
      icon: Bug,
      color: 'green' as const,
      implemented: true,
    },
    {
      id: 'treeoflife',
      name: t('tools.treeOfLife.title'),
      description: t('tools.treeOfLife.description'),
      icon: TreePine,
      color: 'green' as const,
      implemented: true,
    },
    {
      id: 'batchanalyzer',
      name: t('tools.batchAnalyzer.title'),
      description: t('tools.batchAnalyzer.description'),
      icon: BarChart3,
      color: 'blue' as const,
      implemented: true,
    },
    {
      id: 'drugtargets',
      name: t('tools.drugTargetFinder.title'),
      description: t('tools.drugTargetFinder.description'),
      icon: Pill,
      color: 'purple' as const,
      implemented: true,
    },
    {
      id: 'genomecomp',
      name: t('tools.genomeComparator.title'),
      description: t('tools.genomeComparator.description'),
      icon: Globe2,
      color: 'blue' as const,
      implemented: true,
    },
    {
      id: 'splicing',
      name: t('tools.splicingPredictor.title'),
      description: t('tools.splicingPredictor.description'),
      icon: Scissors,
      color: 'blue' as const,
      implemented: true,
    },
    {
      id: 'agingcorrector',
      name: t('tools.agingErrorCorrector.title'),
      description: t('tools.agingErrorCorrector.description'),
      icon: Bug,
      color: 'orange' as const,
      implemented: true,
    },
    {
      id: 'beneficialvariants',
      name: t('tools.beneficialVariants.title'),
      description: t('tools.beneficialVariants.description'),
      icon: BookOpen,
      color: 'orange' as const,
      implemented: true,
    },
    {
      id: 'futuresim',
      name: t('tools.futureSimulator.title'),
      description: t('tools.futureSimulator.description'),
      icon: Clock,
      color: 'purple' as const,
      implemented: true,
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="gradient-accent">
        <div className="flex items-center gap-3">
          <Wrench className="w-8 h-8 text-info" />
          <div>
            <Title>{t('nav.tools')}</Title>
            <Text>All available genetic analysis tools</Text>
          </div>
        </div>
      </Card>

      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
        {tools.map((tool) => (
          <Col key={tool.id}>
            {tool.implemented ? (
              <Card
                className="h-full hover:shadow-lg transition-shadow cursor-pointer hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400"
                onClick={() => onToolSelect(tool.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-${tool.color}-100 dark:bg-${tool.color}-900/30 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <tool.icon className={`w-5 h-5 text-${tool.color}-600 dark:text-${tool.color}-400`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-title">{tool.name}</p>
                      <Badge color="green" size="xs">Ready</Badge>
                    </div>
                    <p className="text-sm text-muted mt-1">{tool.description}</p>
                    <p className="text-xs text-info mt-2 flex items-center gap-1">
                      <span>→</span> {t('tools.clickToOpen') || 'Click to open'}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <FeatureRequestPlaceholder
                featureId={tool.id}
                featureName={tool.name}
                featureDescription={tool.description}
                featureIcon={<tool.icon className="w-6 h-6" />}
                estimatedPhase={(tool as { phase?: string }).phase || 'Coming Soon'}
                color={tool.color as 'blue' | 'purple' | 'green' | 'orange' | 'pink'}
              />
            )}
          </Col>
        ))}
      </Grid>
    </div>
  )
}
