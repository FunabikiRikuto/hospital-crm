'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Users, Briefcase, TrendingUp, Clock, Globe, AlertTriangle, DollarSign, Calendar, UserCheck, Building, Download } from 'lucide-react'
import { getCaseStats, getUrgencyStats, getNationalityStats, getDepartmentStats } from '@/data/mockCases'
import { useCases } from '@/hooks/useCases'
import { useI18n } from '@/hooks/useI18n'
import { exportStatsToCSV } from '@/lib/export'

export default function Dashboard() {
  const router = useRouter()
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
      color: urgentCasesCount > 0 ? 'text-red-600' : 'text-orange-600',
    },
  ]

  // 最新の案件を5件取得
  const recentCases = cases
    .filter(c => c.createdAt) // Filter out cases without createdAt
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5)
  
  // 緊急案件を抽出
  const urgentCases = cases
    .filter(c => c.urgency === 'high' && ['new', 'information_needed', 'under_review'].includes(c.status))
    .filter(c => c.preferredDate) // Filter out cases without preferredDate
    .sort((a, b) => new Date(a.preferredDate!).getTime() - new Date(b.preferredDate!).getTime())
    .slice(0, 3)
  
  // 国籍別案件数（上位5カ国）
  const topNationalities = Object.entries(nationalityStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
  
  // 診療科別案件数（上位5診療科）
  const topDepartments = Object.entries(departmentStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
  
  // ステータスバッジ用の関数
  const getStatusBadge = (status: string) => {
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
  
  // 金額フォーマット
  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${(amount / 10000).toFixed(0)}万`
    } else if (currency === 'USD') {
      return `$${amount.toLocaleString()}`
    } else if (currency === 'CNY') {
      return `¥${amount.toLocaleString()}`
    }
    return `${amount.toLocaleString()} ${currency}`
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Clock className="h-8 w-8 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">{t('loading')}</span>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">医療ツーリズム ダッシュボード</h1>
            <p className="text-gray-600">外国人患者の案件管理と収益状況</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => exportStatsToCSV(caseStats, 'dashboard-stats')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                最新の案件
              </CardTitle>
              <CardDescription>
                最近登録された医療ツーリズム案件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCases.map((caseItem) => (
                  <div 
                    key={caseItem.id} 
                    onClick={() => router.push(`/cases/${caseItem.id}`)}
                    className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{caseItem.patientName}</p>
                          <p className="text-sm text-gray-500">{caseItem.treatmentType}</p>
                          <p className="text-xs text-gray-400">{caseItem.nationality} • {formatAmount(caseItem.estimatedAmount, caseItem.currency)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(caseItem.status)}
                        <p className="text-sm text-gray-500 mt-1">{caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString('ja-JP') : '不明'}</p>
                      </div>
                    </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
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
                {urgentCases.length > 0 ? `${urgentCases.length}件の緊急案件があります` : '緊急案件はありません'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {urgentCases.length > 0 ? (
                <div className="space-y-4">
                  {urgentCases.map((caseItem) => (
                    <div 
                      key={caseItem.id} 
                      onClick={() => router.push(`/cases/${caseItem.id}`)}
                      className="flex items-center justify-between p-4 border border-red-200 rounded-md bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{caseItem.patientName}</p>
                            <p className="text-sm text-gray-600">{caseItem.treatmentType}</p>
                            <p className="text-xs text-red-600">希望日: {caseItem.preferredDate ? new Date(caseItem.preferredDate).toLocaleDateString('ja-JP') : '不明'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(caseItem.status)}
                          <Badge className="bg-red-100 text-red-800 mt-1">緊急</Badge>
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>現在、緊急対応が必要な案件はありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nationality Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-green-600" />
                国籍別案件数
              </CardTitle>
              <CardDescription>
                外国人患者の国籍別分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topNationalities.map(([nationality, count]) => (
                  <div key={nationality} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Globe className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">{nationality}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{count}件</Badge>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(count / caseStats.total) * 100}%` }}
                        ></div>
                      </div>
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
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                診療科別案件数
              </CardTitle>
              <CardDescription>
                医療分野別の案件分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDepartments.map(([department, count]) => (
                  <div key={department} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Building className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium">{department}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{count}件</Badge>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(count / caseStats.total) * 100}%` }}
                        ></div>
                      </div>
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