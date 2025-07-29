'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { User, Calendar, Globe, CreditCard } from 'lucide-react'

interface Patient {
  id: string
  name: string
  nameOriginal?: string
  age: number
  gender: 'male' | 'female' | 'other'
  nationality: string
  passportNumber: string
  email?: string
  phone?: string
  wechatId?: string
  companions?: number
  createdAt: string
  updatedAt: string
  status: 'active' | 'completed' | 'inactive'
}

interface PatientBasicInfoProps {
  patient: Patient
}

export function PatientBasicInfo({ patient }: PatientBasicInfoProps) {
  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return '男性'
      case 'female': return '女性'
      case 'other': return 'その他'
      default: return '不明'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'アクティブ'
      case 'completed': return '完了'
      case 'inactive': return '非アクティブ'
      default: return '不明'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{patient.name}</CardTitle>
              <CardDescription>
                {patient.nameOriginal && `${patient.nameOriginal} • `}
                患者ID: {patient.id}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(patient.status)}>
            {getStatusText(patient.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              基本情報
            </h3>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">年齢</span>
                <span className="text-sm font-medium">{patient.age}歳</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">性別</span>
                <span className="text-sm font-medium">{getGenderText(patient.gender)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">同伴者数</span>
                <span className="text-sm font-medium">{patient.companions || 0}名</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              国籍情報
            </h3>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">国籍</span>
                <span className="text-sm font-medium">{patient.nationality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">パスポート</span>
                <span className="text-sm font-medium font-mono">{patient.passportNumber}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              登録情報
            </h3>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">登録日</span>
                <span className="text-sm font-medium">{formatDate(patient.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">更新日</span>
                <span className="text-sm font-medium">{formatDate(patient.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}