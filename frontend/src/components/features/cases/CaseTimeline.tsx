'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react'
import type { Case } from '@/types/case'

interface TimelineEvent {
  id: string
  date: string
  type: 'created' | 'status_change' | 'updated' | 'note_added'
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface CaseTimelineProps {
  caseData: Case
}

export function CaseTimeline({ caseData }: CaseTimelineProps) {
  // 実際の実装では、履歴データがあればそれを使用
  // デモ用にモックのタイムラインを生成
  const generateTimeline = (caseData: Case): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        id: '1',
        date: caseData.createdAt || new Date().toISOString(),
        type: 'created',
        title: '案件作成',
        description: `${caseData.patientName}様の案件が作成されました`,
        icon: FileText,
        color: 'text-blue-600'
      }
    ]

    // ステータスに応じて追加のイベントを生成
    if (caseData.status !== 'new') {
      events.push({
        id: '2',
        date: new Date(new Date(caseData.createdAt || new Date()).getTime() + 86400000).toISOString(),
        type: 'status_change',
        title: '審査開始',
        description: '医療機関での審査が開始されました',
        icon: AlertCircle,
        color: 'text-orange-600'
      })
    }

    if (caseData.status === 'confirmed' || caseData.status === 'completed') {
      events.push({
        id: '3',
        date: new Date(new Date(caseData.createdAt || new Date()).getTime() + 172800000).toISOString(),
        type: 'status_change',
        title: '治療確定',
        description: '治療日程が確定しました',
        icon: CheckCircle,
        color: 'text-green-600'
      })
    }

    if (caseData.status === 'completed') {
      events.push({
        id: '4',
        date: new Date(new Date(caseData.preferredDate).getTime() + 86400000).toISOString(),
        type: 'status_change',
        title: '治療完了',
        description: '治療が正常に完了しました',
        icon: CheckCircle,
        color: 'text-purple-600'
      })
    }

    if (caseData.status === 'cancelled') {
      events.push({
        id: '5',
        date: caseData.updatedAt || new Date().toISOString(),
        type: 'status_change',
        title: 'キャンセル',
        description: '案件がキャンセルされました',
        icon: XCircle,
        color: 'text-red-600'
      })
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const timeline = generateTimeline(caseData)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-green-600" />
          案件履歴
        </CardTitle>
        <CardDescription>
          案件の進行状況と更新履歴
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul className="-mb-8">
            {timeline.map((event, eventIdx) => (
              <li key={event.id}>
                <div className="relative pb-8">
                  {eventIdx !== timeline.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          event.type === 'created' ? 'bg-blue-100' :
                          event.type === 'status_change' ? 'bg-green-100' :
                          event.type === 'updated' ? 'bg-yellow-100' :
                          'bg-gray-100'
                        }`}
                      >
                        <event.icon className={`h-4 w-4 ${event.color}`} aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-gray-500">{event.description}</p>
                        )}
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={event.date}>
                          {new Date(event.date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}