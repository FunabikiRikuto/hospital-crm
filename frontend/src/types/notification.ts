export interface Notification {
  id: string
  userId: string
  caseId?: string
  type: 'new_case' | 'status_change' | 'comment' | 'info_request' | 'appointment_confirmed'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: {
    caseId?: string
    caseName?: string
    caseStatus?: string
    commentId?: string
    wechatSent?: boolean
  }
}

export interface CreateNotificationInput {
  userId: string
  caseId?: string
  type: Notification['type']
  title: string
  message: string
  metadata?: Notification['metadata']
}

export interface NotificationPreferences {
  email: boolean
  wechat: boolean
  inApp: boolean
  notificationTypes: {
    newCase: boolean
    statusChange: boolean
    comment: boolean
    infoRequest: boolean
    appointmentConfirmed: boolean
  }
}