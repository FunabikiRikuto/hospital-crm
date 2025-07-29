import { Case, CaseStats } from '@/types/case'
import { realisticMockCases } from './realisticMockCases'

// リアルなモックデータを使用
export const mockCases: Case[] = realisticMockCases

// 旧データは下記のようになっていました（参考用）
const legacyMockCases: Case[] = [
  {
    id: 'case-001',
    // 患者情報
    patientName: '王小明',
    patientNameOriginal: '王小明',
    age: 45,
    gender: 'male',
    nationality: '中国',
    passportNumber: 'E12345678',
    
    // 連絡先
    email: 'wang.xiaoming@example.com',
    phone: '+86-13812345678',
    wechatId: 'wangxm2025',
    
    // 診療情報
    treatmentType: '心臓手術（冠動脈バイパス）',
    hospitalName: '東京総合病院',
    doctorName: '田中心臓外科医師',
    department: '心臓外科',
    preferredDate: '2025-08-15',
    confirmedDate: '2025-08-20',
    
    // 医療情報
    companions: 1,
    allergies: 'ペニシリンアレルギー',
    medicalHistory: '高血圧、糖尿病の既往歴あり',
    
    // 金額・手数料
    estimatedAmount: 5000000,
    confirmedAmount: 5200000,
    currency: 'JPY',
    commissionRate: 0.05,
    
    // 案件管理
    status: 'confirmed',
    urgency: 'high',
    assignedTo: '佐藤コーディネーター',
    
    // エージェント情報
    agentName: '李華',
    agentCompany: '北京メディカルツアー',
    agentContact: 'lihua@bmt.com',
    
    // メモ・説明
    description: '緊急性の高い心臓手術案件。患者の症状が重篤なため早期の治療が必要。',
    hospitalNotes: '手術室の確保完了。麻酔科との調整済み。',
    
    // 添付ファイル
    attachments: [
      {
        id: 'att-001',
        name: '心電図検査結果.pdf',
        type: 'medical_record',
        url: '/files/ecg-001.pdf',
        uploadedAt: '2025-07-25T10:00:00Z'
      },
      {
        id: 'att-002',
        name: 'パスポート.jpg',
        type: 'passport',
        url: '/files/passport-001.jpg',
        uploadedAt: '2025-07-25T10:05:00Z'
      }
    ],
    
    // システム情報
    createdAt: '2025-07-25T10:00:00Z',
    updatedAt: '2025-07-29T14:30:00Z',
    createdBy: 'agent-001'
  },
  {
    id: 'case-002',
    // 患者情報
    patientName: '李美华',
    patientNameOriginal: '李美华',
    age: 32,
    gender: 'female',
    nationality: '中国',
    passportNumber: 'E87654321',
    
    // 連絡先
    email: 'li.meihua@example.com',
    phone: '+86-13987654321',
    wechatId: 'limeihua32',
    
    // 診療情報
    treatmentType: '美容整形（鼻形成術）',
    hospitalName: '青山美容クリニック',
    doctorName: '佐藤美容外科医師',
    department: '美容外科',
    preferredDate: '2025-09-10',
    
    // 医療情報
    companions: 2,
    allergies: 'なし',
    medicalHistory: '特記事項なし',
    
    // 金額・手数料
    estimatedAmount: 1200000,
    currency: 'JPY',
    commissionRate: 0.04,
    
    // 案件管理
    status: 'information_needed',
    urgency: 'low',
    assignedTo: '山田コーディネーター',
    
    // エージェント情報
    agentName: '陈志强',
    agentCompany: '上海医疗旅游',
    agentContact: 'chen.zhiqiang@smt.com',
    
    // メモ・説明
    description: '鼻の形成術を希望。より自然な鼻筋を求めている。',
    requirements: '追加の血液検査結果と麻酔科での事前診察が必要',
    hospitalNotes: '術前検査の結果待ち',
    
    // システム情報
    createdAt: '2025-07-20T09:15:00Z',
    updatedAt: '2025-07-28T16:45:00Z',
    createdBy: 'agent-002'
  },
  {
    id: 'case-003',
    // 患者情報
    patientName: '金正雄',
    patientNameOriginal: '김정웅',
    age: 58,
    gender: 'male',
    nationality: '韓国',
    passportNumber: 'M12345678',
    
    // 連絡先
    email: 'kim.jungwoong@example.com',
    phone: '+82-10-1234-5678',
    wechatId: '',
    
    // 診療情報
    treatmentType: '甲状腺手術（結節摘出）',
    hospitalName: '国立医療センター',
    doctorName: '高橋内分泌外科医師',
    department: '内分泌外科',
    preferredDate: '2025-08-25',
    confirmedDate: '2025-08-28',
    
    // 医療情報
    companions: 1,
    allergies: 'ヨード造影剤アレルギー',
    medicalHistory: '甲状腺機能低下症',
    
    // 金額・手数料
    estimatedAmount: 2500000,
    confirmedAmount: 2650000,
    currency: 'JPY',
    commissionRate: 0.05,
    
    // 案件管理
    status: 'completed',
    urgency: 'medium',
    assignedTo: '鈴木コーディネーター',
    
    // エージェント情報
    agentName: '박수진',
    agentCompany: '서울메디컬투어',
    agentContact: 'park.sujin@smt.co.kr',
    
    // メモ・説明
    description: '甲状腺結節の摘出術。良性腫瘍の可能性が高いが確定診断のため手術実施。',
    hospitalNotes: '手術は成功。術後経過良好。',
    
    // 添付ファイル
    attachments: [
      {
        id: 'att-003',
        name: '甲状腺エコー検査.pdf',
        type: 'medical_record',
        url: '/files/thyroid-003.pdf',
        uploadedAt: '2025-07-22T14:20:00Z'
      }
    ],
    
    // システム情報
    createdAt: '2025-07-22T14:20:00Z',
    updatedAt: '2025-07-30T11:30:00Z',
    createdBy: 'agent-003'
  },
  {
    id: 'case-004',
    // 患者情報
    patientName: '陈志明',
    patientNameOriginal: '陈志明',
    age: 67,
    gender: 'male',
    nationality: '中国',
    passportNumber: 'E11111111',
    
    // 連絡先
    email: 'chen.zhiming@example.com',
    phone: '+86-13611111111',
    wechatId: 'chenzhiming67',
    
    // 診療情報
    treatmentType: 'カテーテル治療（心房細動）',
    hospitalName: '循環器専門病院',
    doctorName: '山本循環器内科医師',
    department: '循環器内科',
    preferredDate: '2025-08-05',
    
    // 医療情報
    companions: 2,
    allergies: 'なし',
    medicalHistory: '心房細動、ワーファリン服用中',
    
    // 金額・手数料
    estimatedAmount: 3200000,
    currency: 'JPY',
    commissionRate: 0.05,
    
    // 案件管理
    status: 'new',
    urgency: 'high',
    assignedTo: '田中コーディネーター',
    
    // エージェント情報
    agentName: '李華',
    agentCompany: '北京メディカルツアー',
    agentContact: 'lihua@bmt.com',
    
    // メモ・説明
    description: '心房細動に対するカテーテルアブレーション治療。',
    hospitalNotes: '術前の抗凝固管理について循環器内科と相談予定',
    
    // システム情報
    createdAt: '2025-07-28T08:45:00Z',
    updatedAt: '2025-07-29T13:10:00Z',
    createdBy: 'agent-001'
  },
  {
    id: 'case-005',
    // 患者情報
    patientName: '张丽娜',
    patientNameOriginal: '张丽娜',
    age: 29,
    gender: 'female',
    nationality: '中国',
    passportNumber: 'E22222222',
    
    // 連絡先
    email: 'zhang.lina@example.com',
    phone: '+86-13622222222',
    wechatId: 'zhanglina29',
    
    // 診療情報
    treatmentType: '不妊治療（体外受精）',
    hospitalName: '生殖医療センター',
    doctorName: '木村産婦人科医師',
    department: '生殖医療科',
    preferredDate: '2025-09-15',
    
    // 医療情報
    companions: 1,
    allergies: '卵アレルギー',
    medicalHistory: '多嚢胞性卵巣症候群',
    
    // 金額・手数料
    estimatedAmount: 1500000,
    currency: 'JPY',
    commissionRate: 0.04,
    
    // 案件管理
    status: 'under_review',
    urgency: 'medium',
    assignedTo: '佐藤コーディネーター',
    
    // エージェント情報
    agentName: '王小强',
    agentCompany: '广州医疗咨询',
    agentContact: 'wang.xiaoqiang@gmc.com',
    
    // メモ・説明
    description: '体外受精（IVF）治療。ホルモン治療と採卵・移植の予定。',
    hospitalNotes: '卵アレルギーのため薬剤選択に注意が必要',
    
    // システム情報
    createdAt: '2025-07-26T11:20:00Z',
    updatedAt: '2025-07-29T09:45:00Z',
    createdBy: 'agent-004'
  },
  {
    id: 'case-006',
    // 患者情報
    patientName: 'Nguyen Van Nam',
    patientNameOriginal: 'Nguyễn Văn Nam',
    age: 41,
    gender: 'male',
    nationality: 'ベトナム',
    passportNumber: 'B12345678',
    
    // 連絡先
    email: 'nguyen.vannam@example.com',
    phone: '+84-901-234-567',
    wechatId: '',
    
    // 診療情報
    treatmentType: '肝臓精密検査',
    hospitalName: '消化器病センター',
    doctorName: '伊藤消化器内科医師',
    department: '消化器内科',
    preferredDate: '2025-08-12',
    
    // 医療情報
    companions: 3,
    allergies: 'なし',
    medicalHistory: 'B型肝炎既往歴',
    
    // 金額・手数料
    estimatedAmount: 800000,
    currency: 'JPY',
    commissionRate: 0.05,
    
    // 案件管理
    status: 'cancelled',
    urgency: 'medium',
    assignedTo: '山田コーディネーター',
    
    // エージェント情報
    agentName: 'Tran Thi Mai',
    agentCompany: 'Vietnam Medical Tour',
    agentContact: 'tran.thimai@vmt.vn',
    
    // メモ・説明
    description: '肝機能異常の精密検査。CT、MRI、肝生検を含む予定だった。',
    rejectionReason: '患者の都合により案件キャンセル',
    hospitalNotes: 'キャンセル手続き完了',
    
    // システム情報
    createdAt: '2025-07-18T10:40:00Z',
    updatedAt: '2025-07-29T16:25:00Z',
    createdBy: 'agent-005'
  }
]

// 検索・フィルタ用のヘルパー関数
export const filterCases = (
  cases: Case[],
  searchTerm: string = '',
  statusFilter: string = '',
  urgencyFilter: string = '',
  departmentFilter: string = ''
) => {
  return cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (caseItem.agentName || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || caseItem.status === statusFilter
    const matchesUrgency = !urgencyFilter || caseItem.urgency === urgencyFilter
    const matchesDepartment = !departmentFilter || (caseItem.department || '').includes(departmentFilter)
    
    return matchesSearch && matchesStatus && matchesUrgency && matchesDepartment
  })
}

// 統計データ取得用のヘルパー関数
export const getCaseStats = (cases: Case[]): CaseStats => {
  const total = cases.length
  const byStatus = {
    new: cases.filter(c => c.status === 'new').length,
    information_needed: cases.filter(c => c.status === 'information_needed').length,
    under_review: cases.filter(c => c.status === 'under_review').length,
    confirmed: cases.filter(c => c.status === 'confirmed').length,
    completed: cases.filter(c => c.status === 'completed').length,
    cancelled: cases.filter(c => c.status === 'cancelled').length
  }
  
  const completedCases = cases.filter(c => c.status === 'completed')
  const totalRevenue = completedCases.reduce((sum, c) => sum + (c.confirmedAmount || c.estimatedAmount), 0)
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = completedCases
    .filter(c => {
      const caseDate = new Date(c.updatedAt || new Date())
      return caseDate.getMonth() === currentMonth && caseDate.getFullYear() === currentYear
    })
    .reduce((sum, c) => sum + (c.confirmedAmount || c.estimatedAmount), 0)
  
  const averageAmount = completedCases.length > 0 
    ? totalRevenue / completedCases.length 
    : 0
    
  const completionRate = total > 0 
    ? (byStatus.completed / total) * 100 
    : 0
  
  return {
    total,
    byStatus,
    totalRevenue,
    monthlyRevenue,
    averageAmount,
    completionRate
  }
}

// 緊急度別の統計
export const getUrgencyStats = (cases: Case[]) => {
  return {
    high: cases.filter(c => c.urgency === 'high').length,
    medium: cases.filter(c => c.urgency === 'medium').length,
    low: cases.filter(c => c.urgency === 'low').length
  }
}

// 部署別の統計
export const getDepartmentStats = (cases: Case[]) => {
  return cases.reduce((acc, caseItem) => {
    const dept = caseItem.department || 'その他'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

// 国籍別の統計
export const getNationalityStats = (cases: Case[]) => {
  return cases.reduce((acc, caseItem) => {
    acc[caseItem.nationality] = (acc[caseItem.nationality] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}