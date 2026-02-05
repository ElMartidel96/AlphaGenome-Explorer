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
  Divider,
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
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useApiKeyStore } from '@/lib/store'
import { VariantAnalyzer } from '@/components/variant-analyzer'
import { ApiKeySetup } from '@/components/api-key-setup'
import { LanguageToggle } from '@/components/language-toggle'

export default function HomePage() {
  const t = useTranslations()
  const { isConfigured } = useApiKeyStore()
  const [activeTab, setActiveTab] = useState<'analyze' | 'explore' | 'batch' | 'learn'>('analyze')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
                <p className="text-sm text-gray-500">{t('header.subtitle')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
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
                className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'analyze' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('analyze')}
            icon={Search}
          >
            {t('nav.variantAnalyzer')}
          </Button>
          <Button
            variant={activeTab === 'explore' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('explore')}
            icon={Layers}
            disabled={!isConfigured}
          >
            {t('nav.regionExplorer')}
          </Button>
          <Button
            variant={activeTab === 'batch' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('batch')}
            icon={FileText}
            disabled={!isConfigured}
          >
            {t('nav.batchAnalysis')}
          </Button>
          <Button
            variant={activeTab === 'learn' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('learn')}
            icon={GraduationCap}
          >
            {t('nav.learn')}
          </Button>
        </div>

        {/* Main Content */}
        {activeTab === 'analyze' && (
          isConfigured ? <VariantAnalyzer /> : <WelcomeCard t={t} />
        )}

        {activeTab === 'explore' && isConfigured && <RegionExplorer t={t} />}
        {activeTab === 'batch' && isConfigured && <BatchAnalysis t={t} />}
        {activeTab === 'learn' && <LearnSection t={t} />}

        {/* Use Cases Section */}
        <UseCasesSection t={t} />

        {/* Features Overview */}
        {isConfigured && <FeaturesSection t={t} />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              <p>{t('footer.poweredBy')}</p>
              <p className="mt-1">{t('footer.citation')}</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="https://www.alphagenomedocs.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                {t('footer.documentation')}
              </a>
              <a href="https://github.com/google-deepmind/alphagenome" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                {t('footer.github')}
              </a>
              <a href="https://www.alphagenomecommunity.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
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

// Region Explorer Component
function RegionExplorer({ t }: { t: any }) {
  const [region, setRegion] = useState('chr22:36000000-36500000')

  return (
    <Card>
      <Title>{t('nav.regionExplorer')}</Title>
      <Text className="mt-2">
        Browse any genomic region and explore predictions across different cell types.
      </Text>
      <div className="mt-4 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="chr22:36000000-36500000"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button icon={Search}>Explore</Button>
        </div>
        <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
          <div className="text-center">
            <Layers className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Interactive Genome Browser</p>
            <p className="text-sm text-gray-500 mt-1">
              Visualize predictions for RNA-seq, ATAC-seq, splicing, and more
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Batch Analysis Component
function BatchAnalysis({ t }: { t: any }) {
  return (
    <Card>
      <Title>{t('nav.batchAnalysis')}</Title>
      <Text className="mt-2">
        Upload a VCF file to analyze multiple variants at once.
      </Text>
      <div className="mt-4">
        <div className="p-8 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-dashed border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
          <div className="text-center">
            <Upload className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Drop your VCF file here</p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse (max 10,000 variants)
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">VCF</p>
            <p className="text-xs text-gray-500">Input Format</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">10K</p>
            <p className="text-xs text-gray-500">Max Variants</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">CSV</p>
            <p className="text-xs text-gray-500">Export Results</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Learn Section Component
function LearnSection({ t }: { t: any }) {
  const lessons = [
    { icon: Dna, title: 'What is DNA?', desc: 'The basic building blocks of life', color: 'blue' },
    { icon: Zap, title: 'Genetic Variants', desc: 'How single letter changes affect your body', color: 'yellow' },
    { icon: Brain, title: 'Gene Expression', desc: 'How genes become proteins', color: 'purple' },
    { icon: Heart, title: 'Disease & Genetics', desc: 'Understanding genetic risk factors', color: 'red' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <Title>Genetics Academy</Title>
        </div>
        <Text>Learn the basics of genetics and genomics in simple, interactive lessons.</Text>

        <Grid numItems={1} numItemsSm={2} className="gap-4 mt-6">
          {lessons.map((lesson, idx) => (
            <Col key={idx}>
              <div className={`p-4 rounded-lg border-2 border-${lesson.color}-200 bg-${lesson.color}-50 hover:shadow-md transition-shadow cursor-pointer`}>
                <lesson.icon className={`w-8 h-8 text-${lesson.color}-500 mb-2`} />
                <p className="font-semibold text-gray-800">{lesson.title}</p>
                <p className="text-sm text-gray-600">{lesson.desc}</p>
              </div>
            </Col>
          ))}
        </Grid>
      </Card>
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
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="font-semibold text-gray-800">{t('useCases.personal.title')}</span>
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
              <GraduationCap className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-800">{t('useCases.education.title')}</span>
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
              <FlaskConical className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-800">{t('useCases.research.title')}</span>
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
    <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-500">{desc}</p>
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
