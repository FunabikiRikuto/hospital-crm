'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Users, Plus, Search, Filter, Building, Phone, Mail, MessageSquare, TrendingUp, Star, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import type { Agent } from '@/types/agent'

// モックデータ
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
  },
  {
    id: 'agent-3',
    companyName: 'メディカルブリッジ有限公司',
    contactName: '王 芳',
    email: 'wang@medical-bridge.hk',
    phone: '+852-2345-6789',
    wechatId: 'wang_mb',
    contractInfo: {
      commissionRate: 0.18,
      contractStartDate: '2023-06-01',
      contractEndDate: '2024-05-31'
    },
    performance: {
      totalCases: 15,
      completedCases: 12,
      totalRevenue: 35000000,
      averageRating: 4.3
    },
    status: 'inactive',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-06-01T09:00:00Z'
  }
]

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = searchTerm === '' || 
      agent.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">アクティブ</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">非アクティブ</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">停止中</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">エージェント管理</h1>
            <p className="text-gray-600 mt-1">提携エージェントの管理と実績確認</p>
          </div>
          <Link href="/agents/new">
            <Button>
              <Plus className="h-5 w-5 mr-2" />
              新規エージェント登録
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  総エージェント数
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
              <p className="text-xs text-gray-500">
                アクティブ: {agents.filter(a => a.status === 'active').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  総案件数
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agents.reduce((sum, agent) => sum + agent.performance.totalCases, 0)}
              </div>
              <p className="text-xs text-gray-500">
                完了: {agents.reduce((sum, agent) => sum + agent.performance.completedCases, 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  総売上高
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(agents.reduce((sum, agent) => sum + agent.performance.totalRevenue, 0))}
              </div>
              <p className="text-xs text-gray-500">全エージェント合計</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  平均評価
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(agents.reduce((sum, agent) => sum + agent.performance.averageRating, 0) / agents.length).toFixed(1)}
              </div>
              <p className="text-xs text-gray-500">5段階評価</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="会社名、担当者名、メールアドレスで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              すべて
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              アクティブ
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('inactive')}
            >
              非アクティブ
            </Button>
          </div>
        </div>

        {/* Agent List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center">
                      <Building className="h-5 w-5 mr-2 text-gray-600" />
                      {agent.companyName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      担当: {agent.contactName}
                    </CardDescription>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {agent.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {agent.phone}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WeChat: {agent.wechatId}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    契約: {new Date(agent.contractInfo.contractStartDate).getFullYear()}年〜
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">案件実績</p>
                      <p className="text-lg font-semibold">
                        {agent.performance.completedCases}/{agent.performance.totalCases}件
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{width: `${(agent.performance.completedCases / agent.performance.totalCases) * 100}%`}}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">売上高</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(agent.performance.totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        手数料率: {(agent.contractInfo.commissionRate * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-semibold">{agent.performance.averageRating.toFixed(1)}</span>
                    <span className="ml-1 text-sm text-gray-500">/ 5.0</span>
                  </div>
                  <Link href={`/agents/${agent.id}`}>
                    <Button variant="outline" size="sm">
                      詳細を見る
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">該当するエージェントが見つかりません</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  )
}