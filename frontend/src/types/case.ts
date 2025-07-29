// Re-export types from schema for consistency
export type { Case, CreateCase, UpdateCase, CaseStatus } from '@/schemas/case'

// Legacy type alias for backwards compatibility
export type LegacyCaseStatus = 
  | 'new' 
  | 'information_needed' 
  | 'under_review' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled'

// Legacy interface (kept for compatibility with existing components)
/** @deprecated Use Case type from schemas/case.ts instead */
export interface LegacyCase {
  id: string
  // 患者情報（統合）
  patientName: string
  patientNameOriginal?: string // 中国語等の原語名
  age: number
  gender: 'male' | 'female' | 'other'
  nationality: string
  passportNumber: string
  
  // 連絡先情報
  email?: string
  phone?: string
  wechatId?: string
  
  // 診療情報
  treatmentType: string
  hospitalName: string
  doctorName?: string
  department?: string
  preferredDate: string
  confirmedDate?: string
  
  // 同行者・医療情報
  companions?: number
  allergies?: string
  medicalHistory?: string
  
  // 金額・手数料
  estimatedAmount: number
  confirmedAmount?: number
  currency: string
  commissionRate?: number
  
  // 案件管理
  status: LegacyCaseStatus
  urgency: 'low' | 'medium' | 'high'
  assignedTo?: string
  
  // エージェント情報
  agentName?: string
  agentCompany?: string
  agentContact?: string
  
  // メモ・説明
  description?: string
  requirements?: string // 追加資料要求
  hospitalNotes?: string // 病院内部メモ
  rejectionReason?: string // 拒否理由
  
  // 添付ファイル
  attachments?: Array<{
    id: string
    name: string
    type: 'medical_record' | 'passport' | 'other'
    url: string
    uploadedAt: string
  }>
  
  // システム情報
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface CreateCaseInput {
  // 患者情報
  patientName: string
  patientNameOriginal?: string
  age: number
  gender: 'male' | 'female' | 'other'
  nationality: string
  passportNumber: string
  
  // 連絡先
  email?: string
  phone?: string
  wechatId?: string
  
  // 診療情報
  treatmentType: string
  hospitalName: string
  department?: string
  preferredDate: string
  
  // 医療情報
  companions?: number
  allergies?: string
  medicalHistory?: string
  
  // 金額・その他
  estimatedAmount: number
  currency: string
  urgency: 'low' | 'medium' | 'high'
  description?: string
  
  // エージェント情報
  agentName?: string
  agentCompany?: string
  agentContact?: string
}

export interface UpdateCaseInput extends Partial<CreateCaseInput> {
  id: string
  status?: LegacyCaseStatus
  confirmedDate?: string
  confirmedAmount?: number
  doctorName?: string
  assignedTo?: string
  hospitalNotes?: string
  requirements?: string
  rejectionReason?: string
}

export interface CaseFilters {
  status?: LegacyCaseStatus[]
  urgency?: string[]
  hospitalName?: string
  department?: string
  nationality?: string
  agentName?: string
  treatmentType?: string
  dateRange?: {
    start: string
    end: string
  }
  amountRange?: {
    min: number
    max: number
  }
}

export interface CaseActivity {
  id: string
  caseId: string
  userId: string
  userName: string
  action: 'created' | 'updated' | 'status_changed' | 'comment_added' | 'file_uploaded' | 'approved' | 'rejected'
  description: string
  details?: Record<string, any>
  comment?: string
  createdAt: string
}

export interface CaseStats {
  total: number
  byStatus: {
    new: number
    information_needed: number
    under_review: number
    confirmed: number
    completed: number
    cancelled: number
  }
  totalRevenue: number
  monthlyRevenue: number
  averageAmount: number
  completionRate: number
}