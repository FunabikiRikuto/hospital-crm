'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Check, CheckCheck, X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'
import { useNotifications } from '@/hooks/useNotifications'
import type { Notification, NotificationType } from '@/lib/notifications'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications()

  const [showAll, setShowAll] = useState(false)

  // 表示する通知をフィルタリング
  const displayNotifications = showAll 
    ? notifications 
    : notifications.slice(0, 10)

  // 通知タイプに応じたアイコンを取得
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  // 通知タイプに応じた背景色を取得
  const getNotificationBg = (type: NotificationType, read: boolean) => {
    const baseClasses = read ? 'bg-gray-50' : 'bg-white border-l-4'
    
    switch (type) {
      case 'success':
        return `${baseClasses} ${read ? '' : 'border-green-500'}`
      case 'error':
        return `${baseClasses} ${read ? '' : 'border-red-500'}`
      case 'warning':
        return `${baseClasses} ${read ? '' : 'border-orange-500'}`
      case 'info':
      default:
        return `${baseClasses} ${read ? '' : 'border-blue-500'}`
    }
  }

  // 時間をフォーマット
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'たった今'
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return date.toLocaleDateString('ja-JP')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <CardTitle>通知</CardTitle>
                {unreadCount > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    全て既読
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              最新の案件情報とシステム通知
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Bell className="h-12 w-12 mb-4 text-gray-300" />
                <p>通知はありません</p>
              </div>
            ) : (
              <div className="divide-y">
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${getNotificationBg(notification.type, notification.read)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {notification.caseId && (
                          <Link
                            href={`/cases/${notification.caseId}`}
                            className="inline-block mt-2"
                            onClick={onClose}
                          >
                            <Badge variant="outline" className="text-xs">
                              案件を確認
                            </Badge>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {notifications.length > 10 && !showAll && (
                  <div className="p-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAll(true)}
                    >
                      さらに表示 ({notifications.length - 10}件)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}