'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Notification,
  NotificationType,
  getNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications,
  requestNotificationPermission
} from '@/lib/notifications'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // 通知を読み込み
  const loadNotifications = useCallback(() => {
    try {
      const storedNotifications = getNotifications()
      setNotifications(storedNotifications)
      setUnreadCount(storedNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初回読み込み
  useEffect(() => {
    loadNotifications()
    cleanupOldNotifications()
  }, [loadNotifications])

  // 新しい通知を追加
  const notify = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    caseId?: string
  ) => {
    addNotification(type, title, message, caseId)
    loadNotifications() // 状態を更新
  }, [loadNotifications])

  // 通知を既読にする
  const markNotificationAsRead = useCallback((notificationId: string) => {
    markAsRead(notificationId)
    loadNotifications() // 状態を更新
  }, [loadNotifications])

  // 全ての通知を既読にする
  const markAllNotificationsAsRead = useCallback(() => {
    markAllAsRead()
    loadNotifications() // 状態を更新
  }, [loadNotifications])

  // 通知を削除
  const removeNotification = useCallback((notificationId: string) => {
    deleteNotification(notificationId)
    loadNotifications() // 状態を更新
  }, [loadNotifications])

  // ブラウザ通知の許可を要求
  const requestPermission = useCallback(async () => {
    try {
      const permission = await requestNotificationPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }, [])

  // 便利な通知メソッド
  const notifySuccess = useCallback((title: string, message: string, caseId?: string) => {
    notify('success', title, message, caseId)
  }, [notify])

  const notifyError = useCallback((title: string, message: string, caseId?: string) => {
    notify('error', title, message, caseId)
  }, [notify])

  const notifyWarning = useCallback((title: string, message: string, caseId?: string) => {
    notify('warning', title, message, caseId)
  }, [notify])

  const notifyInfo = useCallback((title: string, message: string, caseId?: string) => {
    notify('info', title, message, caseId)
  }, [notify])

  return {
    notifications,
    unreadCount,
    isLoading,
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    deleteNotification: removeNotification,
    requestPermission,
    refresh: loadNotifications
  }
}