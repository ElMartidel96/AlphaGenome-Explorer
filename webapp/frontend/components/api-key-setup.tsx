'use client'

import { useState } from 'react'
import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
} from '@tremor/react'
import { Key, ExternalLink, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useApiKeyStore } from '@/lib/store'
import toast from 'react-hot-toast'

export function ApiKeySetup() {
  const t = useTranslations('apiKey')
  const { setApiKey, isConfigured, clearApiKey } = useApiKeyStore()
  const [inputKey, setInputKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const handleSaveKey = () => {
    if (inputKey.trim().length < 10) {
      toast.error(t('invalidKey'))
      return
    }
    setApiKey(inputKey.trim())
    toast.success(t('keySaved'))
    setInputKey('')
  }

  const handleClearKey = () => {
    clearApiKey()
    toast.success(t('keyRemoved'))
  }

  if (isConfigured) {
    return (
      <Card className="gradient-success border-success">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <Title className="text-success">{t('configured')}</Title>
              <Text className="text-body">{t('configuredDesc')}</Text>
            </div>
          </div>
          <Button variant="secondary" size="xs" onClick={handleClearKey}>
            {t('changeKey')}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-info-soft rounded-xl flex items-center justify-center flex-shrink-0">
          <Key className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <Title>{t('title')}</Title>
          <Text className="mt-1">{t('description')}</Text>

          {/* Steps Card */}
          <div className="mt-4 p-3 sm:p-4 bg-info-soft border border-info rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-5 h-5 text-info" />
              <span className="font-semibold text-info">{t('howToGet')}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-sm text-body">
                  {t('step1')}{' '}
                  <a
                    href="https://deepmind.google.com/science/alphagenome"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info hover:underline font-medium break-all"
                  >
                    deepmind.google.com/science/alphagenome
                  </a>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span className="text-sm text-body">{t('step2')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-sm text-body">{t('step3')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span className="text-sm text-body">{t('step4')}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-body mb-2">
              {t('enterKey')}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <TextInput
                  type={showKey ? 'text' : 'password'}
                  placeholder={t('placeholder')}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-subtle hover:text-body transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button onClick={handleSaveKey} disabled={!inputKey.trim()}>
                {t('saveKey')}
              </Button>
            </div>
          </div>

          {/* Privacy notice */}
          <div className="mt-4 p-3 sm:p-4 bg-surface-soft border border-adaptive rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-muted" />
              <span className="font-semibold text-body">{t('privacyTitle')}</span>
            </div>
            <p className="text-sm text-muted">{t('privacyDesc')}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
