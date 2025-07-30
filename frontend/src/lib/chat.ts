import { Chat, CreateChatInput } from '@/types/chat'
import { v4 as uuidv4 } from 'uuid'

const CHATS_STORAGE_KEY = 'medical-tourism-chats'

// チャット作成または取得
export async function getOrCreateChat(input: CreateChatInput): Promise<Chat> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('This function must be called on the client side')
    }

    // 既存のチャットを確認
    const storedChats = localStorage.getItem(CHATS_STORAGE_KEY)
    const existingChats: Chat[] = storedChats ? JSON.parse(storedChats) : []
    
    // 同じケースIDのチャットが既にある場合はそれを返す
    const existingChat = existingChats.find(chat => chat.caseId === input.caseId)
    if (existingChat) {
      return existingChat
    }
    
    // 新しいチャットを作成
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
    
    return newChat
  } catch (err) {
    console.error('Failed to create/get chat:', err)
    throw err
  }
}