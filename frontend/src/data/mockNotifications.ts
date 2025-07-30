import { Notification } from '@/types/notification'
import { v4 as uuidv4 } from 'uuid'

export const mockNotifications: Notification[] = [
  {
    id: uuidv4(),
    userId: 'user-1',
    caseId: 'case-001', // 実際のケースIDに置き換えられる
    type: 'new_case',
    title: '新規案件登録',
    message: '新しい案件「陈志明」が登録されました',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2時間前
    metadata: {
      caseName: '陈志明',
      caseStatus: 'new',
      wechatSent: true
    }
  },
  {
    id: uuidv4(),
    userId: 'user-1',
    caseId: 'case-002',
    type: 'status_change',
    title: '審査開始',
    message: '案件「刘文静」の審査を開始しました',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1時間前
    metadata: {
      caseName: '刘文静',
      caseStatus: 'under_review',
      wechatSent: true
    }
  },
  {
    id: uuidv4(),
    userId: 'user-1',
    caseId: 'case-003',
    type: 'info_request',
    title: '追加情報要求',
    message: '案件「赵明珠」に追加情報が必要です（心電図データ、最新の血液検査結果）',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分前
    metadata: {
      caseName: '赵明珠',
      caseStatus: 'information_needed',
      wechatSent: true
    }
  },
  {
    id: uuidv4(),
    userId: 'user-1',
    caseId: 'case-004',
    type: 'appointment_confirmed',
    title: '予約確定',
    message: '案件「张伟民」が承認されました',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3日前
    metadata: {
      caseName: '张伟民',
      caseStatus: 'confirmed',
      wechatSent: true
    }
  },
  {
    id: uuidv4(),
    userId: 'user-1',
    caseId: 'case-005',
    type: 'comment',
    title: 'コメント追加',
    message: 'エージェントから案件「王雅文」に新しいコメントがあります',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15分前
    metadata: {
      caseName: '王雅文',
      caseStatus: 'confirmed'
    }
  }
]