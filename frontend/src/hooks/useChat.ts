'use client'

import { useState, useEffect, useCallback } from 'react'
import { Chat, ChatMessage, CreateChatInput, SendMessageInput } from '@/types/chat'
import { v4 as uuidv4 } from 'uuid'

const CHATS_STORAGE_KEY = 'medical-tourism-chats'
const MESSAGES_STORAGE_KEY = 'medical-tourism-chat-messages'

// Mock user for demonstration
const MOCK_USER = {
  id: 'user-1',
  name: '田中太郎',
  role: 'hospital' as const,
  wechatId: 'hospital_tokyo_001'
}

export function useChat(chatId?: string) {
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // チャット一覧取得
  const fetchChats = useCallback(() => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window === 'undefined') {
        setChats([])
        return
      }

      const storedChats = localStorage.getItem(CHATS_STORAGE_KEY)
      const allChats: Chat[] = storedChats ? JSON.parse(storedChats) : []
      
      // 最終メッセージ時間でソート
      allChats.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
        return timeB - timeA
      })
      
      setChats(allChats)
    } catch (err) {
      console.error('Failed to fetch chats:', err)
      setError('チャットの取得に失敗しました')
      setChats([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 特定チャットのメッセージ取得
  const fetchMessages = useCallback((targetChatId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window === 'undefined') {
        setMessages([])
        return
      }

      const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY)
      let allMessages: ChatMessage[] = storedMessages ? JSON.parse(storedMessages) : []
      
      // 指定されたチャットのメッセージをフィルタリング（患者のメッセージは除外）
      allMessages = allMessages.filter(msg => 
        msg.chatId === targetChatId && msg.senderRole !== 'patient'
      )
      
      // タイムスタンプでソート（古い順）
      allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      
      setMessages(allMessages)
      
      // 現在のチャット情報を取得
      const storedChats = localStorage.getItem(CHATS_STORAGE_KEY)
      const chats: Chat[] = storedChats ? JSON.parse(storedChats) : []
      const chat = chats.find(c => c.id === targetChatId)
      if (chat) {
        setCurrentChat(chat)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setError('メッセージの取得に失敗しました')
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // チャット作成
  const createChat = useCallback(async (input: CreateChatInput): Promise<Chat> => {
    setError(null)

    try {
      // 既存のチャットを確認
      const storedChats = localStorage.getItem(CHATS_STORAGE_KEY)
      const existingChats: Chat[] = storedChats ? JSON.parse(storedChats) : []
      
      // 同じケースIDのチャットが既にある場合はそれを返す
      const existingChat = existingChats.find(chat => chat.caseId === input.caseId)
      if (existingChat) {
        // モックメッセージを作成（初回のみ）
        const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY)
        const messages: ChatMessage[] = storedMessages ? JSON.parse(storedMessages) : []
        const hasMessages = messages.some(msg => msg.chatId === existingChat.id)
        
        if (!hasMessages && Math.random() > 0.3) { // 70%の確率でモックメッセージを生成
          const mockMessages: ChatMessage[] = [
            {
              id: uuidv4(),
              chatId: existingChat.id,
              senderId: 'agent-1',
              senderName: input.participants.find(p => p.role === 'agent')?.name || 'エージェント',
              senderRole: 'agent',
              content: '患者様から追加の質問があります。手術後のリハビリ期間について詳しく教えてください。',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              isRead: false
            },
            {
              id: uuidv4(),
              chatId: existingChat.id,
              senderId: 'agent-1',
              senderName: input.participants.find(p => p.role === 'agent')?.name || 'エージェント',
              senderRole: 'agent',
              content: '病院からの回答をお待ちしています。また、患者様は支払い方法についても確認したいとのことです。',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              isRead: false
            }
          ]
          
          messages.push(...mockMessages)
          localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages))
        }
        
        return existingChat
      }
      
      const newChat: Chat = {
        id: uuidv4(),
        caseId: input.caseId,
        caseName: input.caseName,
        participants: input.participants,
        unreadCount: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      }
      
      // チャットを追加
      existingChats.push(newChat)
      
      // ローカルストレージに保存
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(existingChats))
      
      // 現在の表示を更新
      fetchChats()
      
      return newChat
    } catch (err) {
      console.error('Failed to create chat:', err)
      setError('チャットの作成に失敗しました')
      throw err
    }
  }, [fetchChats])

  // メッセージ送信
  const sendMessage = useCallback(async (input: SendMessageInput): Promise<ChatMessage> => {
    setError(null)

    try {
      const newMessage: ChatMessage = {
        id: uuidv4(),
        chatId: input.chatId,
        senderId: MOCK_USER.id,
        senderName: MOCK_USER.name,
        senderRole: MOCK_USER.role,
        content: input.content,
        timestamp: new Date().toISOString(),
        isRead: false,
        attachments: input.attachments
      }

      // メッセージをストレージに追加
      const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY)
      const allMessages: ChatMessage[] = storedMessages ? JSON.parse(storedMessages) : []
      allMessages.push(newMessage)
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages))
      
      // チャットの最終メッセージを更新
      const storedChats = localStorage.getItem(CHATS_STORAGE_KEY)
      const chats: Chat[] = storedChats ? JSON.parse(storedChats) : []
      const chatIndex = chats.findIndex(c => c.id === input.chatId)
      
      if (chatIndex !== -1) {
        chats[chatIndex].lastMessage = input.content
        chats[chatIndex].lastMessageTime = newMessage.timestamp
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats))
      }
      
      // WeChat通知のシミュレーション
      console.log('[WeChat Message Sent]', {
        chatId: input.chatId,
        content: input.content,
        sender: MOCK_USER.wechatId
      })
      
      // 現在のメッセージ一覧を更新
      if (chatId === input.chatId) {
        fetchMessages(input.chatId)
      }
      
      return newMessage
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('メッセージの送信に失敗しました')
      throw err
    }
  }, [chatId, fetchMessages])

  // メッセージを既読にする
  const markMessagesAsRead = useCallback(async (messageIds: string[]): Promise<void> => {
    try {
      const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY)
      const allMessages: ChatMessage[] = storedMessages ? JSON.parse(storedMessages) : []
      
      // 指定されたメッセージを既読に更新
      const updatedMessages = allMessages.map(msg => 
        messageIds.includes(msg.id) 
          ? { ...msg, isRead: true }
          : msg
      )
      
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages))
      
      // 現在のメッセージ一覧を更新
      if (chatId) {
        fetchMessages(chatId)
      }
    } catch (err) {
      console.error('Failed to mark messages as read:', err)
    }
  }, [chatId, fetchMessages])

  // 初回ロード
  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId)
    } else {
      fetchChats()
    }
  }, [chatId, fetchChats, fetchMessages])

  return {
    chats,
    messages,
    currentChat,
    isLoading,
    error,
    createChat,
    sendMessage,
    markMessagesAsRead,
    refetchChats: fetchChats,
    refetchMessages: fetchMessages
  }
}