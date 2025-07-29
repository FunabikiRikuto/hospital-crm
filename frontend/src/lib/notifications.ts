import { Case } from '@/types/case'

// 通知タイプ
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  caseId?: string
}

const STORAGE_KEY = 'medical-tourism-notifications'
const MAX_NOTIFICATIONS = 100

// 通知をローカルストレージから取得
export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const notifications = JSON.parse(stored)
    return Array.isArray(notifications) ? notifications : []
  } catch (error) {
    console.error('Failed to load notifications:', error)
    return []
  }
}

// 通知をローカルストレージに保存
export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  
  try {
    // 最新の通知のみ保持
    const limitedNotifications = notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX_NOTIFICATIONS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedNotifications))
  } catch (error) {
    console.error('Failed to save notifications:', error)
  }
}

// 新しい通知を追加
export function addNotification(
  type: NotificationType,
  title: string,
  message: string,
  caseId?: string
): void {
  const notification: Notification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    caseId
  }
  
  const notifications = getNotifications()
  notifications.unshift(notification)
  saveNotifications(notifications)
  
  // ブラウザ通知を表示（権限がある場合）
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    })
  }
}

// 通知を既読にする
export function markAsRead(notificationId: string): void {
  const notifications = getNotifications()
  const notification = notifications.find(n => n.id === notificationId)
  
  if (notification) {
    notification.read = true
    saveNotifications(notifications)
  }
}

// 全ての通知を既読にする
export function markAllAsRead(): void {
  const notifications = getNotifications()
  notifications.forEach(notification => {
    notification.read = true
  })
  saveNotifications(notifications)
}

// 通知を削除
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications()
  const filteredNotifications = notifications.filter(n => n.id !== notificationId)
  saveNotifications(filteredNotifications)
}

// 古い通知をクリーンアップ（7日以上前）
export function cleanupOldNotifications(): void {
  const notifications = getNotifications()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const filteredNotifications = notifications.filter(notification => 
    new Date(notification.timestamp) > sevenDaysAgo
  )
  
  saveNotifications(filteredNotifications)
}

// ブラウザ通知の許可を要求
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied')
  }
  
  if (Notification.permission === 'granted') {
    return Promise.resolve('granted')
  }
  
  if (Notification.permission !== 'denied') {
    return Notification.requestPermission()
  }
  
  return Promise.resolve('denied')
}

// 案件関連の通知を生成
export function notifyCaseCreated(caseData: Case): void {
  addNotification(
    'success',
    '新規案件が作成されました',
    `患者: ${caseData.patientName} (${caseData.treatmentType})`,
    caseData.id
  )
}

export function notifyCaseStatusChanged(caseData: Case, oldStatus: string, newStatus: string): void {
  const statusLabels: Record<string, string> = {
    'new': '新規',
    'information_needed': '情報不足',
    'under_review': '審査中',
    'confirmed': '確定',
    'completed': '完了',
    'cancelled': 'キャンセル'
  }
  
  const type: NotificationType = newStatus === 'cancelled' ? 'warning' : 
                                  newStatus === 'completed' ? 'success' : 'info'
  
  addNotification(
    type,
    'ステータスが更新されました',
    `${caseData.patientName}: ${statusLabels[oldStatus]} → ${statusLabels[newStatus]}`,
    caseData.id
  )
}

export function notifyUrgentCase(caseData: Case): void {
  if (caseData.urgency === 'high') {
    addNotification(
      'warning',
      '緊急案件があります',
      `患者: ${caseData.patientName} (${caseData.treatmentType})`,
      caseData.id
    )
  }
}

export function notifyDeadlineApproaching(caseData: Case): void {
  if (caseData.preferredDate) {
    const preferredDate = new Date(caseData.preferredDate)
    const today = new Date()
    const daysUntilDeadline = Math.ceil((preferredDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
      addNotification(
        'warning',
        '希望日が近づいています',
        `${caseData.patientName}: ${daysUntilDeadline}日後 (${caseData.preferredDate})`,
        caseData.id
      )
    }
  }
}