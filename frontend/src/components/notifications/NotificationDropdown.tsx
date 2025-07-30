'use client'

import Link from 'next/link'
import { Notification } from '@/types/notification'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Bell, MessageSquare, AlertCircle, CheckCircle, Calendar, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
  onClose: () => void
}

export function NotificationDropdown({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onClose 
}: NotificationDropdownProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_case':
        return <Bell className="h-4 w-4 text-blue-500" />
      case 'status_change':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'info_request':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'appointment_confirmed':
        return <Calendar className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await onMarkAsRead(notification.id)
    }
    onClose()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Card className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-hidden shadow-lg z-20">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">通知</CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              すべて既読にする
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 max-h-[500px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>通知はありません</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                  !notification.isRead && "bg-blue-50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        "text-sm",
                        !notification.isRead ? "font-semibold" : "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      {notification.metadata?.wechatSent && (
                        <span className="text-xs text-green-600">
                          WeChat送信済
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('ja-JP')}
                      </p>
                      
                      {notification.caseId && (
                        <Link
                          href={`/cases/${notification.caseId}`}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          案件詳細
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}