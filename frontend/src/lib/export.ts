import { Case } from '@/types/case'

// CSVエクスポート用の文字列エスケープ
function escapeCSV(value: string | number | undefined): string {
  if (value === undefined || value === null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// 案件データをCSV形式でエクスポート（詳細版）
export function exportCasesToCSV(cases: Case[], filename: string = 'medical-tourism-cases'): void {
  // CSVヘッダー（詳細版）
  const headers = [
    '案件ID',
    '患者名',
    '患者名（原語）',
    '年齢',
    '性別',
    '国籍',
    'パスポート番号',
    'メールアドレス',
    '電話番号',
    'WeChat ID',
    '治療種別',
    '病院名',
    '担当医師',
    '診療科',
    '希望日',
    '確定日',
    '同行者数',
    'アレルギー情報',
    '既往歴・医療履歴',
    '予想金額',
    '確定金額',
    '通貨',
    '緊急度',
    'ステータス',
    '院内担当者',
    'エージェント名',
    'エージェント会社',
    'エージェント連絡先',
    '症状・治療詳細',
    '病院内部メモ',
    '要求・必要資料',
    '拒否・キャンセル理由',
    '作成日',
    '更新日',
    '作成者'
  ]

  // CSVデータ作成（詳細版）
  const csvData = cases.map(caseItem => [
    escapeCSV(caseItem.id),
    escapeCSV(caseItem.patientName),
    escapeCSV(caseItem.patientNameOriginal),
    escapeCSV(caseItem.age),
    escapeCSV(caseItem.gender === 'male' ? '男性' : caseItem.gender === 'female' ? '女性' : 'その他'),
    escapeCSV(caseItem.nationality),
    escapeCSV(caseItem.passportNumber),
    escapeCSV(caseItem.email),
    escapeCSV(caseItem.phone),
    escapeCSV(caseItem.wechatId),
    escapeCSV(caseItem.treatmentType),
    escapeCSV(caseItem.hospitalName),
    escapeCSV(caseItem.doctorName),
    escapeCSV(caseItem.department),
    escapeCSV(caseItem.preferredDate),
    escapeCSV(caseItem.confirmedDate),
    escapeCSV(caseItem.companions),
    escapeCSV(caseItem.allergies),
    escapeCSV(caseItem.medicalHistory),
    escapeCSV(caseItem.estimatedAmount),
    escapeCSV(caseItem.confirmedAmount),
    escapeCSV(caseItem.currency),
    escapeCSV(caseItem.urgency === 'high' ? '高' : caseItem.urgency === 'medium' ? '中' : '低'),
    escapeCSV(getStatusLabel(caseItem.status)),
    escapeCSV(caseItem.assignedTo),
    escapeCSV(caseItem.agentName),
    escapeCSV(caseItem.agentCompany),
    escapeCSV(caseItem.agentContact),
    escapeCSV(caseItem.description),
    escapeCSV(caseItem.hospitalNotes),
    escapeCSV(caseItem.requirements),
    escapeCSV(caseItem.rejectionReason),
    escapeCSV(caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString('ja-JP') + ' ' + new Date(caseItem.createdAt).toLocaleTimeString('ja-JP') : ''),
    escapeCSV(caseItem.updatedAt ? new Date(caseItem.updatedAt).toLocaleDateString('ja-JP') + ' ' + new Date(caseItem.updatedAt).toLocaleTimeString('ja-JP') : ''),
    escapeCSV(caseItem.createdBy)
  ])

  // CSV形式の文字列を作成
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n')

  // BOMを追加してExcelで正しく表示されるようにする
  const bom = '\ufeff'
  const csvWithBom = bom + csvContent

  // ダウンロード処理
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ステータスラベル変換
function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'new': '新規',
    'information_needed': '情報不足',
    'under_review': '審査中',
    'confirmed': '確定',
    'completed': '完了',
    'cancelled': 'キャンセル'
  }
  return statusLabels[status] || status
}

// 統計データをエクスポート
export function exportStatsToCSV(stats: any, filename: string = 'medical-tourism-stats'): void {
  const headers = ['項目', '値']
  const statsData = [
    ['総案件数', stats.total],
    ['新規案件', stats.byStatus.new],
    ['情報不足案件', stats.byStatus.information_needed],
    ['審査中案件', stats.byStatus.under_review],
    ['確定案件', stats.byStatus.confirmed],
    ['完了案件', stats.byStatus.completed],
    ['キャンセル案件', stats.byStatus.cancelled],
    ['総収益', `¥${stats.totalRevenue?.toLocaleString() || 0}`],
    ['今月の収益', `¥${stats.monthlyRevenue?.toLocaleString() || 0}`],
    ['平均案件金額', `¥${Math.round(stats.averageAmount || 0).toLocaleString()}`],
    ['完了率', `${Math.round(stats.completionRate || 0)}%`]
  ]

  const csvContent = [
    headers.join(','),
    ...statsData.map(row => `${escapeCSV(row[0])},${escapeCSV(row[1])}`)
  ].join('\n')

  const bom = '\ufeff'
  const csvWithBom = bom + csvContent

  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}// 個別患者の詳細CSVエクスポート
export function exportPatientDetailToCSV(caseData: Case, filename?: string): void {
  const patientFilename = filename || `patient-${caseData.patientName}-${caseData.id}`
  
  // 患者詳細データを縦形式で作成
  const patientDetails = [
    ['項目', '内容'],
    ['案件ID', caseData.id || ''],
    ['', ''],
    ['=== 患者基本情報 ===', ''],
    ['患者名', caseData.patientName || ''],
    ['患者名（原語）', caseData.patientNameOriginal || ''],
    ['年齢', caseData.age?.toString() || ''],
    ['性別', caseData.gender === 'male' ? '男性' : caseData.gender === 'female' ? '女性' : 'その他'],
    ['国籍', caseData.nationality || ''],
    ['パスポート番号', caseData.passportNumber || ''],
    ['', ''],
    ['=== 連絡先情報 ===', ''],
    ['メールアドレス', caseData.email || ''],
    ['電話番号', caseData.phone || ''],
    ['WeChat ID', caseData.wechatId || ''],
    ['', ''],
    ['=== 治療情報 ===', ''],
    ['治療種別', caseData.treatmentType || ''],
    ['病院名', caseData.hospitalName || ''],
    ['担当医師', caseData.doctorName || ''],
    ['診療科', caseData.department || ''],
    ['希望日', caseData.preferredDate || ''],
    ['確定日', caseData.confirmedDate || ''],
    ['同行者数', caseData.companions?.toString() || '0'],
    ['', ''],
    ['=== 医療情報 ===', ''],
    ['アレルギー情報', caseData.allergies || 'なし'],
    ['既往歴・医療履歴', caseData.medicalHistory || 'なし'],
    ['', ''],
    ['=== 費用情報 ===', ''],
    ['予想金額', caseData.estimatedAmount ? `¥${caseData.estimatedAmount.toLocaleString()}` : ''],
    ['確定金額', caseData.confirmedAmount ? `¥${caseData.confirmedAmount.toLocaleString()}` : ''],
    ['通貨', caseData.currency || ''],
    ['緊急度', caseData.urgency === 'high' ? '高' : caseData.urgency === 'medium' ? '中' : '低'],
    ['', ''],
    ['=== 案件管理情報 ===', ''],
    ['ステータス', getStatusLabel(caseData.status)],
    ['院内担当者', caseData.assignedTo || ''],
    ['', ''],
    ['=== エージェント情報 ===', ''],
    ['エージェント名', caseData.agentName || ''],
    ['エージェント会社', caseData.agentCompany || ''],
    ['エージェント連絡先', caseData.agentContact || ''],
    ['', ''],
    ['=== 詳細情報 ===', ''],
    ['症状・治療詳細', caseData.description || ''],
    ['病院内部メモ', caseData.hospitalNotes || ''],
    ['要求・必要資料', caseData.requirements || ''],
    ['拒否・キャンセル理由', caseData.rejectionReason || ''],
    ['', ''],
    ['=== システム情報 ===', ''],
    ['作成日', caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('ja-JP') + ' ' + new Date(caseData.createdAt).toLocaleTimeString('ja-JP') : ''],
    ['更新日', caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString('ja-JP') + ' ' + new Date(caseData.updatedAt).toLocaleTimeString('ja-JP') : ''],
    ['作成者', caseData.createdBy || '']
  ]

  // CSV形式の文字列を作成
  const csvContent = patientDetails
    .map(row => `${escapeCSV(row[0])},${escapeCSV(row[1])}`)
    .join('\n')

  // BOMを追加
  const bom = '\ufeff'
  const csvWithBom = bom + csvContent

  // ダウンロード処理
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${patientFilename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}