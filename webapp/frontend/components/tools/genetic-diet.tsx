'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge, Select, SelectItem } from '@tremor/react'
import {
  Utensils,
  AlertTriangle,
  Leaf,
  Apple,
  Coffee,
  Milk,
  Wheat,
  Fish,
  Beef,
  Carrot,
  ChefHat,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

// Types
interface GeneticTrait {
  id: string
  name: string
  nameEs: string
  gene: string
  variant: string
  status: 'good' | 'alert' | 'neutral'
  impact: string
  impactEs: string
  icon: typeof Coffee
}

interface FoodRecommendation {
  id: string
  name: string
  nameEs: string
  category: 'superfood' | 'moderate' | 'avoid'
  reason: string
  reasonEs: string
  icon: typeof Apple
  relatedGene: string
}

interface CuisineRecommendation {
  cuisine: string
  cuisineEs: string
  recommend: string[]
  recommendEs: string[]
  avoid: string[]
  avoidEs: string[]
}

// Demo genetic traits
const GENETIC_TRAITS: GeneticTrait[] = [
  {
    id: 'lactose',
    name: 'Lactose Tolerance',
    nameEs: 'Tolerancia a la Lactosa',
    gene: 'LCT',
    variant: 'rs4988235 (CT)',
    status: 'good',
    impact: 'You can digest dairy products normally. No need to avoid lactose.',
    impactEs: 'Puedes digerir productos lacteos normalmente. No necesitas evitar la lactosa.',
    icon: Milk,
  },
  {
    id: 'caffeine',
    name: 'Caffeine Metabolism',
    nameEs: 'Metabolismo de Cafeina',
    gene: 'CYP1A2',
    variant: 'rs762551 (AC)',
    status: 'alert',
    impact: 'Slow caffeine metabolizer. Limit to 1-2 cups of coffee per day, avoid after 2pm.',
    impactEs: 'Metabolizador lento de cafeina. Limita a 1-2 tazas de cafe por dia, evita despues de las 2pm.',
    icon: Coffee,
  },
  {
    id: 'gluten',
    name: 'Gluten Sensitivity',
    nameEs: 'Sensibilidad al Gluten',
    gene: 'HLA-DQ',
    variant: 'DQ2.5 negative',
    status: 'good',
    impact: 'Low risk for celiac disease. Gluten is safe for you.',
    impactEs: 'Bajo riesgo de enfermedad celiaca. El gluten es seguro para ti.',
    icon: Wheat,
  },
  {
    id: 'alcohol',
    name: 'Alcohol Metabolism',
    nameEs: 'Metabolismo de Alcohol',
    gene: 'ADH1B',
    variant: 'rs1229984 (AG)',
    status: 'alert',
    impact: 'Fast alcohol metabolizer but slow acetaldehyde clearance. You may experience flushing.',
    impactEs: 'Metabolizador rapido de alcohol pero eliminacion lenta de acetaldehido. Puedes experimentar rubor.',
    icon: Utensils,
  },
  {
    id: 'omega3',
    name: 'Omega-3 Conversion',
    nameEs: 'Conversion de Omega-3',
    gene: 'FADS1',
    variant: 'rs174546 (TT)',
    status: 'neutral',
    impact: 'Reduced conversion of plant omega-3 to EPA/DHA. Consider fish or algae sources.',
    impactEs: 'Conversion reducida de omega-3 vegetal a EPA/DHA. Considera fuentes de pescado o algas.',
    icon: Fish,
  },
  {
    id: 'saturatedfat',
    name: 'Saturated Fat Response',
    nameEs: 'Respuesta a Grasa Saturada',
    gene: 'APOA2',
    variant: 'rs5082 (CC)',
    status: 'alert',
    impact: 'Higher risk of weight gain from saturated fat. Limit red meat and butter.',
    impactEs: 'Mayor riesgo de aumento de peso por grasa saturada. Limita carne roja y mantequilla.',
    icon: Beef,
  },
]

// Food recommendations based on genetic traits
const FOOD_RECOMMENDATIONS: FoodRecommendation[] = [
  // Superfoods
  {
    id: 'salmon',
    name: 'Wild Salmon',
    nameEs: 'Salmon Salvaje',
    category: 'superfood',
    reason: 'Direct source of EPA/DHA, bypassing your FADS1 limitation',
    reasonEs: 'Fuente directa de EPA/DHA, evitando tu limitacion FADS1',
    icon: Fish,
    relatedGene: 'FADS1',
  },
  {
    id: 'spinach',
    name: 'Spinach',
    nameEs: 'Espinacas',
    category: 'superfood',
    reason: 'High in folate, supports your MTHFR function',
    reasonEs: 'Alto en folato, apoya tu funcion MTHFR',
    icon: Leaf,
    relatedGene: 'MTHFR',
  },
  {
    id: 'blueberries',
    name: 'Blueberries',
    nameEs: 'Arandanos',
    category: 'superfood',
    reason: 'Antioxidants support your longevity genes',
    reasonEs: 'Los antioxidantes apoyan tus genes de longevidad',
    icon: Apple,
    relatedGene: 'FOXO3',
  },
  {
    id: 'olive',
    name: 'Extra Virgin Olive Oil',
    nameEs: 'Aceite de Oliva Extra Virgen',
    category: 'superfood',
    reason: 'Healthy fats without saturated fat concerns',
    reasonEs: 'Grasas saludables sin preocupaciones de grasa saturada',
    icon: Leaf,
    relatedGene: 'APOA2',
  },
  {
    id: 'greentea',
    name: 'Green Tea',
    nameEs: 'Te Verde',
    category: 'superfood',
    reason: 'Lower caffeine, high in L-theanine for calm focus',
    reasonEs: 'Menor cafeina, alto en L-teanina para enfoque tranquilo',
    icon: Leaf,
    relatedGene: 'CYP1A2',
  },
  // Moderate
  {
    id: 'coffee',
    name: 'Coffee',
    nameEs: 'Cafe',
    category: 'moderate',
    reason: 'Limit to 1-2 cups before 2pm due to slow metabolism',
    reasonEs: 'Limita a 1-2 tazas antes de las 2pm por metabolismo lento',
    icon: Coffee,
    relatedGene: 'CYP1A2',
  },
  {
    id: 'redmeat',
    name: 'Red Meat',
    nameEs: 'Carne Roja',
    category: 'moderate',
    reason: 'High in saturated fat - limit to 1-2 times per week',
    reasonEs: 'Alta en grasa saturada - limita a 1-2 veces por semana',
    icon: Beef,
    relatedGene: 'APOA2',
  },
  {
    id: 'butter',
    name: 'Butter',
    nameEs: 'Mantequilla',
    category: 'moderate',
    reason: 'Replace with olive oil when possible',
    reasonEs: 'Reemplaza con aceite de oliva cuando sea posible',
    icon: Utensils,
    relatedGene: 'APOA2',
  },
  // Avoid
  {
    id: 'alcohol',
    name: 'Alcohol',
    nameEs: 'Alcohol',
    category: 'avoid',
    reason: 'Your genetics suggest poor acetaldehyde clearance',
    reasonEs: 'Tu genetica sugiere eliminacion pobre de acetaldehido',
    icon: Utensils,
    relatedGene: 'ADH1B',
  },
]

// Restaurant mode recommendations
const CUISINE_RECOMMENDATIONS: Record<string, CuisineRecommendation> = {
  mexican: {
    cuisine: 'Mexican',
    cuisineEs: 'Mexicana',
    recommend: ['Fish tacos', 'Ceviche', 'Guacamole', 'Grilled chicken fajitas', 'Bean soup'],
    recommendEs: ['Tacos de pescado', 'Ceviche', 'Guacamole', 'Fajitas de pollo a la parrilla', 'Sopa de frijoles'],
    avoid: ['Carnitas', 'Chicharron', 'Margaritas', 'Chorizo'],
    avoidEs: ['Carnitas', 'Chicharron', 'Margaritas', 'Chorizo'],
  },
  italian: {
    cuisine: 'Italian',
    cuisineEs: 'Italiana',
    recommend: ['Grilled fish', 'Caprese salad', 'Minestrone soup', 'Pasta with olive oil', 'Bruschetta'],
    recommendEs: ['Pescado a la parrilla', 'Ensalada Caprese', 'Sopa minestrone', 'Pasta con aceite de oliva', 'Bruschetta'],
    avoid: ['Carbonara', 'Lasagna', 'Tiramisu', 'Creamy sauces'],
    avoidEs: ['Carbonara', 'Lasana', 'Tiramisu', 'Salsas cremosas'],
  },
  japanese: {
    cuisine: 'Japanese',
    cuisineEs: 'Japonesa',
    recommend: ['Sashimi', 'Edamame', 'Miso soup', 'Green tea', 'Seaweed salad'],
    recommendEs: ['Sashimi', 'Edamame', 'Sopa de miso', 'Te verde', 'Ensalada de algas'],
    avoid: ['Sake', 'Tempura', 'Tonkatsu', 'Heavy ramen'],
    avoidEs: ['Sake', 'Tempura', 'Tonkatsu', 'Ramen pesado'],
  },
  american: {
    cuisine: 'American',
    cuisineEs: 'Americana',
    recommend: ['Grilled salmon', 'Turkey burger', 'Mixed greens salad', 'Steamed vegetables', 'Fruit bowl'],
    recommendEs: ['Salmon a la parrilla', 'Hamburguesa de pavo', 'Ensalada mixta', 'Vegetales al vapor', 'Plato de frutas'],
    avoid: ['Bacon cheeseburger', 'Buffalo wings', 'Beer', 'Milkshakes'],
    avoidEs: ['Hamburguesa con tocino', 'Alitas buffalo', 'Cerveza', 'Malteadas'],
  },
  mediterranean: {
    cuisine: 'Mediterranean',
    cuisineEs: 'Mediterranea',
    recommend: ['Grilled fish', 'Hummus', 'Tabbouleh', 'Greek salad', 'Falafel'],
    recommendEs: ['Pescado a la parrilla', 'Hummus', 'Tabule', 'Ensalada griega', 'Falafel'],
    avoid: ['Lamb kebab', 'Baklava', 'Wine', 'Cheese platters'],
    avoidEs: ['Kebab de cordero', 'Baklava', 'Vino', 'Tablas de quesos'],
  },
}

// Macro distribution data for ideal plate
const IDEAL_PLATE = {
  protein: 30,
  carbs: 40,
  fat: 25,
  fiber: 5,
}

export function GeneticDiet() {
  const t = useTranslations('tools.diet')
  const [loading, setLoading] = useState(true)
  const [selectedCuisine, setSelectedCuisine] = useState<string>('')
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const toggleAlert = (id: string) => {
    setExpandedAlerts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const alerts = GENETIC_TRAITS.filter(t => t.status === 'alert')
  const superfoods = FOOD_RECOMMENDATIONS.filter(f => f.category === 'superfood')
  const moderate = FOOD_RECOMMENDATIONS.filter(f => f.category === 'moderate')
  const avoidFoods = FOOD_RECOMMENDATIONS.filter(f => f.category === 'avoid')

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full animate-spin opacity-20"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <Utensils className="w-8 h-8 text-green-600 animate-pulse" />
            </div>
          </div>
          <Title>Analyzing your nutritional genetics...</Title>
          <Text className="mt-2">Building personalized dietary recommendations</Text>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <Utensils className="w-7 h-7 text-white" />
          </div>
          <div>
            <Title>{t('title')}</Title>
            <Text>{t('description')}</Text>
          </div>
        </div>
      </Card>

      {/* Ideal Plate Visualization */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-green-600" />
          <Title className="text-green-700">{t('idealPlate')}</Title>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Pie Chart */}
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Protein - 30% */}
              <circle
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="20"
                strokeDasharray={`${IDEAL_PLATE.protein * 2.51} 251`}
                strokeDashoffset="0"
              />
              {/* Carbs - 40% */}
              <circle
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeDasharray={`${IDEAL_PLATE.carbs * 2.51} 251`}
                strokeDashoffset={`${-IDEAL_PLATE.protein * 2.51}`}
              />
              {/* Fat - 25% */}
              <circle
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray={`${IDEAL_PLATE.fat * 2.51} 251`}
                strokeDashoffset={`${-(IDEAL_PLATE.protein + IDEAL_PLATE.carbs) * 2.51}`}
              />
              {/* Fiber - 5% */}
              <circle
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke="#22c55e"
                strokeWidth="20"
                strokeDasharray={`${IDEAL_PLATE.fiber * 2.51} 251`}
                strokeDashoffset={`${-(IDEAL_PLATE.protein + IDEAL_PLATE.carbs + IDEAL_PLATE.fat) * 2.51}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Utensils className="w-8 h-8 text-gray-400 mx-auto" />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <div>
                <p className="font-medium text-gray-700">Protein</p>
                <p className="text-sm text-gray-500">{IDEAL_PLATE.protein}% - Fish, poultry, legumes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <div>
                <p className="font-medium text-gray-700">Complex Carbs</p>
                <p className="text-sm text-gray-500">{IDEAL_PLATE.carbs}% - Whole grains, vegetables</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <div>
                <p className="font-medium text-gray-700">Healthy Fats</p>
                <p className="text-sm text-gray-500">{IDEAL_PLATE.fat}% - Olive oil, nuts, avocado</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <div>
                <p className="font-medium text-gray-700">Fiber</p>
                <p className="text-sm text-gray-500">{IDEAL_PLATE.fiber}% - Leafy greens, berries</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Genetic Alerts */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <Title className="text-amber-700">{t('alerts')}</Title>
        </div>

        <div className="space-y-3">
          {alerts.map(trait => {
            const Icon = trait.icon
            const isExpanded = expandedAlerts.has(trait.id)

            return (
              <div
                key={trait.id}
                className="p-4 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => toggleAlert(trait.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{trait.name}</p>
                      <p className="text-xs text-gray-500">{trait.gene} - {trait.variant}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-amber-200">
                    <p className="text-sm text-gray-600">{trait.impact}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Superfoods For You */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-green-600" />
          <Title className="text-green-700">{t('superfoods')}</Title>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {superfoods.map(food => {
            const Icon = food.icon
            return (
              <div
                key={food.id}
                className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{food.name}</p>
                  <p className="text-xs text-gray-500">{food.reason}</p>
                  <Badge color="green" size="xs" className="mt-1">{food.relatedGene}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Foods to Moderate */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <Title className="text-blue-700">{t('moderate')}</Title>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {moderate.map(food => {
            const Icon = food.icon
            return (
              <div
                key={food.id}
                className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{food.name}</p>
                  <p className="text-xs text-gray-500">{food.reason}</p>
                  <Badge color="blue" size="xs" className="mt-1">{food.relatedGene}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Restaurant Mode */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="w-5 h-5 text-purple-600" />
          <Title className="text-purple-700">{t('restaurantMode')}</Title>
        </div>

        <div className="mb-4">
          <Text className="mb-2">{t('cuisineType')}</Text>
          <Select
            value={selectedCuisine}
            onValueChange={setSelectedCuisine}
            placeholder="Select cuisine type..."
          >
            {Object.keys(CUISINE_RECOMMENDATIONS).map(key => (
              <SelectItem key={key} value={key}>
                {CUISINE_RECOMMENDATIONS[key].cuisine}
              </SelectItem>
            ))}
          </Select>
        </div>

        {selectedCuisine && CUISINE_RECOMMENDATIONS[selectedCuisine] && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recommend */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-700">{t('recommend')}</p>
              </div>
              <ul className="space-y-2">
                {CUISINE_RECOMMENDATIONS[selectedCuisine].recommend.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Avoid */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-red-700">{t('avoid')}</p>
              </div>
              <ul className="space-y-2">
                {CUISINE_RECOMMENDATIONS[selectedCuisine].avoid.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
