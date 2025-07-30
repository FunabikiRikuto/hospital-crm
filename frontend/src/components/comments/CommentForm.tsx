'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MessageCircle, Send, Lock, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  onSubmit: (content: string, isInternal: boolean) => Promise<void>
  placeholder?: string
}

export function CommentForm({ onSubmit, placeholder = 'コメントを入力...' }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(content.trim(), isInternal)
      setContent('')
      setIsInternal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start space-x-3">
          <MessageCircle className="h-5 w-5 text-gray-400 mt-2" />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsInternal(!isInternal)}
              className={cn(
                "flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isInternal 
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {isInternal ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>内部メモ</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  <span>エージェントと共有</span>
                </>
              )}
            </button>
            
            {isInternal && (
              <span className="text-xs text-amber-600">
                このコメントは病院スタッフのみが閲覧できます
              </span>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            送信
          </Button>
        </div>
      </form>
    </Card>
  )
}