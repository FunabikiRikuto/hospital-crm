'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FileText, ClipboardList, MessageSquare } from 'lucide-react'
import type { Case } from '@/types/case'

interface CaseDetailInfoProps {
  caseData: Case
}

export function CaseDetailInfo({ caseData }: CaseDetailInfoProps) {
  return (
    <div className="space-y-6">
      {/* 治療内容詳細 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            治療内容詳細
          </CardTitle>
          <CardDescription>
            症例の詳細情報
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {caseData.description || '詳細情報がありません'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 特別な要求事項 */}
      {caseData.requirements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
              特別な要求・希望
            </CardTitle>
            <CardDescription>
              患者からの特別な要望事項
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                {caseData.requirements}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 医療情報 */}
      {(caseData.allergies || caseData.medicalHistory) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="h-5 w-5 mr-2 text-red-600" />
              医療情報
            </CardTitle>
            <CardDescription>
              アレルギー・既往歴情報
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.allergies && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">アレルギー情報</h4>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm text-red-800 whitespace-pre-wrap">
                    {caseData.allergies}
                  </p>
                </div>
              </div>
            )}
            {caseData.medicalHistory && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">既往歴</h4>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                    {caseData.medicalHistory}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 内部メモ */}
      {caseData.hospitalNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-orange-600" />
              病院内部メモ
            </CardTitle>
            <CardDescription>
              スタッフ間での共有事項
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-800 whitespace-pre-wrap">
                {caseData.hospitalNotes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 拒否理由 */}
      {caseData.rejectionReason && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
              キャンセル・拒否理由
            </CardTitle>
            <CardDescription>
              案件がキャンセルまたは拒否された理由
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-800 whitespace-pre-wrap">
                {caseData.rejectionReason}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 添付ファイル */}
      {caseData.attachments && caseData.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              添付ファイル
            </CardTitle>
            <CardDescription>
              患者から提供された書類・検査結果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {caseData.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-xs text-gray-500">
                        {attachment.type === 'medical_record' ? '医療記録' : 
                         attachment.type === 'passport' ? 'パスポート' : 'その他'} • 
                        {new Date(attachment.uploadedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    ダウンロード
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}