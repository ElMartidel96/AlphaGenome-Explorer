'use client'

import { useState } from 'react'
import { Card, Title, Text, TextInput, Button } from '@tremor/react'
import {
  Clock,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Users,
  Sparkles,
  Loader2,
  Heart,
  Code,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

interface FeatureRequestPlaceholderProps {
  featureId: string
  featureName: string
  featureDescription: string
  featureIcon: React.ReactNode
  estimatedPhase?: string
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export function FeatureRequestPlaceholder({
  featureId,
  featureName,
  featureDescription,
  featureIcon,
  estimatedPhase = 'Fase 2',
  color = 'blue',
}: FeatureRequestPlaceholderProps) {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [showCommunity, setShowCommunity] = useState(false)

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail(email)) {
      toast.error('Por favor ingresa un email valido')
      return
    }

    setSubmitState('submitting')

    try {
      // API call to register interest
      const response = await fetch('/api/feature-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureId,
          featureName,
          email,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Request failed')

      setSubmitState('success')
      toast.success('Te notificaremos cuando este lista!')
      setEmail('')
    } catch (error) {
      setSubmitState('error')
      toast.error('Error al enviar. Intenta de nuevo.')
      // Auto-reset error state after 3 seconds
      setTimeout(() => setSubmitState('idle'), 3000)
    }
  }

  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800',
    purple: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800',
    green: 'from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-success',
    orange: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800',
    pink: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200 dark:border-pink-800',
  }

  const iconColorClasses = {
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    green: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    orange: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
    pink: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
  }

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border-2 border-dashed`}>
      <div className="text-center py-6">
        {/* Icon */}
        <div className={`w-16 h-16 ${iconColorClasses[color]} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          {featureIcon}
        </div>

        {/* Title & Description */}
        <Title className="text-title">{featureName}</Title>
        <Text className="mt-2 max-w-md mx-auto text-body">
          {featureDescription}
        </Text>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
            En desarrollo - {estimatedPhase}
          </span>
        </div>

        {/* Message */}
        <div className="mt-6 p-4 bg-white/70 dark:bg-slate-800/70 rounded-xl max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm text-body">
                <strong>Somos un equipo pequeno con grandes suenos.</strong> Esta funcionalidad
                esta en nuestra lista, pero aun no hemos podido priorizarla.
              </p>
              <p className="text-sm text-body mt-2">
                Si la necesitas, dejanos tu email y la <strong>priorizaremos para ti</strong>.
                Recibiras un correo cuando este lista.
              </p>
            </div>
          </div>
        </div>

        {/* Email Form */}
        {submitState !== 'success' ? (
          <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto">
            <div className="flex gap-2">
              <TextInput
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitState === 'submitting'}
                icon={Mail}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!email.trim() || submitState === 'submitting'}
                icon={submitState === 'submitting' ? Loader2 : Send}
                loading={submitState === 'submitting'}
              >
                {submitState === 'submitting' ? 'Enviando...' : 'Solicitar'}
              </Button>
            </div>
            {submitState === 'error' && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Error al enviar. Por favor intenta de nuevo.</span>
              </div>
            )}
          </form>
        ) : (
          <div className="mt-6 p-4 bg-success-soft border border-success rounded-xl max-w-md mx-auto">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
              <CheckCircle className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium">Solicitud registrada!</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Te enviaremos un email cuando esta funcionalidad este lista.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Community Invitation (collapsible) */}
        <div className="mt-6 pt-6 border-t border-adaptive/50">
          <button
            onClick={() => setShowCommunity(!showCommunity)}
            className="text-sm text-muted hover:text-body flex items-center gap-2 mx-auto transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Quieres ayudar a construir esto?</span>
            <Sparkles className="w-4 h-4" />
          </button>

          {showCommunity && (
            <div className="mt-4 p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl max-w-lg mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <Code className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-title">
                    Unete a nuestra comunidad de desarrollo
                  </p>
                  <p className="text-xs text-body mt-1">
                    No necesitas saber programar. Con las herramientas que te ensenamos
                    en un par de horas y nuestros sistemas de trabajo, podras contribuir
                    a hacer realidad funcionalidades como esta.
                  </p>
                  <a
                    href="https://discord.gg/alphagenome-community"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <span>Unirme a la comunidad</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Shorthand components for common features
export function ComingSoonFeature({
  id,
  name,
  description,
  icon,
  phase,
  color,
}: {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  phase?: string
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
}) {
  return (
    <FeatureRequestPlaceholder
      featureId={id}
      featureName={name}
      featureDescription={description}
      featureIcon={icon}
      estimatedPhase={phase}
      color={color}
    />
  )
}
