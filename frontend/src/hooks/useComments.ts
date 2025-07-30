'use client'

import { useState, useEffect, useCallback } from 'react'
import { Comment, CreateCommentInput } from '@/types/comment'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'medical-tourism-comments'

// Mock user for demonstration
const MOCK_USER = {
  id: 'user-1',
  name: '田中太郎',
  role: 'hospital' as const
}

export function useComments(caseId?: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 全コメント取得（フィルタリング付き）
  const fetchComments = useCallback(() => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window === 'undefined') {
        setComments([])
        return
      }

      const storedComments = localStorage.getItem(STORAGE_KEY)
      let allComments: Comment[] = storedComments ? JSON.parse(storedComments) : []
      
      // caseIdでフィルタリング
      if (caseId) {
        allComments = allComments.filter(comment => comment.caseId === caseId)
      }
      
      // 日付降順でソート
      allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setComments(allComments)
    } catch (err) {
      console.error('Failed to fetch comments:', err)
      setError('コメントの取得に失敗しました')
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }, [caseId])

  // コメント追加
  const addComment = useCallback(async (input: CreateCommentInput): Promise<Comment> => {
    setError(null)

    try {
      const newComment: Comment = {
        id: uuidv4(),
        caseId: input.caseId,
        userId: MOCK_USER.id,
        userName: MOCK_USER.name,
        userRole: MOCK_USER.role,
        content: input.content,
        isInternal: input.isInternal,
        createdAt: new Date().toISOString()
      }

      // ローカルストレージから全コメント取得
      const storedComments = localStorage.getItem(STORAGE_KEY)
      const allComments: Comment[] = storedComments ? JSON.parse(storedComments) : []
      
      // 新しいコメントを追加
      allComments.push(newComment)
      
      // ローカルストレージに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allComments))
      
      // 現在の表示を更新
      fetchComments()
      
      return newComment
    } catch (err) {
      console.error('Failed to add comment:', err)
      setError('コメントの追加に失敗しました')
      throw err
    }
  }, [fetchComments])

  // コメント削除
  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    setError(null)

    try {
      // ローカルストレージから全コメント取得
      const storedComments = localStorage.getItem(STORAGE_KEY)
      const allComments: Comment[] = storedComments ? JSON.parse(storedComments) : []
      
      // 指定されたコメントを除外
      const updatedComments = allComments.filter(comment => comment.id !== commentId)
      
      // ローカルストレージに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedComments))
      
      // 現在の表示を更新
      fetchComments()
    } catch (err) {
      console.error('Failed to delete comment:', err)
      setError('コメントの削除に失敗しました')
      throw err
    }
  }, [fetchComments])

  // 初回ロード
  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    refetch: fetchComments
  }
}