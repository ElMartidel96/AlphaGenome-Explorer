'use client'

import { useState } from 'react'
import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Select,
  SelectItem,
  MultiSelect,
  MultiSelectItem,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  ProgressBar,
  Callout,
  Grid,
  Col,
  Metric,
  Flex,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@tremor/react'
import {
  Search,
  Download,
  Copy,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileDown,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
} from 'lucide-react'
import { useApiKeyStore } from '@/lib/store'
import { apiClient, GeneScore, VariantSummary } from '@/lib/api'
import toast from 'react-hot-toast'

// Tissue options
const COMMON_TISSUES = [
  { code: 'UBERON:0000955', name: 'Brain' },
  { code: 'UBERON:0000948', name: 'Heart' },
  { code: 'UBERON:0002107', name: 'Liver' },
  { code: 'UBERON:0002048', name: 'Lung' },
  { code: 'UBERON:0002113', name: 'Kidney' },
  { code: 'UBERON:0001157', name: 'Colon (Transverse)' },
  { code: 'UBERON:0000178', name: 'Blood' },
  { code: 'UBERON:0002097', name: 'Skin' },
  { code: 'EFO:0002067', name: 'K562 (Leukemia)' },
  { code: 'EFO:0001187', name: 'HepG2 (Liver Cancer)' },
]

// Output type options
const OUTPUT_TYPES = [
  { id: 'RNA_SEQ', name: 'RNA-seq (Expression)' },
  { id: 'DNASE', name: 'DNase-seq (Accessibility)' },
  { id: 'ATAC', name: 'ATAC-seq (Accessibility)' },
  { id: 'SPLICE_SITES', name: 'Splice Sites' },
  { id: 'CHIP_HISTONE', name: 'Histone Modifications' },
]

interface AnalysisResult {
  summary: VariantSummary | null
  scores: GeneScore[]
  exportData: Record<string, any>
}

export function VariantAnalyzer() {
  const { apiKey } = useApiKeyStore()
  const [variant, setVariant] = useState('')
  const [selectedOutputs, setSelectedOutputs] = useState(['RNA_SEQ'])
  const [selectedTissues, setSelectedTissues] = useState(['UBERON:0001157'])
  const [sequenceLength, setSequenceLength] = useState('1MB')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!apiKey) {
      toast.error('Please configure your API key first')
      return
    }

    if (!variant.trim()) {
      toast.error('Please enter a variant')
      return
    }

    // Validate variant format
    const variantPattern = /^chr[\dXY]+:\d+:[ACGTN]+>[ACGTN]+$/i
    if (!variantPattern.test(variant.trim())) {
      toast.error('Invalid variant format. Use: chr22:36201698:A>C')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiClient.predictVariant(apiKey, {
        variant: variant.trim(),
        outputs: selectedOutputs,
        tissues: selectedTissues,
        sequence_length: sequenceLength,
        organism: 'HOMO_SAPIENS',
      })

      if (response.success && response.data) {
        setResult({
          summary: response.data.summary,
          scores: response.data.scores,
          exportData: {
            ...response.data,
            export_formats: response.export,
          },
        })
        toast.success('Analysis completed!')
      } else {
        setError(response.error || 'Analysis failed')
        toast.error(response.error || 'Analysis failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyToClipboard = async (format: 'json' | 'markdown' | 'tsv') => {
    if (!result) return

    try {
      let text: string
      if (format === 'json') {
        text = JSON.stringify(result.exportData, null, 2)
      } else if (format === 'markdown') {
        text = generateMarkdown(result)
      } else {
        text = generateTSV(result.scores)
      }

      await navigator.clipboard.writeText(text)
      toast.success(`Copied as ${format.toUpperCase()}!`)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownload = async (format: string) => {
    if (!result) return

    try {
      let content: string
      let mimeType: string
      let extension: string

      switch (format) {
        case 'json':
          content = JSON.stringify(result.exportData, null, 2)
          mimeType = 'application/json'
          extension = 'json'
          break
        case 'csv':
          content = generateCSV(result.scores)
          mimeType = 'text/csv'
          extension = 'csv'
          break
        case 'tsv':
          content = generateTSV(result.scores)
          mimeType = 'text/tab-separated-values'
          extension = 'tsv'
          break
        case 'markdown':
          content = generateMarkdown(result)
          mimeType = 'text/markdown'
          extension = 'md'
          break
        default:
          return
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `alphagenome_${variant.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Downloaded as ${extension.toUpperCase()}!`)
    } catch (err) {
      toast.error('Download failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <Title>Analyze Genetic Variant</Title>
        <Text className="mt-2">
          Enter a variant to predict its effect on gene expression, splicing, and more.
        </Text>

        <div className="mt-6 space-y-4">
          {/* Variant Input */}
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Variant (e.g., chr22:36201698:A&gt;C)
            </label>
            <div className="flex space-x-2">
              <TextInput
                placeholder="chr22:36201698:A>C"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isLoading || !variant.trim()}
                icon={isLoading ? Loader2 : Search}
                loading={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
            <Text className="text-xs text-muted mt-1">
              Format: chromosome:position:reference&gt;alternate
            </Text>
          </div>

          {/* Options Grid */}
          <Grid numItems={1} numItemsSm={3} className="gap-4">
            <Col>
              <label className="block text-sm font-medium text-body mb-1">
                Output Types
              </label>
              <MultiSelect
                value={selectedOutputs}
                onValueChange={setSelectedOutputs}
                placeholder="Select outputs..."
              >
                {OUTPUT_TYPES.map((type) => (
                  <MultiSelectItem key={type.id} value={type.id}>
                    {type.name}
                  </MultiSelectItem>
                ))}
              </MultiSelect>
            </Col>

            <Col>
              <label className="block text-sm font-medium text-body mb-1">
                Tissues
              </label>
              <MultiSelect
                value={selectedTissues}
                onValueChange={setSelectedTissues}
                placeholder="Select tissues..."
              >
                {COMMON_TISSUES.map((tissue) => (
                  <MultiSelectItem key={tissue.code} value={tissue.code}>
                    {tissue.name}
                  </MultiSelectItem>
                ))}
              </MultiSelect>
            </Col>

            <Col>
              <label className="block text-sm font-medium text-body mb-1">
                Sequence Context
              </label>
              <Select value={sequenceLength} onValueChange={setSequenceLength}>
                <SelectItem value="16KB">16 KB (Fast)</SelectItem>
                <SelectItem value="100KB">100 KB</SelectItem>
                <SelectItem value="500KB">500 KB</SelectItem>
                <SelectItem value="1MB">1 MB (Comprehensive)</SelectItem>
              </Select>
            </Col>
          </Grid>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div className="flex items-center space-x-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <div className="flex-1">
              <Text className="font-medium">Analyzing variant...</Text>
              <Text className="text-sm text-muted">
                This may take a few moments
              </Text>
              <ProgressBar value={45} className="mt-2" />
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Callout title="Analysis Error" icon={AlertTriangle} color="red">
          {error}
        </Callout>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {result.summary && (
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
              <Col>
                <Card decoration="top" decorationColor={getImpactColor(result.summary.impact_level)}>
                  <Text>Impact Level</Text>
                  <Metric>{result.summary.impact_level}</Metric>
                </Card>
              </Col>
              <Col>
                <Card decoration="top" decorationColor="blue">
                  <Text>Affected Genes</Text>
                  <Metric>{result.summary.affected_genes.length}</Metric>
                  <Text className="text-xs truncate">
                    {result.summary.affected_genes.slice(0, 3).join(', ')}
                  </Text>
                </Card>
              </Col>
              <Col>
                <Card decoration="top" decorationColor="purple">
                  <Text>Top Effect</Text>
                  <Text className="text-sm font-medium mt-1">
                    {result.summary.top_effect || 'No significant effect'}
                  </Text>
                </Card>
              </Col>
              <Col>
                <Card decoration="top" decorationColor="gray">
                  <Text>Confidence</Text>
                  <Metric>{Math.round(result.summary.confidence * 100)}%</Metric>
                </Card>
              </Col>
            </Grid>
          )}

          {/* Scores Table */}
          <Card>
            <Flex justifyContent="between" alignItems="center">
              <div>
                <Title>Gene Scores</Title>
                <Text>{result.scores.length} genes analyzed</Text>
              </div>

              {/* Export Buttons */}
              <div className="flex space-x-2">
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Copy}
                  onClick={() => handleCopyToClipboard('markdown')}
                >
                  Copy
                </Button>
                <Select
                  value=""
                  onValueChange={handleDownload}
                  placeholder="Download..."
                  className="w-32"
                >
                  <SelectItem value="json" icon={FileJson}>JSON</SelectItem>
                  <SelectItem value="csv" icon={FileSpreadsheet}>CSV</SelectItem>
                  <SelectItem value="tsv" icon={FileText}>TSV</SelectItem>
                  <SelectItem value="markdown" icon={FileDown}>Markdown</SelectItem>
                </Select>
              </div>
            </Flex>

            <TabGroup className="mt-4">
              <TabList>
                <Tab>Table View</Tab>
                <Tab>JSON</Tab>
                <Tab>Markdown</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Table className="mt-4">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Gene</TableHeaderCell>
                        <TableHeaderCell>Tissue</TableHeaderCell>
                        <TableHeaderCell>Score</TableHeaderCell>
                        <TableHeaderCell>Quantile</TableHeaderCell>
                        <TableHeaderCell>Effect</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.scores.slice(0, 20).map((score, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Text className="font-medium">{score.gene_name}</Text>
                            <Text className="text-xs text-muted">{score.gene_id}</Text>
                          </TableCell>
                          <TableCell>
                            <Text className="text-sm">{score.tissue}</Text>
                          </TableCell>
                          <TableCell>
                            <Flex justifyContent="start" alignItems="center" className="space-x-2">
                              {getScoreIcon(score.raw_score)}
                              <Text className={getScoreColor(score.raw_score)}>
                                {score.raw_score.toFixed(4)}
                              </Text>
                            </Flex>
                          </TableCell>
                          <TableCell>
                            <Badge color={getQuantileColor(score.quantile_score)}>
                              {(score.quantile_score * 100).toFixed(0)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Text className="text-sm">{score.interpretation}</Text>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {result.scores.length > 20 && (
                    <Text className="mt-2 text-sm text-muted text-center">
                      Showing 20 of {result.scores.length} genes. Download for full data.
                    </Text>
                  )}
                </TabPanel>

                <TabPanel>
                  <pre className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(result.exportData, null, 2)}
                  </pre>
                  <Button
                    size="xs"
                    variant="secondary"
                    icon={Copy}
                    className="mt-2"
                    onClick={() => handleCopyToClipboard('json')}
                  >
                    Copy JSON
                  </Button>
                </TabPanel>

                <TabPanel>
                  <pre className="mt-4 p-4 bg-surface-soft rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                    {generateMarkdown(result)}
                  </pre>
                  <Button
                    size="xs"
                    variant="secondary"
                    icon={Copy}
                    className="mt-2"
                    onClick={() => handleCopyToClipboard('markdown')}
                  >
                    Copy Markdown
                  </Button>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </Card>
        </div>
      )}
    </div>
  )
}

// Helper functions
function getImpactColor(impact: string): string {
  switch (impact) {
    case 'HIGH':
      return 'red'
    case 'MODERATE':
      return 'orange'
    case 'LOW':
      return 'yellow'
    default:
      return 'gray'
  }
}

function getScoreIcon(score: number) {
  if (score > 0.01) return <TrendingUp className="w-4 h-4 text-green-600" />
  if (score < -0.01) return <TrendingDown className="w-4 h-4 text-red-600" />
  return <Minus className="w-4 h-4 text-subtle" />
}

function getScoreColor(score: number): string {
  if (score > 0.01) return 'text-green-600'
  if (score < -0.01) return 'text-red-600'
  return 'text-body'
}

function getQuantileColor(quantile: number): string {
  if (quantile > 0.9) return 'red'
  if (quantile > 0.75) return 'orange'
  if (quantile > 0.5) return 'yellow'
  return 'gray'
}

function generateCSV(scores: GeneScore[]): string {
  const headers = ['gene_id', 'gene_name', 'strand', 'tissue', 'raw_score', 'quantile_score', 'interpretation']
  const rows = scores.map((s) =>
    [s.gene_id, s.gene_name, s.strand, s.tissue, s.raw_score, s.quantile_score, s.interpretation].join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

function generateTSV(scores: GeneScore[]): string {
  const headers = ['gene_id', 'gene_name', 'strand', 'tissue', 'raw_score', 'quantile_score', 'interpretation']
  const rows = scores.map((s) =>
    [s.gene_id, s.gene_name, s.strand, s.tissue, s.raw_score, s.quantile_score, s.interpretation].join('\t')
  )
  return [headers.join('\t'), ...rows].join('\n')
}

function generateMarkdown(result: AnalysisResult): string {
  const lines: string[] = []

  lines.push(`## AlphaGenome Analysis`)
  lines.push('')
  lines.push(`**Generated:** ${new Date().toISOString()}`)
  lines.push('')

  if (result.summary) {
    lines.push('### Summary')
    lines.push('')
    lines.push('| Metric | Value |')
    lines.push('|--------|-------|')
    lines.push(`| Impact | ${result.summary.impact_level} |`)
    lines.push(`| Affected Genes | ${result.summary.affected_genes.join(', ')} |`)
    lines.push(`| Top Effect | ${result.summary.top_effect} |`)
    lines.push(`| Confidence | ${Math.round(result.summary.confidence * 100)}% |`)
    lines.push('')
  }

  lines.push('### Gene Scores')
  lines.push('')
  lines.push('| Gene | Tissue | Score | Quantile | Interpretation |')
  lines.push('|------|--------|-------|----------|----------------|')

  result.scores.slice(0, 20).forEach((s) => {
    lines.push(
      `| ${s.gene_name} | ${s.tissue} | ${s.raw_score.toFixed(4)} | ${(s.quantile_score * 100).toFixed(0)}% | ${s.interpretation} |`
    )
  })

  lines.push('')
  lines.push('---')
  lines.push('*Generated by [AlphaGenome Explorer](https://github.com/)*')

  return lines.join('\n')
}
