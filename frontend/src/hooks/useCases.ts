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
import { useNotifications } from '@/hooks/useNotifications'

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
  const { addNotification } = useNotifications()

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
      
      // 新規案件登録通知を作成
      await addNotification({
        userId: 'user-1', // TODO: 実際のユーザーIDを使用
        caseId: newCase.id,
        type: 'new_case',
        title: '新規案件登録',
        message: `新しい案件「${newCase.patientName}」が登録されました`,
        metadata: {
          caseName: newCase.patientName,
          caseStatus: newCase.status
        }
      })
      
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
  const updateCaseStatus = useCallback(async (caseId: string, status: Case['status'], data?: any): Promise<Case> => {
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
      if (typeof data === 'string') {
        // 後方互換性のため、文字列の場合は理由として扱う
        if (status === 'cancelled') {
          updates.rejectionReason = data
        } else if (status === 'information_needed') {
          updates.requirements = data
        }
      } else if (data && typeof data === 'object') {
        // オブジェクトの場合は詳細データを処理
        if ('comment' in data && data.comment) {
          if (status === 'cancelled' || status === 'rejected') {
            updates.rejectionReason = data.comment
          }
        }
        if ('requiredDocuments' in data && data.requiredDocuments) {
          updates.requirements = data.requiredDocuments.join('\n')
        }
        if ('quote' in data && data.quote) {
          (updates as any).quote = data.quote
        }
        // その他のデータもマージ
        Object.keys(data).forEach(key => {
          if (!['comment', 'requiredDocuments', 'quote'].includes(key)) {
            (updates as any)[key] = (data as any)[key]
          }
        })
      }
      
      // ステータス固有の更新
      if (status === 'confirmed' || status === 'accepted') {
        updates.confirmedDate = new Date().toISOString()
      } else if (status === 'completed') {
        updates.confirmedDate = updates.confirmedDate || new Date().toISOString()
      }
      
      const updatedCase = await updateCase(caseId, updates)
      
      // 通知を作成
      if (updatedCase) {
        let notificationTitle = ''
        let notificationMessage = ''
        let notificationType: 'status_change' | 'info_request' | 'appointment_confirmed' = 'status_change'
        
        switch (status) {
          case 'under_review':
            notificationTitle = '審査開始'
            notificationMessage = `案件「${currentCase.patientName}」の審査を開始しました`
            break
          case 'confirmed':
            notificationTitle = '受入承認'
            notificationMessage = `案件「${currentCase.patientName}」が承認されました`
            notificationType = 'appointment_confirmed'
            break
          case 'cancelled':
          case 'rejected':
            notificationTitle = status === 'cancelled' ? '案件キャンセル' : '案件拒否'
            notificationMessage = `案件「${currentCase.patientName}」が${status === 'cancelled' ? 'キャンセル' : '拒否'}されました${updates.rejectionReason ? `（理由: ${updates.rejectionReason}）` : ''}`
            break
          case 'information_needed':
          case 'additional_info_required':
            notificationTitle = '追加情報要求'
            notificationMessage = `案件「${currentCase.patientName}」に追加情報が必要です${updates.requirements ? `（${updates.requirements.split('\n')[0]}...）` : ''}`
            notificationType = 'info_request'
            break
          case 'accepted':
            notificationTitle = '受入承認'
            notificationMessage = `案件「${currentCase.patientName}」が受け入れ承認されました`
            notificationType = 'appointment_confirmed'
            break
          case 'completed':
            notificationTitle = '診療完了'
            notificationMessage = `案件「${currentCase.patientName}」の診療が完了しました`
            break
        }
        
        if (notificationTitle && notificationMessage) {
          await addNotification({
            userId: 'user-1', // TODO: 実際のユーザーIDを使用
            caseId: caseId,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            metadata: {
              caseName: currentCase.patientName,
              caseStatus: status
            }
          })
        }
      }
      
      return updatedCase
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