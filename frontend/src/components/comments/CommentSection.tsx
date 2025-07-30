'use client'

import { useComments } from '@/hooks/useComments'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MessageCircle } from 'lucide-react'

interface CommentSectionProps {
  caseId: string
}

export function CommentSection({ caseId }: CommentSectionProps) {
  const { comments, isLoading, error, addComment, deleteComment } = useComments(caseId)

  const handleAddComment = async (content: string, isInternal: boolean) => {
    await addComment({
      caseId,
      content,
      isInternal
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
          コメント・メモ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CommentForm onSubmit={handleAddComment} />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            読み込み中...
          </div>
        ) : (
          <CommentList 
            comments={comments} 
            onDelete={deleteComment}
          />
        )}
      </CardContent>
    </Card>
  )
}