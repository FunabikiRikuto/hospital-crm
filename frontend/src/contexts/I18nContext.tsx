'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

type Language = 'ja' | 'en' | 'zh'

interface I18nContextType {
  locale: Language
  setLocale: (locale: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const translations: Record<Language, Record<string, string>> = {
  ja: {
    cases: '案件管理',
    newCase: '新規案件登録',
    dashboard: 'ダッシュボード',
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    messages: {
      caseNotFound: '案件が見つかりません',
      statusUpdated: 'ステータスを{status}に更新しました',
      confirmStartReview: '審査を開始しますか？',
      confirmApprove: 'この案件を承認しますか？',
      enterRejectionReason: '拒否理由を入力してください',
      enterRequiredDocuments: '必要な追加資料を入力してください'
    }
  },
  en: {
    cases: 'Case Management',
    newCase: 'New Case',
    dashboard: 'Dashboard',
    loading: 'Loading...',
    error: 'An error occurred',
    messages: {
      caseNotFound: 'Case not found',
      statusUpdated: 'Status updated to {status}',
      confirmStartReview: 'Start review?',
      confirmApprove: 'Approve this case?',
      enterRejectionReason: 'Please enter rejection reason',
      enterRequiredDocuments: 'Please enter required documents'
    }
  },
  zh: {
    cases: '案件管理',
    newCase: '新建案件',
    dashboard: '仪表板',
    loading: '加载中...',
    error: '发生错误',
    messages: {
      caseNotFound: '未找到案件',
      statusUpdated: '状态已更新为{status}',
      confirmStartReview: '开始审查？',
      confirmApprove: '批准此案件？',
      enterRejectionReason: '请输入拒绝理由',
      enterRequiredDocuments: '请输入所需文件'
    }
  }
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Language>('ja')

  const t = useCallback((key: string, params?: Record<string, string>) => {
    const keys = key.split('.')
    let translation: any = translations[locale]
    
    for (const k of keys) {
      translation = translation?.[k]
    }
    
    if (typeof translation !== 'string') {
      return key
    }
    
    if (params) {
      return Object.entries(params).reduce((str, [key, value]) => {
        return str.replace(`{${key}}`, value)
      }, translation)
    }
    
    return translation
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}