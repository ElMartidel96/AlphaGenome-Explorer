'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge } from '@tremor/react'
import {
  Microscope,
  AlertTriangle,
  Leaf,
  Apple,
  Brain,
  Sparkles,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Dna,
  HeartPulse,
  Beaker,
  Salad,
  Wheat,
  FlaskConical,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

// Types
interface HLAAllele {
  id: string
  gene: string
  allele: string
  frequency: string
  microbiomeImpact: string
  associatedConditions: string[]
  bacteriaAffected: string[]
  detailedMechanism: string
  riskLevel: 'protective' | 'moderate' | 'elevated'
}

interface ProbioticStrain {
  id: string
  name: string
  species: string
  benefit: string
  mechanism: string
  relevantHLA: string
  dosage: string
  evidence: 'strong' | 'moderate' | 'emerging'
}

interface PrebioticFood {
  id: string
  name: string
  category: string
  fiberType: string
  bacteriaFed: string[]
  servingSize: string
  benefit: string
}

interface GutBrainConnection {
  id: string
  pathway: string
  hlaInfluence: string
  neurotransmitter: string
  effect: string
  recommendation: string
}

interface MicrobiomeRatio {
  name: string
  percentage: number
  color: string
  description: string
}

// Demo HLA profile data
const HLA_ALLELES: HLAAllele[] = [
  {
    id: 'drb1-0301',
    gene: 'HLA-DRB1',
    allele: '*03:01',
    frequency: '10-15% European',
    microbiomeImpact: 'Associated with increased Bacteroidetes abundance and reduced inflammatory Proteobacteria. This HLA type shapes immune tolerance toward commensal bacteria.',
    associatedConditions: ['Type 1 Diabetes', 'Systemic Lupus Erythematosus', 'Graves\' Disease'],
    bacteriaAffected: ['Bacteroides fragilis (+)', 'Prevotella copri (+)', 'Proteobacteria (-)'],
    detailedMechanism: 'HLA-DRB1*03:01 presents microbial peptides that promote Th1/Th17 balance. The resulting immune environment favors Bacteroidetes colonization and produces anti-inflammatory short-chain fatty acids (SCFAs), particularly butyrate.',
    riskLevel: 'moderate',
  },
  {
    id: 'b27',
    gene: 'HLA-B',
    allele: '*27',
    frequency: '6-8% European',
    microbiomeImpact: 'Strongly linked to altered intestinal permeability and Klebsiella pneumoniae molecular mimicry. Associated with spondyloarthritis via gut-joint axis.',
    associatedConditions: ['Ankylosing Spondylitis', 'Reactive Arthritis', 'Anterior Uveitis'],
    bacteriaAffected: ['Klebsiella pneumoniae (sensitivity)', 'Dialister invisus (+)', 'Ruminococcus gnavus (+)'],
    detailedMechanism: 'HLA-B*27 misfolding in the endoplasmic reticulum triggers the unfolded protein response (UPR), activating IL-23 production. This drives Th17-mediated inflammation, increasing gut permeability and allowing bacterial translocation. Klebsiella surface antigens share sequence homology with HLA-B27, causing molecular mimicry.',
    riskLevel: 'elevated',
  },
  {
    id: 'dq25',
    gene: 'HLA-DQ',
    allele: '2.5 (DQA1*05:01/DQB1*02:01)',
    frequency: '20-30% European',
    microbiomeImpact: 'Gluten-derived peptide presentation drives celiac-spectrum changes in the microbiome. Reduced Bifidobacterium and increased Firmicutes/Bacteroidetes ratio even without active celiac disease.',
    associatedConditions: ['Celiac Disease', 'Non-Celiac Gluten Sensitivity', 'Dermatitis Herpetiformis'],
    bacteriaAffected: ['Bifidobacterium longum (-)', 'Staphylococcus spp. (+)', 'E. coli (+)'],
    detailedMechanism: 'HLA-DQ2.5 binds deamidated gliadin peptides with high affinity, presenting them to CD4+ T cells in the lamina propria. Even in non-celiac carriers, this immune priming subtly shifts microbial composition, reducing Bifidobacterium abundance and increasing potential pathobionts.',
    riskLevel: 'elevated',
  },
]

// Predicted microbiome composition based on HLA genotype
const MICROBIOME_COMPOSITION: MicrobiomeRatio[] = [
  { name: 'Firmicutes', percentage: 52, color: 'bg-blue-500', description: 'Includes Lactobacillus, Clostridium, Ruminococcus. Primary SCFA producers.' },
  { name: 'Bacteroidetes', percentage: 28, color: 'bg-emerald-500', description: 'Includes Bacteroides, Prevotella. Polysaccharide degraders, favored by HLA-DRB1*03:01.' },
  { name: 'Actinobacteria', percentage: 8, color: 'bg-amber-500', description: 'Includes Bifidobacterium. May be reduced due to HLA-DQ2.5 carrier status.' },
  { name: 'Proteobacteria', percentage: 7, color: 'bg-red-500', description: 'Includes E. coli, Klebsiella. Monitor due to HLA-B*27 sensitivity.' },
  { name: 'Verrucomicrobia', percentage: 3, color: 'bg-purple-500', description: 'Akkermansia muciniphila. Mucin degrader, supports gut barrier integrity.' },
  { name: 'Other', percentage: 2, color: 'bg-gray-400', description: 'Minor phyla including Fusobacteria, Tenericutes, and archaea.' },
]

// Personalized probiotic recommendations
const PROBIOTIC_STRAINS: ProbioticStrain[] = [
  {
    id: 'lgg',
    name: 'Lactobacillus rhamnosus GG',
    species: 'L. rhamnosus',
    benefit: 'Strengthens gut barrier integrity, reduces intestinal permeability associated with HLA-B*27. Produces p40 and p75 proteins that activate EGF receptor signaling in epithelial cells.',
    mechanism: 'Adheres to intestinal mucosa via SpaCBA pili, competing with Klebsiella for binding sites. Stimulates tight junction protein expression (ZO-1, claudin-1).',
    relevantHLA: 'HLA-B*27',
    dosage: '10-20 billion CFU daily',
    evidence: 'strong',
  },
  {
    id: 'bl',
    name: 'Bifidobacterium longum BB536',
    species: 'B. longum',
    benefit: 'Compensates for reduced Bifidobacterium levels associated with HLA-DQ2.5. Produces acetate and lactate that cross-feed butyrate producers.',
    mechanism: 'Ferments human milk oligosaccharides (HMOs) and dietary fiber into acetate. Suppresses NF-kB activation, reducing inflammatory cytokine production in the intestinal mucosa.',
    relevantHLA: 'HLA-DQ2.5',
    dosage: '5-10 billion CFU daily',
    evidence: 'strong',
  },
  {
    id: 'sb',
    name: 'Saccharomyces boulardii CNCM I-745',
    species: 'S. boulardii',
    benefit: 'Yeast-based probiotic that survives antibiotic treatment. Neutralizes Clostridium difficile toxins and supports microbiome recovery after dysbiosis.',
    mechanism: 'Produces a 54-kDa serine protease that cleaves C. difficile toxin A and its receptor. Stimulates secretory IgA production and brush border enzyme activity.',
    relevantHLA: 'HLA-DRB1*03:01',
    dosage: '250-500mg twice daily',
    evidence: 'strong',
  },
  {
    id: 'lr',
    name: 'Lactobacillus reuteri DSM 17938',
    species: 'L. reuteri',
    benefit: 'Produces reuterin (antimicrobial compound) that selectively inhibits pathogenic bacteria. Modulates Th17/Treg balance relevant to HLA-B*27 pathology.',
    mechanism: 'Converts glycerol to 3-hydroxypropionaldehyde (reuterin), inhibiting gram-negative pathobionts. Stimulates dendritic cell IL-10 production, promoting regulatory T cell differentiation.',
    relevantHLA: 'HLA-B*27',
    dosage: '5 billion CFU daily',
    evidence: 'moderate',
  },
  {
    id: 'la',
    name: 'Lactobacillus acidophilus NCFM',
    species: 'L. acidophilus',
    benefit: 'Enhances epithelial barrier function and modulates innate immune recognition. Particularly beneficial for DQ2.5 carriers to reduce gluten-induced inflammation.',
    mechanism: 'Surface layer protein A (SlpA) binds DC-SIGN receptor on dendritic cells, promoting anti-inflammatory cytokine profile. Reduces intestinal zonulin levels.',
    relevantHLA: 'HLA-DQ2.5',
    dosage: '10 billion CFU daily',
    evidence: 'moderate',
  },
  {
    id: 'am',
    name: 'Akkermansia muciniphila MucT',
    species: 'A. muciniphila',
    benefit: 'Next-generation probiotic that degrades mucin, paradoxically stimulating goblet cells to produce more, thickening the mucus layer. Critical for gut barrier.',
    mechanism: 'Outer membrane protein Amuc_1100 activates TLR2 signaling, promoting tight junction integrity. Supports metabolic health by improving insulin sensitivity.',
    relevantHLA: 'All HLA types',
    dosage: 'Emerging - pasteurized form 10^9 cells daily',
    evidence: 'emerging',
  },
]

// Prebiotic food recommendations
const PREBIOTIC_FOODS: PrebioticFood[] = [
  {
    id: 'kimchi',
    name: 'Kimchi',
    category: 'Fermented Foods',
    fiberType: 'Naturally fermented + fiber',
    bacteriaFed: ['Lactobacillus', 'Leuconostoc', 'Weissella'],
    servingSize: '1/2 cup daily',
    benefit: 'Contains live cultures plus prebiotic fiber from cabbage. Supports Lactobacillus colonization relevant to HLA-B*27 management.',
  },
  {
    id: 'kefir',
    name: 'Kefir',
    category: 'Fermented Foods',
    fiberType: 'Fermented dairy + exopolysaccharides',
    bacteriaFed: ['Lactobacillus', 'Bifidobacterium', 'Saccharomyces'],
    servingSize: '1 cup daily',
    benefit: 'Rich diversity of 30+ microbial strains. Kefiran (polysaccharide) acts as prebiotic. Well-tolerated even by those with mild lactose sensitivity.',
  },
  {
    id: 'jerusalem-artichoke',
    name: 'Jerusalem Artichoke',
    category: 'High-Fiber Vegetables',
    fiberType: 'Inulin (fructooligosaccharide)',
    bacteriaFed: ['Bifidobacterium', 'Lactobacillus', 'Faecalibacterium'],
    servingSize: '1/2 cup cooked',
    benefit: 'Highest natural source of inulin (up to 76% dry weight). Selectively feeds Bifidobacterium, compensating for HLA-DQ2.5 associated reduction.',
  },
  {
    id: 'green-banana',
    name: 'Green Banana / Plantain',
    category: 'Resistant Starch Sources',
    fiberType: 'Resistant starch type 2',
    bacteriaFed: ['Ruminococcus bromii', 'Bifidobacterium adolescentis', 'Eubacterium rectale'],
    servingSize: '1 medium banana (unripe)',
    benefit: 'Resistant starch reaches the colon intact, where it is fermented into butyrate. Butyrate is the primary fuel for colonocytes and reduces inflammation.',
  },
  {
    id: 'garlic',
    name: 'Raw Garlic',
    category: 'High-Fiber Vegetables',
    fiberType: 'Fructooligosaccharides + allicin',
    bacteriaFed: ['Bifidobacterium', 'Lactobacillus'],
    servingSize: '1-2 cloves daily',
    benefit: 'FOS content feeds beneficial bacteria while allicin has selective antimicrobial activity against pathobionts. Supports anti-inflammatory microbiome composition.',
  },
  {
    id: 'oats',
    name: 'Oats (Gluten-Free)',
    category: 'Resistant Starch Sources',
    fiberType: 'Beta-glucan + resistant starch',
    bacteriaFed: ['Roseburia', 'Faecalibacterium prausnitzii', 'Bifidobacterium'],
    servingSize: '1/2 cup dry oats',
    benefit: 'Beta-glucan is a soluble fiber that feeds SCFA-producing bacteria. Choose certified gluten-free due to HLA-DQ2.5 carrier status. Supports Faecalibacterium prausnitzii, a key anti-inflammatory species.',
  },
  {
    id: 'miso',
    name: 'Miso Paste',
    category: 'Fermented Foods',
    fiberType: 'Fermented soy + isoflavones',
    bacteriaFed: ['Lactobacillus', 'Enterococcus faecium', 'Bacillus subtilis'],
    servingSize: '1 tablespoon in soup daily',
    benefit: 'Long-fermented miso contains diverse Bacillus and Lactobacillus. Isoflavones are converted to equol by gut bacteria, providing anti-inflammatory benefits.',
  },
  {
    id: 'flaxseed',
    name: 'Ground Flaxseed',
    category: 'High-Fiber Vegetables',
    fiberType: 'Lignans + mucilage fiber',
    bacteriaFed: ['Ruminococcus', 'Bacteroides', 'Prevotella'],
    servingSize: '2 tablespoons ground daily',
    benefit: 'Lignans are converted by gut bacteria to enterolactone, which has immunomodulatory effects. Mucilage fiber soothes intestinal lining, beneficial for HLA-B*27 associated permeability.',
  },
]

// Gut-brain axis connections
const GUT_BRAIN_CONNECTIONS: GutBrainConnection[] = [
  {
    id: 'serotonin',
    pathway: 'Serotonin (5-HT) Production',
    hlaInfluence: 'HLA-DRB1*03:01 associated Bacteroidetes produce tryptophan metabolites that serve as serotonin precursors. 90-95% of body serotonin is produced by enterochromaffin cells in the gut.',
    neurotransmitter: 'Serotonin (5-HT)',
    effect: 'Your HLA-DRB1*03:01 profile favors Bacteroidetes that enhance tryptophan availability. This supports gut serotonin synthesis, influencing mood, appetite, and sleep-wake cycles.',
    recommendation: 'Include tryptophan-rich foods (turkey, eggs, cheese) and prebiotic fiber to support serotonin-producing gut bacteria. Avoid excessive SSRI dose without PGx guidance.',
  },
  {
    id: 'gaba',
    pathway: 'GABA Production',
    hlaInfluence: 'Lactobacillus and Bifidobacterium strains produce gamma-aminobutyric acid (GABA) via glutamic acid decarboxylase. Your microbiome composition supports moderate GABA production.',
    neurotransmitter: 'GABA',
    effect: 'Reduced Bifidobacterium from HLA-DQ2.5 status may modestly decrease microbial GABA production. Supplementing with B. longum can help restore this pathway.',
    recommendation: 'Supplement with Bifidobacterium longum BB536 and consume fermented foods (kefir, yogurt) that provide GABA-producing bacteria. Include glutamine-rich foods.',
  },
  {
    id: 'dopamine',
    pathway: 'Dopamine Precursor Synthesis',
    hlaInfluence: 'Gut bacteria produce L-DOPA and dopamine via tyrosine metabolism. Enterococcus and Lactobacillus are primary producers. Dysbiosis from HLA-B*27 can alter this pathway.',
    neurotransmitter: 'Dopamine',
    effect: 'HLA-B*27 associated gut inflammation and increased permeability may affect Enterococcus populations, potentially reducing microbial dopamine contribution to the enteric nervous system.',
    recommendation: 'Address gut permeability with L-glutamine (5g daily) and zinc carnosine. Support tyrosine-to-dopamine conversion with adequate B6, iron, and vitamin C.',
  },
  {
    id: 'vagus',
    pathway: 'Vagus Nerve Signaling',
    hlaInfluence: 'The vagus nerve (cranial nerve X) directly connects gut microbiome signals to the brainstem. Microbial metabolites activate vagal afferents, modulating brain function.',
    neurotransmitter: 'Multiple (Acetylcholine, Neuropeptides)',
    effect: 'Your combined HLA profile suggests monitoring gut inflammation, which can dysregulate vagal tone. Reduced vagal tone is linked to depression, anxiety, and impaired stress resilience.',
    recommendation: 'Practice vagal toning exercises (cold exposure, deep breathing, singing). Consume polyphenol-rich foods (berries, dark chocolate, green tea) that support microbiome diversity and vagal health.',
  },
]

// Helpers
function getEvidenceColor(evidence: string): 'green' | 'amber' | 'blue' | 'gray' {
  switch (evidence) {
    case 'strong': return 'green'
    case 'moderate': return 'amber'
    case 'emerging': return 'blue'
    default: return 'gray'
  }
}

function getRiskColor(risk: string): 'green' | 'amber' | 'red' | 'gray' {
  switch (risk) {
    case 'protective': return 'green'
    case 'moderate': return 'amber'
    case 'elevated': return 'red'
    default: return 'gray'
  }
}

function getRiskBgClass(risk: string): string {
  switch (risk) {
    case 'protective': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40'
    case 'moderate': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40'
    case 'elevated': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/40'
    default: return 'bg-surface-soft border-border'
  }
}

export function MicrobiomeConnector() {
  const t = useTranslations('tools.microbiomeConnector')
  const [loading, setLoading] = useState(true)
  const [expandedHLA, setExpandedHLA] = useState<Set<string>>(new Set())
  const [expandedProbiotics, setExpandedProbiotics] = useState<Set<string>>(new Set())
  const [expandedBrain, setExpandedBrain] = useState<Set<string>>(new Set())
  const [showAllFoods, setShowAllFoods] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const toggleHLA = (id: string) => {
    setExpandedHLA(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleProbiotic = (id: string) => {
    setExpandedProbiotics(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleBrain = (id: string) => {
    setExpandedBrain(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const displayedFoods = showAllFoods ? PREBIOTIC_FOODS : PREBIOTIC_FOODS.slice(0, 4)

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 rounded-full animate-spin opacity-20"></div>
            <div className="absolute inset-2 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Microscope className="w-8 h-8 text-emerald-500 animate-pulse" />
            </div>
          </div>
          <Title>Mapping your HLA-microbiome interactions...</Title>
          <Text className="mt-2">Connecting genotype to gut ecosystem recommendations</Text>
        </div>
      </Card>
    )
  }

  return (
    <div role="region" aria-label="Microbiome Connector" className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl flex items-center justify-center shadow-lg">
            <Microscope className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>{t('title')}</Title>
            <Text>{t('description')}</Text>
          </div>
        </div>
      </Card>

      {/* HLA Profile Section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Dna className="w-5 h-5 text-emerald-600" />
          <Title className="text-emerald-700 dark:text-emerald-400">HLA Genotype Profile</Title>
        </div>
        <Text className="mb-4 text-muted">
          Your Human Leukocyte Antigen (HLA) genes shape how your immune system interacts with gut microbes, directly influencing microbiome composition.
        </Text>

        <div className="space-y-3">
          {HLA_ALLELES.map(allele => {
            const isExpanded = expandedHLA.has(allele.id)

            return (
              <div
                key={allele.id}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${getRiskBgClass(allele.riskLevel)} hover:opacity-90`}
                onClick={() => toggleHLA(allele.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Dna className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-title">{allele.gene}{allele.allele}</p>
                        <Badge color={getRiskColor(allele.riskLevel)} size="xs">
                          {allele.riskLevel === 'protective' ? 'Protective' : allele.riskLevel === 'moderate' ? 'Moderate Impact' : 'Elevated Risk'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">Population frequency: {allele.frequency}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-subtle" /> : <ChevronDown className="w-5 h-5 text-subtle" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-current/10 space-y-3">
                    <p className="text-sm text-body">{allele.microbiomeImpact}</p>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Molecular Mechanism</p>
                      <p className="text-sm text-body">{allele.detailedMechanism}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted mb-2">Bacteria Affected:</p>
                      <div className="flex flex-wrap gap-1">
                        {allele.bacteriaAffected.map(b => (
                          <Badge key={b} color={b.includes('(+)') ? 'green' : b.includes('(-)') ? 'red' : 'amber'} size="xs">{b}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted mb-2">Associated Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {allele.associatedConditions.map(c => (
                          <Badge key={c} color="gray" size="xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Microbiome Balance Indicator */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-emerald-600" />
          <Title className="text-emerald-700 dark:text-emerald-400">Predicted Microbiome Composition</Title>
        </div>
        <Text className="mb-4 text-muted">
          Based on your HLA genotype, this is the predicted phylum-level composition of your gut microbiome. The Firmicutes/Bacteroidetes ratio is a key indicator of metabolic health.
        </Text>

        {/* Stacked bar visualization */}
        <div className="mb-4">
          <div className="flex h-10 rounded-xl overflow-hidden">
            {MICROBIOME_COMPOSITION.map(phylum => (
              <div
                key={phylum.name}
                className={`${phylum.color} relative group transition-all hover:opacity-80`}
                style={{ width: `${phylum.percentage}%` }}
              >
                {phylum.percentage >= 8 && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                    {phylum.percentage}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {MICROBIOME_COMPOSITION.map(phylum => (
            <div key={phylum.name} className="flex items-start gap-2 p-2 rounded-lg bg-surface-soft">
              <div className={`w-3 h-3 rounded-full ${phylum.color} mt-1 flex-shrink-0`}></div>
              <div>
                <p className="text-sm font-medium text-title">{phylum.name} ({phylum.percentage}%)</p>
                <p className="text-xs text-muted">{phylum.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* F/B Ratio */}
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">Firmicutes/Bacteroidetes Ratio: 1.86</p>
          </div>
          <p className="text-sm text-body">
            Your predicted F/B ratio of 1.86 falls within the healthy range (1.5-2.5). A ratio above 3.0 is associated with obesity and metabolic syndrome.
            Your HLA-DRB1*03:01 allele contributes to favorable Bacteroidetes abundance, while the HLA-DQ2.5 influence slightly elevates Firmicutes.
          </p>
        </div>
      </Card>

      {/* Personalized Probiotics */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Beaker className="w-5 h-5 text-emerald-600" />
          <Title className="text-emerald-700 dark:text-emerald-400">Personalized Probiotic Recommendations</Title>
        </div>
        <Text className="mb-4 text-muted">
          Strains selected based on your specific HLA alleles and their microbiome effects. Evidence levels reflect published clinical trial data.
        </Text>

        <div className="space-y-3">
          {PROBIOTIC_STRAINS.map(strain => {
            const isExpanded = expandedProbiotics.has(strain.id)

            return (
              <div
                key={strain.id}
                className="p-4 bg-surface-soft rounded-xl border border-border cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                onClick={() => toggleProbiotic(strain.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Microscope className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-title">{strain.name}</p>
                        <Badge color={getEvidenceColor(strain.evidence)} size="xs">
                          {strain.evidence === 'strong' ? 'Strong Evidence' : strain.evidence === 'moderate' ? 'Moderate Evidence' : 'Emerging Research'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">{strain.species} - Targets: {strain.relevantHLA}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-subtle flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-subtle flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    <p className="text-sm text-body">{strain.benefit}</p>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Mechanism of Action</p>
                      <p className="text-sm text-body">{strain.mechanism}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color="blue" size="xs">Dosage: {strain.dosage}</Badge>
                      <Badge color="emerald" size="xs">For: {strain.relevantHLA}</Badge>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Prebiotic Foods */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-green-600" />
          <Title className="text-green-700 dark:text-green-400">Prebiotic Foods for Your Genotype</Title>
        </div>
        <Text className="mb-4 text-muted">
          These foods contain specific fibers and compounds that feed the beneficial bacteria most relevant to your HLA profile.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedFoods.map(food => (
            <div
              key={food.id}
              className="p-3 bg-success-soft rounded-xl border border-success"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  {food.category === 'Fermented Foods' ? (
                    <FlaskConical className="w-5 h-5 text-green-600" />
                  ) : food.category === 'Resistant Starch Sources' ? (
                    <Wheat className="w-5 h-5 text-green-600" />
                  ) : (
                    <Leaf className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-title">{food.name}</p>
                    <Badge color="green" size="xs">{food.category}</Badge>
                  </div>
                  <p className="text-xs text-muted mt-1">{food.benefit}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge color="emerald" size="xs">{food.fiberType}</Badge>
                    <Badge color="blue" size="xs">{food.servingSize}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {food.bacteriaFed.map(b => (
                      <span key={b} className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {PREBIOTIC_FOODS.length > 4 && (
          <div className="mt-4 text-center">
            <Button
              variant="secondary"
              onClick={() => setShowAllFoods(!showAllFoods)}
              className="text-emerald-700"
            >
              {showAllFoods ? 'Show Less' : `Show All ${PREBIOTIC_FOODS.length} Foods`}
              {showAllFoods ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        )}
      </Card>

      {/* Gut-Brain Axis */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <Title className="text-purple-700 dark:text-purple-400">Gut-Brain Axis & HLA Influence</Title>
        </div>
        <Text className="mb-4 text-muted">
          Your gut produces over 90% of your body's serotonin and communicates directly with your brain via the vagus nerve. Your HLA genes influence which neurotransmitter-producing bacteria thrive.
        </Text>

        <div className="space-y-3">
          {GUT_BRAIN_CONNECTIONS.map(connection => {
            const isExpanded = expandedBrain.has(connection.id)

            return (
              <div
                key={connection.id}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700/40 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                onClick={() => toggleBrain(connection.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-title">{connection.pathway}</p>
                      <p className="text-xs text-muted">Neurotransmitter: {connection.neurotransmitter}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-subtle" /> : <ChevronDown className="w-5 h-5 text-subtle" />}
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700/40 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">HLA Influence</p>
                      <p className="text-sm text-body">{connection.hlaInfluence}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">Your Profile Effect</p>
                      <p className="text-sm text-body">{connection.effect}</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">Recommendation</p>
                      <p className="text-sm text-body">{connection.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="border-emerald-200 dark:border-emerald-700/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-title mb-1">Scientific Disclaimer</p>
            <p className="text-sm text-muted">
              HLA-microbiome interactions are an active area of research. Predictions are based on genome-wide association studies and
              may not reflect individual variation due to diet, environment, medication use, and other factors.
              Probiotic recommendations are based on clinical evidence but should be discussed with a healthcare provider,
              especially if you have autoimmune conditions. Microbiome testing (16S rRNA or shotgun metagenomics)
              can provide a more accurate picture of your actual gut composition.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
