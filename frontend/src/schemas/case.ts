import { z } from 'zod'

// Patient validation schema
export const PatientSchema = z.object({
  patientName: z.string()
    .min(1, '患者名は必須です')
    .max(100, '患者名は100文字以内で入力してください')
    .regex(/^[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/, '患者名に無効な文字が含まれています'),
  
  patientNameOriginal: z.string()
    .max(100, '原語名は100文字以内で入力してください')
    .optional(),
  
  age: z.number()
    .int('年齢は整数で入力してください')
    .min(0, '年齢は0歳以上で入力してください')
    .max(150, '年齢は150歳以下で入力してください'),
  
  gender: z.enum(['male', 'female', 'other'], {
    message: '性別を選択してください'
  }),
  
  nationality: z.string()
    .min(1, '国籍は必須です')
    .max(50, '国籍は50文字以内で入力してください'),
  
  passportNumber: z.string()
    .min(1, 'パスポート番号は必須です')
    .max(20, 'パスポート番号は20文字以内で入力してください')
    .regex(/^[A-Z0-9]+$/, 'パスポート番号は英数字のみで入力してください')
})

// Contact information validation schema
export const ContactSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .max(255, 'メールアドレスは255文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .max(20, '電話番号は20文字以内で入力してください')
    .regex(/^[\+\-\(\)\s\d]*$/, '電話番号の形式が正しくありません')
    .optional()
    .or(z.literal('')),
  
  wechatId: z.string()
    .max(50, 'エージェントWeChat IDは50文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_-]*$/, 'WeChat IDは英数字、アンダースコア、ハイフンのみ使用可能です')
    .optional()
    .or(z.literal('')),
  
  patientWechatId: z.string()
    .max(50, '患者WeChat IDは50文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_-]*$/, 'WeChat IDは英数字、アンダースコア、ハイフンのみ使用可能です')
    .optional()
    .or(z.literal(''))
})

// Medical information validation schema
export const MedicalSchema = z.object({
  treatmentType: z.string()
    .min(1, '治療種別は必須です')
    .max(200, '治療種別は200文字以内で入力してください'),
  
  hospitalName: z.string()
    .min(1, '病院名は必須です')
    .max(200, '病院名は200文字以内で入力してください'),
  
  doctorName: z.string()
    .max(100, '医師名は100文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  department: z.string()
    .max(100, '診療科は100文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  preferredDate: z.string()
    .min(1, '希望日は必須です')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '希望日の形式が正しくありません'),
  
  confirmedDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '確定日の形式が正しくありません')
    .optional()
    .or(z.literal('')),
  
  companions: z.number()
    .int('同行者数は整数で入力してください')
    .min(0, '同行者数は0以上で入力してください')
    .max(20, '同行者数は20名以下で入力してください')
    .optional(),
  
  allergies: z.string()
    .max(1000, 'アレルギー情報は1000文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  medicalHistory: z.string()
    .max(2000, '既往歴は2000文字以内で入力してください')
    .optional()
    .or(z.literal(''))
})

// Financial information validation schema
export const FinancialSchema = z.object({
  estimatedAmount: z.number()
    .min(0, '予想金額は0以上で入力してください')
    .max(100000000, '予想金額は1億円以下で入力してください'),
  
  confirmedAmount: z.number()
    .min(0, '確定金額は0以上で入力してください')
    .max(100000000, '確定金額は1億円以下で入力してください')
    .optional(),
  
  currency: z.enum(['JPY', 'USD', 'CNY', 'KRW', 'EUR'], {
    message: '通貨を選択してください'
  }),
  
  urgency: z.enum(['low', 'medium', 'high'], {
    message: '緊急度を選択してください'
  }),
  
  commissionRate: z.number()
    .min(0, '手数料率は0以上で入力してください')
    .max(1, '手数料率は100%以下で入力してください')
    .optional()
})

// Agent information validation schema
export const AgentSchema = z.object({
  agentName: z.string()
    .max(100, 'エージェント名は100文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  agentCompany: z.string()
    .max(200, 'エージェント会社名は200文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  agentContact: z.string()
    .max(500, 'エージェント連絡先は500文字以内で入力してください')
    .optional()
    .or(z.literal(''))
})

// Case status validation schema
export const CaseStatusSchema = z.enum([
  'new',
  'pending',
  'reviewing',
  'accepted',
  'rejected',
  'additional_info_required',
  'information_needed', // 後方互換性のため
  'under_review', // 後方互換性のため
  'scheduled',
  'confirmed',
  'completed',
  'cancelled'
], {
  message: '有効なステータスを選択してください'
})

// Notes and descriptions validation schema
export const NotesSchema = z.object({
  description: z.string()
    .max(2000, '症状詳細は2000文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  requirements: z.string()
    .max(1000, '要求事項は1000文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  hospitalNotes: z.string()
    .max(2000, '病院メモは2000文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  rejectionReason: z.string()
    .max(1000, '拒否理由は1000文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  
  assignedTo: z.string()
    .max(100, '担当者は100文字以内で入力してください')
    .optional()
    .or(z.literal(''))
})

// Attachment schema
export const AttachmentSchema = z.object({
  id: z.string().uuid('無効な添付ファイルIDです'),
  name: z.string().min(1, 'ファイル名は必須です').max(255, 'ファイル名は255文字以内で入力してください'),
  type: z.enum(['medical_record', 'passport', 'other'], {
    message: '有効なファイルタイプを選択してください'
  }),
  url: z.string().url('有効なURLを入力してください'),
  uploadedAt: z.string().datetime('アップロード日時の形式が正しくありません')
})

// Complete case validation schema
export const CaseSchema = z.object({
  id: z.string()
    .uuid('無効なケースIDです')
    .optional(),
  
  ...PatientSchema.shape,
  ...ContactSchema.shape,
  ...MedicalSchema.shape,
  ...FinancialSchema.shape,
  ...AgentSchema.shape,
  ...NotesSchema.shape,
  
  status: CaseStatusSchema,
  
  // Attachments
  attachments: z.array(AttachmentSchema).optional(),
  
  createdAt: z.string()
    .datetime('作成日時の形式が正しくありません')
    .optional(),
  
  updatedAt: z.string()
    .datetime('更新日時の形式が正しくありません')
    .optional(),
  
  createdBy: z.string()
    .min(1, '作成者IDは必須です')
    .max(100, '作成者IDは100文字以内である必要があります')
    .optional()
})

// Schema for case creation (without system-generated fields)
export const CreateCaseSchema = CaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true
})

// Schema for case updates (all fields optional except id)
export const UpdateCaseSchema = CaseSchema.partial().extend({
  id: z.string().uuid('無効なケースIDです')
})

// Status transition validation
export const ValidStatusTransitions: Record<string, string[]> = {
  'new': ['pending', 'reviewing', 'additional_info_required', 'rejected', 'cancelled'],
  'pending': ['reviewing', 'additional_info_required', 'rejected', 'cancelled'],
  'reviewing': ['accepted', 'rejected', 'additional_info_required', 'cancelled'],
  'accepted': ['scheduled', 'cancelled'],
  'rejected': [], // Terminal state
  'additional_info_required': ['reviewing', 'rejected', 'cancelled'],
  'scheduled': ['confirmed', 'cancelled'],
  'confirmed': ['completed', 'cancelled'],
  'completed': [], // Terminal state
  'cancelled': [], // Terminal state
  // 後方互換性
  'information_needed': ['under_review', 'cancelled'],
  'under_review': ['confirmed', 'cancelled', 'information_needed']
}

// Function to validate status transitions
export function validateStatusTransition(
  currentStatus: string, 
  newStatus: string
): boolean {
  const validTransitions = ValidStatusTransitions[currentStatus]
  return validTransitions ? validTransitions.includes(newStatus) : false
}

// Input sanitization functions
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially harmful characters
    .substring(0, 10000) // Limit length to prevent DoS
}

export function sanitizeNumber(input: unknown): number {
  const num = Number(input)
  return isNaN(num) ? 0 : Math.max(0, Math.min(num, 999999999)) // Reasonable bounds
}

// Export types inferred from schemas
export type Case = z.infer<typeof CaseSchema>
export type CreateCase = z.infer<typeof CreateCaseSchema>
export type UpdateCase = z.infer<typeof UpdateCaseSchema>
export type CaseStatus = z.infer<typeof CaseStatusSchema>