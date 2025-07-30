'use client'

import { useState } from 'react'
import { Comment } from '@/types/comment'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MessageCircle, Lock, Globe, Trash2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentListProps {
  comments: Comment[]
  currentUserId?: string
  onDelete?: (commentId: string) => void
}

export function CommentList({ comments, currentUserId = 'user-1', onDelete }: CommentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (commentId: string) => {
    if (!onDelete) return
    
    if (confirm('このコメントを削除してもよろしいですか？')) {
      setDeletingId(commentId)
      try {
        await onDelete(commentId)
      } finally {
        setDeletingId(null)
      }
    }
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>コメントはまだありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isOwnComment = comment.userId === currentUserId
        const roleLabel = comment.userRole === 'hospital' ? '病院' : 'エージェント'
        const roleColor = comment.userRole === 'hospital' ? 'text-blue-600' : 'text-green-600'
        
        return (
          <Card key={comment.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={cn(
                  "p-2 rounded-full",
                  comment.userRole === 'hospital' ? 'bg-blue-100' : 'bg-green-100'
                )}>
                  <User className={cn("h-4 w-4", roleColor)} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.userName}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", 
                      comment.userRole === 'hospital' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    )}>
                      {roleLabel}
                    </span>
                    {comment.isInternal ? (
                      <span className="flex items-center text-xs text-amber-600">
                        <Lock className="h-3 w-3 mr-1" />
                        内部メモ
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-gray-500">
                        <Globe className="h-3 w-3 mr-1" />
                        共有
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString('ja-JP')}
                    {comment.updatedAt && (
                      <span className="ml-2">
                        (編集済み: {new Date(comment.updatedAt).toLocaleString('ja-JP')})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {isOwnComment && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </Button>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}