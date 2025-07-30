'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { CaseBasicInfo } from '@/components/features/cases/CaseBasicInfo'
import { CaseDetailInfo } from '@/components/features/cases/CaseDetailInfo'
import { CaseTimeline } from '@/components/features/cases/CaseTimeline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Edit3, User, FileText, Calendar, Loader2, Globe, Users, MessageSquare, Phone, AlertTriangle, DollarSign, Building, UserCheck, Download } from 'lucide-react'
import { useCases } from '@/hooks/useCases'
import { useI18n } from '@/hooks/useI18n'
import { exportPatientDetailToCSV } from '@/lib/export'
import { CommentSection } from '@/components/comments/CommentSection'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { useChatUnread } from '@/hooks/useChatUnread'
import type { Case } from '@/types/case'

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { updateCaseStatus } = useCases()
  const { t } = useI18n()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  

  const caseId = params.id as string
  const unreadCount = useChatUnread(caseId)

  // 案件ステータス更新関数
  const handleUpdateStatus = async (newStatus: string, reason?: string) => {
    try {
      setIsLoading(true)
      
      const updatedCase = await updateCaseStatus(caseId, newStatus as Case['status'], reason)
      setCaseData(updatedCase)
      
      alert(t('messages.statusUpdated', { status: t(`status.${newStatus}`) }))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('error'))
    } finally {
      setIsLoading(false)
    }
  }

  // 審査開始
  const handleStartReview = () => {
    if (confirm(t('messages.confirmStartReview'))) {
      handleUpdateStatus('under_review')
    }
  }

  // 受入承認
  const handleApprove = () => {
    if (confirm(t('messages.confirmApprove'))) {
      handleUpdateStatus('confirmed')
    }
  }

  // 案件拒否
  const handleReject = () => {
    const reason = prompt(t('messages.enterRejectionReason'))
    if (reason && reason.trim()) {
      handleUpdateStatus('cancelled', reason.trim())
    }
  }

  // 追加資料要求
  const handleRequestInfo = () => {
    const requirements = prompt(t('messages.enterRequiredDocuments'))
    if (requirements && requirements.trim()) {
      handleUpdateStatus('information_needed', requirements.trim())
    }
  }

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setIsLoading(true)
        setError('')

        // ストレージから該当する案件を検索
        const { getCaseFromStorage } = await import('@/lib/storage')
        const foundCase = getCaseFromStorage(caseId)
        
        if (!foundCase) {
          throw new Error(t('messages.caseNotFound'))
        }
        
        setCaseData(foundCase)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error'))
      } finally {
        setIsLoading(false)
      }
    }

    if (caseId) {
      fetchCaseData()
    }
  }, [caseId]) // tを依存配列から削除

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

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
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      </ProtectedLayout>
    )
  }

  if (error || !caseData) {
    return (
      <ProtectedLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/cases">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || '案件が見つかりません'}
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/cases">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{caseData.patientName}</h1>
              <p className="text-lg text-gray-600">{caseData.treatmentType}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{caseData.nationality}</span>
                </div>
                <Badge className={getStatusColor(caseData.status)}>
                  {getStatusText(caseData.status)}
                </Badge>
                <Badge className={getUrgencyColor(caseData.urgency)}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {getUrgencyText(caseData.urgency)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => exportPatientDetailToCSV(caseData)}
            >
              <Download className="h-4 w-4 mr-2" />
              患者詳細CSV
            </Button>
            <Link href={`/cases/${caseData.id}/edit`}>
              <Button>
                <Edit3 className="h-4 w-4 mr-2" />
                編集
              </Button>
            </Link>
            <Button 
              variant="outline"
              onClick={() => {
                setIsChatOpen(prev => !prev);
              }}
              className="relative"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              チャット
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
            {caseData.status === 'new' && (
              <Button 
                variant="outline" 
                className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                onClick={handleStartReview}
                disabled={isLoading}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                審査開始
              </Button>
            )}
            {caseData.status === 'information_needed' && (
              <Button 
                variant="outline" 
                className="bg-orange-50 hover:bg-orange-100 text-orange-700"
                onClick={handleRequestInfo}
                disabled={isLoading}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                追加資料要求
              </Button>
            )}
            {caseData.status === 'under_review' && (
              <>
                <Button 
                  variant="outline" 
                  className="bg-green-50 hover:bg-green-100 text-green-700"
                  onClick={handleApprove}
                  disabled={isLoading}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  受入承認
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-red-50 hover:bg-red-100 text-red-700"
                  onClick={handleReject}
                  disabled={isLoading}
                >
                  拒否
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メイン情報 */}
          <div className="lg:col-span-2 space-y-6">
            <CaseBasicInfo caseData={caseData} />
            <CaseDetailInfo caseData={caseData} />
            <CommentSection caseId={caseData.id!} />
            <CaseTimeline caseData={caseData} />
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 患者情報サマリー */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  患者情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">患者名</span>
                    <span className="text-sm font-medium text-gray-900">{caseData.patientName}</span>
                  </div>
                  {caseData.patientNameOriginal && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">原語名</span>
                      <span className="text-sm font-medium text-gray-900">{caseData.patientNameOriginal}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">年齢・性別</span>
                    <span className="text-sm font-medium text-gray-900">
                      {caseData.age}歳 {caseData.gender === 'male' ? '男性' : caseData.gender === 'female' ? '女性' : 'その他'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">国籍</span>
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{caseData.nationality}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">パスポート</span>
                    <span className="text-sm font-medium text-gray-900">{caseData.passportNumber}</span>
                  </div>
                  {caseData.companions && caseData.companions > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">同行者</span>
                      <span className="text-sm font-medium text-gray-900">{caseData.companions}名</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 金額情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  金額情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">
                    {formatAmount(caseData.estimatedAmount, caseData.currency)}
                  </div>
                  <div className="text-sm text-gray-600">予想金額</div>
                </div>
                {caseData.confirmedAmount && (
                  <div className="text-center p-3 bg-blue-50 rounded-md">
                    <div className="text-lg font-bold text-blue-600">
                      {formatAmount(caseData.confirmedAmount, caseData.currency)}
                    </div>
                    <div className="text-sm text-gray-600">確定金額</div>
                  </div>
                )}
                {caseData.commissionRate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">手数料率</span>
                    <span className="font-medium">{(caseData.commissionRate * 100).toFixed(1)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* エージェント情報 */}
            {caseData.agentName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    エージェント情報
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">担当者</span>
                    <span className="text-sm font-medium text-gray-900">{caseData.agentName}</span>
                  </div>
                  {caseData.agentCompany && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">会社</span>
                      <span className="text-sm font-medium text-gray-900">{caseData.agentCompany}</span>
                    </div>
                  )}
                  {caseData.wechatId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">WeChat</span>
                      <span className="text-sm font-medium text-gray-900">{caseData.wechatId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 関連アクション */}
            <Card>
              <CardHeader>
                <CardTitle>関連アクション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  チャット
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  見積書生成
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  書類ダウンロード
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  スケジュール調整
                </Button>
                {caseData.status !== 'completed' && caseData.status !== 'cancelled' && (
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                    案件キャンセル
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 案件メタ情報 */}
            <Card>
              <CardHeader>
                <CardTitle>案件情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">案件ID</span>
                  <span className="text-sm font-medium text-gray-900">#{caseData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">作成日</span>
                  <span className="text-sm font-medium text-gray-900">{caseData.createdAt ? formatDate(caseData.createdAt) : '不明'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">最終更新</span>
                  <span className="text-sm font-medium text-gray-900">{caseData.updatedAt ? formatDate(caseData.updatedAt) : '不明'}</span>
                </div>
                {caseData.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">担当者</span>
                    <span className="text-sm font-medium text-gray-900">{caseData.assignedTo}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Chat Panel */}
      {caseData && (
        <ChatPanel 
          caseData={caseData}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </ProtectedLayout>
  )
}