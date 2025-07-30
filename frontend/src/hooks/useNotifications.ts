'use client'

import { useState, useEffect, useCallback } from 'react'
import { Notification, CreateNotificationInput } from '@/types/notification'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'medical-tourism-notifications'

// Mock user for demonstration
const MOCK_USER = {
  id: 'user-1',
  wechatId: 'hospital_tokyo_001'
}

export function useNotifications(userId: string = MOCK_USER.id) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 通知取得
  const fetchNotifications = useCallback(() => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window === 'undefined') {
        setNotifications([])
        return
      }

      const storedNotifications = localStorage.getItem(STORAGE_KEY)
      let allNotifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : []
      
      // ユーザーでフィルタリング
      allNotifications = allNotifications.filter(notification => notification.userId === userId)
      
      // 日付降順でソート
      allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setNotifications(allNotifications)
      setUnreadCount(allNotifications.filter(n => !n.isRead).length)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setError('通知の取得に失敗しました')
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // 通知追加
  const addNotification = useCallback(async (input: CreateNotificationInput): Promise<Notification> => {
    setError(null)

    try {
      const newNotification: Notification = {
        id: uuidv4(),
        userId: input.userId,
        caseId: input.caseId,
        type: input.type,
        title: input.title,
        message: input.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        metadata: input.metadata
      }

      // ローカルストレージから全通知取得
      const storedNotifications = localStorage.getItem(STORAGE_KEY)
      const allNotifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : []
      
      // 新しい通知を追加
      allNotifications.push(newNotification)
      
      // ローカルストレージに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications))
      
      // WeChat通知のシミュレーション（実際の実装では API を呼び出す）
      if (shouldSendWeChatNotification(input.type)) {
        console.log(`[WeChat Notification] To: ${MOCK_USER.wechatId}`, {
          title: input.title,
          message: input.message,
          caseId: input.caseId
        })
        newNotification.metadata = {
          ...newNotification.metadata,
          wechatSent: true
        }
      }
      
      // 現在の表示を更新
      fetchNotifications()
      
      return newNotification
    } catch (err) {
      console.error('Failed to add notification:', err)
      setError('通知の追加に失敗しました')
      throw err
    }
  }, [fetchNotifications])

  // 通知を既読にする
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    setError(null)

    try {
      // ローカルストレージから全通知取得
      const storedNotifications = localStorage.getItem(STORAGE_KEY)
      const allNotifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : []
      
      // 指定された通知を既読に更新
      const updatedNotifications = allNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
      
      // ローカルストレージに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications))
      
      // 現在の表示を更新
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark as read:', err)
      setError('既読状態の更新に失敗しました')
      throw err
    }
  }, [fetchNotifications])

  // すべて既読にする
  const markAllAsRead = useCallback(async (): Promise<void> => {
    setError(null)

    try {
      // ローカルストレージから全通知取得
      const storedNotifications = localStorage.getItem(STORAGE_KEY)
      const allNotifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : []
      
      // ユーザーの通知をすべて既読に更新
      const updatedNotifications = allNotifications.map(notification => 
        notification.userId === userId
          ? { ...notification, isRead: true }
          : notification
      )
      
      // ローカルストレージに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications))
      
      // 現在の表示を更新
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      setError('既読状態の更新に失敗しました')
      throw err
    }
  }, [userId, fetchNotifications])

  // WeChat通知を送信すべきかどうかを判定
  function shouldSendWeChatNotification(type: Notification['type']): boolean {
    // ワークフローに基づき、以下の4つのイベントでWeChat通知を送信
    const wechatNotificationTypes: Notification['type'][] = [
      'new_case',             // 新規案件登録完了
      'status_change',        // 病院判断結果確定
      'info_request',         // 情報不足時の追加要求
      'appointment_confirmed' // 予約確定
    ]
    
    return wechatNotificationTypes.includes(type)
  }

  // 初回ロード
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  }
}