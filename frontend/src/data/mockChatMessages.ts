import { ChatMessage } from '@/types/chat'
import { v4 as uuidv4 } from 'uuid'

// チャットIDは実際のチャット作成時に動的に生成されるため、ダミーIDを使用
const CHAT_ID_1 = 'chat-001'
const CHAT_ID_2 = 'chat-002'

export const mockChatMessages: ChatMessage[] = [
  // case-mt-001のチャット
  {
    id: uuidv4(),
    chatId: CHAT_ID_1,
    senderId: 'agent-1',
    senderName: '李華',
    senderRole: 'agent',
    content: '患者様から心臓手術について追加の質問があります。手術後のリハビリ期間はどのくらいかかりますか？',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2時間前
    isRead: false
  },
  {
    id: uuidv4(),
    chatId: CHAT_ID_1,
    senderId: 'patient-1',
    senderName: '陈志明',
    senderRole: 'patient',
    content: '手術費用の支払い方法について教えてください。分割払いは可能ですか？',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1時間前
    isRead: false
  },
  {
    id: uuidv4(),
    chatId: CHAT_ID_1,
    senderId: 'user-1',
    senderName: '田中太郎',
    senderRole: 'hospital',
    content: 'リハビリ期間は通常3ヶ月程度です。支払いについては、一括払いのみとなっております。',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分前
    isRead: true
  },
  
  // case-mt-002のチャット
  {
    id: uuidv4(),
    chatId: CHAT_ID_2,
    senderId: 'agent-1',
    senderName: '王明',
    senderRole: 'agent',
    content: '患者様が手術日程を2月20日に変更したいとのことです。可能でしょうか？',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5分前
    isRead: false
  }
]

// チャット情報（caseIdとchatIdの対応）
export const mockChats = [
  {
    id: CHAT_ID_1,
    caseId: 'case-mt-001',
    caseName: '陈志明',
    participants: [
      { id: 'user-1', name: '田中太郎', role: 'hospital', wechatId: 'hospital_tokyo_001' },
      { id: 'agent-1', name: '李華', role: 'agent', wechatId: 'agent_lihua' },
      { id: 'patient-1', name: '陈志明', role: 'patient', wechatId: 'patient_chen' }
    ],
    lastMessage: 'リハビリ期間は通常3ヶ月程度です。支払いについては、一括払いのみとなっております。',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 2,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: CHAT_ID_2,
    caseId: 'case-mt-002',
    caseName: '刘文静',
    participants: [
      { id: 'user-1', name: '田中太郎', role: 'hospital', wechatId: 'hospital_tokyo_001' },
      { id: 'agent-1', name: '王明', role: 'agent', wechatId: 'agent_wang' },
      { id: 'patient-1', name: '刘文静', role: 'patient', wechatId: 'patient_liu' }
    ],
    lastMessage: '患者様が手術日程を2月20日に変更したいとのことです。可能でしょうか？',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 1,
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
]