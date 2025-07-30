'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2, Save, X, User, Briefcase, Calendar, DollarSign, FileText, Users } from 'lucide-react'

interface CaseFormData {
  id?: string
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
  patientWechatId?: string
  
  // 診療情報
  treatmentType: string
  hospitalName: string
  doctorName?: string
  department?: string
  preferredDate: string
  confirmedDate?: string
  
  // 医療情報
  companions?: number
  allergies?: string
  medicalHistory?: string
  
  // 金額・その他
  estimatedAmount: number
  confirmedAmount?: number
  currency: string
  urgency: 'low' | 'medium' | 'high'
  
  // エージェント情報
  agentName?: string
  agentCompany?: string
  agentContact?: string
  
  // メモ・説明
  description?: string
  requirements?: string
  hospitalNotes?: string
  rejectionReason?: string
  
  // 案件管理
  status: 'new' | 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'additional_info_required' | 'information_needed' | 'under_review' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  assignedTo?: string
}

interface CaseFormProps {
  initialData?: Partial<CaseFormData>
  mode: 'create' | 'edit'
  onSubmit?: (data: CaseFormData) => Promise<void>
  onCancel?: () => void
}

export function CaseForm({ initialData, mode, onSubmit, onCancel }: CaseFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<CaseFormData>({
    id: initialData?.id,
    // 患者情報
    patientName: initialData?.patientName || '',
    patientNameOriginal: initialData?.patientNameOriginal || '',
    age: initialData?.age || 0,
    gender: initialData?.gender || 'male',
    nationality: initialData?.nationality || '中国',
    passportNumber: initialData?.passportNumber || '',
    
    // 連絡先
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    wechatId: initialData?.wechatId || '',
    patientWechatId: initialData?.patientWechatId || '',
    
    // 診療情報
    treatmentType: initialData?.treatmentType || '',
    hospitalName: '東京総合病院', // 固定値
    doctorName: initialData?.doctorName || '',
    department: initialData?.department || '',
    preferredDate: initialData?.preferredDate || '',
    confirmedDate: initialData?.confirmedDate || '',
    
    // 医療情報
    companions: initialData?.companions || 0,
    allergies: initialData?.allergies || '',
    medicalHistory: initialData?.medicalHistory || '',
    
    // 金額・その他
    estimatedAmount: initialData?.estimatedAmount || 0,
    confirmedAmount: initialData?.confirmedAmount || 0,
    currency: initialData?.currency || 'JPY',
    urgency: initialData?.urgency || 'medium',
    
    // エージェント情報
    agentName: initialData?.agentName || '',
    agentCompany: initialData?.agentCompany || '',
    agentContact: initialData?.agentContact || '',
    
    // メモ・説明
    description: initialData?.description || '',
    requirements: initialData?.requirements || '',
    hospitalNotes: initialData?.hospitalNotes || '',
    rejectionReason: initialData?.rejectionReason || '',
    
    // 案件管理
    status: initialData?.status || 'new',
    assignedTo: initialData?.assignedTo || '',
  })

  const handleChange = (field: keyof CaseFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // バリデーション
      if (!formData.patientName.trim()) {
        throw new Error('患者名は必須です')
      }
      if (!formData.nationality.trim()) {
        throw new Error('国籍は必須です')
      }
      if (!formData.passportNumber.trim()) {
        throw new Error('パスポート番号は必須です')
      }
      if (!formData.treatmentType.trim()) {
        throw new Error('治療種別は必須です')
      }
      if (!formData.hospitalName.trim()) {
        throw new Error('病院名は必須です')
      }
      if (!formData.preferredDate) {
        throw new Error('希望日は必須です')
      }
      if (formData.estimatedAmount <= 0) {
        throw new Error('予想金額は正の数で入力してください')
      }
      if (formData.age <= 0 || formData.age > 120) {
        throw new Error('正しい年齢を入力してください')
      }

      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // デフォルトのAPI呼び出し
        const url = mode === 'create' ? '/api/cases' : `/api/cases/${initialData?.id}`
        const method = mode === 'create' ? 'POST' : 'PUT'

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '保存に失敗しました')
        }

        router.push('/cases')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? '新規医療ツーリズム案件作成' : '案件情報編集'}
        </CardTitle>
        <CardDescription>
          医療ツーリズム案件の詳細情報を入力してください。*は必須項目です。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* 患者基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              患者基本情報
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="患者名 *"
                value={formData.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
                placeholder="例：王小明"
                required
              />

              <Input
                label="患者名（原語）"
                value={formData.patientNameOriginal}
                onChange={(e) => handleChange('patientNameOriginal', e.target.value)}
                placeholder="例：王小明"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="年齢 *"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                  min="0"
                  max="120"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性別 *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value as 'male' | 'female' | 'other')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  国籍 *
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="中国">中国</option>
                  <option value="韓国">韓国</option>
                  <option value="台湾">台湾</option>
                  <option value="ベトナム">ベトナム</option>
                  <option value="タイ">タイ</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <Input
                label="パスポート番号 *"
                value={formData.passportNumber}
                onChange={(e) => handleChange('passportNumber', e.target.value)}
                placeholder="例：E12345678"
                required
              />
            </div>
          </div>

          {/* 連絡先情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              連絡先・エージェント情報
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="メールアドレス"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="例：patient@example.com"
              />

              <Input
                label="電話番号"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="例：+86-13812345678"
              />

              <Input
                label="エージェント WeChat ID"
                value={formData.wechatId}
                onChange={(e) => handleChange('wechatId', e.target.value)}
                placeholder="例：agent_wang123"
              />

              <Input
                label="患者 WeChat ID"
                value={formData.patientWechatId}
                onChange={(e) => handleChange('patientWechatId', e.target.value)}
                placeholder="例：patient_zhang456"
              />

              <Input
                label="同行者人数"
                type="number"
                value={formData.companions}
                onChange={(e) => handleChange('companions', parseInt(e.target.value) || 0)}
                min="0"
                max="10"
              />

              <Input
                label="エージェント名"
                value={formData.agentName}
                onChange={(e) => handleChange('agentName', e.target.value)}
                placeholder="例：李華"
              />

              <Input
                label="エージェント会社"
                value={formData.agentCompany}
                onChange={(e) => handleChange('agentCompany', e.target.value)}
                placeholder="例：北京メディカルツアー"
              />
            </div>
          </div>

          {/* 診療情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
              診療情報
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="治療種別 *"
                value={formData.treatmentType}
                onChange={(e) => handleChange('treatmentType', e.target.value)}
                placeholder="例：心臓手術、美容整形、健康診断"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  病院名 *
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700">
                  東京総合病院
                </div>
              </div>

              <Input
                label="担当医師"
                value={formData.doctorName}
                onChange={(e) => handleChange('doctorName', e.target.value)}
                placeholder="例：田中心臓外科医師"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  診療科
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="内科">内科</option>
                  <option value="外科">外科</option>
                  <option value="心臓外科">心臓外科</option>
                  <option value="整形外科">整形外科</option>
                  <option value="美容外科">美容外科</option>
                  <option value="皮膚科">皮膚科</option>
                  <option value="眼科">眼科</option>
                  <option value="歯科">歯科</option>
                  <option value="産婦人科">産婦人科</option>
                  <option value="循環器内科">循環器内科</option>
                  <option value="消化器内科">消化器内科</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <Input
                label="希望受診日 *"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => handleChange('preferredDate', e.target.value)}
                required
              />

              {mode === 'edit' && (
                <Input
                  label="確定受診日"
                  type="date"
                  value={formData.confirmedDate}
                  onChange={(e) => handleChange('confirmedDate', e.target.value)}
                />
              )}
            </div>
          </div>

          {/* 医療情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-red-600" />
              医療情報
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アレルギー情報
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  placeholder="例：ペニシリンアレルギー、食物アレルギーなど"
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  既往歴・現在の病気
                </label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => handleChange('medicalHistory', e.target.value)}
                  placeholder="例：高血圧、糖尿病、手術歴など"
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* 金額・案件管理 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
              金額・案件管理
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="予想金額 *"
                  type="number"
                  value={formData.estimatedAmount}
                  onChange={(e) => handleChange('estimatedAmount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    通貨
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="JPY">円 (JPY)</option>
                    <option value="USD">ドル (USD)</option>
                    <option value="CNY">人民元 (CNY)</option>
                    <option value="KRW">ウォン (KRW)</option>
                  </select>
                </div>
              </div>

              {mode === 'edit' && (
                <Input
                  label="確定金額"
                  type="number"
                  value={formData.confirmedAmount}
                  onChange={(e) => handleChange('confirmedAmount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  緊急度
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleChange('urgency', e.target.value as 'low' | 'medium' | 'high')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as CaseFormData['status'])}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="new">新規</option>
                  <option value="information_needed">情報不足</option>
                  <option value="under_review">審査中</option>
                  <option value="confirmed">確定</option>
                  <option value="completed">完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>

              <Input
                label="担当者"
                value={formData.assignedTo}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
                placeholder="例：佐藤コーディネーター"
              />
            </div>
          </div>

          {/* メモ・説明 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">メモ・説明</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  症状・治療内容の詳細
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="治療を希望する症状や詳細な内容を記入してください"
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特別な要求・追加資料
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  placeholder="通訳、特別な部屋、食事制限、追加で必要な検査結果など"
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {mode === 'edit' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      病院内部メモ
                    </label>
                    <textarea
                      value={formData.hospitalNotes}
                      onChange={(e) => handleChange('hospitalNotes', e.target.value)}
                      placeholder="病院スタッフ向けの内部メモ"
                      className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {formData.status === 'cancelled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        キャンセル・拒否理由
                      </label>
                      <textarea
                        value={formData.rejectionReason}
                        onChange={(e) => handleChange('rejectionReason', e.target.value)}
                        placeholder="キャンセルまたは拒否の理由を記入"
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}