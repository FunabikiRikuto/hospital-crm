'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Briefcase, Plus, Clock, User, Building, Search, Filter, Download, Eye, Edit3, Loader2, Globe, Phone, UserCheck, AlertTriangle, DollarSign, Calendar } from 'lucide-react'
import { filterCases, getCaseStats } from '@/data/mockCases'
import type { Case } from '@/types/case'
import { useCases } from '@/hooks/useCases'
import { exportCasesToCSV, exportStatsToCSV } from '@/lib/export'

export default function CasesPage() {
  const { cases: allCases, isLoading: casesLoading, error: casesError } = useCases()
  const [cases, setCases] = useState<Case[]>([])
  const [stats, setStats] = useState({ 
    total: 0, 
    new: 0, 
    information_needed: 0,
    under_review: 0, 
    confirmed: 0, 
    completed: 0, 
    cancelled: 0 
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('')

  // 案件データをフィルタリング
  const fetchCases = useCallback(() => {
    try {
      setIsLoading(true)
      setError('')
      
      if (casesError) {
        setError(typeof casesError === 'string' ? casesError : casesError.message)
        setIsLoading(false)
        return
      }
      
      // フィルタリング
      const filteredData = filterCases(allCases, searchTerm, statusFilter, urgencyFilter, departmentFilter)
        .filter(caseItem => !nationalityFilter || caseItem.nationality === nationalityFilter)
      const statsData = getCaseStats(filteredData)
      
      setCases(filteredData)
      setStats({
        total: statsData.total,
        new: statsData.byStatus.new,
        information_needed: statsData.byStatus.information_needed,
        under_review: statsData.byStatus.under_review,
        confirmed: statsData.byStatus.confirmed,
        completed: statsData.byStatus.completed,
        cancelled: statsData.byStatus.cancelled
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }, [allCases, casesError, searchTerm, statusFilter, urgencyFilter, departmentFilter, nationalityFilter])

  // 初回読み込みとデータ変更時の更新
  useEffect(() => {
    if (!casesLoading) {
      fetchCases()
    }
  }, [fetchCases, casesLoading])

  // フィルタ変更時の検索（デバウンス）
  useEffect(() => {
    if (!casesLoading) {
      const debounceTimer = setTimeout(() => {
        fetchCases()
      }, 300)

      return () => clearTimeout(debounceTimer)
    }
  }, [fetchCases, casesLoading])

  // ステータスバッジのスタイル
  const getStatusBadge = (status: Case['status']) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">新規</Badge>
      case 'information_needed':
        return <Badge className="bg-orange-100 text-orange-800">情報不足</Badge>
      case 'under_review':
        return <Badge className="bg-yellow-100 text-yellow-800">審査中</Badge>
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">確定</Badge>
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800">完了</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">キャンセル</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // 緊急度バッジのスタイル
  const getUrgencyBadge = (urgency: Case['urgency']) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 flex items-center"><AlertTriangle className="h-3 w-3 mr-1" />高</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">中</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">低</Badge>
      default:
        return <Badge>{urgency}</Badge>
    }
  }

  // 金額フォーマット
  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${amount.toLocaleString()}`
    } else if (currency === 'USD') {
      return `$${amount.toLocaleString()}`
    } else if (currency === 'CNY') {
      return `¥${amount.toLocaleString()}`
    } else if (currency === 'KRW') {
      return `₩${amount.toLocaleString()}`
    }
    return `${amount.toLocaleString()} ${currency}`
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">医療ツーリズム案件管理</h1>
            <p className="text-gray-600">外国人患者の診療案件を一元管理</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => exportCasesToCSV(cases, 'medical-tourism-cases')}
            >
              <Download className="h-4 w-4 mr-2" />
              CSVエクスポート
            </Button>
            <Link href="/cases/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規案件作成
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              statusFilter === '' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter('')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総案件数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              statusFilter === 'new' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter('new')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">新規</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              statusFilter === 'information_needed' ? 'ring-2 ring-orange-500' : ''
            }`}
            onClick={() => setStatusFilter('information_needed')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">情報不足</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.information_needed}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              statusFilter === 'under_review' ? 'ring-2 ring-yellow-500' : ''
            }`}
            onClick={() => setStatusFilter('under_review')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">審査中</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.under_review}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              statusFilter === 'confirmed' ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => setStatusFilter('confirmed')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">確定</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              statusFilter === 'completed' ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setStatusFilter('completed')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">完了</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              statusFilter === 'cancelled' ? 'ring-2 ring-gray-500' : ''
            }`}
            onClick={() => setStatusFilter('cancelled')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">キャンセル</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
                </div>
                <Building className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  検索
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="患者名、治療内容、エージェント名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="min-w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">全て</option>
                  <option value="new">新規</option>
                  <option value="information_needed">情報不足</option>
                  <option value="under_review">審査中</option>
                  <option value="confirmed">確定</option>
                  <option value="completed">完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>

              <div className="min-w-24">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  緊急度
                </label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">全て</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>

              <div className="min-w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  国籍
                </label>
                <select
                  value={nationalityFilter}
                  onChange={(e) => setNationalityFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">全て</option>
                  <option value="中国">中国</option>
                  <option value="韓国">韓国</option>
                  <option value="台湾">台湾</option>
                  <option value="ベトナム">ベトナム</option>
                  <option value="タイ">タイ</option>
                </select>
              </div>

              <div className="min-w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  診療科
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">全て</option>
                  <option value="内科">内科</option>
                  <option value="外科">外科</option>
                  <option value="心臓外科">心臓外科</option>
                  <option value="美容外科">美容外科</option>
                  <option value="整形外科">整形外科</option>
                  <option value="産婦人科">産婦人科</option>
                  <option value="循環器内科">循環器内科</option>
                  <option value="消化器内科">消化器内科</option>
                </select>
              </div>

              <Button variant="outline" className="min-w-24">
                <Download className="h-4 w-4 mr-2" />
                エクスポート
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <Card>
          <CardHeader>
            <CardTitle>案件一覧</CardTitle>
            <CardDescription>
              {cases.length}件の案件が見つかりました
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">読み込み中...</span>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-8">{error}</div>
            ) : cases.length === 0 ? (
              <div className="text-gray-500 text-center py-8">案件が見つかりません</div>
            ) : (
              <div className="space-y-4">
                {cases.map((caseItem) => (
                  <Link key={caseItem.id} href={`/cases/${caseItem.id}`} passHref>
                    <div className="border rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {caseItem.patientName}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{caseItem.nationality}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(caseItem.status)}
                            {getUrgencyBadge(caseItem.urgency)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">治療内容</p>
                            <p className="font-medium">{caseItem.treatmentType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">病院・診療科</p>
                            <p className="font-medium">{caseItem.hospitalName}</p>
                            <p className="text-sm text-gray-600">{caseItem.department}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">希望日</p>
                            <p className="font-medium">{new Date(caseItem.preferredDate).toLocaleDateString('ja-JP')}</p>
                            {caseItem.confirmedDate && (
                              <p className="text-sm text-green-600">
                                確定: {new Date(caseItem.confirmedDate).toLocaleDateString('ja-JP')}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">金額</p>
                            <p className="font-medium">{formatAmount(caseItem.estimatedAmount, caseItem.currency)}</p>
                            {caseItem.confirmedAmount && caseItem.confirmedAmount !== caseItem.estimatedAmount && (
                              <p className="text-sm text-blue-600">
                                確定: {formatAmount(caseItem.confirmedAmount, caseItem.currency)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          {caseItem.agentName && (
                            <div>
                              <p className="text-sm text-gray-500">エージェント</p>
                              <p className="font-medium">{caseItem.agentName}</p>
                              <p className="text-sm text-gray-600">{caseItem.agentCompany}</p>
                            </div>
                          )}
                          {caseItem.wechatId && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">WeChat: {caseItem.wechatId}</span>
                            </div>
                          )}
                          {caseItem.assignedTo && (
                            <div>
                              <p className="text-sm text-gray-500">担当者</p>
                              <p className="font-medium">{caseItem.assignedTo}</p>
                            </div>
                          )}
                        </div>

                        {caseItem.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500">症状・詳細</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{caseItem.description}</p>
                          </div>
                        )}

                        {caseItem.requirements && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500">要求・必要資料</p>
                            <p className="text-sm text-orange-600">{caseItem.requirements}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>作成日: {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString('ja-JP') : '不明'}</span>
                          <span>更新日: {caseItem.updatedAt ? new Date(caseItem.updatedAt).toLocaleDateString('ja-JP') : '不明'}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/cases/${caseItem.id}/edit`;
                          }}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          編集
                        </Button>
                      </div>
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}