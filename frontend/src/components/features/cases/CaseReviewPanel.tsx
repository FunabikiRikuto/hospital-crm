'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { CheckCircle, XCircle, FileText, AlertCircle, DollarSign, Calendar, MessageSquare, Download } from 'lucide-react'
import type { Case } from '@/types/case'

interface CaseReviewPanelProps {
  caseData: Case
  onUpdateStatus: (newStatus: string, data?: any) => Promise<void>
  isLoading?: boolean
}

export function CaseReviewPanel({ caseData, onUpdateStatus, isLoading = false }: CaseReviewPanelProps) {
  const [reviewAction, setReviewAction] = useState<'accept' | 'reject' | 'request_info' | null>(null)
  const [comment, setComment] = useState('')
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([])
  const [newDocument, setNewDocument] = useState('')
  const [quote, setQuote] = useState({
    medicalFee: '',
    estimatedDays: '',
    notes: ''
  })

  const handleAddDocument = () => {
    if (newDocument.trim()) {
      setRequiredDocuments([...requiredDocuments, newDocument.trim()])
      setNewDocument('')
    }
  }

  const handleRemoveDocument = (index: number) => {
    setRequiredDocuments(requiredDocuments.filter((_, i) => i !== index))
  }

  const handleSubmitReview = async () => {
    if (!reviewAction) return

    try {
      switch (reviewAction) {
        case 'accept':
          if (!quote.medicalFee || !quote.estimatedDays) {
            alert('見積金額と予定日数を入力してください')
            return
          }
          await onUpdateStatus('accepted', {
            comment,
            quote: {
              medicalFee: parseFloat(quote.medicalFee),
              estimatedDays: parseInt(quote.estimatedDays),
              notes: quote.notes
            }
          })
          break

        case 'reject':
          if (!comment.trim()) {
            alert('拒否理由を入力してください')
            return
          }
          await onUpdateStatus('rejected', { comment })
          break

        case 'request_info':
          if (requiredDocuments.length === 0) {
            alert('必要な書類を少なくとも1つ追加してください')
            return
          }
          await onUpdateStatus('additional_info_required', {
            comment,
            requiredDocuments
          })
          break
      }

      // Reset form
      setReviewAction(null)
      setComment('')
      setRequiredDocuments([])
      setQuote({ medicalFee: '', estimatedDays: '', notes: '' })
    } catch (error) {
      console.error('Review submission error:', error)
    }
  }

  const canReview = ['pending', 'reviewing', 'additional_info_required'].includes(caseData.status)

  if (!canReview) {
    return null
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          案件審査
        </CardTitle>
        <CardDescription>
          この案件の受け入れ可否を判断してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 審査アクション選択 */}
        <div className="space-y-3">
          <Label>審査アクション</Label>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={reviewAction === 'accept' ? 'default' : 'outline'}
              className={reviewAction === 'accept' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={() => setReviewAction('accept')}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              受け入れ
            </Button>
            <Button
              variant={reviewAction === 'request_info' ? 'default' : 'outline'}
              className={reviewAction === 'request_info' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              onClick={() => setReviewAction('request_info')}
              disabled={isLoading}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              情報不足
            </Button>
            <Button
              variant={reviewAction === 'reject' ? 'default' : 'outline'}
              className={reviewAction === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
              onClick={() => setReviewAction('reject')}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              拒否
            </Button>
          </div>
        </div>

        {/* 受け入れの場合：見積情報入力 */}
        {reviewAction === 'accept' && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800">見積情報</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medicalFee">診療費見積（{caseData.currency}）</Label>
                <Input
                  id="medicalFee"
                  type="number"
                  value={quote.medicalFee}
                  onChange={(e) => setQuote({ ...quote, medicalFee: e.target.value })}
                  placeholder="1000000"
                />
              </div>
              <div>
                <Label htmlFor="estimatedDays">治療予定日数</Label>
                <Input
                  id="estimatedDays"
                  type="number"
                  value={quote.estimatedDays}
                  onChange={(e) => setQuote({ ...quote, estimatedDays: e.target.value })}
                  placeholder="7"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="quoteNotes">見積備考</Label>
              <Textarea
                id="quoteNotes"
                value={quote.notes}
                onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
                placeholder="検査費用込み、入院費別途"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* 情報不足の場合：必要書類リスト */}
        {reviewAction === 'request_info' && (
          <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-medium text-orange-800">必要書類・情報</h4>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  placeholder="例：血液検査結果、心電図データ"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDocument()}
                />
                <Button onClick={handleAddDocument} size="sm">追加</Button>
              </div>
              <div className="space-y-1">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-sm">{doc}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 拒否の場合：理由入力 */}
        {reviewAction === 'reject' && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <Label className="text-red-800">拒否理由（必須）</Label>
            <p className="text-sm text-red-600 mb-2">
              エージェントに通知される内容です。丁寧に記載してください。
            </p>
          </div>
        )}

        {/* 共通：コメント入力 */}
        {reviewAction && (
          <div>
            <Label htmlFor="comment">
              {reviewAction === 'reject' ? '拒否理由' : 'コメント'}
              {reviewAction === 'reject' && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                reviewAction === 'accept' 
                  ? '承認に関するコメント（任意）'
                  : reviewAction === 'reject'
                  ? '申し訳ございませんが、現在当院では対応が困難な症例となります。'
                  : '追加情報が必要な理由を記載'
              }
              rows={3}
            />
          </div>
        )}

        {/* 送信ボタン */}
        {reviewAction && (
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setReviewAction(null)
                setComment('')
                setRequiredDocuments([])
                setQuote({ medicalFee: '', estimatedDays: '', notes: '' })
              }}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isLoading}
              className={
                reviewAction === 'accept' 
                  ? 'bg-green-600 hover:bg-green-700'
                  : reviewAction === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {isLoading ? '送信中...' : '審査結果を送信'}
            </Button>
          </div>
        )}

        {/* 添付ファイル一覧 */}
        {caseData.attachments && caseData.attachments.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              添付ファイル
            </h4>
            <div className="space-y-1">
              {caseData.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded hover:bg-gray-100"
                >
                  <span>{attachment.name}</span>
                  <Badge variant="secondary">{attachment.type}</Badge>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}