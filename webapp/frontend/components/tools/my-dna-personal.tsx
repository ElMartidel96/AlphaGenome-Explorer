'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, Title, Text, Button, Badge, Grid, Col, ProgressBar } from '@tremor/react'
import {
  Upload,
  Dna,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Download,
  Share2,
  Info,
  Loader2,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

// Types
interface Variant {
  rsid: string
  chromosome: string
  position: number
  genotype: string
  gene?: string
  significance?: 'beneficial' | 'neutral' | 'risk' | 'unknown'
  description?: string
}

interface AnalysisResult {
  totalVariants: number
  analyzedVariants: number
  highlights: Variant[]
  categories: {
    beneficial: number
    neutral: number
    risk: number
    unknown: number
  }
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'processing' | 'success' | 'error'

// Demo data for users without their own DNA file
const DEMO_VARIANTS: Variant[] = [
  {
    rsid: 'rs4680',
    chromosome: '22',
    position: 19963748,
    genotype: 'AG',
    gene: 'COMT',
    significance: 'beneficial',
    description: 'Warrior gene - better stress response and focus under pressure',
  },
  {
    rsid: 'rs53576',
    chromosome: '3',
    position: 8804371,
    genotype: 'GG',
    gene: 'OXTR',
    significance: 'beneficial',
    description: 'Enhanced empathy and social bonding',
  },
  {
    rsid: 'rs1800497',
    chromosome: '11',
    position: 113400106,
    genotype: 'CT',
    gene: 'DRD2',
    significance: 'neutral',
    description: 'Normal dopamine receptor density',
  },
  {
    rsid: 'rs429358',
    chromosome: '19',
    position: 44908684,
    genotype: 'TT',
    gene: 'APOE',
    significance: 'beneficial',
    description: 'No APOE4 allele - lower Alzheimer risk',
  },
  {
    rsid: 'rs1801133',
    chromosome: '1',
    position: 11856378,
    genotype: 'CT',
    gene: 'MTHFR',
    significance: 'risk',
    description: 'Reduced folate metabolism - consider B vitamin supplementation',
  },
]

export function MyDnaPersonal() {
  const t = useTranslations('tools.myDna')
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File validation
  const validateFile = (file: File): boolean => {
    const validExtensions = ['.txt', '.csv', '.tsv']
    const maxSize = 50 * 1024 * 1024 // 50MB

    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!validExtensions.includes(ext)) {
      setErrorMessage('Invalid file format. Please upload a .txt or .csv file from 23andMe, Ancestry, or MyHeritage.')
      return false
    }

    if (file.size > maxSize) {
      setErrorMessage('File too large. Maximum size is 50MB.')
      return false
    }

    return true
  }

  // Parse DNA file (simplified - in production would use web worker)
  const parseFile = async (file: File): Promise<Variant[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 50))
        }
      }

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n')
          const variants: Variant[] = []

          let parsed = 0
          for (const line of lines) {
            if (line.startsWith('#') || line.trim() === '') continue

            const parts = line.split(/[\t,]/)
            if (parts.length >= 4) {
              variants.push({
                rsid: parts[0]?.trim() || '',
                chromosome: parts[1]?.trim() || '',
                position: parseInt(parts[2]?.trim() || '0'),
                genotype: parts[3]?.trim() || '',
              })
              parsed++

              // Update progress every 10000 variants
              if (parsed % 10000 === 0) {
                setProgress(50 + Math.min(40, Math.round((parsed / lines.length) * 40)))
              }
            }
          }

          resolve(variants)
        } catch (error) {
          reject(new Error('Failed to parse file'))
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Analyze variants (mock - in production would call API)
  const analyzeVariants = async (variants: Variant[]): Promise<AnalysisResult> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setProgress(95)

    // In production, this would call AlphaGenome API
    const highlights = variants
      .slice(0, 100)
      .map((v) => ({
        ...v,
        significance: ['beneficial', 'neutral', 'risk', 'unknown'][Math.floor(Math.random() * 4)] as Variant['significance'],
        description: `Variant ${v.rsid} analysis pending`,
      }))

    return {
      totalVariants: variants.length,
      analyzedVariants: Math.min(variants.length, 100),
      highlights: highlights.slice(0, 10),
      categories: {
        beneficial: Math.floor(variants.length * 0.15),
        neutral: Math.floor(variants.length * 0.7),
        risk: Math.floor(variants.length * 0.1),
        unknown: Math.floor(variants.length * 0.05),
      },
    }
  }

  // Handle file upload
  const handleFile = async (file: File) => {
    if (!validateFile(file)) {
      setState('error')
      return
    }

    setState('uploading')
    setProgress(0)
    setErrorMessage(null)

    try {
      setState('processing')
      const variants = await parseFile(file)

      if (variants.length === 0) {
        throw new Error('No variants found in file')
      }

      const analysis = await analyzeVariants(variants)
      setProgress(100)
      setResult(analysis)
      setState('success')
      toast.success(`${analysis.totalVariants.toLocaleString()} ${t('variantsFound')}!`)
    } catch (error) {
      setState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Analysis failed')
      toast.error('Error analyzing file')
    }
  }

  // Demo mode
  const handleDemo = async () => {
    setState('processing')
    setProgress(0)

    // Simulate processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setProgress(i)
    }

    setResult({
      totalVariants: 650000,
      analyzedVariants: 5,
      highlights: DEMO_VARIANTS,
      categories: {
        beneficial: 97500,
        neutral: 455000,
        risk: 65000,
        unknown: 32500,
      },
    })
    setState('success')
    toast.success('Demo data loaded!')
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('dragging')
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('idle')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const resetAnalysis = () => {
    setState('idle')
    setProgress(0)
    setResult(null)
    setSelectedVariant(null)
    setErrorMessage(null)
  }

  // Significance badge color
  const getSignificanceColor = (sig: Variant['significance']) => {
    switch (sig) {
      case 'beneficial': return 'green'
      case 'risk': return 'red'
      case 'neutral': return 'gray'
      default: return 'yellow'
    }
  }

  const getSignificanceLabel = (sig: Variant['significance']) => {
    switch (sig) {
      case 'beneficial': return 'Beneficial'
      case 'risk': return 'Risk factor'
      case 'neutral': return 'Neutral'
      default: return 'Unknown'
    }
  }

  // Render upload zone
  if (state === 'idle' || state === 'dragging' || state === 'error') {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-info-soft rounded-xl flex items-center justify-center">
            <Dna className="w-5 h-5 text-info" />
          </div>
          <div>
            <Title>{t('title')}</Title>
            <Text>{t('description')}</Text>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            mt-6 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300
            ${state === 'dragging'
              ? 'dropzone-active scale-[1.02]'
              : state === 'error'
                ? 'dropzone-error'
                : 'dropzone-adaptive'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,.tsv"
            onChange={handleFileInput}
            className="hidden"
            aria-label="Upload DNA file"
          />

          <div className="text-center">
            {state === 'dragging' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-info-muted rounded-full flex items-center justify-center animate-pulse">
                  <Upload className="w-8 h-8 text-info" />
                </div>
                <p className="text-lg font-medium text-info">Drop your file here!</p>
              </>
            ) : state === 'error' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-danger-muted rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-danger" />
                </div>
                <p className="text-lg font-medium text-danger">Upload failed</p>
                <p className="text-sm text-danger mt-1">{errorMessage}</p>
                <Button variant="secondary" className="mt-4" onClick={(e) => { e.stopPropagation(); resetAnalysis(); }}>
                  Try again
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 gradient-accent rounded-full flex items-center justify-center">
                  <Dna className="w-8 h-8 text-info animate-spin-slow" />
                </div>
                <p className="text-lg font-medium text-body">{t('dragDrop')}</p>
                <p className="text-sm text-muted mt-1">{t('orBrowse')}</p>
                <p className="text-xs text-subtle mt-3">{t('supportedFormats')}</p>
              </>
            )}
          </div>
        </div>

        {/* Demo button */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted mb-3">
            <span className="w-16 h-px bg-surface-muted"></span>
            <span>or</span>
            <span className="w-16 h-px bg-surface-muted"></span>
          </div>
          <div>
            <Button variant="secondary" onClick={handleDemo} icon={Sparkles}>
              {t('tryDemo')}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Render processing state
  if (state === 'uploading' || state === 'processing') {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-info opacity-30 rounded-full"></div>
            <div
              className="absolute inset-0 border-4 border-info rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: '1.5s' }}
            ></div>
            <Dna className="absolute inset-0 m-auto w-8 h-8 text-info" />
          </div>

          <Title>{t('analyzing')}</Title>
          <Text className="mt-2 text-body">
            {state === 'uploading' ? 'Reading file...' : 'Analyzing variants...'}
          </Text>

          <div className="mt-6 max-w-md mx-auto">
            <ProgressBar value={progress} color="blue" />
            <p className="text-sm text-muted mt-2">{progress}% complete</p>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <Badge color="blue">Chromosome {Math.min(22, Math.floor(progress / 4.5) + 1)}</Badge>
          </div>
        </div>
      </Card>
    )
  }

  // Render results
  if (state === 'success' && result) {
    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <Card className="gradient-success border-success">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-success-muted rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-success" />
              </div>
              <div>
                <Title className="text-success">Analysis Complete!</Title>
                <Text className="text-body">
                  {result.totalVariants.toLocaleString()} {t('variantsFound')}
                </Text>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="xs" icon={Download}>Export</Button>
              <Button variant="secondary" size="xs" icon={Share2}>Share</Button>
              <Button variant="secondary" size="xs" icon={X} onClick={resetAnalysis}>New Analysis</Button>
            </div>
          </div>
        </Card>

        {/* Categories */}
        <Grid numItems={2} numItemsSm={4} className="gap-4">
          <Col>
            <Card decoration="left" decorationColor="green">
              <Text>Beneficial</Text>
              <p className="text-2xl font-bold text-success">{result.categories.beneficial.toLocaleString()}</p>
            </Card>
          </Col>
          <Col>
            <Card decoration="left" decorationColor="gray">
              <Text>Neutral</Text>
              <p className="text-2xl font-bold text-body">{result.categories.neutral.toLocaleString()}</p>
            </Card>
          </Col>
          <Col>
            <Card decoration="left" decorationColor="red">
              <Text>Risk Factors</Text>
              <p className="text-2xl font-bold text-danger">{result.categories.risk.toLocaleString()}</p>
            </Card>
          </Col>
          <Col>
            <Card decoration="left" decorationColor="yellow">
              <Text>Unknown</Text>
              <p className="text-2xl font-bold text-yellow-600">{result.categories.unknown.toLocaleString()}</p>
            </Card>
          </Col>
        </Grid>

        {/* Highlights */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title>{t('topFindings')}</Title>
            <Badge color="blue">{result.analyzedVariants} analyzed in detail</Badge>
          </div>

          <div className="space-y-3">
            {result.highlights.map((variant) => (
              <div
                key={variant.rsid}
                onClick={() => setSelectedVariant(selectedVariant?.rsid === variant.rsid ? null : variant)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all
                  ${selectedVariant?.rsid === variant.rsid
                    ? 'border-info bg-info-soft'
                    : 'border-adaptive bg-surface-soft hover:border-adaptive-subtle'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-elevated rounded-xl flex items-center justify-center shadow-sm border border-adaptive">
                      <span className="text-sm font-mono font-bold text-body">
                        {variant.gene || variant.rsid.slice(0, 4)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-title">{variant.rsid}</p>
                      <p className="text-sm text-muted">
                        Chr{variant.chromosome}:{variant.position.toLocaleString()} • {variant.genotype}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={getSignificanceColor(variant.significance)}>
                      {getSignificanceLabel(variant.significance)}
                    </Badge>
                    <ChevronRight className={`w-4 h-4 text-subtle transition-transform ${selectedVariant?.rsid === variant.rsid ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {selectedVariant?.rsid === variant.rsid && variant.description && (
                  <div className="mt-3 pt-3 border-t border-adaptive">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-body">{variant.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Button variant="secondary">View All Variants</Button>
          </div>
        </Card>
      </div>
    )
  }

  return null
}
