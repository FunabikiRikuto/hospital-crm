'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { CreateCaseSchema, validateStatusTransition } from '@/schemas/case'

// Enhanced error type
interface CaseError {
  message: string
  code?: string
  field?: string
  type: 'validation' | 'storage' | 'business' | 'network'
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<CaseError | null>(null)
  const [storageInfo, setStorageInfo] = useState({
    totalCases: 0,
    storageSize: 0,
    maxSize: 0,
    usagePercent: 0
  })

  // Enhanced error handling function
  const handleError = useCallback((err: unknown, defaultMessage: string, type: CaseError['type'] = 'storage'): CaseError => {
    let errorInfo: CaseError

    if (err instanceof ValidationError) {
      errorInfo = {
        message: err.message,
        field: err.field,
        type: 'validation'
      }
    } else if (err instanceof StorageError) {
      errorInfo = {
        message: err.message,
        code: err.code,
        type: 'storage'
      }
    } else if (err instanceof Error) {
      errorInfo = {
        message: err.message,
        type
      }
    } else {
      errorInfo = {
        message: defaultMessage,
        type
      }
    }

    setError(errorInfo)
    return errorInfo
  }, [])

  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Update storage info
  const updateStorageInfo = useCallback(() => {
    try {
      const info = StorageUtils.getStorageInfo()
      setStorageInfo(info)
    } catch (err) {
      console.warn('Failed to get storage info:', err)
    }
  }, [])

  // 初期データの読み込み
  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 初期データをセットアップ（初回のみ）
      initializeStorageWithMockData()
      
      // ケースを読み込み
      const storedCases = getCasesFromStorage()
      setCases(storedCases)
      
      updateStorageInfo()
    } catch (err) {
      handleError(err, 'ケースの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [handleError, updateStorageInfo])

  // 新規ケース作成
  const createCase = useCallback(async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Case> => {
    try {
      setError(null)
      
      // Validate input data using schema
      const validatedData = CreateCaseSchema.parse(caseData)
      
      const newCase = addCaseToStorage(validatedData)
      setCases(prev => [...prev, newCase])
      updateStorageInfo()
      
      return newCase
    } catch (err) {
      const errorInfo = handleError(err, 'ケースの作成に失敗しました', 'validation')
      throw new Error(errorInfo.message)
    }
  }, [handleError, updateStorageInfo])

  // ケース更新
  const updateCase = useCallback(async (caseId: string, updates: Partial<Case>): Promise<Case> => {
    try {
      setError(null)
      
      const updatedCase = updateCaseInStorage(caseId, updates)
      
      if (!updatedCase) {
        throw new Error('ケースが見つかりません')
      }
      
      setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c))
      updateStorageInfo()
      
      return updatedCase
    } catch (err) {
      const errorInfo = handleError(err, 'ケースの更新に失敗しました', 'business')
      throw new Error(errorInfo.message)
    }
  }, [handleError, updateStorageInfo])

  // ケース削除
  const deleteCase = useCallback(async (caseId: string): Promise<void> => {
    try {
      setError(null)
      
      const success = deleteCaseFromStorage(caseId)
      
      if (!success) {
        throw new Error('ケースが見つかりません')
      }
      
      setCases(prev => prev.filter(c => c.id !== caseId))
      updateStorageInfo()
    } catch (err) {
      const errorInfo = handleError(err, 'ケースの削除に失敗しました', 'business')
      throw new Error(errorInfo.message)
    }
  }, [handleError, updateStorageInfo])

  // 単一ケース取得
  const getCase = useCallback((caseId: string): Case | undefined => {
    return cases.find(c => c.id === caseId)
  }, [cases])

  // ケースステータス更新（ワークフロー用）
  const updateCaseStatus = useCallback(async (caseId: string, status: Case['status'], reason?: string): Promise<Case> => {
    try {
      setError(null)
      
      // Find current case to validate transition
      const currentCase = cases.find(c => c.id === caseId)
      if (!currentCase) {
        throw new Error('ケースが見つかりません')
      }
      
      // Validate status transition
      if (!validateStatusTransition(currentCase.status, status)) {
        throw new ValidationError(`${currentCase.status} から ${status} への変更は許可されていません`)
      }
      
      const updates: Partial<Case> = { status }
      
      // ステータスに応じて追加フィールドを更新
      if (status === 'cancelled' && reason) {
        updates.rejectionReason = reason
      } else if (status === 'information_needed' && reason) {
        updates.requirements = reason
      } else if (status === 'confirmed') {
        updates.confirmedDate = new Date().toISOString()
      } else if (status === 'completed') {
        updates.confirmedDate = updates.confirmedDate || new Date().toISOString()
      }
      
      return await updateCase(caseId, updates)
    } catch (err) {
      const errorInfo = handleError(err, 'ステータスの更新に失敗しました', 'business')
      throw new Error(errorInfo.message)
    }
  }, [cases, updateCase, handleError])

  // データ再読み込み
  const refreshCases = useCallback(() => {
    try {
      setError(null)
      const storedCases = getCasesFromStorage()
      setCases(storedCases)
      updateStorageInfo()
    } catch (err) {
      handleError(err, 'ケースの再読み込みに失敗しました')
    }
  }, [handleError, updateStorageInfo])

  // ストレージクリーンアップ
  const cleanupStorage = useCallback(async (): Promise<number> => {
    try {
      setError(null)
      const cleanedCount = StorageUtils.cleanup()
      if (cleanedCount > 0) {
        refreshCases()
      }
      return cleanedCount
    } catch (err) {
      handleError(err, 'ストレージのクリーンアップに失敗しました')
      return 0
    }
  }, [handleError, refreshCases])

  // ストレージリセット（モックデータ再読み込み）
  const resetStorage = useCallback(() => {
    try {
      setError(null)
      resetStorageWithMockData()
    } catch (err) {
      handleError(err, 'ストレージのリセットに失敗しました')
    }
  }, [handleError])

  return {
    // Data
    cases,
    isLoading,
    error,
    storageInfo,
    
    // Actions
    createCase,
    updateCase,
    deleteCase,
    getCase,
    updateCaseStatus,
    refreshCases,
    cleanupStorage,
    resetStorage,
    clearError,
    
    // Utilities
    canTransitionTo: useCallback((currentStatus: Case['status'], newStatus: Case['status']) => {
      return validateStatusTransition(currentStatus, newStatus)
    }, [])
  }
}

export function useCase(caseId: string) {
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCase = () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const storedCase = getCaseFromStorage(caseId)
        if (!storedCase) {
          throw new Error('ケースが見つかりません')
        }
        
        setCaseData(storedCase)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ケースの読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (caseId) {
      loadCase()
    }
  }, [caseId])

  return {
    caseData,
    isLoading,
    error,
    refreshCase: () => {
      const storedCase = getCaseFromStorage(caseId)
      setCaseData(storedCase)
    }
  }
}