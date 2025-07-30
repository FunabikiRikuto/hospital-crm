'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DollarSign, FileText, Download, Calendar, TrendingUp, Users, CheckCircle, Clock, Filter, Search } from 'lucide-react'
import type { Billing, MonthlyInvoice } from '@/types/billing'
import type { Agent } from '@/types/agent'
import { useCases } from '@/hooks/useCases'

// モックデータ
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
  },
  {
    id: 'billing-3',
    caseId: 'case-3',
    agentId: 'agent-2',
    medicalFee: 8000000,
    insuranceCovered: 2000000,
    netAmount: 6000000,
    commissionRate: 0.12,
    commission: 720000,
    paymentStatus: 'pending',
    createdAt: '2024-12-03T11:00:00Z',
    updatedAt: '2024-12-03T11:00:00Z'
  }
]

const mockAgents: Agent[] = [
  {
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
  },
  {
    id: 'agent-2',
    companyName: 'グローバルヘルスケア株式会社',
    contactName: '李 明華',
    email: 'li@global-healthcare.cn',
    phone: '+86-21-8765-4321',
    wechatId: 'li_global',
    contractInfo: {
      commissionRate: 0.12,
      contractStartDate: '2024-03-15',
      contractEndDate: '2026-03-14'
    },
    performance: {
      totalCases: 32,
      completedCases: 28,
      totalRevenue: 89000000,
      averageRating: 4.6
    },
    status: 'active',
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-12-10T14:20:00Z'
  }
]

export default function BillingPage() {
  const { cases } = useCases()
  const [billings, setBillings] = useState<Billing[]>(mockBillings)
  const [agents] = useState<Agent[]>(mockAgents)
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-12')
  const [searchTerm, setSearchTerm] = useState('')

  // 統計計算
  const stats = {
    totalBillings: billings.length,
    totalMedicalFee: billings.reduce((sum, b) => sum + b.medicalFee, 0),
    totalCommission: billings.reduce((sum, b) => sum + b.commission, 0),
    paidCount: billings.filter(b => b.paymentStatus === 'paid').length,
    pendingAmount: billings
      .filter(b => b.paymentStatus !== 'paid')
      .reduce((sum, b) => sum + b.commission, 0)
  }

  // フィルタリング
  const filteredBillings = billings.filter(billing => {
    const matchesAgent = selectedAgent === 'all' || billing.agentId === selectedAgent
    const matchesStatus = selectedStatus === 'all' || billing.paymentStatus === selectedStatus
    const matchesSearch = searchTerm === '' || 
      billing.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.caseId.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesAgent && matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: Billing['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">請求待ち</Badge>
      case 'invoiced':
        return <Badge className="bg-blue-100 text-blue-800">請求済み</Badge>
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">支払済み</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`
  }

  const handleGenerateInvoice = (agentId: string) => {
    // 請求書生成処理
    alert(`エージェント ${agentId} の請求書を生成します`)
  }

  const getCaseInfo = (caseId: string) => {
    const caseData = cases.find(c => c.id === caseId)
    return caseData || null
  }

  const getAgentInfo = (agentId: string) => {
    return agents.find(a => a.id === agentId) || null
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">請求管理</h1>
            <p className="text-gray-600 mt-1">手数料計算と請求書管理</p>
          </div>
          <Button>
            <FileText className="h-5 w-5 mr-2" />
            月次請求書生成
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  総診療費
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalMedicalFee)}</div>
              <p className="text-xs text-gray-500">{stats.totalBillings}件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  総手数料
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalCommission)}
              </div>
              <p className="text-xs text-gray-500">
                平均: {formatCurrency(Math.floor(stats.totalCommission / stats.totalBillings))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  支払済み
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidCount}件</div>
              <p className="text-xs text-gray-500">
                {((stats.paidCount / stats.totalBillings) * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  未収金
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.pendingAmount)}
              </div>
              <p className="text-xs text-gray-500">
                {stats.totalBillings - stats.paidCount}件
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  エージェント数
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
              <p className="text-xs text-gray-500">アクティブ</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex-1">
            <Label htmlFor="search">検索</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="search"
                type="search"
                placeholder="請求書番号、案件IDで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-full lg:w-48">
            <Label htmlFor="agent">エージェント</Label>
            <select
              id="agent"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">すべて</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.companyName}</option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-48">
            <Label htmlFor="status">ステータス</Label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">すべて</option>
              <option value="pending">請求待ち</option>
              <option value="invoiced">請求済み</option>
              <option value="paid">支払済み</option>
            </select>
          </div>

          <div className="w-full lg:w-48">
            <Label htmlFor="month">対象月</Label>
            <Input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        {/* Billing List */}
        <Card>
          <CardHeader>
            <CardTitle>請求一覧</CardTitle>
            <CardDescription>
              診療完了案件の手数料請求状況
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-700">請求書番号</th>
                    <th className="text-left p-4 font-medium text-gray-700">案件情報</th>
                    <th className="text-left p-4 font-medium text-gray-700">エージェント</th>
                    <th className="text-right p-4 font-medium text-gray-700">診療費</th>
                    <th className="text-right p-4 font-medium text-gray-700">手数料</th>
                    <th className="text-center p-4 font-medium text-gray-700">ステータス</th>
                    <th className="text-center p-4 font-medium text-gray-700">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBillings.map((billing) => {
                    const caseInfo = getCaseInfo(billing.caseId)
                    const agentInfo = getAgentInfo(billing.agentId)
                    
                    return (
                      <tr key={billing.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{billing.invoiceNumber || '-'}</p>
                            <p className="text-sm text-gray-500">
                              {billing.invoiceDate ? new Date(billing.invoiceDate).toLocaleDateString('ja-JP') : '未発行'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{caseInfo?.patientName || '不明'}</p>
                            <p className="text-sm text-gray-500">{caseInfo?.treatmentType || '-'}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{agentInfo?.companyName || '不明'}</p>
                            <p className="text-sm text-gray-500">
                              手数料率: {(billing.commissionRate * 100).toFixed(0)}%
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div>
                            <p className="font-medium">{formatCurrency(billing.medicalFee)}</p>
                            {billing.insuranceCovered > 0 && (
                              <p className="text-sm text-gray-500">
                                保険: -{formatCurrency(billing.insuranceCovered)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(billing.commission)}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(billing.paymentStatus)}
                          {billing.paymentDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(billing.paymentDate).toLocaleDateString('ja-JP')}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            {billing.paymentStatus === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={() => handleGenerateInvoice(billing.agentId)}
                              >
                                請求書発行
                              </Button>
                            )}
                            {billing.invoiceNumber && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredBillings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                該当する請求データがありません
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Invoice Summary by Agent */}
        <Card>
          <CardHeader>
            <CardTitle>エージェント別月次請求サマリー</CardTitle>
            <CardDescription>
              {selectedMonth} の請求状況
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents.map(agent => {
                const agentBillings = billings.filter(b => b.agentId === agent.id)
                const totalCommission = agentBillings.reduce((sum, b) => sum + b.commission, 0)
                const paidCommission = agentBillings
                  .filter(b => b.paymentStatus === 'paid')
                  .reduce((sum, b) => sum + b.commission, 0)
                
                if (agentBillings.length === 0) return null

                return (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{agent.companyName}</h4>
                        <p className="text-sm text-gray-500">
                          案件数: {agentBillings.length}件 | 手数料率: {(agent.contractInfo.commissionRate * 100).toFixed(0)}%
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => handleGenerateInvoice(agent.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        請求書生成
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">請求額合計</p>
                        <p className="text-lg font-semibold">{formatCurrency(totalCommission)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">支払済み</p>
                        <p className="text-lg font-semibold text-green-600">{formatCurrency(paidCommission)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">未収金</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {formatCurrency(totalCommission - paidCommission)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}