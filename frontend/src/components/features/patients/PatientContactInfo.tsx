'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mail, Phone, MessageCircle, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface Patient {
  email?: string
  phone?: string
  wechatId?: string
}

interface PatientContactInfoProps {
  patient: Patient
}

export function PatientContactInfo({ patient }: PatientContactInfoProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('コピーに失敗しました:', err)
    }
  }

  const hasContactInfo = patient.email || patient.phone || patient.wechatId

  if (!hasContactInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-green-600" />
            連絡先情報
          </CardTitle>
          <CardDescription>
            患者との連絡に使用する情報
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">連絡先情報が登録されていません</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2 text-green-600" />
          連絡先情報
        </CardTitle>
        <CardDescription>
          患者との連絡に使用する情報
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patient.email && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">メールアドレス</p>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(patient.email!, 'email')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiedField === 'email' ? 'コピー済み' : 'コピー'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`mailto:${patient.email}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  送信
                </Button>
              </div>
            </div>
          )}

          {patient.phone && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">電話番号</p>
                  <p className="text-sm text-gray-600">{patient.phone}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(patient.phone!, 'phone')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiedField === 'phone' ? 'コピー済み' : 'コピー'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${patient.phone}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  発信
                </Button>
              </div>
            </div>
          )}

          {patient.wechatId && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">WeChat ID</p>
                  <p className="text-sm text-gray-600">{patient.wechatId}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(patient.wechatId!, 'wechat')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiedField === 'wechat' ? 'コピー済み' : 'コピー'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}