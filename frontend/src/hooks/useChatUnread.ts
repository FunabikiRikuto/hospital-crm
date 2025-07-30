'use client'

import { useState, useEffect } from 'react'
import { ChatMessage } from '@/types/chat'

const MESSAGES_STORAGE_KEY = 'medical-tourism-chat-messages'

export function useChatUnread(caseId: string, currentUserId: string = 'user-1') {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const calculateUnread = () => {
      if (typeof window === 'undefined' || !caseId) {
        setUnreadCount(0)
        return
      }

      try {
        // すべてのメッセージを取得
        const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY)
        const allMessages: ChatMessage[] = storedMessages ? JSON.parse(storedMessages) : []
        
        // このケースに関連するチャットIDを取得
        const storedChats = localStorage.getItem('medical-tourism-chats')
        const chats = storedChats ? JSON.parse(storedChats) : []
        const chat = chats.find((c: any) => c.caseId === caseId)
        
        if (!chat) {
          setUnreadCount(0)
          return
        }
        
        // 該当チャットの未読メッセージをカウント
        const unread = allMessages.filter(msg => 
          msg.chatId === chat.id && 
          !msg.isRead && 
          msg.senderId !== currentUserId
        ).length
        
        setUnreadCount(unread)
      } catch (error) {
        console.error('Failed to calculate unread messages:', error)
        setUnreadCount(0)
      }
    }

    // 初回計算
    calculateUnread()

    // ストレージの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === MESSAGES_STORAGE_KEY || e.key === 'medical-tourism-chats') {
        calculateUnread()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // 定期的に更新（他のタブでの変更を検知）
    const interval = setInterval(calculateUnread, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [caseId, currentUserId])

  return unreadCount
}