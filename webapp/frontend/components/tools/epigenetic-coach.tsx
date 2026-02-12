'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge, ProgressBar } from '@tremor/react'
import {
  Flame,
  Brain,
  Heart,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Dna,
  Dumbbell,
  Utensils,
  Moon,
  Sparkles,
  Target,
  Leaf,
  FlaskConical,
  MessageCircle,
  Settings,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Bot,
  Link,
  ExternalLink,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToolState } from '@/hooks/useToolState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'

// Types
interface GeneTarget {
  gene: string
  variant: string
  action: 'silence' | 'activate'
  currentStatus: string
  currentStatusEs: string
  targetStatus: string
  targetStatusEs: string
  epigeneticMechanism: string
  epigeneticMechanismEs: string
}

interface Intervention {
  id: string
  name: string
  nameEs: string
  category: 'nutrition' | 'exercise' | 'sleep' | 'meditation' | 'supplement'
  icon: typeof Utensils
  frequency: string
  frequencyEs: string
  duration: string
  durationEs: string
  impactScore: number
  evidenceLevel: 'strong' | 'moderate' | 'emerging'
  targetGenes: GeneTarget[]
  description: string
  descriptionEs: string
  mechanism: string
  mechanismEs: string
  specificProtocol: string
  specificProtocolEs: string
}

interface WeeklyPlan {
  day: string
  dayEs: string
  morning: string[]
  morningEs: string[]
  afternoon: string[]
  afternoonEs: string[]
  evening: string[]
  eveningEs: string[]
}

interface AIConnector {
  id: string
  name: string
  provider: string
  description: string
  descriptionEs: string
  status: 'available' | 'coming_soon'
  icon: string
}

// AI Connector options
const AI_CONNECTORS: AIConnector[] = [
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    provider: 'Anthropic',
    description: 'Advanced reasoning for nuanced epigenetic coaching. Excels at explaining complex gene-environment interactions.',
    descriptionEs: 'Razonamiento avanzado para coaching epigenetico matizado. Excelente explicando interacciones gen-ambiente complejas.',
    status: 'available',
    icon: '🧠',
  },
  {
    id: 'gpt',
    name: 'ChatGPT (OpenAI)',
    provider: 'OpenAI',
    description: 'Versatile AI assistant for personalized health coaching and intervention planning.',
    descriptionEs: 'Asistente IA versatil para coaching de salud personalizado y planificacion de intervenciones.',
    status: 'available',
    icon: '💬',
  },
  {
    id: 'gemini',
    name: 'Gemini (Google)',
    provider: 'Google',
    description: 'Multimodal AI with deep scientific knowledge for research-backed recommendations.',
    descriptionEs: 'IA multimodal con profundo conocimiento cientifico para recomendaciones basadas en investigacion.',
    status: 'coming_soon',
    icon: '✨',
  },
  {
    id: 'custom',
    name: 'Custom API Endpoint',
    provider: 'Custom',
    description: 'Connect your own AI model or fine-tuned endpoint for specialized coaching.',
    descriptionEs: 'Conecta tu propio modelo IA o endpoint afinado para coaching especializado.',
    status: 'available',
    icon: '🔧',
  },
]

// Personalized intervention plan based on demo genotype
const INTERVENTIONS: Intervention[] = [
  {
    id: 'mediterranean-anti-inflammatory',
    name: 'Anti-Inflammatory Mediterranean Protocol',
    nameEs: 'Protocolo Mediterraneo Anti-Inflamatorio',
    category: 'nutrition',
    icon: Utensils,
    frequency: 'Daily',
    frequencyEs: 'Diario',
    duration: '12 weeks minimum',
    durationEs: '12 semanas minimo',
    impactScore: 92,
    evidenceLevel: 'strong',
    targetGenes: [
      {
        gene: 'TNF-alpha',
        variant: 'rs1800629 G>A',
        action: 'silence',
        currentStatus: 'Elevated expression — pro-inflammatory',
        currentStatusEs: 'Expresion elevada — pro-inflamatoria',
        targetStatus: 'Reduce TNF-alpha transcription via NF-kB pathway modulation',
        targetStatusEs: 'Reducir transcripcion de TNF-alfa via modulacion de via NF-kB',
        epigeneticMechanism: 'Omega-3 fatty acids (EPA/DHA) increase HDAC3 activity at TNF promoter, promoting deacetylation and transcriptional silencing',
        epigeneticMechanismEs: 'Los acidos grasos omega-3 (EPA/DHA) aumentan la actividad de HDAC3 en el promotor de TNF, promoviendo deacetilacion y silenciamiento transcripcional',
      },
      {
        gene: 'IL-10',
        variant: 'rs1800896 A>G',
        action: 'activate',
        currentStatus: 'Reduced expression — lower anti-inflammatory capacity',
        currentStatusEs: 'Expresion reducida — menor capacidad anti-inflamatoria',
        targetStatus: 'Enhance IL-10 production through polyphenol-mediated demethylation',
        targetStatusEs: 'Mejorar produccion de IL-10 a traves de desmetilacion mediada por polifenoles',
        epigeneticMechanism: 'Olive oil polyphenols (hydroxytyrosol) inhibit DNMT1 at IL-10 promoter CpG islands, allowing transcription factor access',
        epigeneticMechanismEs: 'Los polifenoles del aceite de oliva (hidroxitirosol) inhiben DNMT1 en islas CpG del promotor de IL-10, permitiendo acceso a factores de transcripcion',
      },
    ],
    description: 'Targeted anti-inflammatory nutrition plan leveraging omega-3 fatty acids, polyphenols, and fiber to epigenetically silence pro-inflammatory genes while activating anti-inflammatory pathways.',
    descriptionEs: 'Plan de nutricion anti-inflamatoria dirigida aprovechando acidos grasos omega-3, polifenoles y fibra para silenciar epigeneticamente genes pro-inflamatorios mientras activa vias anti-inflamatorias.',
    mechanism: 'Omega-3s modulate HDAC/HAT balance at inflammatory gene promoters. Polyphenols act as DNMT inhibitors. Fiber feeds butyrate-producing gut bacteria, and butyrate is a potent HDAC inhibitor.',
    mechanismEs: 'Los omega-3 modulan el balance HDAC/HAT en promotores de genes inflamatorios. Los polifenoles actuan como inhibidores de DNMT. La fibra alimenta bacterias productoras de butirato, y el butirato es un potente inhibidor de HDAC.',
    specificProtocol: '3x/week wild salmon or sardines (EPA 1.5g + DHA 1g). Daily: 2 tbsp EVOO, 1 cup leafy greens, 30g mixed nuts, 2 cups green tea. Avoid: processed meats, refined sugar, seed oils.',
    specificProtocolEs: '3x/semana salmon salvaje o sardinas (EPA 1.5g + DHA 1g). Diario: 2 cucharadas AOVE, 1 taza verduras de hoja, 30g frutos secos mixtos, 2 tazas te verde. Evitar: carnes procesadas, azucar refinada, aceites de semillas.',
  },
  {
    id: 'hiit-telomere',
    name: 'HIIT + Resistance Telomere Protocol',
    nameEs: 'Protocolo HIIT + Resistencia para Telomeros',
    category: 'exercise',
    icon: Dumbbell,
    frequency: '4-5x per week',
    frequencyEs: '4-5x por semana',
    duration: 'Ongoing (8 weeks for measurable changes)',
    durationEs: 'Continuo (8 semanas para cambios medibles)',
    impactScore: 88,
    evidenceLevel: 'strong',
    targetGenes: [
      {
        gene: 'TERT',
        variant: 'rs2736100 A>C',
        action: 'activate',
        currentStatus: 'Below-average telomerase expression',
        currentStatusEs: 'Expresion de telomerasa por debajo del promedio',
        targetStatus: 'Increase TERT transcription through exercise-induced demethylation',
        targetStatusEs: 'Aumentar transcripcion de TERT a traves de desmetilacion inducida por ejercicio',
        epigeneticMechanism: 'Acute exercise activates TET2 demethylase in leukocytes, removing methyl groups from TERT promoter CpG sites, enabling telomerase activation',
        epigeneticMechanismEs: 'El ejercicio agudo activa la desmetilasa TET2 en leucocitos, removiendo grupos metilo de sitios CpG del promotor TERT, habilitando activacion de telomerasa',
      },
      {
        gene: 'BDNF',
        variant: 'rs6265 Val66Met',
        action: 'activate',
        currentStatus: 'Reduced activity-dependent BDNF secretion (Met carrier)',
        currentStatusEs: 'Secrecion reducida de BDNF dependiente de actividad (portador Met)',
        targetStatus: 'Compensate via exercise-induced BDNF promoter demethylation',
        targetStatusEs: 'Compensar via desmetilacion del promotor BDNF inducida por ejercicio',
        epigeneticMechanism: 'HIIT increases BDNF promoter IV demethylation in hippocampus and blood. Exercise-induced lactate crosses BBB and inhibits HDAC2/3 at BDNF locus',
        epigeneticMechanismEs: 'El HIIT aumenta la desmetilacion del promotor BDNF IV en hipocampo y sangre. El lactato inducido por ejercicio cruza la BHE e inhibe HDAC2/3 en el locus BDNF',
      },
    ],
    description: 'Combined HIIT and resistance training protocol designed to activate telomerase, boost BDNF, and improve global DNA methylation patterns.',
    descriptionEs: 'Protocolo combinado de HIIT y entrenamiento de resistencia disenado para activar telomerasa, impulsar BDNF y mejorar patrones globales de metilacion del ADN.',
    mechanism: 'Exercise triggers a cascade of epigenetic changes: TET2 activation for promoter demethylation, increased histone acetylation at neuroprotective genes, and AMPK-mediated SIRT1 activation for longevity gene expression.',
    mechanismEs: 'El ejercicio desencadena una cascada de cambios epigeneticos: activacion de TET2 para desmetilacion de promotores, aumento de acetilacion de histonas en genes neuroprotectores, y activacion de SIRT1 mediada por AMPK para expresion de genes de longevidad.',
    specificProtocol: 'Mon/Wed/Fri: 20 min HIIT (30s sprint / 90s recovery x 8 rounds). Tue/Thu: Full-body resistance (compound movements, 3x8-12 reps). Sat: 45 min zone 2 cardio. Sun: Active recovery (yoga/walking).',
    specificProtocolEs: 'Lun/Mie/Vie: 20 min HIIT (30s sprint / 90s recuperacion x 8 rondas). Mar/Jue: Resistencia cuerpo completo (movimientos compuestos, 3x8-12 reps). Sab: 45 min cardio zona 2. Dom: Recuperacion activa (yoga/caminata).',
  },
  {
    id: 'circadian-sleep',
    name: 'Circadian Rhythm Optimization',
    nameEs: 'Optimizacion del Ritmo Circadiano',
    category: 'sleep',
    icon: Moon,
    frequency: 'Daily',
    frequencyEs: 'Diario',
    duration: '4 weeks to reset, then maintain',
    durationEs: '4 semanas para resetear, luego mantener',
    impactScore: 85,
    evidenceLevel: 'strong',
    targetGenes: [
      {
        gene: 'CLOCK',
        variant: 'rs1801260 T>C',
        action: 'activate',
        currentStatus: 'Delayed circadian phase — evening chronotype',
        currentStatusEs: 'Fase circadiana retrasada — cronotipo vespertino',
        targetStatus: 'Normalize CLOCK gene cycling through light/dark entrainment',
        targetStatusEs: 'Normalizar ciclado del gen CLOCK a traves de arrastre luz/oscuridad',
        epigeneticMechanism: 'Morning light exposure triggers SIRT1-mediated deacetylation of BMAL1, synchronizing the CLOCK:BMAL1 heterodimer transcription cycle with solar time',
        epigeneticMechanismEs: 'La exposicion a la luz matutina desencadena deacetilacion de BMAL1 mediada por SIRT1, sincronizando el ciclo de transcripcion del heterodimero CLOCK:BMAL1 con el tiempo solar',
      },
      {
        gene: 'MTHFR',
        variant: 'rs1801133 C>T',
        action: 'activate',
        currentStatus: 'Reduced methylation capacity (677T carrier)',
        currentStatusEs: 'Capacidad de metilacion reducida (portador 677T)',
        targetStatus: 'Support methylation cycle through sleep-dependent SAM regeneration',
        targetStatusEs: 'Apoyar ciclo de metilacion a traves de regeneracion de SAM dependiente del sueno',
        epigeneticMechanism: 'Deep sleep (N3) is when SAM (S-adenosylmethionine) is regenerated most efficiently. Poor sleep depletes methyl donor pools, compounding MTHFR insufficiency',
        epigeneticMechanismEs: 'El sueno profundo (N3) es cuando SAM (S-adenosilmetionina) se regenera mas eficientemente. El sueno pobre agota las reservas de donantes de metilo, agravando la insuficiencia de MTHFR',
      },
    ],
    description: 'Comprehensive sleep optimization targeting circadian clock genes and methylation-dependent repair pathways. Critical for MTHFR 677T carriers who need optimal SAM regeneration.',
    descriptionEs: 'Optimizacion integral del sueno dirigida a genes del reloj circadiano y vias de reparacion dependientes de metilacion. Critico para portadores de MTHFR 677T que necesitan regeneracion optima de SAM.',
    mechanism: 'Sleep drives rhythmic DNA methylation changes across >15,000 CpG sites. N3 sleep is essential for SAM cycle replenishment, DNA repair enzyme expression, and clearance of oxidative damage.',
    mechanismEs: 'El sueno impulsa cambios ritmicos de metilacion del ADN en >15,000 sitios CpG. El sueno N3 es esencial para reposicion del ciclo SAM, expresion de enzimas de reparacion del ADN, y eliminacion de dano oxidativo.',
    specificProtocol: 'Wake: 10 min bright light (>10,000 lux) within 30 min. No caffeine after 12pm. Blue light block after 8pm. Bedroom: 18-19°C, pitch dark. Bed at 10:30pm, wake at 6:30am. Magnesium glycinate 400mg + L-theanine 200mg 1hr before bed.',
    specificProtocolEs: 'Despertar: 10 min luz brillante (>10,000 lux) dentro de 30 min. Sin cafeina despues de las 12pm. Bloqueo de luz azul despues de las 8pm. Habitacion: 18-19°C, completamente oscura. Dormir a las 10:30pm, despertar a las 6:30am. Glicinato de magnesio 400mg + L-teanina 200mg 1hr antes de dormir.',
  },
  {
    id: 'mindfulness-epigenetic',
    name: 'Epigenetic Mindfulness Protocol',
    nameEs: 'Protocolo de Mindfulness Epigenetico',
    category: 'meditation',
    icon: Brain,
    frequency: 'Daily',
    frequencyEs: 'Diario',
    duration: '8 weeks (MBSR standard)',
    durationEs: '8 semanas (estandar MBSR)',
    impactScore: 76,
    evidenceLevel: 'moderate',
    targetGenes: [
      {
        gene: 'NR3C1',
        variant: 'rs41423247 C>G',
        action: 'activate',
        currentStatus: 'Reduced glucocorticoid receptor expression — stress vulnerability',
        currentStatusEs: 'Expresion reducida del receptor de glucocorticoides — vulnerabilidad al estres',
        targetStatus: 'Demethylate NR3C1 promoter to restore cortisol sensitivity',
        targetStatusEs: 'Desmetilar promotor NR3C1 para restaurar sensibilidad al cortisol',
        epigeneticMechanism: 'Meditation reduces cortisol chronically, allowing TET-mediated demethylation of NR3C1 exon 1F promoter. This restores normal HPA axis negative feedback',
        epigeneticMechanismEs: 'La meditacion reduce el cortisol cronicamente, permitiendo desmetilacion mediada por TET del promotor del exon 1F de NR3C1. Esto restaura la retroalimentacion negativa normal del eje HPA',
      },
      {
        gene: 'SLC6A4',
        variant: 'rs25531 (5-HTTLPR)',
        action: 'activate',
        currentStatus: 'Short allele — reduced serotonin transporter, stress sensitivity',
        currentStatusEs: 'Alelo corto — transportador de serotonina reducido, sensibilidad al estres',
        targetStatus: 'Compensate via increased SLC6A4 expression through histone modification',
        targetStatusEs: 'Compensar via aumento de expresion de SLC6A4 a traves de modificacion de histonas',
        epigeneticMechanism: '8-week MBSR increases H3K4me3 (activating mark) at SLC6A4 promoter in peripheral blood, correlating with improved emotional regulation',
        epigeneticMechanismEs: 'MBSR de 8 semanas aumenta H3K4me3 (marca activadora) en el promotor de SLC6A4 en sangre periferica, correlacionando con regulacion emocional mejorada',
      },
    ],
    description: 'Evidence-based mindfulness protocol targeting stress-response genes and serotonin transporter expression. Especially beneficial for 5-HTTLPR short allele carriers.',
    descriptionEs: 'Protocolo de mindfulness basado en evidencia dirigido a genes de respuesta al estres y expresion del transportador de serotonina. Especialmente beneficioso para portadores del alelo corto de 5-HTTLPR.',
    mechanism: 'Meditation produces measurable epigenetic changes within 8 weeks: reduced methylation at stress-response genes, increased histone acetylation at neuroplasticity genes, and telomere lengthening via telomerase activation.',
    mechanismEs: 'La meditacion produce cambios epigeneticos medibles en 8 semanas: reduccion de metilacion en genes de respuesta al estres, aumento de acetilacion de histonas en genes de neuroplasticidad, y alargamiento de telomeros via activacion de telomerasa.',
    specificProtocol: 'Morning (20 min): Focused attention meditation (breath). Evening (10 min): Body scan before sleep. Weekly: 1 guided loving-kindness session (45 min). Monthly: 1 silent retreat day. Use Waking Up or Insight Timer apps.',
    specificProtocolEs: 'Manana (20 min): Meditacion de atencion focalizada (respiracion). Noche (10 min): Escaneo corporal antes de dormir. Semanal: 1 sesion guiada de bondad amorosa (45 min). Mensual: 1 dia de retiro en silencio. Usar apps Waking Up o Insight Timer.',
  },
  {
    id: 'targeted-supplements',
    name: 'Methylation Support Stack',
    nameEs: 'Stack de Soporte de Metilacion',
    category: 'supplement',
    icon: FlaskConical,
    frequency: 'Daily',
    frequencyEs: 'Diario',
    duration: 'Ongoing with quarterly blood work',
    durationEs: 'Continuo con analisis de sangre trimestrales',
    impactScore: 80,
    evidenceLevel: 'moderate',
    targetGenes: [
      {
        gene: 'MTHFR',
        variant: 'rs1801133 C>T (677T)',
        action: 'activate',
        currentStatus: '~35% reduced enzyme activity (heterozygous)',
        currentStatusEs: '~35% actividad enzimatica reducida (heterocigoto)',
        targetStatus: 'Bypass MTHFR bottleneck with pre-methylated folate',
        targetStatusEs: 'Evitar cuello de botella MTHFR con folato pre-metilado',
        epigeneticMechanism: 'L-methylfolate (5-MTHF) directly provides methyl groups to the SAM cycle, bypassing deficient MTHFR conversion. This restores global methylation capacity.',
        epigeneticMechanismEs: 'L-metilfolato (5-MTHF) proporciona directamente grupos metilo al ciclo SAM, evitando la conversion deficiente de MTHFR. Esto restaura la capacidad global de metilacion.',
      },
      {
        gene: 'COMT',
        variant: 'rs4680 Val158Met',
        action: 'silence',
        currentStatus: 'Met/Met — slow COMT, dopamine/estrogen accumulation',
        currentStatusEs: 'Met/Met — COMT lento, acumulacion de dopamina/estrogeno',
        targetStatus: 'Support methylation-dependent catechol clearance',
        targetStatusEs: 'Apoyar eliminacion de catecol dependiente de metilacion',
        epigeneticMechanism: 'COMT uses SAM to methylate catecholamines and catechol estrogens. Adequate SAM supply (from methylfolate + B12) ensures efficient clearance despite slow enzyme activity.',
        epigeneticMechanismEs: 'COMT usa SAM para metilar catecolaminas y estrogenos catecol. El suministro adecuado de SAM (de metilfolato + B12) asegura eliminacion eficiente a pesar de la actividad enzimatica lenta.',
      },
    ],
    description: 'Personalized supplement stack targeting your MTHFR and COMT variants. Provides pre-methylated B vitamins and co-factors to optimize the methylation cycle.',
    descriptionEs: 'Stack de suplementos personalizado dirigido a tus variantes MTHFR y COMT. Proporciona vitaminas B pre-metiladas y cofactores para optimizar el ciclo de metilacion.',
    mechanism: 'The methylation cycle (folate → SAM → methylation → homocysteine → methionine) is the primary epigenetic control mechanism. MTHFR and COMT variants create bottlenecks that targeted supplementation can address.',
    mechanismEs: 'El ciclo de metilacion (folato → SAM → metilacion → homocisteina → metionina) es el principal mecanismo de control epigenetico. Las variantes MTHFR y COMT crean cuellos de botella que la suplementacion dirigida puede abordar.',
    specificProtocol: 'L-Methylfolate 400mcg, Methylcobalamin (B12) 1000mcg, P5P (active B6) 25mg, TMG (Betaine) 500mg, Magnesium Glycinate 400mg, NAC 600mg, Vitamin D3 4000 IU + K2 100mcg. Take with breakfast. Test: homocysteine, B12, folate, vitamin D quarterly.',
    specificProtocolEs: 'L-Metilfolato 400mcg, Metilcobalamina (B12) 1000mcg, P5P (B6 activa) 25mg, TMG (Betaina) 500mg, Glicinato de Magnesio 400mg, NAC 600mg, Vitamina D3 4000 UI + K2 100mcg. Tomar con desayuno. Analizar: homocisteina, B12, folato, vitamina D trimestralmente.',
  },
]

// Weekly plan
const WEEKLY_PLAN: WeeklyPlan[] = [
  {
    day: 'Monday', dayEs: 'Lunes',
    morning: ['20 min meditation', '10 min bright light', 'Supplement stack', 'HIIT 20 min'],
    morningEs: ['20 min meditacion', '10 min luz brillante', 'Stack de suplementos', 'HIIT 20 min'],
    afternoon: ['Mediterranean lunch (salmon + greens)', 'Green tea x2'],
    afternoonEs: ['Almuerzo mediterraneo (salmon + verduras)', 'Te verde x2'],
    evening: ['Blue light block 8pm', 'Body scan 10 min', 'Magnesium + L-theanine', 'Bed 10:30pm'],
    eveningEs: ['Bloqueo luz azul 8pm', 'Escaneo corporal 10 min', 'Magnesio + L-teanina', 'Dormir 10:30pm'],
  },
  {
    day: 'Tuesday', dayEs: 'Martes',
    morning: ['20 min meditation', '10 min bright light', 'Supplement stack', 'Resistance training 45 min'],
    morningEs: ['20 min meditacion', '10 min luz brillante', 'Stack de suplementos', 'Entrenamiento resistencia 45 min'],
    afternoon: ['EVOO-rich lunch', 'Mixed nuts 30g', 'Green tea x2'],
    afternoonEs: ['Almuerzo rico en AOVE', 'Frutos secos mixtos 30g', 'Te verde x2'],
    evening: ['Blue light block 8pm', 'Body scan 10 min', 'Magnesium + L-theanine', 'Bed 10:30pm'],
    eveningEs: ['Bloqueo luz azul 8pm', 'Escaneo corporal 10 min', 'Magnesio + L-teanina', 'Dormir 10:30pm'],
  },
  {
    day: 'Wednesday', dayEs: 'Miercoles',
    morning: ['20 min meditation', '10 min bright light', 'Supplement stack', 'HIIT 20 min'],
    morningEs: ['20 min meditacion', '10 min luz brillante', 'Stack de suplementos', 'HIIT 20 min'],
    afternoon: ['Sardines + leafy greens', 'Green tea x2'],
    afternoonEs: ['Sardinas + verduras de hoja', 'Te verde x2'],
    evening: ['Blue light block 8pm', 'Body scan 10 min', 'Magnesium + L-theanine', 'Bed 10:30pm'],
    eveningEs: ['Bloqueo luz azul 8pm', 'Escaneo corporal 10 min', 'Magnesio + L-teanina', 'Dormir 10:30pm'],
  },
]

// Helper functions
function getCategoryColor(category: string): string {
  switch (category) {
    case 'nutrition': return 'green'
    case 'exercise': return 'blue'
    case 'sleep': return 'indigo'
    case 'meditation': return 'purple'
    case 'supplement': return 'amber'
    default: return 'gray'
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'nutrition': return 'Nutrition'
    case 'exercise': return 'Exercise'
    case 'sleep': return 'Sleep'
    case 'meditation': return 'Meditation'
    case 'supplement': return 'Supplements'
    default: return category
  }
}

function getEvidenceColor(level: string): 'green' | 'blue' | 'amber' {
  switch (level) {
    case 'strong': return 'green'
    case 'moderate': return 'blue'
    case 'emerging': return 'amber'
    default: return 'blue'
  }
}

export function EpigeneticCoach() {
  const t = useTranslations('tools.epigeneticCoach')
  const [loading, setLoading] = useState(true)
  const [expandedInterventions, setExpandedInterventions] = useState<Set<string>>(new Set())
  const [selectedView, setSelectedView] = useState<'plan' | 'interventions' | 'weekly' | 'aicoach'>('plan')
  const [selectedConnector, setSelectedConnector] = useState<string>('claude')
  const [coachMessage, setCoachMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([])
  const [isAiThinking, setIsAiThinking] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const toggleIntervention = (id: string) => {
    setExpandedInterventions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSendMessage = () => {
    if (!coachMessage.trim()) return

    setChatHistory(prev => [...prev, { role: 'user', text: coachMessage }])
    setCoachMessage('')
    setIsAiThinking(true)

    // Simulate AI response
    setTimeout(() => {
      const connector = AI_CONNECTORS.find(c => c.id === selectedConnector)
      const responses = [
        `Based on your MTHFR 677T variant, I recommend prioritizing methylated B vitamins (L-methylfolate 400mcg) and increasing dietary folate from leafy greens. Your COMT Met/Met genotype means you should avoid high-dose methyl donors — the protocol in your plan is well-calibrated for your specific combination.`,
        `Given your TNF-alpha rs1800629 A allele, the anti-inflammatory Mediterranean protocol is especially important for you. The omega-3 dosing (EPA 1.5g + DHA 1g) has been shown to reduce TNF-alpha expression by up to 30% in carriers of this variant through HDAC3-mediated promoter silencing.`,
        `Your BDNF Val66Met status means exercise-induced BDNF release is reduced compared to Val/Val individuals. The HIIT protocol compensates through an alternative pathway: lactate-mediated HDAC inhibition at the BDNF promoter. Consistency is key — aim for at least 4 sessions per week.`,
      ]
      setChatHistory(prev => [...prev, {
        role: 'ai',
        text: responses[Math.floor(Math.random() * responses.length)]
      }])
      setIsAiThinking(false)
    }, 2000)
  }

  // Calculate total impact
  const totalGenesSilenced = INTERVENTIONS.reduce((acc, i) => acc + i.targetGenes.filter(g => g.action === 'silence').length, 0)
  const totalGenesActivated = INTERVENTIONS.reduce((acc, i) => acc + i.targetGenes.filter(g => g.action === 'activate').length, 0)
  const averageImpact = Math.round(INTERVENTIONS.reduce((acc, i) => acc + i.impactScore, 0) / INTERVENTIONS.length)

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full animate-spin opacity-20"></div>
            <div className="absolute inset-2 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
          </div>
          <Title>Building your personalized epigenetic coaching plan...</Title>
          <Text className="mt-2">Analyzing gene targets, intervention mechanisms, and AI connector options</Text>
        </div>
      </Card>
    )
  }

  return (
    <div role="region" aria-label="Epigenetic Coach" className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>{t('title')}</Title>
            <Text>{t('description')}</Text>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="text-center p-4">
          <div className="w-10 h-10 mx-auto mb-2 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{totalGenesSilenced}</p>
          <p className="text-xs text-muted">Genes to Silence</p>
        </Card>
        <Card className="text-center p-4">
          <div className="w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{totalGenesActivated}</p>
          <p className="text-xs text-muted">Genes to Activate</p>
        </Card>
        <Card className="text-center p-4">
          <div className="w-10 h-10 mx-auto mb-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{INTERVENTIONS.length}</p>
          <p className="text-xs text-muted">Interventions</p>
        </Card>
        <Card className="text-center p-4">
          <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{averageImpact}%</p>
          <p className="text-xs text-muted">Avg Impact Score</p>
        </Card>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 p-1 bg-surface-muted rounded-xl overflow-x-auto">
        <Button variant={selectedView === 'plan' ? 'primary' : 'light'} size="xs" onClick={() => setSelectedView('plan')} icon={Target}>
          Your Plan
        </Button>
        <Button variant={selectedView === 'interventions' ? 'primary' : 'light'} size="xs" onClick={() => setSelectedView('interventions')} icon={Dna}>
          Gene Targets
        </Button>
        <Button variant={selectedView === 'weekly' ? 'primary' : 'light'} size="xs" onClick={() => setSelectedView('weekly')} icon={Clock}>
          Weekly Schedule
        </Button>
        <Button variant={selectedView === 'aicoach' ? 'primary' : 'light'} size="xs" onClick={() => setSelectedView('aicoach')} icon={Bot}>
          AI Coach
        </Button>
      </div>

      {/* Plan Overview View */}
      {selectedView === 'plan' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-orange-600" />
            <Title className="text-orange-700 dark:text-orange-400">Your Personalized Epigenetic Plan</Title>
          </div>
          <Text className="mb-4 text-muted">
            Based on your genotype, these interventions target specific genes through epigenetic mechanisms (DNA methylation, histone modification, chromatin remodeling).
          </Text>

          <div className="space-y-3">
            {INTERVENTIONS.map(intervention => {
              const isExpanded = expandedInterventions.has(intervention.id)
              const Icon = intervention.icon

              return (
                <div
                  key={intervention.id}
                  className="p-4 bg-surface-soft rounded-xl border border-border cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                  onClick={() => toggleIntervention(intervention.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${getCategoryColor(intervention.category)}-100 dark:bg-${getCategoryColor(intervention.category)}-900/30`}>
                        <Icon className={`w-6 h-6 text-${getCategoryColor(intervention.category)}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-title text-sm">{intervention.name}</p>
                          <Badge color={getCategoryColor(intervention.category) as any} size="xs">{getCategoryLabel(intervention.category)}</Badge>
                          <Badge color={getEvidenceColor(intervention.evidenceLevel)} size="xs">{intervention.evidenceLevel} evidence</Badge>
                        </div>
                        <p className="text-xs text-muted mt-1">{intervention.frequency} | {intervention.duration}</p>
                        {/* Impact bar */}
                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                            style={{ width: `${intervention.impactScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-orange-600">{intervention.impactScore}%</p>
                        <p className="text-[10px] text-muted">impact</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-subtle" /> : <ChevronDown className="w-5 h-5 text-subtle" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <p className="text-sm text-body">{intervention.description}</p>

                      {/* Mechanism */}
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">Epigenetic Mechanism</p>
                        <p className="text-sm text-body">{intervention.mechanism}</p>
                      </div>

                      {/* Specific Protocol */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Specific Protocol</p>
                        <p className="text-sm text-body">{intervention.specificProtocol}</p>
                      </div>

                      {/* Target Genes */}
                      <div>
                        <p className="text-xs font-semibold text-muted mb-2">Target Genes:</p>
                        <div className="space-y-2">
                          {intervention.targetGenes.map((gene, i) => (
                            <div key={i} className={`p-3 rounded-lg border ${
                              gene.action === 'silence'
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-700/40'
                                : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-700/40'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge color={gene.action === 'silence' ? 'red' : 'green'} size="xs">
                                  {gene.action === 'silence' ? 'SILENCE' : 'ACTIVATE'}
                                </Badge>
                                <span className="text-xs font-bold text-title">{gene.gene}</span>
                                <span className="text-xs text-muted">({gene.variant})</span>
                              </div>
                              <p className="text-xs text-muted mb-1">Current: {gene.currentStatus}</p>
                              <p className="text-xs text-body">Mechanism: {gene.epigeneticMechanism}</p>
                            </div>
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
      )}

      {/* Gene Targets View */}
      {selectedView === 'interventions' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Dna className="w-5 h-5 text-purple-600" />
            <Title className="text-purple-700 dark:text-purple-400">Gene Target Map</Title>
          </div>
          <Text className="mb-4 text-muted">
            All genes targeted by your personalized epigenetic intervention plan. Red = silence (reduce expression), Green = activate (increase expression).
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Genes to Silence */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Genes to Silence</p>
              </div>
              <div className="space-y-2">
                {INTERVENTIONS.flatMap(i => i.targetGenes.filter(g => g.action === 'silence').map(g => ({ ...g, intervention: i.name }))).map((gene, i) => (
                  <div key={i} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-700/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-title">{gene.gene}</span>
                      <Badge color="red" size="xs">{gene.variant}</Badge>
                    </div>
                    <p className="text-xs text-muted">{gene.currentStatus}</p>
                    <p className="text-xs text-orange-600 mt-1">Via: {gene.intervention}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Genes to Activate */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="font-semibold text-green-700 dark:text-green-400 text-sm">Genes to Activate</p>
              </div>
              <div className="space-y-2">
                {INTERVENTIONS.flatMap(i => i.targetGenes.filter(g => g.action === 'activate').map(g => ({ ...g, intervention: i.name }))).map((gene, i) => (
                  <div key={i} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-700/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-title">{gene.gene}</span>
                      <Badge color="green" size="xs">{gene.variant}</Badge>
                    </div>
                    <p className="text-xs text-muted">{gene.currentStatus}</p>
                    <p className="text-xs text-orange-600 mt-1">Via: {gene.intervention}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Weekly Schedule View */}
      {selectedView === 'weekly' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-600" />
            <Title className="text-indigo-700 dark:text-indigo-400">Weekly Epigenetic Schedule</Title>
          </div>
          <Text className="mb-4 text-muted">
            Your optimized weekly schedule integrating all interventions for maximum epigenetic impact.
          </Text>

          <div className="space-y-4">
            {WEEKLY_PLAN.map(day => (
              <div key={day.day} className="p-4 bg-surface-soft rounded-xl border border-border">
                <p className="font-semibold text-title mb-3">{day.day}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Morning */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Morning</p>
                    </div>
                    <ul className="space-y-1">
                      {day.morning.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-body">
                          <span className="w-1 h-1 bg-amber-500 rounded-full flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Afternoon */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Afternoon</p>
                    </div>
                    <ul className="space-y-1">
                      {day.afternoon.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-body">
                          <span className="w-1 h-1 bg-blue-500 rounded-full flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evening */}
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-4 h-4 text-indigo-600" />
                      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Evening</p>
                    </div>
                    <ul className="space-y-1">
                      {day.evening.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-body">
                          <span className="w-1 h-1 bg-indigo-500 rounded-full flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Coach View */}
      {selectedView === 'aicoach' && (
        <>
          {/* Connector Selection */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Link className="w-5 h-5 text-purple-600" />
              <Title className="text-purple-700 dark:text-purple-400">AI Coach Connector</Title>
            </div>
            <Text className="mb-4 text-muted">
              Connect your preferred AI assistant to get personalized epigenetic coaching based on your genotype. Your genomic data stays local — only intervention questions are sent to the AI.
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AI_CONNECTORS.map(connector => (
                <div
                  key={connector.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedConnector === connector.id
                      ? 'border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-border bg-surface-soft hover:bg-purple-50 dark:hover:bg-purple-900/10'
                  } ${connector.status === 'coming_soon' ? 'opacity-60' : ''}`}
                  onClick={() => connector.status === 'available' && setSelectedConnector(connector.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{connector.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-title text-sm">{connector.name}</p>
                        {connector.status === 'coming_soon' && (
                          <Badge color="gray" size="xs">Coming Soon</Badge>
                        )}
                        {selectedConnector === connector.id && connector.status === 'available' && (
                          <Badge color="purple" size="xs">Selected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted">{connector.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Chat Interface */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-orange-600" />
              <Title className="text-orange-700 dark:text-orange-400">Ask Your Epigenetic Coach</Title>
            </div>

            {/* Chat History */}
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {chatHistory.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                  <p className="text-sm text-muted">Ask your AI coach about your epigenetic interventions.</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-3">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setCoachMessage('Why is L-methylfolate important for my MTHFR variant?')
                        handleSendMessage()
                      }}
                    >
                      Why L-methylfolate for MTHFR?
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setCoachMessage('How does HIIT affect my BDNF gene expression?')
                        handleSendMessage()
                      }}
                    >
                      HIIT and BDNF expression?
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setCoachMessage('What foods best silence my TNF-alpha variant?')
                        handleSendMessage()
                      }}
                    >
                      Foods for TNF-alpha silencing?
                    </Button>
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-surface-soft border border-border text-body'
                  }`}>
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Bot className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-semibold text-orange-600">
                          {AI_CONNECTORS.find(c => c.id === selectedConnector)?.name}
                        </span>
                      </div>
                    )}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="p-3 bg-surface-soft rounded-xl border border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                aria-label="Coach message input"
                type="text"
                value={coachMessage}
                onChange={(e) => setCoachMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about your epigenetic interventions..."
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-surface-soft text-body text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <Button
                size="xs"
                onClick={handleSendMessage}
                disabled={isAiThinking || !coachMessage.trim()}
                icon={MessageCircle}
              >
                Send
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Disclaimer */}
      <Card className="border-orange-200 dark:border-orange-700/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-title mb-1">Epigenetic Coaching Disclaimer</p>
            <p className="text-sm text-muted">
              This epigenetic coaching tool provides educational information based on published research on gene-environment interactions.
              Epigenetic modifications are influenced by many factors and individual responses vary. Supplement recommendations should be
              discussed with your healthcare provider, especially if you take medications. The AI coach provides informational responses
              only and does not constitute medical advice. Always consult qualified health professionals before making changes to your
              health regimen.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
