'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClose={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  )
}