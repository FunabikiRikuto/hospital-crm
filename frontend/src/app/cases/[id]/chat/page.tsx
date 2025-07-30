'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Send, Paperclip, User, MessageCircle, Loader2 } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useCases } from '@/hooks/useCases'
import { cn } from '@/lib/utils'

export default function CaseChatPage() {
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { getCase } = useCases()
  const caseData = getCase(caseId)
  
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
      if (!caseData) return
      
      // チャットを作成または取得
      const chat = await createChat({
        caseId: caseData.id!,
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
          },
          {
            id: 'patient-1',
            name: caseData.patientName,
            role: 'patient',
            wechatId: caseData.patientWechatId
          }
        ]
      })
      
      setChatId(chat.id)
    }
    
    initializeChat()
  }, [caseData, createChat])

  // メッセージの自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 未読メッセージを既読にする
  useEffect(() => {
    const unreadMessages = messages.filter(msg => !msg.isRead && msg.senderId !== 'user-1')
    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages.map(msg => msg.id))
    }
  }, [messages, markMessagesAsRead])

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
      case 'patient': return '患者'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'hospital': return 'bg-blue-100 text-blue-700'
      case 'agent': return 'bg-green-100 text-green-700'
      case 'patient': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (!caseData) {
    return (
      <ProtectedLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          案件が見つかりません
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/cases/${caseId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  案件詳細に戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {caseData.patientName} - WeChat チャット
                </h1>
                <p className="text-sm text-gray-600">
                  {caseData.treatmentType}
                </p>
              </div>
            </div>
            
            {currentChat && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  参加者: {currentChat.participants.length}名
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full max-w-4xl mx-auto p-4">
            <Card className="h-full flex flex-col">
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="h-12 w-12 mb-2" />
                    <p>メッセージはまだありません</p>
                    <p className="text-sm">最初のメッセージを送信してください</p>
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
                            "max-w-[70%]",
                            isOwnMessage ? "items-end" : "items-start"
                          )}>
                            <div className="flex items-center space-x-2 mb-1">
                              {!isOwnMessage && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-600" />
                                </div>
                              )}
                              <span className="text-sm font-medium">{msg.senderName}</span>
                              <Badge className={cn("text-xs", getRoleColor(msg.senderRole))}>
                                {getRoleLabel(msg.senderRole)}
                              </Badge>
                            </div>
                            
                            <div className={cn(
                              "rounded-lg px-4 py-2",
                              isOwnMessage 
                                ? "bg-green-600 text-white ml-10" 
                                : "bg-white border ml-10"
                            )}>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-1 ml-10">
                              {new Date(msg.timestamp).toLocaleString('ja-JP')}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </CardContent>

              {/* Input */}
              <div className="border-t p-4">
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
                  このチャットはWeChatと連携しています。メッセージは自動的にWeChat経由で送信されます。
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}