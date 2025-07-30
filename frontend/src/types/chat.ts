export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderRole: 'hospital' | 'agent' | 'patient'
  content: string
  timestamp: string
  isRead: boolean
  attachments?: {
    id: string
    name: string
    type: 'image' | 'document' | 'audio'
    url: string
  }[]
}

export interface Chat {
  id: string
  caseId: string
  caseName: string
  participants: {
    id: string
    name: string
    role: 'hospital' | 'agent' | 'patient'
    wechatId?: string
  }[]
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isActive: boolean
  createdAt: string
}

export interface CreateChatInput {
  caseId: string
  caseName: string
  participants: Chat['participants']
}

export interface SendMessageInput {
  chatId: string
  content: string
  attachments?: ChatMessage['attachments']
}