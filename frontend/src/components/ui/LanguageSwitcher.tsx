'use client'

import { useI18n } from '@/hooks/useI18n'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { locale, changeLocale } = useI18n()

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value as 'ja' | 'zh')}
        className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
      >
        <option value="ja">日本語</option>
        <option value="zh">中文</option>
      </select>
    </div>
  )
}