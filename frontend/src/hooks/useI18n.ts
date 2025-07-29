'use client'

import { useState, useEffect } from 'react'
import { ja } from '@/locales/ja'
import { zh } from '@/locales/zh'

type Locale = 'ja' | 'zh'
type Messages = typeof ja

const messages: Record<Locale, Messages> = {
  ja,
  zh,
}

export function useI18n() {
  const [locale, setLocale] = useState<Locale>('ja')

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && messages[savedLocale]) {
      setLocale(savedLocale)
    }
  }, [])

  // Save locale to localStorage when changed
  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = messages[locale]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found for locale "${locale}"`)
      return key
    }
    
    // Replace parameters if provided
    if (params) {
      return Object.entries(params).reduce((text, [paramKey, paramValue]) => {
        return text.replace(`{${paramKey}}`, String(paramValue))
      }, value)
    }
    
    return value
  }

  return {
    locale,
    changeLocale,
    t,
    isJapanese: locale === 'ja',
    isChinese: locale === 'zh',
  }
}