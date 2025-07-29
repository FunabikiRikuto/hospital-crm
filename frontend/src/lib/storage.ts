import { v4 as uuidv4 } from 'uuid'
import { Case } from '@/types/case'
import { CaseSchema, CreateCaseSchema, validateStatusTransition, sanitizeString } from '@/schemas/case'
import { realisticMockCases } from '@/data/realisticMockCases'

const STORAGE_KEY = 'medical-tourism-cases'
const STORAGE_VERSION_KEY = 'medical-tourism-cases-version'
const STORAGE_VERSION = '1.0.0' // バージョンを変更すると、既存データがリセットされます
const MAX_STORAGE_SIZE = 4 * 1024 * 1024 // 4MB limit for localStorage

// Error classes for better error handling
export class StorageError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'StorageError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Get current user ID (placeholder for real authentication)
function getCurrentUserId(): string {
  // TODO: Replace with actual authentication context
  return 'hospital-staff-001'
}

// Check localStorage quota and clean if needed
function checkStorageQuota(): void {
  const currentData = localStorage.getItem(STORAGE_KEY) || ''
  if (currentData.length > MAX_STORAGE_SIZE) {
    throw new StorageError('ストレージ容量が上限に達しました。古いデータを削除してください。', 'QUOTA_EXCEEDED')
  }
}

// Sanitize case data before storage
function sanitizeCaseData(caseData: any): any {
  const sanitized = { ...caseData }
  
  // Sanitize all string fields
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key])
    }
  })
  
  return sanitized
}

// ローカルストレージからケースを取得
export function getCasesFromStorage(): Case[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    
    // Validate each case against schema
    const validCases: Case[] = []
    for (const caseData of parsed) {
      try {
        const validatedCase = CaseSchema.parse(caseData)
        validCases.push(validatedCase)
      } catch (error) {
        console.warn('Invalid case data found and skipped:', caseData.id, error)
      }
    }
    
    return validCases
  } catch (error) {
    console.error('Failed to load cases from storage:', error)
    throw new StorageError('ケースデータの読み込みに失敗しました', 'LOAD_FAILED')
  }
}

// ローカルストレージにケースを保存
export function saveCasesToStorage(cases: Case[]): void {
  if (typeof window === 'undefined') return
  
  try {
    // Validate all cases before saving - filter out invalid ones
    const validatedCases: Case[] = []
    const invalidCases: any[] = []
    
    cases.forEach((caseData, index) => {
      try {
        const validatedCase = CaseSchema.parse(caseData)
        validatedCases.push(validatedCase)
      } catch (error) {
        console.warn(`Case at index ${index} failed validation:`, error)
        invalidCases.push({ index, data: caseData, error })
      }
    })
    
    if (invalidCases.length > 0) {
      console.error(`${invalidCases.length} cases failed validation and were skipped`)
    }
    
    if (validatedCases.length === 0) {
      console.warn('No valid cases to save')
      return
    }
    
    checkStorageQuota()
    
    const dataToStore = JSON.stringify(validatedCases)
    localStorage.setItem(STORAGE_KEY, dataToStore)
    
    console.log(`Successfully saved ${validatedCases.length} cases to storage`)
  } catch (error) {
    console.error('Failed to save cases to storage:', error)
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageError('ストレージ容量が不足しています', 'QUOTA_EXCEEDED')
    }
    throw new StorageError('ケースデータの保存に失敗しました', 'SAVE_FAILED')
  }
}

// 新規ケースを追加
export function addCaseToStorage(newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Case {
  try {
    // Validate input data
    const validatedInput = CreateCaseSchema.parse(sanitizeCaseData(newCase))
    
    const cases = getCasesFromStorage()
    
    const caseWithMeta: Case = {
      ...validatedInput,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: getCurrentUserId()
    }
    
    // Final validation of complete case
    const validatedCase = CaseSchema.parse(caseWithMeta)
    
    cases.push(validatedCase)
    saveCasesToStorage(cases)
    
    return validatedCase
  } catch (error) {
    console.error('Failed to add case:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      throw new ValidationError('入力データが無効です: ' + error.message)
    }
    throw new StorageError('ケースの追加に失敗しました', 'ADD_FAILED')
  }
}

// ケースを更新
export function updateCaseInStorage(caseId: string, updates: Partial<Case>): Case | null {
  try {
    // Validate caseId
    if (!caseId || typeof caseId !== 'string') {
      throw new ValidationError('無効なケースIDです')
    }
    
    const cases = getCasesFromStorage()
    const caseIndex = cases.findIndex(c => c.id === caseId)
    
    if (caseIndex === -1) {
      return null
    }
    
    const currentCase = cases[caseIndex]
    
    // Validate status transition if status is being updated
    if (updates.status && updates.status !== currentCase.status) {
      if (!validateStatusTransition(currentCase.status, updates.status)) {
        throw new ValidationError(`${currentCase.status} から ${updates.status} への変更は許可されていません`)
      }
    }
    
    // Sanitize update data
    const sanitizedUpdates = sanitizeCaseData(updates)
    
    const updatedCase: Case = {
      ...currentCase,
      ...sanitizedUpdates,
      id: caseId, // Ensure ID cannot be changed
      createdAt: currentCase.createdAt, // Preserve creation time
      updatedAt: new Date().toISOString()
    }
    
    // Validate updated case
    const validatedCase = CaseSchema.parse(updatedCase)
    
    cases[caseIndex] = validatedCase
    saveCasesToStorage(cases)
    
    return validatedCase
  } catch (error) {
    console.error('Failed to update case:', error)
    if (error instanceof ValidationError) {
      throw error
    }
    if (error instanceof Error && error.name === 'ZodError') {
      throw new ValidationError('更新データが無効です: ' + error.message)
    }
    throw new StorageError('ケースの更新に失敗しました', 'UPDATE_FAILED')
  }
}

// ケースを削除
export function deleteCaseFromStorage(caseId: string): boolean {
  try {
    // Validate caseId
    if (!caseId || typeof caseId !== 'string') {
      throw new ValidationError('無効なケースIDです')
    }
    
    const cases = getCasesFromStorage()
    const caseToDelete = cases.find(c => c.id === caseId)
    
    if (!caseToDelete) {
      return false // ケースが見つからなかった
    }
    
    // Check if case can be deleted (business rule: completed cases cannot be deleted)
    if (caseToDelete.status === 'completed') {
      throw new ValidationError('完了済みのケースは削除できません')
    }
    
    const filteredCases = cases.filter(c => c.id !== caseId)
    saveCasesToStorage(filteredCases)
    return true
  } catch (error) {
    console.error('Failed to delete case:', error)
    if (error instanceof ValidationError) {
      throw error
    }
    throw new StorageError('ケースの削除に失敗しました', 'DELETE_FAILED')
  }
}

// ケースを取得
export function getCaseFromStorage(caseId: string): Case | null {
  try {
    // Validate caseId
    if (!caseId || typeof caseId !== 'string') {
      throw new ValidationError('無効なケースIDです')
    }
    
    const cases = getCasesFromStorage()
    const foundCase = cases.find(c => c.id === caseId)
    
    return foundCase || null
  } catch (error) {
    console.error('Failed to get case:', error)
    if (error instanceof ValidationError) {
      throw error
    }
    throw new StorageError('ケースの取得に失敗しました', 'GET_FAILED')
  }
}

// Clean up invalid or old data
export function cleanupStorage(): number {
  try {
    const allData = localStorage.getItem(STORAGE_KEY)
    if (!allData) return 0
    
    const parsed = JSON.parse(allData)
    const validCases: Case[] = []
    let cleanedCount = 0
    
    for (const caseData of parsed) {
      try {
        const validatedCase = CaseSchema.parse(caseData)
        
        // Remove cases older than 2 years (configurable)
        const caseAge = Date.now() - new Date(validatedCase.createdAt || new Date()).getTime()
        const twoYearsInMs = 2 * 365 * 24 * 60 * 60 * 1000
        
        if (caseAge < twoYearsInMs) {
          validCases.push(validatedCase)
        } else {
          cleanedCount++
        }
      } catch (error) {
        cleanedCount++
        console.warn('Removing invalid case data:', caseData.id)
      }
    }
    
    if (cleanedCount > 0) {
      saveCasesToStorage(validCases)
    }
    
    return cleanedCount
  } catch (error) {
    console.error('Failed to cleanup storage:', error)
    return 0
  }
}

// 初期データをセットアップ（詳細モックデータを使用）
export function initializeStorageWithMockData(): void {
  try {
    // 現在のバージョンを確認
    const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    const needsReset = currentVersion !== STORAGE_VERSION
    
    if (needsReset) {
      console.log(`🔄 ストレージバージョンが変更されました (${currentVersion} → ${STORAGE_VERSION})`)
      // バージョンが異なる場合は、既存データを削除
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
    }
    
    const existing = getCasesFromStorage()
    if (existing.length === 0 || needsReset) {
      try {
        // データは既にスキーマ準拠なので、そのまま保存
        saveCasesToStorage(realisticMockCases)
        console.log(`✅ 初期データを${realisticMockCases.length}件読み込みました`)
        
        // バージョンを保存
        localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
      } catch (error) {
        console.error('Failed to initialize with mock data:', error)
        // フォールバック: 最小限のデータを作成
        const fallbackCase: Case = {
            id: uuidv4(),
            patientName: 'サンプル患者',
            age: 30,
            gender: 'male',
            nationality: '日本',
            passportNumber: 'J12345678',
            treatmentType: 'サンプル治療',
            hospitalName: 'サンプル病院',
            preferredDate: new Date().toISOString().split('T')[0],
            estimatedAmount: 100000,
            currency: 'JPY',
            urgency: 'medium',
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: getCurrentUserId()
          }
          saveCasesToStorage([fallbackCase])
          console.log('⚠️ フォールバックデータを1件作成しました')
        }
    } else {
      console.log(`📊 既存データ${existing.length}件を使用します (バージョン: ${STORAGE_VERSION})`)
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error)
  }
}

// ストレージを完全にリセットして新しいモックデータを読み込み
export function resetStorageWithMockData(): void {
  try {
    // 既存データを削除
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_VERSION_KEY)
      console.log('🗑️ 既存データを削除しました')
    }
    
    // 新しいモックデータを強制読み込み
    try {
        saveCasesToStorage(realisticMockCases)
        console.log(`✅ 新しいモックデータを${realisticMockCases.length}件読み込みました`)
        
        // バージョンを保存
        localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
        console.log(`📌 バージョン ${STORAGE_VERSION} を保存しました`)
        
        // ページをリロードしてUIを更新
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
    } catch (error) {
      console.error('Failed to reset with mock data:', error)
    }
  } catch (error) {
    console.error('Failed to reset storage:', error)
  }
}

// Export storage utilities
export const StorageUtils = {
  cleanup: cleanupStorage,
  reset: resetStorageWithMockData,
  getStorageSize: () => {
    const data = localStorage.getItem(STORAGE_KEY) || ''
    return data.length
  },
  getStorageInfo: () => {
    const cases = getCasesFromStorage()
    return {
      totalCases: cases.length,
      storageSize: (localStorage.getItem(STORAGE_KEY) || '').length,
      maxSize: MAX_STORAGE_SIZE,
      usagePercent: Math.round(((localStorage.getItem(STORAGE_KEY) || '').length / MAX_STORAGE_SIZE) * 100)
    }
  }
}

// 開発環境でwindowオブジェクトに公開（デバッグ用）
if (typeof window !== 'undefined') {
  // windowが存在する場合のみ実行
  if (process.env.NODE_ENV === 'development') {
    (window as any).resetStorageWithMockData = resetStorageWithMockData;
    (window as any).clearStorage = () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_VERSION_KEY);
    };
    (window as any).initializeStorage = initializeStorageWithMockData;
    (window as any).getStorageVersion = () => localStorage.getItem(STORAGE_VERSION_KEY);
    (window as any).STORAGE_VERSION = STORAGE_VERSION;
  }
}