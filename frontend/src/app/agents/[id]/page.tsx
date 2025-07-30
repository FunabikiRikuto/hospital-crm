'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Building, Phone, Mail, MessageSquare, Calendar, DollarSign, TrendingUp, FileText, Users, Star, Briefcase, Clock } from 'lucide-react'
import type { Agent } from '@/types/agent'
import type { Case } from '@/types/case'
import type { Billing } from '@/types/billing'
import { useCases } from '@/hooks/useCases'

// モックデータ
const mockAgent: Agent = {
  id: 'agent-1',
  companyName: 'ABC医療ツーリズム株式会社',
  contactName: '田中 健一',
  email: 'tanaka@abc-medical.com',
  phone: '+81-3-1234-5678',
  wechatId: 'tanaka_abc',
  contractInfo: {
    commissionRate: 0.15,
    contractStartDate: '2024-01-01',
    contractEndDate: '2025-12-31'
  },
  performance: {
    totalCases: 45,
    completedCases: 38,
    totalRevenue: 125000000,
    averageRating: 4.8
  },
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-12-15T10:30:00Z'
}

const mockBillings: Billing[] = [
  {
    id: 'billing-1',
    caseId: 'case-1',
    agentId: 'agent-1',
    medicalFee: 5000000,
    insuranceCovered: 1000000,
    netAmount: 4000000,
    commissionRate: 0.15,
    commission: 600000,
    paymentStatus: 'paid',
    invoiceNumber: 'INV-2024-12-001',
    invoiceDate: '2024-12-05',
    paymentDate: '2024-12-15',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z'
  },
  {
    id: 'billing-2',
    caseId: 'case-2',
    agentId: 'agent-1',
    medicalFee: 3000000,
    insuranceCovered: 0,
    netAmount: 3000000,
    commissionRate: 0.15,
    commission: 450000,
    paymentStatus: 'invoiced',
    invoiceNumber: 'INV-2024-12-002',
    invoiceDate: '2024-12-05',
    createdAt: '2024-12-02T09:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z'
  }
]

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { cases } = useCases()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [agentCases, setAgentCases] = useState<Case[]>([])
  const [agentBillings, setAgentBillings] = useState<Billing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const agentId = params.id as string

  useEffect(() => {
    // TODO: 実際のAPIから取得
    setAgent(mockAgent)
    
    // エージェントに関連する案件を抽出
    const relatedCases = cases.filter(c => c.agentCompany === mockAgent.companyName || c.agentName === mockAgent.contactName)
    setAgentCases(relatedCases)
    
    // エージェントの請求データを抽出
    const relatedBillings = mockBillings.filter(b => b.agentId === agentId)
    setAgentBillings(relatedBillings)
    
    setIsLoading(false)
  }, [agentId, cases])

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`
  }

  const getStatusBadge = (status: Case['status']) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'new': { label: '新規', className: 'bg-blue-100 text-blue-800' },
      'pending': { label: '新規', className: 'bg-blue-100 text-blue-800' },
      'information_needed': { label: '情報不足', className: 'bg-orange-100 text-orange-800' },
      'additional_info_required': { label: '情報不足', className: 'bg-orange-100 text-orange-800' },
      'under_review': { label: '審査中', className: 'bg-yellow-100 text-yellow-800' },
      'reviewing': { label: '審査中', className: 'bg-yellow-100 text-yellow-800' },
      'accepted': { label: '受入承認', className: 'bg-green-100 text-green-800' },
      'rejected': { label: '拒否', className: 'bg-red-100 text-red-800' },
      'scheduled': { label: '予約済', className: 'bg-indigo-100 text-indigo-800' },
      'confirmed': { label: '確定', className: 'bg-green-100 text-green-800' },
      'completed': { label: '完了', className: 'bg-purple-100 text-purple-800' },
      'cancelled': { label: 'キャンセル', className: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: Billing['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">請求待ち</Badge>
      case 'invoiced':
        return <Badge className="bg-blue-100 text-blue-800">請求済み</Badge>
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">支払済み</Badge>
    }
  }

  if (isLoading || !agent) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  // 統計計算
  const totalCommission = agentBillings.reduce((sum, b) => sum + b.commission, 0)
  const paidCommission = agentBillings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.commission, 0)
  const pendingCommission = totalCommission - paidCommission

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/agents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{agent.companyName}</h1>
              <p className="text-gray-600">担当: {agent.contactName}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              連絡する
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              請求書発行
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メイン情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-600" />
                  エージェント情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">会社名</p>
                    <p className="font-medium">{agent.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">担当者</p>
                    <p className="font-medium">{agent.contactName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">メール</p>
                    <p className="font-medium">
                      <a href={`mailto:${agent.email}`} className="text-blue-600 hover:underline">
                        {agent.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">電話番号</p>
                    <p className="font-medium">
                      <a href={`tel:${agent.phone}`} className="text-blue-600 hover:underline">
                        {agent.phone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">WeChat ID</p>
                    <p className="font-medium">{agent.wechatId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ステータス</p>
                    <div className="mt-1">
                      {agent.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-800">アクティブ</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">非アクティブ</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 関連案件 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                  関連案件
                </CardTitle>
                <CardDescription>
                  このエージェントが担当している案件
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentCases.length > 0 ? (
                    agentCases.slice(0, 5).map((caseItem) => (
                      <Link 
                        key={caseItem.id} 
                        href={`/cases/${caseItem.id}`}
                        className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{caseItem.patientName}</p>
                            <p className="text-sm text-gray-600">{caseItem.treatmentType}</p>
                            <p className="text-xs text-gray-500">
                              {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString('ja-JP') : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(caseItem.status)}
                            <p className="text-sm font-medium mt-1">
                              {formatCurrency(caseItem.estimatedAmount)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      関連する案件がありません
                    </p>
                  )}
                </div>
                {agentCases.length > 5 && (
                  <div className="mt-4 pt-4 border-t">
                    <Link href={`/cases?agent=${agentId}`}>
                      <Button variant="outline" className="w-full">
                        すべての案件を表示（{agentCases.length}件）
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 請求履歴 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  請求履歴
                </CardTitle>
                <CardDescription>
                  手数料請求の履歴
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentBillings.length > 0 ? (
                    agentBillings.map((billing) => {
                      const relatedCase = cases.find(c => c.id === billing.caseId)
                      return (
                        <div key={billing.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {billing.invoiceNumber || `請求 ${billing.id}`}
                              </p>
                              {relatedCase && (
                                <Link 
                                  href={`/cases/${relatedCase.id}`}
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  {relatedCase.patientName} - {relatedCase.treatmentType}
                                </Link>
                              )}
                              <p className="text-xs text-gray-500">
                                {billing.invoiceDate 
                                  ? new Date(billing.invoiceDate).toLocaleDateString('ja-JP')
                                  : '未発行'
                                }
                              </p>
                            </div>
                            <div className="text-right">
                              {getPaymentStatusBadge(billing.paymentStatus)}
                              <p className="text-sm font-semibold mt-1 text-green-600">
                                {formatCurrency(billing.commission)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      請求履歴がありません
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 契約情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-orange-600" />
                  契約情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">手数料率</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(agent.contractInfo.commissionRate * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">契約開始日</p>
                  <p className="font-medium">
                    {new Date(agent.contractInfo.contractStartDate).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                {agent.contractInfo.contractEndDate && (
                  <div>
                    <p className="text-sm text-gray-600">契約終了日</p>
                    <p className="font-medium">
                      {new Date(agent.contractInfo.contractEndDate).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 実績サマリー */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  実績サマリー
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">案件実績</p>
                  <p className="text-xl font-bold">
                    {agent.performance.completedCases}/{agent.performance.totalCases}件
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{width: `${(agent.performance.completedCases / agent.performance.totalCases) * 100}%`}}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">総売上高</p>
                  <p className="text-xl font-bold">{formatCurrency(agent.performance.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">平均評価</p>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-xl font-bold">{agent.performance.averageRating.toFixed(1)}</span>
                    <span className="ml-1 text-sm text-gray-500">/ 5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 財務状況 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
                  財務状況
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">総手数料</span>
                  <span className="font-semibold">{formatCurrency(totalCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">支払済み</span>
                  <span className="font-semibold text-green-600">{formatCurrency(paidCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">未収金</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(pendingCommission)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}