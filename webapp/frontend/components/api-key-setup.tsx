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
      <Card className="bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <Title className="text-green-800">{t('configured')}</Title>
              <Text className="text-green-700">{t('configuredDesc')}</Text>
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
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Key className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <Title>{t('title')}</Title>
          <Text className="mt-1">{t('description')}</Text>

          {/* Steps Card */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">{t('howToGet')}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-sm text-gray-700">
                  {t('step1')}{' '}
                  <a
                    href="https://deepmind.google.com/science/alphagenome"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    deepmind.google.com/science/alphagenome
                  </a>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span className="text-sm text-gray-700">{t('step2')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-sm text-gray-700">{t('step3')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span className="text-sm text-gray-700">{t('step4')}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('enterKey')}
            </label>
            <div className="flex space-x-2">
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">{t('privacyTitle')}</span>
            </div>
            <p className="text-sm text-gray-600">{t('privacyDesc')}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
