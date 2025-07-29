'use client'

import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Users, Briefcase, TrendingUp, Clock, Globe, AlertTriangle, DollarSign, Calendar, UserCheck, Building, Download } from 'lucide-react'
import { getCaseStats, getUrgencyStats, getNationalityStats, getDepartmentStats } from '@/data/mockCases'
import { useCases } from '@/hooks/useCases'
import { useI18n } from '@/hooks/useI18n'
import { exportStatsToCSV } from '@/lib/export'

export default function Home() {
  const { cases, isLoading } = useCases()
  const { t } = useI18n()
  
  // 医療ツーリズム統計を計算
  const caseStats = getCaseStats(cases)
  const urgencyStats = getUrgencyStats(cases)
  const nationalityStats = getNationalityStats(cases)
  const departmentStats = getDepartmentStats(cases)
  
  // 進行中案件数（新規、情報不足、審査中、確定）
  const activeCases = caseStats.byStatus.new + caseStats.byStatus.information_needed + 
                     caseStats.byStatus.under_review + caseStats.byStatus.confirmed
  
  // 月間収益（完了案件の合計）
  const monthlyRevenue = caseStats.monthlyRevenue
  
  // 完了率
  const completionRate = caseStats.completionRate
  
  // 緊急案件数
  const urgentCasesCount = urgencyStats.high
  
  const stats = [
    {
      title: '総案件数',
      value: caseStats.total.toString(),
      description: `進行中: ${activeCases}件`,
      icon: Briefcase,
      color: 'text-blue-600',
    },
    {
      title: '今月の収益',
      value: monthlyRevenue > 0 ? `¥${(monthlyRevenue / 1000000).toFixed(1)}M` : '¥0',
      description: `完了案件: ${caseStats.byStatus.completed}件`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: '完了率',
      value: `${completionRate.toFixed(1)}%`,
      description: `平均金額: ¥${(caseStats.averageAmount / 10000).toFixed(0)}万`,
      icon: DollarSign,
      color: 'text-purple-600',
    },
    {
      title: '緊急案件',
      value: urgentCasesCount.toString(),
      description: urgentCasesCount > 0 ? '要対応' : '問題なし',
      icon: AlertTriangle,
      color: urgentCasesCount > 0 ? 'text-red-600' : 'text-gray-600',
    },
  ]
  
  // 最新の案件を取得（作成日時でソート）
  const recentCases = [...cases]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">医療ツーリズム ダッシュボード</h1>
            <p className="text-gray-600">外国人患者の案件管理と収益状況</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => exportStatsToCSV(caseStats, '医療ツーリズム統計')}
            >
              <Download className="h-4 w-4 mr-2" />
              統計エクスポート
            </Button>
            <Link href="/cases">
              <Button variant="outline">
                <Briefcase className="h-4 w-4 mr-2" />
                案件一覧
              </Button>
            </Link>
            <Link href="/cases/new">
              <Button>
                <UserCheck className="h-4 w-4 mr-2" />
                新規案件作成
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{stat.description}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Cases and Urgent Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                最新の案件
              </CardTitle>
              <CardDescription>
                最近登録された医療ツーリズム案件
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-gray-500 py-4">読み込み中...</p>
              ) : recentCases.length === 0 ? (
                <p className="text-center text-gray-500 py-4">案件がありません</p>
              ) : (
                <div className="space-y-3">
                  {recentCases.map((case_) => (
                    <div key={case_.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-gray-900">{case_.patientName}</p>
                            <p className="text-sm text-gray-600">{case_.treatmentType}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Globe className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{case_.nationality}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                ¥{(case_.estimatedAmount / 10000).toFixed(0)}万
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {case_.urgency === 'high' && (
                          <Badge className="bg-red-100 text-red-800">緊急</Badge>
                        )}
                        {case_.status === 'new' && (
                          <Badge className="bg-blue-100 text-blue-800">新規</Badge>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(case_.createdAt || 0).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link href="/cases">
                  <Button variant="outline" className="w-full">
                    全ての案件を表示
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Urgent Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                緊急対応案件
              </CardTitle>
              <CardDescription>
                {urgentCasesCount > 0 ? `${urgentCasesCount}件の緊急案件があります` : '緊急案件はありません'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {urgentCasesCount === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">現在、緊急対応が必要な案件はありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cases
                    .filter(c => c.urgency === 'high')
                    .slice(0, 5)
                    .map((case_) => (
                      <div key={case_.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{case_.patientName}</p>
                          <p className="text-sm text-gray-600">{case_.treatmentType}</p>
                          <p className="text-xs text-red-600 mt-1">
                            希望日: {new Date(case_.preferredDate).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">{case_.status}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Nationality and Department Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nationality Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                国籍別案件数
              </CardTitle>
              <CardDescription>
                外国人患者の国籍別分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(nationalityStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([nationality, count]) => (
                    <div key={nationality} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{nationality}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / caseStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}件</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                診療科別案件数
              </CardTitle>
              <CardDescription>
                医療分野別の案件分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(departmentStats)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([department, count]) => (
                    <div key={department} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{department}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(count / caseStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}件</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}
