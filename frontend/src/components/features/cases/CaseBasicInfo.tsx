'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Briefcase, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import type { Case } from '@/types/case'

interface CaseBasicInfoProps {
  caseData: Case
}

export function CaseBasicInfo({ caseData }: CaseBasicInfoProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'information_needed': return 'bg-orange-100 text-orange-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return '新規'
      case 'information_needed': return '情報不足'
      case 'under_review': return '審査中'
      case 'confirmed': return '確定'
      case 'completed': return '完了'
      case 'cancelled': return 'キャンセル'
      default: return '不明'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return '不明'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'JPY' ? '¥' : currency === 'USD' ? '$' : currency
    return `${symbol}${amount.toLocaleString()}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{caseData.treatmentType}</CardTitle>
              <CardDescription>
                案件ID: {caseData.id} • 患者: {caseData.patientName}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(caseData.status)}>
              {getStatusText(caseData.status)}
            </Badge>
            <Badge className={getUrgencyColor(caseData.urgency)}>
              <AlertCircle className="h-3 w-3 mr-1" />
              緊急度: {getUrgencyText(caseData.urgency)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
              治療情報
            </h3>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">病院</span>
                <span className="text-sm font-medium">{caseData.hospitalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">診療科</span>
                <span className="text-sm font-medium">{caseData.department}</span>
              </div>
              {caseData.doctorName && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">担当医</span>
                  <span className="text-sm font-medium">{caseData.doctorName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              日程情報
            </h3>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">希望日</span>
                <span className="text-sm font-medium">
                  {caseData.preferredDate ? new Date(caseData.preferredDate).toLocaleDateString('ja-JP') : '不明'}
                </span>
              </div>
              {caseData.confirmedDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">確定日</span>
                  <span className="text-sm font-medium text-green-700">
                    {caseData.confirmedDate ? new Date(caseData.confirmedDate).toLocaleDateString('ja-JP') : '不明'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">作成日</span>
                <span className="text-sm font-medium">
                  {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('ja-JP') : '不明'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">更新日</span>
                <span className="text-sm font-medium">
                  {caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString('ja-JP') : '不明'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
              費用情報
            </h3>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">予想金額</span>
                <span className="text-sm font-medium">
                  {formatCurrency(caseData.estimatedAmount, caseData.currency)}
                </span>
              </div>
              {caseData.confirmedAmount && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">確定金額</span>
                  <span className="text-sm font-medium text-green-700">
                    {formatCurrency(caseData.confirmedAmount, caseData.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">通貨</span>
                <span className="text-sm font-medium">{caseData.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}