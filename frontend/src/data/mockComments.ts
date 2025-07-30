import { Comment } from '@/types/comment'

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    caseId: 'case-mt-001',
    userId: 'user-1',
    userName: '田中太郎',
    userRole: 'hospital',
    content: '患者様の診療履歴を確認しました。心臓手術の経験がある方なので、事前に循環器内科との連携が必要です。',
    isInternal: true,
    createdAt: '2025-01-10T10:30:00Z'
  },
  {
    id: 'comment-2',
    caseId: 'case-mt-001',
    userId: 'agent-1',
    userName: '李華',
    userRole: 'agent',
    content: '患者様から追加の検査結果を受け取りました。WeChat経由で画像を送信します。',
    isInternal: false,
    createdAt: '2025-01-10T14:20:00Z'
  },
  {
    id: 'comment-3',
    caseId: 'case-mt-002',
    userId: 'user-2',
    userName: '佐藤花子',
    userRole: 'hospital',
    content: '美容外科の山田先生と相談済み。手術日程は2月15日で確定可能です。',
    isInternal: false,
    createdAt: '2025-01-12T09:00:00Z'
  },
  {
    id: 'comment-4',
    caseId: 'case-mt-002',
    userId: 'user-1',
    userName: '田中太郎',
    userRole: 'hospital',
    content: '患者様のアレルギー情報について、詳細確認が必要。ペニシリン系の薬剤は避ける必要があります。',
    isInternal: true,
    createdAt: '2025-01-12T11:30:00Z'
  },
  {
    id: 'comment-5',
    caseId: 'case-mt-003',
    userId: 'agent-2',
    userName: '王明',
    userRole: 'agent',
    content: '患者様が来日日程を1週間延期したいとのことです。可能でしょうか？',
    isInternal: false,
    createdAt: '2025-01-13T15:45:00Z'
  }
]