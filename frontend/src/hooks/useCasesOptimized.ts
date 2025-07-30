'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Case } from '@/types/case'
import { 
  getCasesFromStorage, 
  addCaseToStorage, 
  updateCaseInStorage, 
  deleteCaseFromStorage, 
  getCaseFromStorage,
  initializeStorageWithMockData,
  StorageError,
  ValidationError,
  StorageUtils,
  resetStorageWithMockData
} from '@/lib/storage'

// メモリキャッシュ
let memoryCache: Case[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5000 // 5秒間キャッシュ

export function useCasesOptimized() {
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 初期データの読み込み（キャッシュ利用）
  useEffect(() => {
    const loadCases = () => {
      try {
        setIsLoading(true)
        
        // キャッシュが有効な場合は使用
        const now = Date.now()
        if (memoryCache && (now - cacheTimestamp) < CACHE_DURATION) {
          setCases(memoryCache)
          setIsLoading(false)
          return
        }
        
        // 初回のみ初期化
        if (!memoryCache) {
          initializeStorageWithMockData()
        }
        
        // ストレージから読み込み
        const storedCases = getCasesFromStorage()
        memoryCache = storedCases
        cacheTimestamp = now
        setCases(storedCases)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadCases()
  }, []) // 依存配列を空に

  // キャッシュをクリア
  const clearCache = useCallback(() => {
    memoryCache = null
    cacheTimestamp = 0
  }, [])

  // 新規ケース作成（最適化版）
  const createCase = useCallback(async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Case> => {
    try {
      const newCase = addCaseToStorage(caseData)
      
      // メモリキャッシュを更新
      if (memoryCache) {
        memoryCache = [...memoryCache, newCase]
      }
      
      // ローカルステートを更新
      setCases(prev => [...prev, newCase])
      
      return newCase
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ケースの作成に失敗しました')
    }
  }, [])

  // ケース更新（最適化版）
  const updateCase = useCallback(async (caseId: string, updates: Partial<Case>): Promise<Case> => {
    try {
      const updatedCase = updateCaseInStorage(caseId, updates)
      
      if (!updatedCase) {
        throw new Error('ケースが見つかりません')
      }
      
      // メモリキャッシュを更新
      if (memoryCache) {
        memoryCache = memoryCache.map(c => c.id === caseId ? updatedCase : c)
      }
      
      // ローカルステートを更新
      setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c))
      
      return updatedCase
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'ケースの更新に失敗しました')
    }
  }, [])

  // フィルタリング（メモ化）
  const filterCases = useCallback((
    searchTerm: string = '',
    status: string = '',
    urgency: string = '',
    department: string = ''
  ) => {
    return cases.filter(caseItem => {
      const matchesSearch = searchTerm === '' || 
        caseItem.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.treatmentType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = status === '' || caseItem.status === status
      const matchesUrgency = urgency === '' || caseItem.urgency === urgency
      const matchesDepartment = department === '' || caseItem.department === department

      return matchesSearch && matchesStatus && matchesUrgency && matchesDepartment
    })
  }, [cases])

  // 統計情報（メモ化）
  const stats = useMemo(() => {
    const total = cases.length
    const byStatus = cases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const completedCases = cases.filter(c => c.status === 'completed')
    const monthlyRevenue = completedCases
      .filter(c => {
        const date = new Date(c.updatedAt || c.createdAt || '')
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      })
      .reduce((sum, c) => sum + (c.confirmedAmount || c.estimatedAmount), 0)
    
    return {
      total,
      byStatus: {
        new: byStatus.new || 0,
        pending: byStatus.pending || 0,
        information_needed: byStatus.information_needed || 0,
        additional_info_required: byStatus.additional_info_required || 0,
        under_review: byStatus.under_review || 0,
        reviewing: byStatus.reviewing || 0,
        accepted: byStatus.accepted || 0,
        rejected: byStatus.rejected || 0,
        scheduled: byStatus.scheduled || 0,
        confirmed: byStatus.confirmed || 0,
        completed: byStatus.completed || 0,
        cancelled: byStatus.cancelled || 0
      },
      monthlyRevenue,
      completionRate: total > 0 ? (completedCases.length / total) * 100 : 0,
      averageAmount: total > 0 ? cases.reduce((sum, c) => sum + c.estimatedAmount, 0) / total : 0
    }
  }, [cases])

  return {
    cases,
    isLoading,
    error,
    stats,
    createCase,
    updateCase,
    filterCases,
    clearCache,
    refreshCases: () => {
      clearCache()
      window.location.reload()
    }
  }
}