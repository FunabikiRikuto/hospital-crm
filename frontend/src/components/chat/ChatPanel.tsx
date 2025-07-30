'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { X, Send, Paperclip, User, MessageCircle, Loader2 } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { cn } from '@/lib/utils'
import type { Case } from '@/types/case'

interface ChatPanelProps {
  caseData: Case
  isOpen: boolean
  onClose: () => void
}

export function ChatPanel({ caseData, isOpen, onClose }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  
  const { 
    messages, 
    currentChat, 
    isLoading, 
    error, 
    createChat, 
    sendMessage,
    markMessagesAsRead 
  } = useChat(chatId || undefined)

  // チャットを初期化または取得
  useEffect(() => {
    const initializeChat = async () => {
      if (!caseData || !isOpen || !caseData.id) return
      
      try {
        // チャットを作成または取得
        const chat = await createChat({
          caseId: caseData.id,
          caseName: caseData.patientName,
          participants: [
            {
              id: 'user-1',
              name: '田中太郎',
              role: 'hospital',
              wechatId: 'hospital_tokyo_001'
            },
            {
              id: 'agent-1',
              name: caseData.agentName || 'エージェント',
              role: 'agent',
              wechatId: caseData.wechatId
            }
          ]
        })
        
        setChatId(chat.id)
      } catch (error) {
        console.error('Failed to initialize chat:', error)
      }
    }
    
    if (isOpen && caseData) {
      initializeChat()
    }
  }, [caseData?.id, isOpen]) // caseDataの参照ではなくidのみを依存に

  // メッセージの自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 未読メッセージを既読にする
  useEffect(() => {
    if (isOpen) {
      const unreadMessages = messages.filter(msg => !msg.isRead && msg.senderId !== 'user-1')
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages.map(msg => msg.id))
      }
    }
  }, [messages, isOpen]) // markMessagesAsReadを依存配列から削除

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || isSending) return
    
    setIsSending(true)
    try {
      await sendMessage({
        chatId,
        content: message.trim()
      })
      setMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'hospital': return '病院'
      case 'agent': return 'エージェント'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'hospital': return 'bg-blue-100 text-blue-700'
      case 'agent': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // 未読メッセージ数を計算
  const unreadCount = messages.filter(msg => !msg.isRead && msg.senderId !== 'user-1').length

  // パネルが開いていない場合は非表示
  if (!isOpen) {
    return null
  }

  return (
    <div 
      className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l flex flex-col z-50"
      style={{ zIndex: 9999 }}>
      {/* Header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-gray-900">
              エージェントチャット
            </h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-1">
          <p className="text-sm text-gray-600">
            {caseData.agentName || 'エージェント'} - {caseData.agentCompany || ''}
          </p>
          <p className="text-xs text-gray-500">
            案件: {caseData.patientName} ({caseData.treatmentType})
          </p>
        </div>
      </div>

      {/* Content */}
      <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="h-12 w-12 mb-2" />
                <p className="text-sm">メッセージはまだありません</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwnMessage = msg.senderId === 'user-1'
                  
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        isOwnMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[80%]",
                        isOwnMessage ? "items-end" : "items-start"
                      )}>
                        {!isOwnMessage && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium">{msg.senderName}</span>
                            <Badge className={cn("text-xs", getRoleColor(msg.senderRole))}>
                              {getRoleLabel(msg.senderRole)}
                            </Badge>
                          </div>
                        )}
                        
                        <div className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          isOwnMessage 
                            ? "bg-green-600 text-white" 
                            : "bg-white border"
                        )}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex space-x-2"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="メッセージを入力..."
                disabled={isSending || !chatId}
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || isSending || !chatId}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 mt-2">
              WeChatと連携中
            </p>
          </div>
      </>
    </div>
  )
}